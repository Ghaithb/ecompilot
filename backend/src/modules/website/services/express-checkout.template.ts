import { TUNISIA_GOVERNORATES } from '../../../common/data/tunisia-locations';

interface ExpressCheckoutConfig {
  slug: string;
  currency?: string;
  whatsappNumber?: string;
  companyName?: string;
}

export function generateExpressCheckoutHTML(config: ExpressCheckoutConfig): string {
  const currency = config.currency || 'TND';
  const currencySymbol = currency === 'TND' ? 'DT' : currency;

  return `
    <div x-data="checkout" x-show="isOpen" class="fixed inset-0 z-[100] overflow-y-auto" style="display:none;">
      <div class="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
        <div @click="closeCheckout()" class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div class="p-5 sm:p-6">
            <div x-show="step === 'form'">
              <h2 class="text-2xl font-black mb-1">Commander en 30 sec</h2>
              <p class="text-sm text-gray-500 mb-4">Paiement à la livraison · Sans compte</p>
              <div x-show="cart.item" class="mb-4 p-3 bg-gray-50 rounded-xl flex gap-3 items-center">
                <div class="text-2xl">🛍️</div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold truncate" x-text="cart.item?.name"></div>
                  <div class="text-primary font-bold" x-text="cart.item ? (cart.item.price + ' ${currencySymbol}') : ''"></div>
                </div>
              </div>
              <form @submit.prevent="submitOrder" class="space-y-3">
                <div x-show="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm" x-text="error"></div>
                <div>
                  <label class="text-sm font-semibold">Nom complet *</label>
                  <input x-model="form.customerName" type="text" required class="w-full mt-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-base" placeholder="Ex: Ahmed Ben Ali">
                </div>
                <div>
                  <label class="text-sm font-semibold">Téléphone *</label>
                  <input x-model="form.phoneNumber" @input="formatPhone()" type="tel" inputmode="tel" required class="w-full mt-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-base" placeholder="22 123 456">
                  <p x-show="phoneError" class="text-xs text-red-500 mt-1" x-text="phoneError"></p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-sm font-semibold">Gouvernorat *</label>
                    <select x-model="form.governorate" @change="updateDelegations()" required class="w-full mt-1 px-3 py-3 border-2 border-gray-100 rounded-xl bg-white text-sm">
                      <option value="">Choisir</option>
                      <template x-for="g in governorates" :key="g.name">
                        <option :value="g.name" x-text="g.name"></option>
                      </template>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-semibold">Délégation</label>
                    <select x-model="form.delegation" class="w-full mt-1 px-3 py-3 border-2 border-gray-100 rounded-xl bg-white text-sm">
                      <option value="">Choisir</option>
                      <template x-for="d in delegations" :key="d">
                        <option :value="d" x-text="d"></option>
                      </template>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-semibold">Adresse *</label>
                  <input x-model="form.address" type="text" required class="w-full mt-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-base" placeholder="Rue, quartier, numéro">
                </div>
                <div class="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-sm text-green-800">
                  <span>✓</span><span>Paiement à la livraison (COD) · Livraison rapide</span>
                </div>
                <button type="submit" :disabled="loading" class="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg" style="background:linear-gradient(135deg,var(--primary,#3B82F6),var(--secondary,#10B981))">
                  <span x-show="!loading">Confirmer ma commande</span>
                  <span x-show="loading">Envoi...</span>
                </button>
                <button type="button" @click="orderViaWhatsApp()" class="w-full py-3 rounded-xl font-semibold border-2 border-green-500 text-green-700 flex items-center justify-center gap-2">
                  💬 Commander via WhatsApp
                </button>
              </form>
            </div>
            <div x-show="step === 'otp'" class="text-center py-4">
              <div class="text-4xl mb-3">📱</div>
              <h2 class="text-xl font-black mb-2">Code SMS</h2>
              <p class="text-gray-600 text-sm mb-4">Entrez le code reçu au <strong x-text="form.phoneNumber"></strong></p>
              <form @submit.prevent="verifyOtp" class="space-y-4">
                <div x-show="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm" x-text="error"></div>
                <input x-model="otpCode" type="text" maxlength="6" inputmode="numeric" required placeholder="000000" class="text-center text-3xl font-black tracking-widest w-full px-4 py-4 border-2 rounded-xl">
                <button type="submit" :disabled="loading" class="w-full py-4 rounded-xl font-bold text-white" style="background:var(--primary,#3B82F6)">Vérifier</button>
              </form>
            </div>
            <div x-show="step === 'success'" class="text-center py-6">
              <div class="text-5xl mb-3">✅</div>
              <h2 class="text-2xl font-black mb-2">Commande confirmée !</h2>
              <p class="text-gray-600 mb-6">Merci <span x-text="form.customerName"></span>, nous vous contactons bientôt.</p>
              <button @click="closeCheckout()" class="w-full py-3 bg-gray-900 text-white rounded-xl font-bold">Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

export function generateExpressCheckoutScript(config: ExpressCheckoutConfig): string {
  const { slug, currency = 'TND', whatsappNumber = '' } = config;
  const governoratesJson = JSON.stringify(TUNISIA_GOVERNORATES);
  const waNumber = whatsappNumber.replace(/\D/g, '') || '';
  const currencyLabel = currency === 'TND' ? 'DT' : currency;

  return `
<script>
document.addEventListener('alpine:init', () => {
  Alpine.data('checkout', () => ({
    isOpen: false,
    step: 'form',
    loading: false,
    error: null,
    phoneError: '',
    orderId: null,
    sessionId: localStorage.getItem('ec_session_${slug}') || ('sess_' + Date.now()),
    governorates: ${governoratesJson},
    delegations: [],
    cart: { item: null, quantity: 1 },
    form: {
      customerName: localStorage.getItem('ec_name_${slug}') || '',
      phoneNumber: localStorage.getItem('ec_phone_${slug}') || '',
      governorate: '',
      delegation: '',
      address: '',
      paymentMethod: 'cod',
      currency: '${currency}'
    },
    otpCode: '',

    init() {
      localStorage.setItem('ec_session_${slug}', this.sessionId);
    },

    updateDelegations() {
      const g = this.governorates.find(x => x.name === this.form.governorate);
      this.delegations = g ? g.delegations : [];
      this.form.delegation = '';
    },

    formatPhone() {
      const digits = this.form.phoneNumber.replace(/\\D/g, '').slice(0, 8);
      if (digits.length >= 5) {
        this.form.phoneNumber = digits.slice(0,2) + ' ' + digits.slice(2,5) + ' ' + digits.slice(5);
      } else if (digits.length >= 2) {
        this.form.phoneNumber = digits.slice(0,2) + ' ' + digits.slice(2);
      } else {
        this.form.phoneNumber = digits;
      }
    },

    normalizePhone() {
      const d = this.form.phoneNumber.replace(/\\D/g, '');
      if (d.length === 8) return '+216' + d;
      return this.form.phoneNumber;
    },

    validatePhone() {
      const d = this.form.phoneNumber.replace(/\\D/g, '');
      this.phoneError = (d.length === 8 && /^[2-9]/.test(d)) ? '' : 'Numéro tunisien invalide (8 chiffres)';
      return !this.phoneError;
    },

    openCheckout(product) {
      this.cart.item = product;
      this.cart.quantity = 1;
      this.isOpen = true;
      this.step = 'form';
      this.error = null;
    },

    closeCheckout() {
      if (this.step === 'form' && this.cart.item && !this.orderId) {
        this.saveAbandonedCart();
      }
      this.isOpen = false;
    },

    async saveAbandonedCart() {
      if (!this.cart.item) return;
      try {
        await fetch('/api/v1/public/website/${slug}/abandoned-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            customerName: this.form.customerName,
            customerPhone: this.normalizePhone(),
            items: [{
              productId: this.cart.item.id,
              title: this.cart.item.name || this.cart.item.title,
              quantity: this.cart.quantity,
              price: this.cart.item.price
            }],
            total: this.cart.item.price * this.cart.quantity
          })
        });
      } catch (e) {}
    },

    orderViaWhatsApp() {
      if (!this.cart.item) return;
      const label = '${currencyLabel}';
      const msg = encodeURIComponent(
        'Bonjour, je veux commander: ' + (this.cart.item.name || this.cart.item.title) + ' (' + this.cart.item.price + ' ' + label + ')'
      );
      const phone = '${waNumber}' || '';
      window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');
    },

    async submitOrder() {
      if (!this.validatePhone()) return;
      this.loading = true;
      this.error = null;
      localStorage.setItem('ec_name_${slug}', this.form.customerName);
      localStorage.setItem('ec_phone_${slug}', this.form.phoneNumber);

      const orderData = {
        customer: {
          name: this.form.customerName,
          phone: this.normalizePhone(),
          address: this.form.address,
          governorate: this.form.governorate,
          delegation: this.form.delegation,
          country: 'TN',
          sessionId: this.sessionId
        },
        items: [{
          productId: this.cart.item.id,
          title: this.cart.item.name || this.cart.item.title,
          quantity: this.cart.quantity,
          price: this.cart.item.price
        }],
        total: this.cart.item.price * this.cart.quantity,
        paymentMethod: 'cod',
        currency: '${currency}'
      };

      try {
        const res = await fetch('/api/v1/public/website/${slug}/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        const data = await res.json();
        if (data.success) {
          this.orderId = data.orderId;
          this.step = 'otp';
        } else {
          this.error = data.message || 'Erreur commande';
        }
      } catch (e) {
        this.error = 'Connexion impossible';
      } finally {
        this.loading = false;
      }
    },

    async verifyOtp() {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetch('/api/v1/public/website/${slug}/orders/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: this.orderId, code: this.otpCode })
        });
        const data = await res.json();
        if (data.success) this.step = 'success';
        else this.error = data.message || 'Code invalide';
      } catch (e) {
        this.error = 'Erreur vérification';
      } finally {
        this.loading = false;
      }
    }
  }));
});

