/**
 * EcomPilot — Test de TOUTES les routes (API + frontend SPA)
 * Usage: node scripts/test-all-routes.mjs
 */
const API = process.env.API_URL || 'http://127.0.0.1:3001/api/v1';
async function resolveWebBase() {
  if (process.env.WEB_URL) return process.env.WEB_URL;
  for (const port of [5175, 5173, 5174, 5176]) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) return `http://127.0.0.1:${port}`;
    } catch {
      /* try next port */
    }
  }
  return 'http://127.0.0.1:5173';
}

const WEB = await resolveWebBase();

const apiResults = [];
const webResults = [];

function apiPass(status, opts = {}) {
  const { allow = [200, 201, 204], allow404, allow401, allow400, allow403 } = opts;
  if (allow.includes(status)) return true;
  if (allow404 && status === 404) return true;
  if (allow401 && status === 401) return true;
  if (allow400 && status === 400) return true;
  if (allow403 && status === 403) return true;
  return false;
}

async function apiCall(method, path, { token, body, noAuth } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token && !noAuth) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, text: text.slice(0, 300) };
}

async function testApi(label, method, path, opts = {}) {
  try {
    const r = await apiCall(method, path, opts);
    const ok = apiPass(r.status, opts.pass);
    apiResults.push({
      label,
      method,
      path,
      status: r.status,
      ok,
      detail: ok ? '' : r.text,
    });
    console.log(`${ok ? '✅' : '❌'} [API] ${method} ${path} → ${r.status}${opts.note ? ` (${opts.note})` : ''}`);
    if (!ok) console.log(`   ↳ ${r.text.slice(0, 120)}`);
    return { ok, r };
  } catch (e) {
    apiResults.push({ label, method, path, status: 0, ok: false, detail: e.message });
    console.log(`❌ [API] ${method} ${path} — ${e.message}`);
    return { ok: false };
  }
}

async function testWeb(path, expectedFinal) {
  try {
    const res = await fetch(`${WEB}${path}`, { redirect: 'follow' });
    const html = await res.text();
    const hasRoot = html.includes('id="root"') || html.includes("id='root'");
    const ok = res.status === 200 && hasRoot;
    const finalPath = new URL(res.url).pathname;
    webResults.push({
      path,
      status: res.status,
      ok,
      final: finalPath,
      expected: expectedFinal,
    });
    const redirectNote =
      expectedFinal && finalPath !== path.replace(/\/$/, '') && finalPath !== path
        ? ` → ${finalPath}`
        : '';
    console.log(
      `${ok ? '✅' : '❌'} [WEB] ${path} → ${res.status}${redirectNote}`,
    );
    return ok;
  } catch (e) {
    webResults.push({ path, status: 0, ok: false, detail: e.message });
    console.log(`❌ [WEB] ${path} — ${e.message}`);
    return false;
  }
}

const ts = Date.now();
const email = `routes_${ts}@ecompilot.local`;
const password = 'TestPass123!';
let token = '';
let productId = '';
let orderId = '';
let websiteSlug = 'demo-shop';
let couponCode = `R${ts}`;

console.log('\n══════════════════════════════════════════════════');
console.log('  EcomPilot — Test de TOUTES les routes');
console.log('══════════════════════════════════════════════════');
console.log(`API:  ${API}`);
console.log(`WEB:  ${WEB}\n`);

// ─── Setup ───
console.log('── Setup (auth + données) ──\n');
const reg = await apiCall('POST', '/auth/register', {
  body: {
    email,
    password,
    firstName: 'Route',
    lastName: 'Test',
    country: 'TN',
    phone: '+21620000000',
    companyName: `Shop Routes ${ts}`,
  },
});
if (reg.status >= 400) throw new Error(`Register failed: ${reg.status} ${reg.text}`);
token = reg.data.access_token;

await apiCall('POST', '/auth/login', { body: { email, password } });

const prod = await apiCall('POST', '/products', {
  token,
  body: {
    title: `Produit Routes ${ts}`,
    description: 'Test routes',
    variants: [{ sku: `SKU-R${ts}`, name: 'Default', price: 29, inventory: 50 }],
    category: 'Test',
    status: 'active',
  },
});
productId = prod.data?._id || prod.data?.id || '';

const site = await apiCall('POST', '/website/generate', {
  token,
  body: {
    companyName: `Shop Routes ${ts}`,
    business: { industry: 'ecommerce', description: 'Boutique test routes' },
    contact: { email, phone: '+21620000000', city: 'Tunis', country: 'Tunisie' },
  },
});
websiteSlug = site.data?.slug || websiteSlug;

