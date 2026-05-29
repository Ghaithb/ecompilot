#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('\n🚀 VÉRIFICATION RAPIDE - EcomPilot Backend\n');

let score = 0;
let total = 0;

function check(description, fn) {
  total++;
  process.stdout.write(`${description}... `);
  try {
    const result = fn();
    if (result) {
      console.log('✅');
      score++;
      return true;
    } else {
      console.log('❌');
      return false;
    }
  } catch (error) {
    console.log(`❌ (${error.message.substring(0, 50)})`);
    return false;
  }
}

// Tests
check('📦 package.json existe', () => fs.existsSync('./package.json'));
check('📝 tsconfig.json existe', () => fs.existsSync('./tsconfig.json'));
check('⚙️  jest.config.js existe', () => fs.existsSync('./jest.config.js'));
check('📁 node_modules existe', () => fs.existsSync('./node_modules'));
check('📁 uploads existe', () => fs.existsSync('./uploads'));
check('🌍 i18n/fr existe', () => fs.existsSync('./src/i18n/fr'));
check('🌍 i18n/en existe', () => fs.existsSync('./src/i18n/en'));

check('🤖 AI Module existe', () => fs.existsSync('./src/modules/ai/ai.module.ts'));
check('✨ Enhanced AI Service', () => fs.existsSync('./src/modules/ai/enhanced-ai-content.service.ts'));
check('🎨 Personalization Service', () => fs.existsSync('./src/modules/ai/personalization-engine.service.ts'));
check('🔄 Content Variations Service', () => fs.existsSync('./src/modules/ai/content-variations.service.ts'));
check('💡 Smart Recommendations Service', () => fs.existsSync('./src/modules/ai/smart-recommendations.service.ts'));

check('🧪 Test Enhanced AI', () => fs.existsSync('./src/modules/ai/enhanced-ai-content.service.spec.ts'));
check('🧪 Test Personalization', () => fs.existsSync('./src/modules/ai/personalization-engine.service.spec.ts'));

check('📦 @types/jest installé', () => {
  try {
    execSync('npm list @types/jest', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

check('📦 jest installé', () => {
  try {
    execSync('npm list jest', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

check('📦 @nestjs/testing installé', () => {
  try {
    execSync('npm list @nestjs/testing', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
});

const percentage = Math.round((score / total) * 100);

console.log('\n' + '='.repeat(50));
console.log(`\n📊 SCORE: ${score}/${total} (${percentage}%)\n`);

if (percentage === 100) {
  console.log('🎉 PARFAIT! Tout est prêt!');
  console.log('\nProchaines étapes:');
  console.log('  1. npm run start:dev');
  console.log('  2. npm test\n');
} else if (percentage >= 80) {
  console.log('✅ BIEN! Quelques dépendances à installer');
  console.log('\nAction:');
  console.log('  npm install\n');
} else if (percentage >= 60) {
  console.log('⚠️  MOYEN. Corrections nécessaires');
  console.log('\nActions:');
  console.log('  1. npm install');
  console.log('  2. node test-all.js (pour plus de détails)\n');
} else {
  console.log('❌ PROBLÈMES. Installation requise');
  console.log('\nActions:');
  console.log('  1. npm install');
  console.log('  2. mkdir -p uploads src/i18n/fr src/i18n/en');
  console.log('  3. node test-all.js\n');
}

console.log('='.repeat(50) + '\n');

process.exit(percentage === 100 ? 0 : 1);
