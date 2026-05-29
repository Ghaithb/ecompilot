const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TEST COMPLET - Vérification de Toutes les Fonctionnalités\n');
console.log('='.repeat(70));

let errors = [];
let warnings = [];
let passed = [];

// Fonction pour exécuter une commande
function runCommand(command, description) {
  return new Promise((resolve) => {
    console.log(`\n🔍 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`  ❌ ÉCHEC: ${error.message}`);
        errors.push({ test: description, error: error.message });
        resolve(false);
      } else {
        console.log(`  ✅ SUCCÈS`);
        if (stdout) console.log(`     ${stdout.trim().substring(0, 100)}`);
        passed.push(description);
        resolve(true);
      }
    });
  });
}

// Fonction pour vérifier un fichier
function checkFile(filePath, description) {
  console.log(`\n📄 Vérification: ${description}...`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ Existe (${stats.size} bytes)`);
    passed.push(description);
    return true;
  } else {
    console.log(`  ❌ MANQUANT: ${filePath}`);
    errors.push({ test: description, error: 'Fichier manquant' });
    return false;
  }
}

// Fonction pour vérifier un dossier
function checkDirectory(dirPath, description) {
  console.log(`\n📁 Vérification: ${description}...`);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    console.log(`  ✅ Existe (${files.length} fichiers)`);
    passed.push(description);
    return true;
  } else {
    console.log(`  ❌ MANQUANT: ${dirPath}`);
    errors.push({ test: description, error: 'Dossier manquant' });
    return false;
  }
}

// Tests
async function runAllTests() {
  console.log('\n📦 PHASE 1: Vérification des Fichiers Critiques');
  console.log('-'.repeat(70));

  checkFile('./src/main.ts', 'main.ts');
  checkFile('./src/app.module.ts', 'app.module.ts');
  checkFile('./tsconfig.json', 'tsconfig.json');
  checkFile('./package.json', 'package.json');
  checkFile('./jest.config.js', 'jest.config.js');

  console.log('\n📂 PHASE 2: Vérification des Modules AI');
  console.log('-'.repeat(70));

  checkFile('./src/modules/ai/ai.module.ts', 'AI Module');
  checkFile('./src/modules/ai/enhanced-ai-content.service.ts', 'Enhanced AI Content Service');
  checkFile('./src/modules/ai/personalization-engine.service.ts', 'Personalization Engine Service');
  checkFile('./src/modules/ai/content-variations.service.ts', 'Content Variations Service');
  checkFile('./src/modules/ai/smart-recommendations.service.ts', 'Smart Recommendations Service');

  console.log('\n🧪 PHASE 3: Vérification des Tests');
  console.log('-'.repeat(70));

  checkFile('./src/modules/ai/enhanced-ai-content.service.spec.ts', 'Test Enhanced AI Content');
  checkFile('./src/modules/ai/personalization-engine.service.spec.ts', 'Test Personalization Engine');

  console.log('\n📁 PHASE 4: Vérification des Dossiers');
  console.log('-'.repeat(70));

  checkDirectory('./uploads', 'Dossier uploads');
  checkDirectory('./src/i18n/fr', 'i18n français');
  checkDirectory('./src/i18n/en', 'i18n anglais');
  checkDirectory('./node_modules', 'node_modules');

  console.log('\n🔍 PHASE 5: Vérification package.json');
  console.log('-'.repeat(70));

  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const criticalDeps = {
      '@nestjs/common': pkg.dependencies?.['@nestjs/common'],
      '@nestjs/mongoose': pkg.dependencies?.['@nestjs/mongoose'],
      'mongoose': pkg.dependencies?.['mongoose'],
      '@nestjs/platform-express': pkg.dependencies?.['@nestjs/platform-express'],
      'multer': pkg.dependencies?.['multer'],
    };

    const criticalDevDeps = {
      '@types/jest': pkg.devDependencies?.['@types/jest'],
      'jest': pkg.devDependencies?.['jest'],
      'ts-jest': pkg.devDependencies?.['ts-jest'],
      '@nestjs/testing': pkg.devDependencies?.['@nestjs/testing'],
    };

    console.log('\n  Dependencies:');
    Object.entries(criticalDeps).forEach(([name, version]) => {
      if (version) {
        console.log(`    ✅ ${name}: ${version}`);
        passed.push(`Dep: ${name}`);
      } else {
        console.log(`    ❌ ${name}: MANQUANT`);
        errors.push({ test: `Dependency ${name}`, error: 'Non installé' });
      }
    });

    console.log('\n  DevDependencies:');
    Object.entries(criticalDevDeps).forEach(([name, version]) => {
      if (version) {
        console.log(`    ✅ ${name}: ${version}`);
        passed.push(`DevDep: ${name}`);
      } else {
        console.log(`    ❌ ${name}: MANQUANT`);
        warnings.push({ test: `DevDependency ${name}`, warning: 'Non installé' });
      }
    });

  } catch (error) {
    console.log('  ❌ Erreur lecture package.json:', error.message);
    errors.push({ test: 'package.json', error: error.message });
  }

  console.log('\n🔧 PHASE 6: Vérification tsconfig.json');
  console.log('-'.repeat(70));

  try {
    const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));
    
    if (tsconfig.compilerOptions?.types) {
      const types = tsconfig.compilerOptions.types;
      console.log(`  Types définis: ${JSON.stringify(types)}`);
      
      if (types.includes('jest')) {
        console.log('  ✅ Type "jest" présent');
        passed.push('tsconfig types jest');
      } else {
        console.log('  ⚠️  Type "jest" manquant');
        warnings.push({ test: 'tsconfig types', warning: 'jest non inclus' });
      }
    } else {
      console.log('  ⚠️  Aucun type défini');
      warnings.push({ test: 'tsconfig types', warning: 'types array vide' });
    }
  } catch (error) {
    console.log('  ❌ Erreur lecture tsconfig.json:', error.message);
    errors.push({ test: 'tsconfig.json', error: error.message });
  }

  console.log('\n🚀 PHASE 7: Compilation TypeScript');
  console.log('-'.repeat(70));

  await runCommand('npx tsc --noEmit', 'Compilation TypeScript (vérification uniquement)');

  console.log('\n📊 RÉSUMÉ FINAL');
  console.log('='.repeat(70));

  console.log(`\n✅ Tests Réussis: ${passed.length}`);
  console.log(`⚠️  Avertissements: ${warnings.length}`);
  console.log(`❌ Erreurs: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n❌ ERREURS DÉTAILLÉES:');
    errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.test}`);
      console.log(`     → ${err.error}`);
    });
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  AVERTISSEMENTS:');
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. ${warn.test}`);
      console.log(`     → ${warn.warning}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 TOUT FONCTIONNE PARFAITEMENT! 🎉\n');
    console.log('Prochaines étapes:');
    console.log('  1. npm run start:dev  (Démarrer le backend)');
    console.log('  2. npm test           (Lancer les tests)');
  } else if (errors.length === 0) {
    console.log('\n✅ FONCTIONNEL (avec avertissements mineurs)\n');
    console.log('Prochaines étapes:');
    console.log('  1. npm install        (Installer dépendances manquantes)');
    console.log('  2. npm run start:dev  (Démarrer le backend)');
  } else {
    console.log('\n⚠️  CORRECTIONS NÉCESSAIRES\n');
    console.log('Actions recommandées:');
    console.log('  1. npm install        (Installer les dépendances)');
    console.log('  2. Corriger les erreurs ci-dessus');
    console.log('  3. Relancer: node test-all.js');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Exécution
runAllTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
