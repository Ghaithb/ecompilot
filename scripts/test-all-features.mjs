/**
 * EcomPilot — smoke test de toutes les fonctionnalités API
 * ⚠️  DEPRECATED — utiliser scripts/test-mvp-features.mjs (MVP actif uniquement)
 * Usage: node scripts/test-all-features.mjs
 */
console.warn('\n⚠️  test-all-features.mjs est deprecie. Lancement de test-mvp-features.mjs...\n');
await import('./test-mvp-features.mjs');
