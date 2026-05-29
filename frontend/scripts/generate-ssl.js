import devcert from 'devcert';
import { writeFileSync } from 'fs';

async function generateCerts() {
  try {
    const ssl = await devcert.certificateFor('localhost');
    
    writeFileSync('localhost.pem', ssl.cert);
    writeFileSync('localhost-key.pem', ssl.key);
    
    console.log('Certificats SSL générés avec succès !');
  } catch (error) {
    console.error('Erreur lors de la génération des certificats :', error);
    process.exit(1);
  }
}

generateCerts().catch(console.error);