const ord = await apiCall('POST', '/orders', {
  token,
  body: {
    orderNumber: `ORD-R${ts}`,
    customerEmail: 'c@test.local',
    lineItems: [
      {
        productId,
        variantId: `SKU-R${ts}`,
        title: 'P',
        quantity: 1,
        price: 29,
        total: 29,
      },
    ],
    subtotal: 29,
    total: 29,
    currency: 'TND',
    paymentMethod: 'cod',
    shippingAddress: {
      firstName: 'A',
      lastName: 'B',
      address1: '1 rue',
      city: 'Tunis',
      province: 'Tunis',
      country: 'TN',
      zip: '1000',
      phone: '+21698765432',
    },
  },
});
orderId = ord.data?._id || ord.data?.id || '';

console.log(`   token OK | product=${productId?.slice?.(-6) || '?'} | slug=${websiteSlug}\n`);

// ─── API ROUTES ───
console.log('── Routes API (GET accessibles + POST critiques) ──\n');

const P = { pass: { allow: [200, 201, 204], allow404: true, allow400: true } };
const PA = { pass: { allow: [200, 201, 204], allow404: true, allow400: true }, token };
const P401 = { pass: { allow: [401], allow403: true }, noAuth: true, note: 'auth requis' };

const apiTests = [
  // App
  ['GET', '/', { ...P, noAuth: true }],
  ['GET', '/health', { ...P, noAuth: true }],
  ['GET', '/debug/no-auth', { ...P, noAuth: true }],
  ['GET', '/debug/auth', PA],
  ['GET', '/debug/tenant', PA],
  // Auth
  ['GET', '/auth/profile', PA],
  ['GET', '/auth/test-jwt', PA],
  ['POST', '/auth/refresh', { ...P, body: {}, token }],
  // Public
  ['GET', '/public/website/locations/tunisia', { ...P, noAuth: true }],
  ['GET', `/public/website/${websiteSlug}`, { pass: { allow: [200] }, noAuth: true, note: 'HTML boutique' }],
  ['GET', `/public/website/${websiteSlug}/products`, { ...P, noAuth: true }],
  ['GET', `/public/website/${websiteSlug}/payment-methods`, { ...P, noAuth: true }],
  ['GET', `/public/website/${websiteSlug}/availability`, { ...P, noAuth: true }],
  ['GET', '/public/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=ecompilot_verify&hub.challenge=ok', { pass: { allow: [200] }, noAuth: true }],
  // Currency
  ['GET', '/currency/list', { ...P, noAuth: true }],
  ['GET', '/currency/rates/TND', { ...P, noAuth: true }],
  ['GET', '/currency/info/TND', { ...P, noAuth: true }],
  ['GET', '/currency/convert?from=TND&to=EUR&amount=100', { ...P, noAuth: true }],
  ['GET', '/currency/pricing/TND', { ...P, noAuth: true }],
  ['GET', '/currency/pricing-by-country/TN', { ...P, noAuth: true }],
  ['GET', '/currency/validate?amount=10&currency=TND', { ...P, noAuth: true }],
  // Products
  ['GET', '/products', PA],
  ['GET', '/products/categories', PA],
  ['GET', '/products/tags', PA],
  ['GET', `/products/${productId}`, PA],
  // Orders
  ['GET', '/orders', PA],
  ['GET', `/orders/${orderId}`, PA],
  // Cart
  ['GET', '/cart', PA],
  // Customers
  ['GET', '/customers', PA],
  ['GET', '/customers/stats', PA],
  // Inventory
  ['GET', '/inventory/summary', PA],
  ['GET', '/inventory/items', PA],
  // Analytics
  ['GET', '/analytics/dashboard', PA],
  ['GET', '/analytics/sales', PA],
  ['GET', '/analytics/inventory', PA],
  ['GET', '/analytics/top-products', PA],
  ['GET', '/analytics/cod-delivery', PA],
  ['GET', '/analytics/product-performance', PA],
  ['GET', '/analytics/funnel', PA],
  ['GET', '/analytics/revenue-chart', PA],
  ['GET', '/analytics/export', PA],
  // Abandoned cart
  ['GET', '/abandoned-cart', PA],
  ['GET', '/abandoned-cart/stats', PA],
  ['GET', '/abandoned-cart/conversion-center', PA],
  ['GET', '/abandoned-cart-recovery/stats', PA],
  // WhatsApp
  ['GET', '/whatsapp/configuration', PA],
  ['GET', '/whatsapp/messages', PA],
  ['GET', '/whatsapp/statistics', PA],
  ['GET', '/whatsapp/chat-widget-url', PA],
  // COD trust
  ['GET', '/cod-trust/blacklist', PA],
  ['GET', '/cod-trust/check/+21698765432', PA],
  // Coupons
  ['GET', '/coupons', PA],
  ['GET', '/coupons/stats', PA],
  // Website
  ['GET', '/website', PA],
  ['GET', '/website/stats', PA],
  ['GET', '/website/pages', PA],
  ['GET', '/website/config', PA],
  ['GET', '/website/services', PA],
  ['POST', '/website/refresh', { ...PA, body: {} }],
  // Store public alt
  ['GET', `/store/${websiteSlug}`, { ...P, noAuth: true }],
  // Onboarding
  ['GET', '/onboarding/status', PA],
  ['GET', '/onboarding/next-steps', PA],
  ['GET', '/onboarding/survey/status', PA],
  // Notifications & alerts
  ['GET', '/notifications', PA],
  ['GET', '/notifications/unread-count', PA],
  ['GET', '/alerts/stock', PA],
  ['GET', '/alerts/stock/statistics', PA],
  ['GET', '/alerts/payments', PA],
  ['GET', '/alerts/finance', PA],
  ['GET', '/alerts/security', PA],
  ['GET', '/alerts/rules', PA],
  // Search
  ['GET', '/search?q=test', PA],
  ['GET', '/search/products?q=test', PA],
  ['GET', '/search/orders?q=test', PA],
  // AI
  ['GET', '/ai/dashboard/insights', PA],
  ['GET', '/ai/forecasts/sales', PA],
  ['GET', '/ai/inventory/analysis', PA],
  ['GET', '/ai/analytics/financial', PA],
  ['GET', '/ai/security/anomalies', PA],
  ['GET', '/ai/recommendations', { ...PA, pass: { allow: [200], allow400: true } }],
  ['GET', '/ai/recommendations/ml', PA],
  // Rasa
  ['GET', '/rasa/health', PA],
  ['GET', '/rasa/conversations', PA],
  ['GET', '/rasa/analytics', PA],
  ['GET', '/rasa/analytics/intents', PA],
  ['GET', '/rasa/intents', PA],
  ['GET', '/rasa/config', PA],
  ['GET', '/rasa/config/status/open', PA],
  // Payment
  ['GET', '/payment/tunisia/status', PA],
  ['GET', '/payment/mobile-money/providers/TN', PA],
  // Export / import templates
  ['GET', '/export/stats', PA],
  ['GET', '/export/products', PA],
  ['GET', '/export/orders', PA],
  ['GET', '/export/customers', PA],
  ['GET', '/import/templates/products', PA],
  ['GET', '/import/templates/orders', PA],
  // Subscriptions & billing
  ['GET', '/subscriptions/plans', PA],
  ['GET', '/subscriptions/current', PA],
  // Integrations
  ['GET', '/integrations', PA],
  ['GET', '/integrations/shopify/status', PA],
  ['GET', '/integrations/social/status', PA],
  // Marketing & discounts
  ['GET', '/marketing/campaigns', PA],
  ['GET', '/marketing/compare', PA],
  ['GET', '/discounts', PA],
  ['GET', '/reviews', PA],
  ['GET', '/reviews/stats', PA],
  ['GET', '/email-marketing/campaigns', PA],
  ['GET', '/email-marketing/subscribers', PA],
  ['GET', '/email-marketing/templates', PA],
  // Ads
  ['GET', '/ads/campaigns/all', PA],
  // Budgets & financing
  ['GET', '/budgets', PA],
  ['GET', '/budgets/recommendations', PA],
  ['GET', '/financing/dashboard', PA],
  // Purchase orders
  ['GET', '/purchase-orders', PA],
  // Voice calls
  ['GET', '/voice-calls', PA],
  ['GET', '/voice-calls/stats', PA],
  // Shipping
  ['GET', '/shipping/track/TEST123', { ...PA, pass: { allow: [200, 404], allow400: true } }],
  // Modules avec préfixe doublé (connus)
  ['GET', '/booking', PA],
  ['GET', '/booking/services', PA],
  ['GET', '/booking/stats', PA],
  ['GET', '/sales/quotes', PA],
  ['GET', '/sales/invoices', PA],
  ['GET', '/sales/stats', PA],
  ['GET', '/staff', PA],
  ['GET', '/staff/stats', PA],
  ['GET', '/accounting/accounts', PA],
  ['GET', '/accounting/transactions', PA],
  ['GET', '/accounting/reports/summary', PA],
  ['GET', '/accounting/reports/cashflow', PA],
  // Admin (peut 403 si pas admin)
  ['GET', '/admin/users', { ...PA, pass: { allow: [200, 403], allow404: true } }],
  // Sans auth → 401
  ['GET', '/products', P401],
  ['GET', '/orders', P401],
];

