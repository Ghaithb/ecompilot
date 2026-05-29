from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker, FormValidationAction
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import requests
import logging

logger = logging.getLogger(__name__)

# URL de votre API backend NestJS
BACKEND_API = "http://localhost:3000/api/v1"

def get_headers(tracker: Tracker) -> Dict[str, str]:
    """Récupère les headers avec le token JWT"""
    # Le token devrait être passé dans les metadata
    metadata = tracker.latest_message.get('metadata', {})
    token = metadata.get('token', '')
    
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}' if token else '',
    }

class ActionTrackOrder(Action):
    """Action pour suivre une commande"""

    def name(self) -> Text:
        return "action_track_order"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        order_id = tracker.get_slot("order_id")
        
        if not order_id:
            dispatcher.utter_message(text="Quel est votre numéro de commande ?")
            return []
        
        try:
            # Appel API backend
            response = requests.get(
                f"{BACKEND_API}/orders/{order_id}",
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                order = response.json()
                
                status_fr = {
                    "pending": "en attente",
                    "processing": "en cours de traitement",
                    "shipped": "expédiée",
                    "delivered": "livrée",
                    "cancelled": "annulée"
                }
                
                status = status_fr.get(order.get('status', 'pending'), order.get('status'))
                
                message = f"📦 Votre commande #{order_id} est {status}."
                
                if order.get('status') == 'shipped' and order.get('tracking_number'):
                    message += f"\n📍 Numéro de suivi : {order['tracking_number']}"
                
                if order.get('estimated_delivery'):
                    message += f"\n📅 Livraison prévue : {order['estimated_delivery']}"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text=f"❌ Désolé, je ne trouve pas la commande #{order_id}. Vérifiez le numéro."
                )
        except Exception as e:
            logger.error(f"Erreur track_order: {e}")
            dispatcher.utter_message(
                text="😕 Désolé, j'ai un problème technique. Réessayez dans quelques instants."
            )
        
        return [SlotSet("order_id", None)]


