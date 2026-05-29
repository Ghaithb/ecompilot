const BASE = process.env.API_URL || 'http://127.0.0.1:3001/api/v1';

async function main() {
  const ts = Date.now();
  const email = `refresh_${ts}@ecompilot.local`;
  const password = 'TestPass123!';

  let res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName: 'T',
      lastName: 'U',
      country: 'TN',
      phone: '+21620000000',
      companyName: 'Refresh Shop',
    }),
  });
  let data = await res.json();
  if (!res.ok) {
    console.error('register failed', res.status, data);
    process.exit(1);
  }
  const token = data.access_token || data.accessToken;

  res = await fetch(`${BASE}/website/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      companyName: 'Refresh Shop',
      business: { industry: 'ecommerce', description: 'test', primaryGoal: 'sell' },
      contact: { email, phone: '+21620123456', city: 'Tunis', country: 'Tunisie' },
      branding: { primaryColor: '#2563eb', secondaryColor: '#7c3aed' },
    }),
  });
  data = await res.json();
  const slug = data.slug || data.website?.slug;
  console.log('generated slug:', slug, 'status:', res.status);

  res = await fetch(`${BASE}/website/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: '{}',
  });
  data = await res.json();
  console.log('refresh:', res.status, data);

  res = await fetch(`${BASE}/public/website/${slug}`);
  const page = await res.json();
  const html = page.page?.html || page.html || '';
  const checks = {
    noBrokenQuotes: !html.includes("currency === 'TND'"),
    slugInOrders: html.includes(`/public/website/${slug}/orders`),
    waLabelFix: html.includes("const label = 'DT'"),
    alpineCheckout: html.includes("Alpine.data('checkout'"),
    alpine314: html.includes('alpinejs@3.14.3'),
  };
  console.log('checks:', checks);
  const ok = Object.values(checks).every(Boolean);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
