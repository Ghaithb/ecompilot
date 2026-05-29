const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNOSTIC AUTOMATIQUE - EcomPilot Backend\n');
console.log('=' .repeat(60));

// 1. Vérifier Node et npm
console.log('\n📦 Vérification Environment:');
console.log(`Node version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// 2. Vérifier package.json
try {
  const pkg = require('./package.json');
  console.log(`\n✅ package.json trouvé`);
  
  // Vérifier dépendances critiques
  const criticalDeps = [
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/mongoose',
    'mongoose',
    '@nestjs/platform-express',
    'multer'
  ];
  
  console.log('\n📋 Dépendances critiques:');
  criticalDeps.forEach(dep => {
    const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    if (version) {
      console.log(`  ✅ ${dep}: ${version}`);
    } else {
      console.log(`  ❌ ${dep}: MANQUANT`);
    }
  });
} catch (error) {
  console.log('❌ Erreur lecture package.json:', error.message);
}

// 3. Vérifier node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('\n✅ node_modules existe');
} else {
  console.log('\n❌ node_modules MANQUANT - Lancer: npm install');
}

// 4. Vérifier dossiers critiques
console.log('\n📁 Dossiers critiques:');
const criticalDirs = [
  'src/modules/ai',
  'src/modules/website',
  'src/modules/uploads',
  'uploads',
  'src/database'
];

criticalDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} MANQUANT`);
  }
});

// 5. Vérifier fichiers critiques
console.log('\n📄 Fichiers critiques:');
const criticalFiles = [
  'src/main.ts',
  'src/app.module.ts',
  'src/modules/ai/ai.module.ts',
  'src/modules/ai/enhanced-ai-content.service.ts',
  'src/modules/ai/personalization-engine.service.ts',
  'src/modules/website/website.service.ts',
  'src/modules/website/website.controller.ts'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} MANQUANT`);
  }
});

// 6. Vérifier .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env existe');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasMongoUri = envContent.includes('MONGODB_URI');
  const hasJwtSecret = envContent.includes('JWT_SECRET');
  console.log(`  ${hasMongoUri ? '✅' : '❌'} MONGODB_URI défini`);
  console.log(`  ${hasJwtSecret ? '✅' : '❌'} JWT_SECRET défini`);
} else {
  console.log('\n❌ .env MANQUANT');
}

// 7. Vérifier dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('\n✅ dist/ existe (backend compilé)');
} else {
  console.log('\n⚠️  dist/ absent - Première compilation nécessaire');
}

// 8. Résumé
console.log('\n' + '='.repeat(60));
console.log('\n🎯 ACTIONS RECOMMANDÉES:\n');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('1. 🔴 CRITIQUE: Installer les dépendances');
  console.log('   npm install\n');
}

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  console.log('2. 🟡 IMPORTANT: Créer le dossier uploads');
  console.log('   mkdir uploads\n');
}

if (!fs.existsSync(envPath)) {
  console.log('3. 🟡 IMPORTANT: Créer le fichier .env');
  console.log('   Copier .env.example vers .env\n');
}

console.log('4. ⚪ Compiler et démarrer:');
console.log('   npm run build');
console.log('   npm run start:dev\n');

console.log('=' .repeat(60));
console.log('\n✅ Diagnostic terminé\n');