class ActionGetProductInfo(Action):
    """Action pour obtenir les infos d'un produit"""

    def name(self) -> Text:
        return "action_get_product_info"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        product_name = tracker.get_slot("product_name")
        
        if not product_name:
            dispatcher.utter_message(text="Quel produit recherchez-vous ?")
            return []
        
        try:
            # Recherche produit
            response = requests.get(
                f"{BACKEND_API}/products/search",
                params={"q": product_name, "limit": 1},
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                products = response.json()
                
                if products and len(products) > 0:
                    product = products[0]
                    
                    message = f"🛍️ **{product['name']}**\n\n"
                    message += f"💰 Prix : {product['price']} FCFA\n"
                    
                    if product.get('description'):
                        message += f"📝 {product['description']}\n"
                    
                    if product.get('stock'):
                        message += f"📦 En stock : {product['stock']} unités\n"
                    
                    message += f"\n✨ Voulez-vous commander ce produit ?"
                    
                    dispatcher.utter_message(text=message)
                    return [SlotSet("product_id", product.get('_id'))]
                else:
                    dispatcher.utter_message(
                        text=f"❌ Désolé, je n'ai pas trouvé de produit correspondant à '{product_name}'."
                    )
            else:
                dispatcher.utter_message(
                    text="😕 Problème de recherche. Pouvez-vous préciser le nom ?"
                )
        except Exception as e:
            logger.error(f"Erreur get_product_info: {e}")
            dispatcher.utter_message(
                text="😕 Problème technique. Réessayez dans quelques instants."
            )
        
        return []


class ActionRecommendProducts(Action):
    """Action pour recommander des produits"""

    def name(self) -> Text:
        return "action_recommend_products"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        try:
            # Appel API recommendations IA
            metadata = tracker.latest_message.get('metadata', {})
            user_id = metadata.get('userId', 'guest')
            
            response = requests.get(
                f"{BACKEND_API}/ai/recommendations/{user_id}",
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                recommendations = response.json()
                
                if recommendations:
                    message = "✨ Voici mes recommandations pour vous :\n\n"
                    
                    for i, product in enumerate(recommendations[:3], 1):
                        message += f"{i}. **{product['name']}** - {product['price']} FCFA\n"
                    
                    message += "\n💡 Dites-moi le numéro du produit qui vous intéresse !"
                    
                    dispatcher.utter_message(text=message)
                else:
                    dispatcher.utter_message(
                        text="🔍 Explorez notre catalogue pour découvrir nos produits !"
                    )
            else:
                dispatcher.utter_message(
                    text="🔍 Consultez notre catalogue pour voir tous nos produits."
                )
        except Exception as e:
            logger.error(f"Erreur recommend_products: {e}")
            dispatcher.utter_message(
                text="🔍 Consultez notre boutique pour découvrir nos produits."
            )
        
        return []


class ActionCheckStock(Action):
    """Action pour vérifier le stock"""

    def name(self) -> Text:
        return "action_check_stock"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        product_name = tracker.get_slot("product_name")
        product_id = tracker.get_slot("product_id")
        
        if not product_name and not product_id:
            dispatcher.utter_message(text="Quel produit voulez-vous vérifier ?")
            return []
        
        try:
            # Vérifier le stock
            endpoint = f"{BACKEND_API}/inventory/{product_id}" if product_id else f"{BACKEND_API}/products/search?q={product_name}"
            
            response = requests.get(
                endpoint,
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                product = data if product_id else (data[0] if data else None)
                
                if product:
                    stock = product.get('stock', 0)
                    
                    if stock > 10:
                        message = f"✅ **{product['name']}** est disponible ! ({stock} en stock)"
                    elif stock > 0:
                        message = f"⚠️ **{product['name']}** - Plus que {stock} en stock ! Commandez vite !"
                    else:
                        message = f"❌ **{product['name']}** est en rupture de stock. Revenez bientôt !"
                    
                    dispatcher.utter_message(text=message)
                else:
                    dispatcher.utter_message(text="❌ Produit introuvable.")
            else:
                dispatcher.utter_message(text="😕 Impossible de vérifier le stock.")
        except Exception as e:
            logger.error(f"Erreur check_stock: {e}")
            dispatcher.utter_message(text="😕 Problème technique.")
        
        return []


class ActionCalculateShipping(Action):
    """Action pour calculer les frais de livraison"""

    def name(self) -> Text:
        return "action_calculate_shipping"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        location = tracker.get_slot("location")
        
        if not location:
            dispatcher.utter_message(text="Quelle est votre ville de livraison ?")
            return []
        
        try:
            response = requests.post(
                f"{BACKEND_API}/shipping/calculate",
                json={"location": location},
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                cost = data.get('cost', 0)
                duration = data.get('duration', '2-5')
                
                message = f"📦 Livraison à {location} :\n"
                message += f"💰 Frais : {cost} FCFA\n"
                message += f"⏱️ Délai : {duration} jours ouvrables"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="😕 Impossible de calculer les frais. Contactez notre service client."
                )
        except Exception as e:
            logger.error(f"Erreur calculate_shipping: {e}")
            dispatcher.utter_message(text="😕 Problème de calcul des frais.")
        
        return []


class ActionApplyDiscount(Action):
    """Action pour appliquer un code promo"""

    def name(self) -> Text:
        return "action_apply_discount"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        discount_code = tracker.get_slot("discount_code")
        
        if not discount_code:
            dispatcher.utter_message(text="Quel est votre code promo ?")
            return []
        
        try:
            response = requests.post(
                f"{BACKEND_API}/discounts/validate",
                json={"code": discount_code},
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('valid'):
                    discount = data.get('discount', 0)
                    message = f"🎉 Code promo **{discount_code}** appliqué !\n"
                    message += f"💰 Réduction : {discount}%"
                    
                    dispatcher.utter_message(text=message)
                else:
                    dispatcher.utter_message(
                        text=f"❌ Le code **{discount_code}** n'est pas valide ou a expiré."
                    )
            else:
                dispatcher.utter_message(text="❌ Code promo invalide.")
        except Exception as e:
            logger.error(f"Erreur apply_discount: {e}")
            dispatcher.utter_message(text="😕 Impossible de valider le code.")
        
        return []


class ActionCreateOrder(Action):
    """Action pour créer une commande"""

    def name(self) -> Text:
        return "action_create_order"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        
        product_name = tracker.get_slot("product_name")
        quantity = tracker.get_slot("quantity") or 1
        location = tracker.get_slot("location")
        payment_method = tracker.get_slot("payment_method")
        
        if not all([product_name, location, payment_method]):
            dispatcher.utter_message(
                text="❌ Informations manquantes pour créer la commande."
            )
            return []
        
        try:
            response = requests.post(
                f"{BACKEND_API}/orders",
                json={
                    "productName": product_name,
                    "quantity": quantity,
                    "location": location,
                    "paymentMethod": payment_method
                },
                headers=get_headers(tracker),
                timeout=5
            )
            
            if response.status_code == 201:
                order = response.json()
                order_id = order.get('orderId', 'N/A')
                
                message = f"✅ Commande créée avec succès !\n\n"
                message += f"📦 Numéro : {order_id}\n"
                message += f"🛍️ Produit : {product_name} x{quantity}\n"
                message += f"📍 Livraison : {location}\n"
                message += f"💳 Paiement : {payment_method}\n\n"
                message += f"Merci pour votre commande ! 🎉"
                
                dispatcher.utter_message(text=message)
            else:
                dispatcher.utter_message(
                    text="❌ Impossible de créer la commande. Réessayez ou contactez le support."
                )
        except Exception as e:
            logger.error(f"Erreur create_order: {e}")
            dispatcher.utter_message(text="😕 Erreur lors de la création de la commande.")
        
        return [
            SlotSet("product_name", None),
            SlotSet("quantity", None),
            SlotSet("location", None),
            SlotSet("payment_method", None)
        ]


class ValidateOrderForm(FormValidationAction):
    """Validation du formulaire de commande"""

    def name(self) -> Text:
        return "validate_order_form"

    def validate_product_name(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Valide le nom du produit"""
        if len(slot_value) < 2:
            dispatcher.utter_message(text="Le nom du produit est trop court.")
            return {"product_name": None}
        return {"product_name": slot_value}

    def validate_quantity(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Valide la quantité"""
        try:
            qty = int(slot_value)
            if qty <= 0 or qty > 100:
                dispatcher.utter_message(text="La quantité doit être entre 1 et 100.")
                return {"quantity": None}
            return {"quantity": qty}
        except (ValueError, TypeError):
            dispatcher.utter_message(text="Veuillez entrer un nombre valide.")
            return {"quantity": None}
