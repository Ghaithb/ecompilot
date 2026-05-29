/**
 * EcomPilot — smoke test de toutes les fonctionnalités API
 * Usage: node scripts/test-all-features.mjs
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api/v1';

const results = [];

async function test(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, status: 'OK', detail: detail ?? '' });
    console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (e) {
    const msg = e.message || String(e);
    results.push({ name, status: 'FAIL', detail: msg });
    console.log(`❌ ${name} — ${msg}`);
  }
}

async function req(method, path, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (expectStatus && res.status !== expectStatus) {
    throw new Error(`HTTP ${res.status} (attendu ${expectStatus}): ${text.slice(0, 200)}`);
  }
  if (!expectStatus && res.status >= 400) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, data };
}

const ts = Date.now();
const testEmail = `test_${ts}@ecompilot.local`;
const testPassword = 'TestPass123!';

let token = '';
let tenantId = '';
let productId = '';
let orderId = '';
let websiteSlug = '';

console.log('\n🔍 EcomPilot — Test complet des fonctionnalités\n');
console.log(`API: ${BASE}\n`);

// ── PUBLIC ──
await test('Health check', async () => {
  const { data } = await req('GET', '/health');
  return data?.status || 'up';
});

await test('Debug sans auth', async () => {
  const { data } = await req('GET', '/debug/no-auth');
  return data?.message;
});

await test('Localisations Tunisie', async () => {
  const { data } = await req('GET', '/public/website/locations/tunisia');
  const gov = data?.governorates?.length ?? data?.length ?? 0;
  return `${gov} gouvernorats`;
});

await test('Webhook Meta GET (vérification)', async () => {
  const { data } = await req('GET', '/public/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=ecompilot_verify&hub.challenge=test123');
  if (data !== 'test123' && data?.toString?.() !== 'test123') throw new Error('Challenge incorrect');
  return 'challenge OK';
});

await test('Devise — liste', async () => {
  const { data } = await req('GET', '/currency/list');
  return `${(data?.currencies || data || []).length || '?'} devises`;
});

// ── AUTH ──
await test('Inscription', async () => {
  const { data } = await req('POST', '/auth/register', {
    body: {
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      country: 'TN',
      phone: '+21620000000',
      companyName: `Boutique Test ${ts}`,
    },
  });
  token = data.access_token;
  tenantId = data.user?.tenant?.id || data.user?.tenantId;
  return data.user?.email;
});

await test('Login', async () => {
  const { data } = await req('POST', '/auth/login', {
    body: { email: testEmail, password: testPassword },
  });
  token = data.access_token;
  return 'JWT obtenu';
});

await test('Profil auth', async () => {
  const { data } = await req('GET', '/auth/profile', { token });
  tenantId = data?.tenant?.id || data?.tenantId || tenantId;
  return data?.email;
});

await test('Onboarding status', async () => {
  const { data } = await req('GET', '/onboarding/status', { token });
  return `${data?.completedSteps?.length ?? 0} étapes complétées`;
});

// ── PRODUCTS ──
await test('Créer produit', async () => {
  const { data } = await req('POST', '/products', {
    token,
    body: {
      title: `Produit Test ${ts}`,
      description: 'Produit de test EcomPilot',
      variants: [{
        sku: `SKU-${ts}`,
        name: 'Default',
        price: 49.99,
        compareAtPrice: 69.99,
        inventory: 100,
      }],
      category: 'Test',
      status: 'active',
    },
  });
  productId = data._id || data.id;
  return productId;
});

await test('Lister produits', async () => {
  const { data } = await req('GET', '/products', { token });
  const count = Array.isArray(data) ? data.length : data?.products?.length ?? data?.total ?? 0;
  return `${count} produit(s)`;
});

await test('Inventaire summary', async () => {
  const { data } = await req('GET', '/inventory/summary', { token });
  return `${data?.totalProducts ?? data?.total ?? '?'} produits en stock`;
});

// ── CUSTOMERS ──
await test('Stats clients', async () => {
  const { data } = await req('GET', '/customers/stats', { token });
  return `${data?.total ?? 0} clients`;
});

// ── CART ──
await test('Panier — ajouter produit', async () => {
  if (!productId) throw new Error('Pas de productId');
  const { data } = await req('POST', '/cart/add', {
    token,
    body: { productId, quantity: 1 },
  });
  return `${data?.items?.length ?? 1} article(s)`;
});

await test('Panier — lire', async () => {
  const { data } = await req('GET', '/cart', { token });
  return `${data?.items?.length ?? 0} article(s), total ${data?.total ?? 0}`;
});

// ── ORDERS (COD + OTP) ──
await test('Créer commande COD', async () => {
  if (!productId) throw new Error('Pas de productId');
  const { data } = await req('POST', '/orders', {
    token,
    body: {
      orderNumber: `ORD-${ts}`,
      customerEmail: 'client@test.local',
      lineItems: [{
        productId,
        variantId: `SKU-${ts}`,
        title: `Produit Test ${ts}`,
        quantity: 1,
        price: 49.99,
        total: 49.99,
      }],
      subtotal: 49.99,
      total: 49.99,
      currency: 'TND',
      paymentMethod: 'cod',
      shippingAddress: {
        firstName: 'Client',
        lastName: 'Test',
        address1: '12 rue test',
        city: 'Tunis',
        province: 'Tunis',
        country: 'TN',
        zip: '1000',
        phone: '+21698765432',
      },
    },
  });
  orderId = data._id || data.id;
  return `Commande ${orderId}, OTP envoyé (simulé)`;
});

// ── ANALYTICS ──
await test('Dashboard analytics', async () => {
  const { data } = await req('GET', '/analytics/dashboard', { token });
  return `Revenu: ${data?.totalRevenue ?? data?.revenue ?? 0}`;
});

await test('Funnel conversion', async () => {
  const { data } = await req('GET', '/analytics/funnel', { token });
  return `Étapes: ${Object.keys(data || {}).length}`;
});

await test('COD delivery stats', async () => {
  const { data } = await req('GET', '/analytics/cod-delivery', { token });
  return 'OK';
});

// ── CONVERSION ──
await test('Centre conversion', async () => {
  const { data } = await req('GET', '/abandoned-cart/conversion-center', { token });
  return `${data?.cartsToRelance ?? 0} paniers à relancer`;
});

await test('Stats paniers abandonnés', async () => {
  const { data } = await req('GET', '/abandoned-cart/stats', { token });
  return `${data?.total ?? 0} paniers total`;
});

// ── WHATSAPP ──
await test('WhatsApp configuration', async () => {
  const { data } = await req('GET', '/whatsapp/configuration', { token });
  return `${data?.provider}, configuré: ${data?.configured}`;
});

await test('WhatsApp envoi simulé', async () => {
  const { data } = await req('POST', '/whatsapp/send-message', {
    token,
    body: { to: '+21698765432', message: 'Test EcomPilot smoke test' },
  });
  return data?.success ? 'envoyé (simulé)' : data?.error;
});

// ── COD TRUST ──
await test('COD trust check', async () => {
  const { data } = await req('GET', '/cod-trust/check/+21698765432', { token });
  return `Score: ${data?.score ?? data?.trustScore ?? '?'}, bloqué: ${data?.blocked ?? false}`;
});

// ── COUPONS ──
await test('Créer coupon', async () => {
  const { data } = await req('POST', '/coupons', {
    token,
    body: {
      code: `TEST${ts}`,
      description: 'Coupon test smoke',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 100,
    },
  });
  return data?.code || data?._id;
});

await test('Valider coupon', async () => {
  const { data } = await req('POST', '/coupons/validate', {
    token,
    body: { code: `TEST${ts}`, orderAmount: 100 },
  });
  return data?.valid ? 'valide' : 'invalide';
});

// ── WEBSITE ──
await test('Générer site IA', async () => {
  const { data } = await req('POST', '/website/generate', {
    token,
    body: {
      companyName: `Shop ${ts}`,
      business: { industry: 'mode', description: 'Boutique mode tunisienne' },
      contact: { email: testEmail, phone: '+21620000000', city: 'Tunis', country: 'Tunisie' },
    },
  });
  websiteSlug = data?.slug || websiteSlug;
  return data?.slug || data?.message || 'généré';
});

await test('Site web GET', async () => {
  const { data } = await req('GET', '/website', { token });
  websiteSlug = data?.slug || websiteSlug;
  return `slug: ${websiteSlug}, publié: ${data?.published ?? false}`;
});

// ── PUBLIC STORE (if slug exists) ──
if (websiteSlug) {
  await test('Store public — produits', async () => {
    const { data } = await req('GET', `/public/website/${websiteSlug}/products`);
    const count = Array.isArray(data) ? data.length : data?.products?.length ?? 0;
    return `${count} produit(s) publics`;
  });

  await test('Store public — commande COD', async () => {
    if (!productId) throw new Error('Pas de productId');
    const { data } = await req('POST', `/public/website/${websiteSlug}/orders`, {
      body: {
        items: [{
          productId,
          title: `Produit Test ${ts}`,
          quantity: 1,
          price: 49.99,
        }],
        customer: {
          name: 'Public Client',
          phone: '+21691234567',
          address: '1 avenue test',
          governorate: 'Sfax',
          delegation: 'Sfax Ville',
          city: 'Sfax',
        },
        total: 49.99,
        paymentMethod: 'cod',
        currency: 'TND',
      },
    });
    return `Commande publique ${data?.orderId || data?._id || data?.order?._id || 'créée'}`;
  });

  await test('Panier abandonné public', async () => {
    const { data } = await req('POST', `/public/website/${websiteSlug}/abandoned-cart`, {
      body: {
        customerName: 'Abandon Test',
        customerPhone: '+21691111111',
        sessionId: `sess_${ts}`,
        items: [{
          productId,
          title: 'Test',
          quantity: 1,
          price: 49.99,
        }],
        total: 49.99,
      },
    });
    return data?.cartId || data?._id || 'enregistré';
  });
}

// ── NOTIFICATIONS ──
await test('Notifications unread count', async () => {
  const { data } = await req('GET', '/notifications/unread-count', { token });
  return `${data?.count ?? data ?? 0} non lues`;
});

// ── ALERTS ──
await test('Alertes stock', async () => {
  const { data } = await req('GET', '/alerts/stock', { token });
  return `${Array.isArray(data) ? data.length : data?.alerts?.length ?? 0} alertes`;
});

// ── SEARCH ──
await test('Recherche globale', async () => {
  const { data } = await req('GET', '/search?q=test', { token });
  return 'OK';
});

// ── AI ──
await test('AI dashboard insights', async () => {
  const { data } = await req('GET', '/ai/dashboard/insights', { token });
  return data?.insights?.length ? `${data.insights.length} insights` : 'OK';
});

// ── RASA ──
await test('Rasa health', async () => {
  const { data } = await req('GET', '/rasa/health', { token });
  return data?.status || 'simulation';
});

await test('Rasa message', async () => {
  const { data } = await req('POST', '/rasa/message', {
    token,
    body: { message: 'Bonjour' },
  });
  return data?.responses?.[0]?.text?.slice(0, 50) || data?.text?.slice(0, 50) || 'réponse reçue';
});

// ── PAYMENT ──
await test('Payment Tunisia status', async () => {
  const { data } = await req('GET', '/payment/tunisia/status', { token });
  return 'OK';
});

// ── EXPORT ──
await test('Export stats', async () => {
  const { data } = await req('GET', '/export/stats', { token });
  return 'OK';
});

// ── SUBSCRIPTIONS ──
await test('Plans abonnement', async () => {
  const { data } = await req('GET', '/subscriptions/plans', { token });
  return `${(data?.plans || data || []).length || '?'} plans`;
});

// ── SUMMARY ──
console.log('\n' + '═'.repeat(50));
const ok = results.filter(r => r.status === 'OK').length;
const fail = results.filter(r => r.status === 'FAIL').length;
console.log(`\n📊 RÉSULTAT: ${ok}/${results.length} OK, ${fail} échecs\n`);

if (fail > 0) {
  console.log('Échecs:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  • ${r.name}: ${r.detail}`);
  });
}

process.exit(fail > 0 ? 1 : 0);
