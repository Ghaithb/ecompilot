/**
 * EcomPilot — smoke test MVP uniquement (modules actifs)
 * Usage: node scripts/test-mvp-features.mjs
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api/v1';

const results = [];
const skipped = [];

async function test(name, fn, { optional = false } = {}) {
  try {
    const detail = await fn();
    results.push({ name, status: 'OK', detail: detail ?? '' });
    console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (e) {
    const msg = e.message || String(e);
    if (optional) {
      skipped.push({ name, detail: msg });
      console.log(`⚠️  ${name} (optionnel) — ${msg}`);
      return;
    }
    results.push({ name, status: 'FAIL', detail: msg });
    console.log(`❌ ${name} — ${msg}`);
  }
}

async function req(method, path, { token, body, expectStatus, formData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: formData ?? (body ? JSON.stringify(body) : undefined),
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (expectStatus && res.status !== expectStatus) {
    throw new Error(`HTTP ${res.status} (attendu ${expectStatus}): ${text.slice(0, 200)}`);
  }
  if (!expectStatus && res.status >= 400) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, data };
}

/** PNG 1×1 valide */
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const ts = Date.now();
const testEmail = `mvp_${ts}@ecompilot.local`;
const testPassword = 'TestPass123!';

let token = '';
let productId = '';
let websiteSlug = '';
let sessionId = `sess_mvp_${ts}`;

console.log('\n🔍 EcomPilot — Test MVP (modules actifs)\n');
console.log(`API: ${BASE}\n`);

// ── PUBLIC ──
await test('Health check', async () => {
  const { data } = await req('GET', '/health');
  return data?.status || 'up';
});

await test('Localisations Tunisie', async () => {
  const { data } = await req('GET', '/public/website/locations/tunisia');
  const gov = data?.governorates?.length ?? data?.length ?? 0;
  return `${gov} gouvernorats`;
});

await test('Webhook Meta GET', async () => {
  const { data } = await req(
    'GET',
    '/public/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=ecompilot_verify&hub.challenge=test123',
  );
  if (data !== 'test123' && data?.toString?.() !== 'test123') throw new Error('Challenge incorrect');
  return 'challenge OK';
});

await test('Devise — liste', async () => {
  const { data } = await req('GET', '/currency/list');
  const list = data?.currencies || data || [];
  return `${Array.isArray(list) ? list.length : '?'} devises`;
});

// ── AUTH ──
await test('Inscription', async () => {
  const { data } = await req('POST', '/auth/register', {
    body: {
      email: testEmail,
      password: testPassword,
      firstName: 'MVP',
      lastName: 'Test',
      country: 'TN',
      phone: '+21620000000',
      companyName: `Boutique MVP ${ts}`,
    },
  });
  token = data.access_token;
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
  return data?.email;
});

await test('Onboarding status', async () => {
  const { data } = await req('GET', '/onboarding/status', { token });
  return `${data?.completedSteps?.length ?? 0} étapes`;
});

// ── WEBSITE ──
await test('Générer boutique', async () => {
  const { data } = await req('POST', '/website/generate', {
    token,
    body: {
      companyName: `Shop MVP ${ts}`,
      business: { industry: 'ecommerce', description: 'Boutique test', primaryGoal: 'Vendre COD' },
      contact: { email: testEmail, phone: '+21620000000', city: 'Tunis', country: 'Tunisie' },
      branding: { primaryColor: '#2563eb', secondaryColor: '#7c3aed', slogan: 'Paiement à la livraison' },
    },
  });
  websiteSlug = data?.slug;
  if (!websiteSlug) throw new Error('Pas de slug');
  return websiteSlug;
});

await test('Config website', async () => {
  const { data } = await req('GET', '/website/config', { token });
  websiteSlug = data?.slug || websiteSlug;
  return `template=${data?.storeTemplate}, publié=${data?.published}`;
});

await test('Branding — slogan', async () => {
  const { data } = await req('PATCH', '/website/branding', {
    token,
    body: { slogan: `Livraison rapide MVP ${ts}` },
  });
  return data?.theme?.slogan;
});

await test('Upload logo (mini PNG)', async () => {
  const form = new FormData();
  form.append('logo', new Blob([TINY_PNG], { type: 'image/png' }), 'logo.png');
  const { data } = await req('POST', '/upload/logo', { token, formData: form });
  await req('PATCH', '/website/branding', { token, body: { logo: data.url } });
  return data.url;
});

await test('Upload couverture (mini PNG)', async () => {
  const form = new FormData();
  form.append('cover', new Blob([TINY_PNG], { type: 'image/png' }), 'cover.png');
  const { data } = await req('POST', '/upload/cover', { token, formData: form });
  await req('PATCH', '/website/branding', { token, body: { coverImage: data.url } });
  return data.url;
});

await test('Templates boutique — liste', async () => {
  const { data } = await req('GET', '/website/templates', { token });
  const count = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
  return `${count} templates`;
});

