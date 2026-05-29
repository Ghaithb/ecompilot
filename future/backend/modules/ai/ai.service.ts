import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { MlClient } from '../../common/clients/ml.client';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private readonly logger = new Logger(AiService.name);
  private isOpenAIConfigured: boolean;
  private isGeminiConfigured: boolean;

  constructor(
    private configService: ConfigService,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private mlClient: MlClient,
  ) {
    // Configuration OpenAI
    const openaiKey = this.configService.get<string>('openai.apiKey');
    this.isOpenAIConfigured = Boolean(openaiKey && !openaiKey.includes('demo-key') && !openaiKey.includes('your-openai'));
    
    // Configuration Gemini (priorité car gratuit)
    const geminiKey = this.configService.get<string>('gemini.apiKey');
    this.isGeminiConfigured = Boolean(geminiKey && !geminiKey.includes('your-gemini') && geminiKey.length > 10);
    
    if (this.isGeminiConfigured && geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      this.logger.log('✅ Google Gemini configuré - Service IA GRATUIT activé!');
    } else if (this.isOpenAIConfigured && openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('✅ OpenAI configuré avec une vraie clé API');
    } else {
      this.logger.warn('⚠️ Aucune IA configurée - Mode simulation activé');
      this.logger.log('💡 Pour activer Gemini GRATUIT: https://ai.google.dev/');
    }
  }

  // Mode simulation pour les tests
  private getSimulatedResponse(type: string, input: any): any {
    switch (type) {
      case 'chat':
        return {
          response: `🤖 [MODE SIMULATION] Bonjour ! Je suis EcomPilot, votre assistant IA e-commerce. 
          
Vous avez dit: "${input.message}"

En mode production avec une vraie clé OpenAI, je pourrais vous aider avec:
• Analyse des ventes et prévisions
• Optimisation des prix et stratégies
• Gestion des stocks et réassort  
• Génération de contenu marketing
• Insights financiers personnalisés

Pour activer les vraies fonctionnalités IA, ajoutez votre clé OpenAI dans le fichier .env.`,
          usage: { total_tokens: 150 }
        };

      case 'content':
        return {
          title: `${input.productName} - Produit Révolutionnaire`,
          description: `🤖 [SIMULATION] Découvrez le ${input.productName}, un produit exceptionnel de la catégorie ${input.category}. 
          
Caractéristiques principales:
${input.features?.map(f => `• ${f}`).join('\n') || '• Qualité premium\n• Design innovant\n• Performance optimale'}

Cette description a été générée en mode simulation. Avec une vraie clé OpenAI, vous obtiendriez du contenu personnalisé et optimisé SEO.`,
          keywords: ['premium', 'innovation', 'qualité', input.category?.toLowerCase()],
          seoOptimized: true
        };

      case 'forecast':
        return {
          forecast: 'simulation',
          predictions: [
            { period: 'Semaine prochaine', sales: Math.floor(Math.random() * 1000) + 500 },
            { period: 'Mois prochain', sales: Math.floor(Math.random() * 5000) + 2000 },
            { period: 'Trimestre prochain', sales: Math.floor(Math.random() * 15000) + 8000 }
          ],
          confidence: '85% (simulation)',
          recommendations: [
            '🤖 Augmenter le stock pour les produits populaires',
            '🤖 Optimiser les campagnes marketing',
            '🤖 Ajuster les prix selon la demande'
          ]
        };

      default:
        return {
          message: '🤖 [SIMULATION] Fonctionnalité IA disponible en mode simulation. Configurez OpenAI pour les vraies fonctionnalités.',
          data: input
        };
    }
  }

  // Méthode helper pour utiliser l'IA (Gemini en priorité, puis OpenAI, puis simulation)
  private async callAI(prompt: string, options: { temperature?: number, maxTokens?: number } = {}): Promise<string> {
    try {
      if (this.isGeminiConfigured) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } else if (this.isOpenAIConfigured) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 1000,
        });
        return completion.choices[0].message.content || '';
      } else {
        return `🤖 [SIMULATION] Réponse simulée pour: ${prompt.substring(0, 100)}...`;
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'appel IA:', error);
      throw new BadRequestException('Service IA temporairement indisponible');
    }
  }

  // Assistant IA Copilote - Fonctionnalité principale
  async chatWithCopilot(tenantId: string, message: string, context?: any) {
    try {
      // Récupérer le contexte business du tenant
      const businessContext = await this.getBusinessContext(tenantId);
      
      const systemPrompt = `Tu es EcomPilot, l'assistant IA spécialisé en e-commerce et finance.
      
Contexte business du tenant:
${JSON.stringify(businessContext, null, 2)}

Tu peux aider avec:
- Analyse des ventes et prévisions
- Optimisation des prix et marges
- Gestion des stocks et réassort
- Stratégies marketing et contenu
- Analyse financière et trésorerie
- Recommandations d'amélioration

Réponds de manière professionnelle, précise et actionnable en français.

Message de l'utilisateur: ${message}`;

      // Priorité 1: Gemini (gratuit)
      if (this.isGeminiConfigured) {
        this.logger.log(`🤖 Chat Gemini pour tenant ${tenantId}`);
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro-latest' });
        
        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        
        return {
          response: response.text(),
          usage: { total_tokens: response.text().length },
          timestamp: new Date(),
          provider: 'Google Gemini (gratuit)'
        };
      }
      
      // Priorité 2: OpenAI (payant)
      if (this.isOpenAIConfigured) {
        this.logger.log(`🤖 Chat OpenAI pour tenant ${tenantId}`);
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        return {
          response: completion.choices[0].message.content,
          usage: completion.usage,
          timestamp: new Date(),
          provider: 'OpenAI GPT-4'
        };
      }
      
      // Fallback: Mode simulation
      this.logger.log(`🤖 Chat en mode simulation pour tenant ${tenantId}`);
      return this.getSimulatedResponse('chat', { message, context });
      
    } catch (error) {
      this.logger.error(`Erreur IA: ${error.message}`);
      throw new BadRequestException('Erreur lors de la communication avec l\'IA');
    }
  }

  // Génération de contenu produit
  async generateProductContent(tenantId: string, productData: any) {
    try {
      const prompt = `Génère un contenu marketing professionnel pour ce produit e-commerce:

Nom: ${productData.productName || productData.title || 'Produit'}
Catégorie: ${productData.category || 'Non spécifiée'}
Prix: ${productData.price || 'Non spécifié'}€
Caractéristiques: ${JSON.stringify(productData.features || productData.attributes || {})}

Génère:
1. Description produit optimisée SEO (150-200 mots)
2. Titre SEO accrocheur
3. Meta description (150 caractères max)
4. 5 tags/mots-clés pertinents
5. 3 points de vente clés

Réponds en JSON avec les clés: title, description, metaDescription, keywords, sellingPoints`;

      // Priorité 1: Gemini (gratuit)
      if (this.isGeminiConfigured) {
        this.logger.log(`🤖 Génération contenu Gemini pour tenant ${tenantId}`);
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro-latest' });
        
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        try {
          return JSON.parse(response);
        } catch {
          // Si pas du JSON valide, retourner un format structuré
          return {
            title: `${productData.productName} - Produit Premium`,
            description: response.substring(0, 300),
            metaDescription: response.substring(0, 150),
            keywords: ['premium', 'qualité', productData.category],
            sellingPoints: ['Qualité exceptionnelle', 'Satisfaction garantie', 'Livraison rapide'],
            provider: 'Google Gemini'
          };
        }
      }
      
      // Priorité 2: OpenAI (payant)
      if (this.isOpenAIConfigured) {
        this.logger.log(`🤖 Génération contenu OpenAI pour tenant ${tenantId}`);
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 800,
        });

        return JSON.parse(completion.choices[0].message.content || '{}');
      }
      
      // Fallback: Mode simulation
      this.logger.log(`🤖 Génération contenu simulation pour tenant ${tenantId}`);
      return this.getSimulatedResponse('content', productData);

    } catch (error) {
      this.logger.error(`Erreur génération contenu: ${error.message}`);
      throw new BadRequestException('Erreur lors de la génération de contenu');
    }
  }

  // Prévisions de ventes avec IA
  async generateSalesForecasts(tenantId: string, period: string = '30d') {
    try {
      // Récupérer les données historiques
      const historicalData = await this.getHistoricalSalesData(tenantId, period);
      
      // Si pas de données, retourner des prévisions vides
      if (historicalData.totalOrders === 0) {
        return {
          prediction: "Aucune donnée historique disponible",
          forecast: {
            revenue: 0,
            orders: 0,
            averageOrderValue: 0
          },
          recommendations: [
            "Commencez par ajouter des produits à votre catalogue",
            "Créez votre première campagne marketing",
            "Configurez vos méthodes de paiement"
          ],
          confidence: 0
        };
      }

      const prompt = `Analyse ces données de ventes e-commerce et génère des prévisions:

Données historiques:
${JSON.stringify(historicalData, null, 2)}

Génère des prévisions pour les 30 prochains jours:
1. Chiffre d'affaires prévu
2. Nombre de commandes estimé
3. Panier moyen prévu
4. Produits les plus vendus
5. Recommandations d'actions
6. Niveau de confiance des prévisions

Format JSON avec des valeurs numériques précises.`;

      if (this.isGeminiConfigured) {
        const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        try {
          return JSON.parse(response);
        } catch {
          return { prediction: response, forecast: null, confidence: 0.5 };
        }
      } else if (this.isOpenAIConfigured) {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        });
        return JSON.parse(completion.choices[0].message.content || '{}');
      } else {
        return this.getSimulatedResponse('forecast', historicalData);
      }
    } catch (error) {
      this.logger.error('Erreur lors des prévisions de ventes:', error);
      return {
        prediction: "Erreur lors de la génération des prévisions",
        forecast: { revenue: 0, orders: 0, averageOrderValue: 0 },
        recommendations: ["Vérifiez la configuration de l'IA"],
        confidence: 0
      };
    }
  }

  // Pricing dynamique intelligent
  async optimizePricing(tenantId: string, productId: string) {
    try {
      const product = await this.productModel.findOne({ _id: productId, tenantId });
      if (!product) {
        throw new BadRequestException('Produit non trouvé');
      }

      // Analyser les données de vente du produit
      const salesData = await this.getProductSalesData(tenantId, productId);
      
      const prompt = `Optimise le prix de ce produit e-commerce:

Produit: ${product.title}
Prix actuel: ${product.variants[0]?.price || 0}€
Coût: ${product.variants[0]?.cost || 0}€
Catégorie: ${product.category}

Données de vente:
${JSON.stringify(salesData, null, 2)}

Recommande:
1. Prix optimal suggéré
2. Marge bénéficiaire optimale
3. Stratégie de pricing (premium, compétitif, pénétration)
4. Prix psychologique recommandé
5. Justification de la recommandation

Format JSON avec calculs détaillés.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 800,
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      throw new BadRequestException('Erreur lors de l\'optimisation des prix');
    }
  }

  // Analyse intelligente des stocks
  async analyzeInventory(tenantId: string) {
    try {
      const products = await this.productModel.find({ tenantId, status: 'active' });
      
      if (products.length === 0) {
        return {
          analysis: "Aucun produit trouvé dans l'inventaire",
          stockAlerts: [],
          reorderSuggestions: [],
          overstock: [],
          recommendations: [
            "Commencez par ajouter des produits à votre catalogue",
            "Définissez des seuils de stock minimum pour chaque produit",
            "Configurez des alertes automatiques de réapprovisionnement"
          ],
          totalValue: 0
        };
      }

      const inventoryData = products.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        category: p.category,
        variants: p.variants?.map(v => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          inventory: v.inventory,
        })) || [],
      }));

      const prompt = `Analyse cet inventaire e-commerce et génère des recommandations:

Inventaire actuel:
${JSON.stringify(inventoryData, null, 2)}

Analyse et recommande:
1. Produits en rupture de stock (urgent)
2. Produits à réassortir (quantités suggérées)
3. Produits en surstock (actions recommandées)
4. Rotation des stocks par produit
5. Valeur totale de l'inventaire
6. Recommandations d'optimisation

Format JSON avec priorités et actions concrètes.`;

      const response = await this.callAI(prompt, { temperature: 0.3, maxTokens: 1200 });
      
      try {
        return JSON.parse(response);
      } catch {
        return { analysis: response, recommendations: ["Optimisez votre gestion de stock"] };
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'analyse des stocks:', error);
      return {
        analysis: "Erreur lors de l'analyse",
        recommendations: ["Vérifiez la configuration du système"],
        stockAlerts: [],
        reorderSuggestions: [],
        overstock: [],
        totalValue: 0
      };
    }
  }

  // Génération de stratégies marketing
  async generateMarketingStrategy(tenantId: string, campaign: any) {
    try {
      const businessContext = await this.getBusinessContext(tenantId);
      
      const prompt = `Génère une stratégie marketing IA pour cette campagne e-commerce:

Contexte business:
${JSON.stringify(businessContext, null, 2)}

Objectif campagne: ${campaign.objective || 'Augmenter les ventes'}
Budget: ${campaign.budget || 'Non spécifié'}€
Durée: ${campaign.duration || '30 jours'}
Cible: ${campaign.target || 'Clients existants'}

Génère:
1. Stratégie globale recommandée
2. Canaux marketing optimaux (Facebook, Google, Email, etc.)
3. Messages clés et accroches
4. Budget répartition par canal
5. KPIs à suivre
6. Timeline d'exécution
7. Contenu suggéré (posts, emails, ads)

Format JSON structuré et actionnable.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la génération de stratégie marketing');
    }
  }

  // Analyse financière intelligente
  async analyzeFinancials(tenantId: string, period: string = '30d') {
    try {
      const financialData = await this.getFinancialData(tenantId, period);
      
      if (!financialData || financialData.totalOrders === 0) {
        return {
          analysis: "Aucune donnée financière disponible",
          healthScore: 0,
          recommendations: [
            "Commencez par générer vos premières ventes",
            "Configurez vos méthodes de paiement",
            "Définissez vos objectifs financiers"
          ],
          metrics: {
            revenue: 0,
            profit: 0,
            margin: 0
          }
        };
      }

      const prompt = `Analyse ces données financières e-commerce et génère des insights:

Données financières (${period}):
${JSON.stringify(financialData, null, 2)}

Analyse et recommande:
1. Santé financière globale (score/10)
2. Tendances de revenus et marges
3. Analyse de la trésorerie
4. Ratios financiers clés
5. Points d'attention et risques
6. Recommandations d'amélioration
7. Prévisions cashflow
8. Opportunités d'optimisation

Format JSON avec métriques précises et recommandations actionables.`;

      const response = await this.callAI(prompt, { temperature: 0.3, maxTokens: 1200 });
      
      try {
        return JSON.parse(response);
      } catch {
        return { analysis: response, recommendations: ["Optimisez votre gestion financière"] };
      }
    } catch (error) {
      this.logger.error('Erreur lors de l\'analyse financière:', error);
      return {
        analysis: "Erreur lors de l'analyse financière",
        recommendations: ["Vérifiez la configuration du système"],
        healthScore: 0,
        metrics: { revenue: 0, profit: 0, margin: 0 }
      };
    }
  }

  // Détection d'anomalies IA
  async detectAnomalies(tenantId: string) {
    try {
      const recentData = await this.getAnomalyDetectionData(tenantId);
      
      if (!recentData || recentData.length === 0) {
        return {
          anomalies: [],
          alerts: [],
          summary: "Aucune anomalie détectée - données insuffisantes",
          riskLevel: "low"
        };
      }

      const prompt = `Analyse ces données e-commerce pour détecter des anomalies:

Données récentes:
${JSON.stringify(recentData, null, 2)}

Détecte:
1. Anomalies dans les ventes (pics/chutes)
2. Comportements clients suspects
3. Problèmes d'inventaire
4. Variations de prix anormales
5. Patterns de fraude potentiels
6. Alertes système

Format JSON avec niveaux de risque et actions recommandées.`;

      const response = await this.callAI(prompt, { temperature: 0.2, maxTokens: 800 });
      
      try {
        return JSON.parse(response);
      } catch {
        return { 
          anomalies: [], 
          alerts: [], 
          summary: response.substring(0, 200),
          riskLevel: "low"
        };
      }
    } catch (error) {
      this.logger.error('Erreur lors de la détection d\'anomalies:', error);
      return {
        anomalies: [],
        alerts: ["Erreur lors de l'analyse"],
        summary: "Service de détection temporairement indisponible",
        riskLevel: "unknown"
      };
    }
  }

  private async getAnomalyDetectionData(tenantId: string) {
    const recentOrders = await this.orderModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(50);

    return recentOrders.map(o => ({
      orderNumber: o.orderNumber,
      total: o.total,
      customerEmail: o.customerEmail,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      lineItems: o.lineItems?.length || 0,
    }));
  }

  private async getFinancialData(tenantId: string, period: string) {
    const days = parseInt(period.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.orderModel
      .find({ 
        tenantId, 
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      })
      .sort({ createdAt: 1 });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      period,
      orders: orders.map(o => ({
        date: o.createdAt,
        total: o.total,
        status: o.paymentStatus
      }))
    };
  }

  // Méthodes utilitaires privées
  private async getBusinessContext(tenantId: string) {
    const [products, orders] = await Promise.all([
      this.productModel.countDocuments({ tenantId }),
      this.orderModel.countDocuments({ tenantId }),
    ]);

    const recentOrders = await this.orderModel
      .find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalProducts: products,
      totalOrders: orders,
      recentRevenue: totalRevenue,
      averageOrderValue: orders > 0 ? totalRevenue / Math.min(orders, 10) : 0,
    };
  }

  private async getHistoricalSalesData(tenantId: string, period: string) {
    const days = parseInt(period.replace('d', '')) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.orderModel
      .find({ 
        tenantId, 
        createdAt: { $gte: startDate },
        paymentStatus: 'paid'
      })
      .sort({ createdAt: 1 });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      dailySales: this.groupOrdersByDay(orders),
    };
  }

  private async getProductSalesData(tenantId: string, productId: string) {
    const orders = await this.orderModel
      .find({ 
        tenantId,
        'lineItems.productId': productId,
        paymentStatus: 'paid'
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const productSales = orders.flatMap(order => 
      order.lineItems.filter(item => item.productId.toString() === productId)
    );

    return {
      totalSold: productSales.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: productSales.reduce((sum, item) => sum + item.total, 0),
      averagePrice: productSales.length > 0 ? 
        productSales.reduce((sum, item) => sum + item.price, 0) / productSales.length : 0,
      salesTrend: productSales.slice(0, 10),
    };
  }

  private groupOrdersByDay(orders: any[]) {
    const grouped = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { orders: 0, revenue: 0 };
      }
      grouped[date].orders++;
      grouped[date].revenue += order.total;
    });
    return grouped;
  }

  // Recommandations ML (algorithme simple basé sur les ventes)
  async getMlRecommendations(tenantId: string, userKey?: string) {
    try {
      // Récupérer les commandes récentes
      const orders = await this.orderModel
        .find({ tenantId, paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(500)
        .exec();

      // Compter les ventes par produit
      const productSales = new Map<string, number>();
      const productRevenue = new Map<string, number>();

      for (const order of orders) {
        for (const item of order.lineItems || []) {
          const pid = item.productId?.toString();
          if (!pid) continue;

          productSales.set(pid, (productSales.get(pid) || 0) + (item.quantity || 1));
          productRevenue.set(pid, (productRevenue.get(pid) || 0) + (item.price * (item.quantity || 1)));
        }
      }

      // Trier par nombre de ventes (produits les plus populaires)
      const sortedProducts = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([pid]) => pid);

      // Récupérer les détails des produits
      const products = await this.productModel
        .find({ _id: { $in: sortedProducts }, tenantId })
        .select(['title', 'variants.price', 'category', 'images'])
        .exec();

      const productsMap = new Map(products.map(p => [String((p as any)._id), p]));

      const items = sortedProducts.map(pid => {
        const p = productsMap.get(pid) as any;
        return {
          productId: pid,
          title: p?.title || 'Produit',
          price: p?.variants?.[0]?.price ?? null,
          category: p?.category ?? null,
          image: p?.images?.[0] ?? null,
          salesCount: productSales.get(pid) || 0,
          revenue: productRevenue.get(pid) || 0,
        };
      }).filter(item => item.title);

      return {
        items,
        model: 'popularity-based',
        algorithm: 'Basé sur les ventes récentes',
        totalCandidates: productSales.size,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la génération des recommandations ML: ${error.message}`);
      
      // Fallback: retourner les produits les plus récents
      const fallbackProducts = await this.productModel
        .find({ tenantId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select(['title', 'variants.price', 'category', 'images'])
        .exec();

      return {
        items: fallbackProducts.map((p: any) => ({
          productId: String(p._id),
          title: p.title,
          price: p.variants?.[0]?.price ?? null,
          category: p.category ?? null,
          image: p.images?.[0] ?? null,
        })),
        model: 'fallback-recent',
        algorithm: 'Produits récents (fallback)',
        totalCandidates: fallbackProducts.length,
        generatedAt: new Date(),
      };
    }
  }
}

