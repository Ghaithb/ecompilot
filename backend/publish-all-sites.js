const { MongoClient } = require('mongodb');

(async () => {
  try {
    const client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db('ecompilot');
    
    // Publier tous les sites
    const result = await db.collection('websites').updateMany(
      {}, 
      { $set: { published: true } }
    );
    
    console.log(`✅ ${result.modifiedCount} sites publiés`);
    
    // Lister les sites
    const sites = await db.collection('websites')
      .find({})
      .project({ name: 1, slug: 1, published: 1 })
      .limit(10)
      .toArray();
    
    console.log('\n📋 Sites disponibles:');
    sites.forEach(site => {
      console.log(`  • ${site.slug} - ${site.name} (${site.published ? '✅ Publié' : '❌ Non publié'})`);
    });
    
    await client.close();
    console.log('\n✅ Terminé');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
})();