// ── PRODUCTS ──
await test('Créer produit actif', async () => {
  const { data } = await req('POST', '/products', {
    token,
    body: {
      title: `Produit MVP ${ts}`,
      description: 'Test smoke MVP',
      variants: [{ sku: `SKU-${ts}`, name: 'Default', price: 49.99, inventory: 50 }],
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

await test('Modifier titre produit', async () => {
  const { data } = await req('PATCH', `/products/${productId}`, {
    token,
    body: { title: `Produit MVP modifié ${ts}` },
  });
  return data?.title;
});

await test('Modifier prix et stock', async () => {
  const { data } = await req('PATCH', `/products/${productId}`, {
    token,
    body: {
      variants: [{ sku: `SKU-${ts}`, name: 'Default', price: 89.5, inventory: 42 }],
    },
  });
  const variant = data?.variants?.[0];
  if (variant?.price !== 89.5 || variant?.inventory !== 42) {
    throw new Error(`Attendu 89.5/42, reçu ${variant?.price}/${variant?.inventory}`);
  }
  return `prix=${variant.price}, stock=${variant.inventory}`;
});

await test('Rejet produit sans description', async () => {
  try {
    await req('POST', '/products', {
      token,
      body: {
        title: 'Sans description',
        description: '',
        variants: [{ sku: `BAD-${ts}`, name: 'Default', price: 10, inventory: 1 }],
        status: 'active',
      },
      expectStatus: 400,
    });
    return '400 OK';
  } catch (e) {
    if (String(e.message).includes('400')) return '400 OK';
    throw e;
  }
});

// ── STOREFRONT PUBLIC ──
await test('Storefront public', async () => {
  const { data } = await req('GET', `/public/storefront/${websiteSlug}`);
  const slogan = data?.store?.theme?.slogan;
  const logo = data?.store?.theme?.logo;
  const cover = data?.store?.theme?.coverImage;
  if (!slogan) throw new Error('Slogan absent du storefront');
  return `produits=${data?.productCount}, slogan OK, logo=${!!logo}, cover=${!!cover}`;
});

await test('Storefront — fiche produit', async () => {
  const { data } = await req('GET', `/public/storefront/${websiteSlug}/products/${productId}`);
  return data?.product?.title || data?.title || 'OK';
});

// ── CHECKOUT PUBLIC ──
await test('Checkout — sync panier', async () => {
  const { data } = await req('POST', `/public/checkout/${websiteSlug}/cart/sync`, {
    body: {
      sessionId,
      items: [{ productId, name: `Produit MVP ${ts}`, price: 49.99, quantity: 1 }],
    },
  });
  return `${data?.items?.length ?? 1} article(s)`;
});

await test('Checkout — devis', async () => {
  const address = {
    fullName: 'Client MVP',
    phone: '+21698765432',
    address: '12 avenue test',
    governorate: 'Tunis',
    delegation: 'La Marsa',
  };
  const { data } = await req('POST', `/public/checkout/${websiteSlug}/quote`, {
    body: { sessionId, address },
  });
  return `total=${data?.totals?.total ?? data?.total ?? '?'}`;
});

await test('Checkout — soumission COD', async () => {
  const address = {
    fullName: 'Client MVP',
    phone: '+21698765432',
    address: '12 avenue test',
    governorate: 'Tunis',
    delegation: 'La Marsa',
  };
  const { data } = await req('POST', `/public/checkout/${websiteSlug}/submit`, {
    body: { sessionId, address },
  });
  return data?.orderId || data?.order?._id || data?._id || 'commande créée';
});

// ── ORDERS ──
await test('Lister commandes', async () => {
  const { data } = await req('GET', '/orders?limit=10', { token });
  const count = data?.orders?.length ?? data?.data?.length ?? (Array.isArray(data) ? data.length : 0);
  return `${count} commande(s)`;
});

await test('Panier merchant — ajouter', async () => {
  const { data } = await req('POST', '/cart/add', { token, body: { productId, quantity: 1 } });
  return `${data?.items?.length ?? 1} article(s)`;
});

// ── CUSTOMERS & COUPONS ──
await test('Stats clients', async () => {
  const { data } = await req('GET', '/customers/stats', { token });
  return `${data?.total ?? 0} clients`;
});

await test('Créer coupon', async () => {
  const { data } = await req('POST', '/coupons', {
    token,
    body: {
      code: `MVP${ts}`,
      description: 'Coupon MVP',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 50,
    },
  });
  return data?.code || data?._id;
});

// ── ANALYTICS & DELIVERY (optionnel) ──
await test(
  'Dashboard analytics',
  async () => {
    const { data } = await req('GET', '/analytics/dashboard', { token });
    return `revenu=${data?.sales?.totalRevenue ?? data?.totalRevenue ?? 0}`;
  },
  { optional: true },
);

await test(
  'Delivery overview',
  async () => {
    const { data } = await req('GET', '/delivery/overview', { token });
    return data?.shipments?.total != null ? 'OK' : 'réponse reçue';
  },
  { optional: true },
);

await test(
  'WhatsApp configuration',
  async () => {
    const { data } = await req('GET', '/whatsapp/configuration', { token });
    return `configuré=${data?.configured ?? false}`;
  },
  { optional: true },
);

await test('COD trust check', async () => {
  const { data } = await req('GET', '/cod-trust/check/+21698765432', { token });
  return `score=${data?.score ?? data?.trustScore ?? '?'}`;
});

await test('Notifications unread', async () => {
  const { data } = await req('GET', '/notifications/unread-count', { token });
  return `${data?.count ?? data ?? 0} non lues`;
});

await test('Supprimer produit test', async () => {
  await req('DELETE', `/products/${productId}`, { token });
  return 'supprimé';
});

// ── SUMMARY ──
console.log('\n' + '═'.repeat(50));
const ok = results.filter((r) => r.status === 'OK').length;
const fail = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n📊 MVP: ${ok}/${results.length} OK, ${fail} échecs, ${skipped.length} optionnels ignorés\n`);

if (skipped.length) {
  console.log('Optionnels (env / config):');
  skipped.forEach((s) => console.log(`  • ${s.name}: ${s.detail}`));
}

if (fail > 0) {
  console.log('\nÉchecs:');
  results.filter((r) => r.status === 'FAIL').forEach((r) => console.log(`  • ${r.name}: ${r.detail}`));
}

process.exit(fail > 0 ? 1 : 0);