for (const [method, path, opts] of apiTests) {
  await testApi(`${method} ${path}`, method, path, opts);
}

// POST critiques
console.log('\n── Routes API POST (écriture) ──\n');
await testApi('POST cart/add', 'POST', '/cart/add', {
  token,
  body: { productId, quantity: 1 },
  pass: { allow: [200, 201] },
});
await testApi('POST coupons', 'POST', '/coupons', {
  token,
  body: {
    code: couponCode,
    description: 'Coupon test routes',
    discountType: 'percentage',
    discountValue: 5,
    usageLimit: 10,
  },
  pass: { allow: [200, 201] },
});
await testApi('POST coupons/validate', 'POST', '/coupons/validate', {
  token,
  body: { code: couponCode, orderAmount: 50 },
  pass: { allow: [200, 201] },
});
await testApi('POST rasa/message', 'POST', '/rasa/message', {
  token,
  body: { message: 'Bonjour' },
  pass: { allow: [200, 201] },
});
await testApi('POST whatsapp/send', 'POST', '/whatsapp/send-message', {
  token,
  body: { to: '+21698765432', message: 'test routes' },
  pass: { allow: [200, 201], allow400: true },
});
await testApi('POST public order', 'POST', `/public/website/${websiteSlug}/orders`, {
  body: {
    items: [{ productId, title: 'Produit Routes', quantity: 1, price: 29 }],
    customer: {
      name: 'Client Routes',
      phone: '+21698765432',
      email: 'client.routes@test.local',
      address: '12 avenue Habib Bourguiba',
      governorate: 'Tunis',
      delegation: 'Tunis',
      city: 'Tunis',
      country: 'TN',
    },
    total: 29,
    paymentMethod: 'cod',
    currency: 'TND',
  },
  pass: { allow: [200, 201] },
});
await testApi('POST abandoned-cart', 'POST', `/public/website/${websiteSlug}/abandoned-cart`, {
  body: {
    customerName: 'X',
    customerPhone: '+21691111111',
    sessionId: `s${ts}`,
    items: [{ productId, title: 'T', quantity: 1, price: 29 }],
    total: 29,
  },
  pass: { allow: [200, 201], allow400: true },
});