function ecGetCheckout() {
  const el = document.querySelector('[x-data="checkout"]');
  if (!el) return null;
  if (typeof Alpine !== 'undefined' && typeof Alpine.$data === 'function') {
    try { return Alpine.$data(el); } catch (e) { /* Alpine not ready */ }
  }
  if (el._x_dataStack && el._x_dataStack[0]) return el._x_dataStack[0];
  return null;
}

window.openExpressCheckout = function(product) {
  const open = () => {
    const cmp = ecGetCheckout();
    if (cmp && typeof cmp.openCheckout === 'function') cmp.openCheckout(product);
  };
  if (ecGetCheckout()) open();
  else document.addEventListener('alpine:initialized', open, { once: true });
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-buy-product]');
  if (!btn) return;
  e.preventDefault();
  const product = {
    id: btn.getAttribute('data-product-id'),
    name: btn.getAttribute('data-product-name'),
    title: btn.getAttribute('data-product-name'),
    price: parseFloat(btn.getAttribute('data-product-price') || '0')
  };
  window.openExpressCheckout(product);
});
</script>`;
}

export function generateWhatsAppFloat(whatsappNumber?: string, companyName?: string): string {
  const wa = (whatsappNumber || '').replace(/\D/g, '');
  if (!wa) return '';
  return `
    <a href="https://wa.me/${wa}?text=${encodeURIComponent('Bonjour ' + (companyName || '') + ', j\'ai une question sur vos produits')}"
       target="_blank" rel="noopener"
       class="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl animate-pulse"
       aria-label="WhatsApp">💬</a>`;
}

export function generateTrustBar(): string {
  return `
    <div class="bg-gray-900 text-white py-3 text-center text-sm">
      ✓ Paiement à la livraison &nbsp;·&nbsp; ✓ Livraison rapide &nbsp;·&nbsp; ✓ Support WhatsApp &nbsp;·&nbsp; ✓ Commande sans compte
    </div>`;
}
