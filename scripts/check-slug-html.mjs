const slug = process.argv[2] || 'refresh-shop';
const res = await fetch(`http://127.0.0.1:3001/api/v1/public/website/${slug}`);
const data = await res.json();
const html = data.page?.html || '';
console.log({
  slug,
  len: html.length,
  noBrokenQuotes: !html.includes("currency === 'TND'"),
  slugInOrders: html.includes(`/public/website/${slug}/orders`),
  waLabelFix: html.includes("const label = 'DT'"),
  alpineCheckout: html.includes("Alpine.data('checkout'"),
  alpine314: html.includes('alpinejs@3.14.3'),
});
