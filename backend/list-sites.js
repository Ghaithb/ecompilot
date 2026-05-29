const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('ecompilot');
  
  const sites = await db.collection('websites')
    .find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  
  console.log('📋 TOUS LES SITES (du plus récent au plus ancien):\n');
  sites.forEach((s, i) => {
    const status = s.published ? '✅ Publié' : '❌ Brouillon';
    console.log(`${(i+1).toString().padStart(2)}. ${s.slug.padEnd(25)} | ${status} | ${s.name}`);
  });
  
  console.log('\n💡 Pour accéder à un site, utilisez: http://localhost:5173/store/SLUG');
  
  await client.close();
})();