// ─── FRONTEND ROUTES ───
console.log('\n── Routes Frontend (SPA) ──\n');

const webRoutes = [
  ['/login', '/login'],
  ['/dashboard', '/dashboard'],
  ['/orders', '/orders'],
  ['/products', '/products'],
  ['/customers', '/customers'],
  ['/conversion', '/conversion'],
  ['/discounts', '/discounts'],
  ['/whatsapp-settings', '/whatsapp-settings'],
  ['/website', '/website'],
  ['/website/settings', '/website/settings'],
  ['/website/wizard', '/website'],
  ['/website/templates', '/website'],
  ['/website/pages', '/website'],
  ['/website/builder/new', '/website'],
  ['/settings', '/settings'],
  ['/profile', '/profile'],
  ['/alerts', '/alerts'],
  ['/notifications-settings', '/notifications-settings'],
  ['/onboarding/survey', '/onboarding/survey'],
  ['/site-preview', '/site-preview'],
  ['/checkout', '/checkout'],
  ['/payment/return', '/payment/return'],
  [`/store/${websiteSlug}`, `/store/${websiteSlug}`],
  ['/site/demo', '/site/demo'],
  // Redirections MVP → dashboard ou autre
  ['/ai-copilot', '/dashboard'],
  ['/analytics', '/dashboard'],
  ['/integrations', '/settings'],
  ['/inventory', '/products'],
  ['/content', '/website'],
  ['/abandoned-cart', '/conversion'],
  ['/currency-settings', '/settings'],
  ['/admin/users', '/admin/users'],
  ['/admin/settings', '/admin/settings'],
  ['/unknown-page-404', '/dashboard'],
];

for (const [path, expected] of webRoutes) {
  await testWeb(path, expected);
}

// ─── SUMMARY ───
console.log('\n══════════════════════════════════════════════════');
const apiOk = apiResults.filter((r) => r.ok).length;
const apiFail = apiResults.filter((r) => !r.ok).length;
const webOk = webResults.filter((r) => r.ok).length;
const webFail = webResults.filter((r) => !r.ok).length;

console.log(`\n📊 API:  ${apiOk}/${apiResults.length} OK, ${apiFail} échecs`);
console.log(`📊 WEB:  ${webOk}/${webResults.length} OK, ${webFail} échecs`);
console.log(`📊 TOTAL: ${apiOk + webOk}/${apiResults.length + webResults.length} OK\n`);

if (apiFail > 0) {
  console.log('Échecs API:');
  apiResults
    .filter((r) => !r.ok)
    .forEach((r) => console.log(`  • ${r.method} ${r.path} → ${r.status} ${r.detail || ''}`));
}
if (webFail > 0) {
  console.log('Échecs WEB:');
  webResults
    .filter((r) => !r.ok)
    .forEach((r) => console.log(`  • ${r.path} → ${r.status} ${r.detail || ''}`));
}

process.exit(apiFail + webFail > 0 ? 1 : 0);
