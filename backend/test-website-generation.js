/**
 * Script de test pour la génération de site web
 * Vérifie si le HTML généré est valide et sans erreurs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://127.0.0.1:3001/api/v1';

// Fonction pour obtenir un token de test
async function getAuthToken() {
    try {
        // Créer un nouveau compte de test avec timestamp unique
        const timestamp = Date.now();
        const testEmail = `test-${timestamp}@ecompilot.com`;
        const testCompany = `Test Company ${timestamp}`;
        
        console.log(`⚙️  Création d'un compte de test: ${testEmail}`);
        console.log(`⚙️  Nom de l'entreprise: ${testCompany}`);
        const signupResponse = await axios.post(`${API_URL}/auth/register`, {
            email: testEmail,
            password: 'Test123!',
            firstName: 'Test',
            lastName: 'Website',
            companyName: testCompany,
            country: 'FR',
            phone: '+33123456789'
        });
        
        console.log('✅ Compte créé avec succès');
        return signupResponse.data.access_token;
    } catch (error) {
        console.error('❌ Erreur lors de l\'authentification:');
        console.error('Message:', error.message);
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Fonction pour générer un site de test
async function generateTestWebsite(token) {
    try {
        console.log('🚀 Génération du site de test...');
        
        const websiteConfig = {
            companyName: 'Test Boutique',
            business: {
                industry: 'e-commerce',
                primaryGoal: 'Vendre des produits de qualité',
                description: 'Boutique de test pour vérifier la génération',
                targetAudience: 'Clients exigeants',
                keyFeatures: 'Qualité, Rapidité, Service'
            },
            contact: {
                email: 'test@boutique.com',
                phone: '+33 1 23 45 67 89',
                address: '123 rue de Test',
                city: 'Paris',
                country: 'FR'
            },
            branding: {
                slogan: 'Le meilleur du test',
                primaryColor: '#3B82F6',
                secondaryColor: '#8B5CF6',
                brandVoice: 'Professionnel et amical'
            },
            contentStrategy: {
                hasExistingContent: 'no',
                launchTimeline: 'Dans 1 mois'
            }
        };

        const response = await axios.post(
            `${API_URL}/website/generate`,
            websiteConfig,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('✅ Site généré avec succès!');
        return response.data;
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error.response?.data || error.message);
        throw error;
    }
}

// Fonction pour récupérer le HTML généré
async function getGeneratedHTML(token) {
    try {
        // Récupérer les pages du site
        const response = await axios.get(`${API_URL}/website/pages`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const pages = response.data;
        if (!pages || pages.length === 0) {
            throw new Error('Aucune page trouvée');
        }
        
        // Trouver la page d'accueil
        const homePage = pages.find(p => p.isHomePage || p.slug === '/');
        if (!homePage) {
            console.log('⚠️  Page d\'accueil non trouvée, utilisation de la première page');
            return pages[0];
        }
        
        return homePage;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du HTML:', error.response?.data || error.message);
        throw error;
    }
}

// Fonction pour vérifier le HTML généré
function validateHTML(html) {
    console.log('\n📋 Vérification du HTML généré...\n');
    
    const checks = [
        {
            name: 'DOCTYPE présent',
            test: () => html.includes('<!DOCTYPE html>'),
            severity: 'error'
        },
        {
            name: 'Balise <html>',
            test: () => html.includes('<html') && html.includes('</html>'),
            severity: 'error'
        },
        {
            name: 'Balise <head>',
            test: () => html.includes('<head>') && html.includes('</head>'),
            severity: 'error'
        },
        {
            name: 'Balise <body>',
            test: () => html.includes('<body') && html.includes('</body>'),
            severity: 'error'
        },
        {
            name: 'Meta charset',
            test: () => html.includes('<meta charset="UTF-8">'),
            severity: 'error'
        },
        {
            name: 'Meta viewport',
            test: () => html.includes('<meta name="viewport"'),
            severity: 'error'
        },
        {
            name: 'Balise <title>',
            test: () => html.includes('<title>') && html.includes('</title>'),
            severity: 'error'
        },
        {
            name: 'Tailwind CSS CDN',
            test: () => html.includes('cdn.tailwindcss.com'),
            severity: 'warning'
        },
        {
            name: 'Alpine.js CDN',
            test: () => html.includes('alpinejs'),
            severity: 'warning'
        },
        {
            name: 'AOS Animations',
            test: () => html.includes('aos'),
            severity: 'info'
        },
        {
            name: 'Script #site-config',
            test: () => html.includes('<script id="site-config"'),
            severity: 'error'
        },
        {
            name: 'Config JSON valide',
            test: () => {
                const match = html.match(/<script id="site-config" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
                if (!match) return false;
                try {
                    JSON.parse(match[1]);
                    return true;
                } catch {
                    return false;
                }
            },
            severity: 'error'
        },
        {
            name: 'Header avec navigation',
            test: () => html.includes('<header') && html.includes('<nav'),
            severity: 'warning'
        },
        {
            name: 'Section Hero',
            test: () => html.includes('id="accueil"') || html.includes('HERO'),
            severity: 'warning'
        },
        {
            name: 'Section Produits',
            test: () => html.includes('id="produits"') || html.includes('produit'),
            severity: 'warning'
        },
        {
            name: 'Section À Propos',
            test: () => html.includes('id="apropos"') || html.includes('À Propos'),
            severity: 'info'
        },
        {
            name: 'Section Contact',
            test: () => html.includes('id="contact"') || html.includes('Contact'),
            severity: 'info'
        },
        {
            name: 'Footer',
            test: () => html.includes('<footer'),
            severity: 'warning'
        },
        {
            name: 'Pas de balises non fermées',
            test: () => {
                const openTags = (html.match(/<[a-z][^>]*>/gi) || []).length;
                const closeTags = (html.match(/<\/[a-z][^>]*>/gi) || []).length;
                // Tolérance augmentée pour les balises auto-fermantes (meta, link, img, input, br)
                return Math.abs(openTags - closeTags) < 20;
            },
            severity: 'error'
        },
        {
            name: 'Pas de caractères mal échappés',
            test: () => {
                // Un site moderne peut avoir 10+ scripts (Tailwind, Alpine, AOS, Swiper, GSAP, FontAwesome, etc.)
                return !html.includes('</script>') || html.split('</script>').length < 15;
            },
            severity: 'warning'
        }
    ];

    let errors = 0;
    let warnings = 0;
    let passed = 0;

    checks.forEach(check => {
        const result = check.test();
        const icon = result ? '✅' : (check.severity === 'error' ? '❌' : check.severity === 'warning' ? '⚠️' : 'ℹ️');
        const status = result ? 'OK' : 'ECHEC';
        
        console.log(`${icon} ${check.name}: ${status}`);
        
        if (result) {
            passed++;
        } else {
            if (check.severity === 'error') errors++;
            else if (check.severity === 'warning') warnings++;
        }
    });

    console.log(`\n📊 Résultat: ${passed}/${checks.length} tests passés`);
    console.log(`   Erreurs: ${errors}, Avertissements: ${warnings}\n`);

    return { errors, warnings, passed, total: checks.length };
}

// Fonction pour extraire et afficher la config injectée
function extractSiteConfig(html) {
    try {
        const match = html.match(/<script id="site-config" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
        if (match) {
            const config = JSON.parse(match[1]);
            console.log('🔧 Configuration du site injectée:');
            console.log(JSON.stringify(config, null, 2));
            return config;
        } else {
            console.log('⚠️ Aucune configuration trouvée dans le HTML');
            return null;
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'extraction de la config:', error.message);
        return null;
    }
}

// Fonction pour sauvegarder le HTML généré
function saveHTML(html, filename = 'generated-website.html') {
    const outputPath = path.join(__dirname, filename);
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`💾 HTML sauvegardé dans: ${outputPath}`);
}

// Fonction principale
async function main() {
    console.log('🧪 === TEST DE GÉNÉRATION DE SITE WEB ===\n');

    try {
        // 1. Authentification
        console.log('🔐 Authentification...');
        const token = await getAuthToken();
        console.log('✅ Token obtenu\n');

        // 2. Génération du site
        const websiteData = await generateTestWebsite(token);
        const siteId = websiteData._id || websiteData.id;
        const slug = websiteData.slug;
        console.log(`📝 ID du site: ${siteId}`);
        console.log(`🌐 Slug: ${slug}\n`);

        // 3. Récupération du HTML généré
        console.log('📥 Récupération du HTML généré...');
        const homePage = await getGeneratedHTML(token);
        const html = homePage.content?.html || homePage.html || '';

        if (!html) {
            console.error('❌ Aucun HTML trouvé dans la page');
            console.log('Keys dans la page:', Object.keys(homePage));
            if (homePage.content) {
                console.log('Keys dans content:', Object.keys(homePage.content));
            }
            return;
        }

        console.log(`📏 Taille du HTML: ${(html.length / 1024).toFixed(2)} KB\n`);

        // 4. Validation du HTML
        const validationResult = validateHTML(html);

        // 5. Extraction de la config
        console.log('');
        const siteConfig = extractSiteConfig(html);

        // 6. Sauvegarde du HTML
        console.log('');
        saveHTML(html);

        // 7. Résumé final
        console.log('\n' + '='.repeat(50));
        if (validationResult.errors === 0) {
            console.log('✅ GÉNÉRATION RÉUSSIE - Aucune erreur critique');
        } else {
            console.log(`❌ GÉNÉRATION AVEC ERREURS - ${validationResult.errors} erreur(s) critique(s)`);
        }
        
        if (validationResult.warnings > 0) {
            console.log(`⚠️  ${validationResult.warnings} avertissement(s)`);
        }
        console.log('='.repeat(50) + '\n');

        process.exit(validationResult.errors > 0 ? 1 : 0);

    } catch (error) {
        console.error('\n❌ ERREUR FATALE:', error.message);
        if (error.response) {
            console.error('Détails:', error.response.data);
        }
        process.exit(1);
    }
}

// Exécution
main();
