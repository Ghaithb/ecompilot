#!/usr/bin/env node

/**
 * Script de test pour le système Voice + WhatsApp
 * Usage: node test-voice-system.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TENANT_ID = process.env.TENANT_ID || '507f1f77bcf86cd799439011';

console.log('🧪 Test du système Voice + WhatsApp\n');
console.log(`API: ${BASE_URL}`);
console.log(`Tenant: ${TENANT_ID}\n`);

// Test 1: Créer un panier abandonné de test
async function test1CreateAbandonedCart() {
  console.log('📦 Test 1: Création d'un panier abandonné...');
  
  const abandonedCart = {
    customerEmail: 'test@example.com',
    customerName: 'Client Test',
    customerPhone: '+33612345678',
    items: [
      {
        productId: '64f8d7b2c5e9a1234567890b',
        productName: 'T-Shirt Rouge',
        quantity: 2,
        price: 29.99,
        image: 'https://example.com/tshirt.jpg'
      },
      {
        productId: '64f8d7b2c5e9a1234567890c',
        productName: 'Jean Bleu',
        quantity: 1,
        price: 59.99
      }
    ],
    totalAmount: 119.97
  };

  try {
    const response = await fetch(`${BASE_URL}/abandoned-carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID
      },
      body: JSON.stringify(abandonedCart)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const cart = await response.json();
    console.log('✅ Panier créé:', cart._id || cart.id);
    return cart._id || cart.id;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test 2: Démarrer la séquence de récupération
async function test2StartRecoverySequence(cartId) {
  console.log('\n📧 Test 2: Démarrage de la séquence de récupération...');
  
  if (!cartId) {
    console.log('⚠️  Pas de cartId, test ignoré');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/abandoned-cart-recovery/${cartId}/start`, {
      method: 'POST',
      headers: {
        'X-Tenant-Id': TENANT_ID
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('✅ Séquence démarrée:', result.message);
    console.log('   - Email envoyé immédiatement');
    console.log('   - WhatsApp planifié dans 24h');
    console.log('   - Appel vocal planifié dans 48h');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Test 3: Créer un appel vocal immédiat
async function test3CreateVoiceCall(cartId) {
  console.log('\n📞 Test 3: Création d\'un appel vocal...');
  
  if (!cartId) {
    console.log('⚠️  Pas de cartId, test ignoré');
    return;
  }

  const callData = {
    customerPhone: '+33612345678',
    customerName: 'Client Test',
    customerEmail: 'test@example.com',
    abandonedCartId: cartId,
    cartData: {
      products: [
        { name: 'T-Shirt Rouge', price: 29.99, quantity: 2 },
        { name: 'Jean Bleu', price: 59.99, quantity: 1 }
      ],
      totalAmount: 119.97
    },
    discountCode: 'TESTCART15',
    discountAmount: 18.00
  };

  try {
    const response = await fetch(`${BASE_URL}/voice-calls/abandoned-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID
      },
      body: JSON.stringify(callData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const call = await response.json();
    console.log('✅ Appel créé:', call._id || call.id);
    console.log('   Statut:', call.status);
    
    if (call.status === 'completed') {
      console.log('   🎭 Mode SIMULATION activé (pas de credentials Twilio)');
      console.log('   AI Response:', JSON.stringify(call.aiResponse, null, 2));
    }
    
    return call._id || call.id;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Test 4: Consulter les statistiques
async function test4GetStats() {
  console.log('\n📊 Test 4: Consultation des statistiques...');

  try {
    // Stats Voice Calls
    const voiceResponse = await fetch(`${BASE_URL}/voice-calls/stats`, {
      headers: { 'X-Tenant-Id': TENANT_ID }
    });

    if (voiceResponse.ok) {
      const voiceStats = await voiceResponse.json();
      console.log('\n📞 Statistiques Appels Vocaux:');
      console.log('   Total appels:', voiceStats.totalCalls);
      console.log('   Durée moyenne:', voiceStats.averageDuration, 'secondes');
      console.log('   Taux de conversion:', voiceStats.conversionRate.toFixed(2), '%');
      console.log('   Par statut:', JSON.stringify(voiceStats.byStatus, null, 2));
    }

    // Stats Recovery
    const recoveryResponse = await fetch(`${BASE_URL}/abandoned-cart-recovery/stats`, {
      headers: { 'X-Tenant-Id': TENANT_ID }
    });

    if (recoveryResponse.ok) {
      const recoveryStats = await recoveryResponse.json();
      console.log('\n🔄 Statistiques Récupération:');
      console.log('   Total abandonnés:', recoveryStats.totalAbandoned);
      console.log('   Total récupérés:', recoveryStats.totalRecovered);
      console.log('   Taux de récupération:', recoveryStats.recoveryRate.toFixed(2), '%');
      console.log('   Par canal:', JSON.stringify(recoveryStats.byChannel, null, 2));
      console.log('   Temps moyen:', recoveryStats.averageTimeToRecover.toFixed(2), 'heures');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Test 5: Lister les appels
async function test5ListCalls() {
  console.log('\n📋 Test 5: Liste des appels...');

  try {
    const response = await fetch(`${BASE_URL}/voice-calls?page=1&limit=5`, {
      headers: { 'X-Tenant-Id': TENANT_ID }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const { calls, total } = await response.json();
    console.log(`✅ ${total} appel(s) trouvé(s)\n`);

    calls.forEach((call, index) => {
      console.log(`   ${index + 1}. ${call.customerName || 'Inconnu'} - ${call.customerPhone}`);
      console.log(`      Statut: ${call.status}`);
      console.log(`      Durée: ${call.duration || 0}s`);
      if (call.aiResponse) {
        console.log(`      Intérêt client: ${call.aiResponse.customerInterest}`);
      }
    });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('DÉBUT DES TESTS');
  console.log('='.repeat(60) + '\n');

  try {
    const cartId = await test1CreateAbandonedCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await test2StartRecoverySequence(cartId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await test3CreateVoiceCall(cartId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await test4GetStats();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await test5ListCalls();

    console.log('\n' + '='.repeat(60));
    console.log('TESTS TERMINÉS ✅');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
  }
}

// Lancer les tests
runAllTests();
