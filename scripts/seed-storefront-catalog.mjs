/**
 * Ajoute plusieurs produits avec images pour tester l'organisation du storefront.
 * Usage: node scripts/seed-storefront-catalog.mjs
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api/v1';
const EMAIL = process.env.SEED_EMAIL || 'mvp_1780158267262@ecompilot.local';
const PASSWORD = process.env.SEED_PASSWORD || 'TestPass123!';

const CATALOG = [
  {
    title: 'T-shirt Coton Premium',
    description: 'T-shirt 100% coton, coupe regular. Idéal pour le quotidien — livraison COD partout en Tunisie.',
    category: 'Mode',
    price: 39.99,
    sku: 'MODE-TSH-001',
    imageSeed: 'fashion-tshirt',
  },
  {
    title: 'Sneakers Urban Street',
    description: 'Baskets légères et confortables. Semelle antidérapante, tailles 39 à 45.',
    category: 'Mode',
    price: 129,
    sku: 'MODE-SNK-002',
    imageSeed: 'sneakers-shoes',
  },
  {
    title: 'Robe Élégante Soirée',
    description: 'Robe fluide pour occasions spéciales. Tissu premium, plusieurs coloris.',
    category: 'Mode',
    price: 89.99,
    sku: 'MODE-ROB-003',
    imageSeed: 'dress-elegant',
  },
  {
    title: 'Montre Connectée Pro',
    description: 'Suivi activité, notifications et autonomie 7 jours. Compatible iOS et Android.',
    category: 'Tech',
    price: 199,
    sku: 'TECH-WCH-004',
    imageSeed: 'smartwatch-tech',
  },
  {
    title: 'Écouteurs Bluetooth ANC',
    description: 'Réduction de bruit active, 30h d\'autonomie avec le boîtier de charge.',
    category: 'Tech',
    price: 79.99,
    sku: 'TECH-BUD-005',
    imageSeed: 'earbuds-audio',
  },
  {
    title: 'Set Cuisine Inox 12 pcs',
    description: 'Casseroles et poêles inox avec couvercles. Compatible tous feux.',
    category: 'Maison',
    price: 149,
    sku: 'HOME-KIT-006',
    imageSeed: 'kitchen-cookware',
  },
  {
    title: 'Diffuseur Parfum Maison',
    description: 'Ambiance parfumée durable. Design minimaliste pour salon ou chambre.',
    category: 'Maison',
    price: 59.99,
    sku: 'HOME-DIF-007',
    imageSeed: 'home-decor',
  },
  {
    title: 'Crème Visage Bio Hydratante',
    description: 'Formule naturelle à l\'aloe vera. Peaux normales à sèches, 50 ml.',
    category: 'Beauté',
    price: 34.99,
    sku: 'BEAU-CRM-008',
    imageSeed: 'skincare-cream',
  },
  {
    title: 'Sac Sport Gym 40L',
    description: 'Compartiment chaussures, bandoulière réglable. Résistant à l\'eau.',
    category: 'Sport',
    price: 89.99,
    sku: 'SPRT-BAG-009',
    imageSeed: 'gym-bag-sport',
  },
  {
    title: 'Tapis Yoga Antidérapant',
    description: 'Épaisseur 6 mm, transport facile avec sangle incluse.',
    category: 'Sport',
    price: 49.99,
    sku: 'SPRT-YOG-010',
    imageSeed: 'yoga-mat',
  },
];

async function req(method, path, { token, body, formData } = {}) {
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

  if (res.status >= 400) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return data;
}

async function downloadImage(seed) {
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/600/600`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Image ${seed}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, type, ext: type.includes('png') ? 'png' : 'jpg' };
}

async function uploadProductImage(token, productId, seed) {
  const { buffer, type, ext } = await downloadImage(seed);
  const form = new FormData();
  form.append('image', new Blob([buffer], { type }), `${seed}.${ext}`);
  return req('POST', `/products/${productId}/images`, { token, formData: form });
}

async function main() {
  console.log('\n📦 Seed catalogue storefront\n');
  console.log(`API: ${BASE}`);
  console.log(`Compte: ${EMAIL}\n`);

  const login = await req('POST', '/auth/login', {
    body: { email: EMAIL, password: PASSWORD },
  });
  const token = login.access_token;
  if (!token) throw new Error('Login échoué');

  const config = await req('GET', '/website/config', { token });
  const slug = config?.slug;
  console.log(`Boutique: ${slug || '?'}\n`);

  const existing = await req('GET', '/products', { token });
  const existingList = Array.isArray(existing) ? existing : existing?.products || [];
  const existingTitles = new Set(existingList.map((p) => p.title));

  let created = 0;
  let skipped = 0;

  for (const item of CATALOG) {
    if (existingTitles.has(item.title)) {
      console.log(`⏭️  Déjà présent: ${item.title}`);
      skipped++;
      continue;
    }

    const product = await req('POST', '/products', {
      token,
      body: {
        title: item.title,
        description: item.description,
        category: item.category,
        status: 'active',
        variants: [
          {
            sku: item.sku,
            name: 'Default',
            price: item.price,
            inventory: 30,
          },
        ],
      },
    });

    const productId = product._id || product.id;
    await uploadProductImage(token, productId, item.imageSeed);

    console.log(`✅ ${item.title} — ${item.category} — ${item.price} TND — image OK`);
    created++;
  }

  const storefront = slug
    ? await fetch(`${BASE}/public/storefront/${slug}`).then((r) => r.json())
    : null;
  const catalogCount = storefront?.catalog?.length ?? storefront?.intelligence?.trending?.length ?? '?';

  console.log(`\n══════════════════════════════════════`);
  console.log(`Créés: ${created} · Ignorés: ${skipped}`);
  console.log(`Catalogue storefront: ${catalogCount} produit(s)`);
  if (slug) console.log(`Voir: http://localhost:5173/store/${slug}`);
  console.log('');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
