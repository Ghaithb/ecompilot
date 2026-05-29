import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UltraAIGeneratorService } from './ultra-ai-generator.service';
import {
  generateExpressCheckoutHTML,
  generateExpressCheckoutScript,
  generateWhatsAppFloat,
  generateTrustBar,
} from './express-checkout.template';

/**
 * SERVICE DE GÃ‰NÃ‰RATION INTELLIGENTE DE SITE
 * 
 * PRINCIPE:
 * - GÃ©nÃ¨re UNIQUEMENT les sections principales (Hero, About, Contact, FAQ, etc.)
 * - NE gÃ©nÃ¨re PAS de produits/services fictifs
 * - Affiche les VRAIS produits de la base de donnÃ©es du tenant
 * - Le chef de site ajoute ses produits via l'interface Products
 */

interface WebsiteGenerationConfig {
    tenantId: string;
    slug?: string;
    companyName: string;
    industry?: string;
    businessType?: string;
    settings?: NormalizedWebsiteConfig['settings'];
    theme?: NormalizedWebsiteConfig['theme'];
    description?: string;
    slogan?: string;
    phone?: string;
    email?: string;
    contactEmail?: string;
    address?: string;
    city?: string;
    location?: string;
    primaryGoal?: string;
    targetAudience?: string;
    keyFeatures?: string;
    brandVoice?: string;
    colorPalette?: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    hasExistingContent?: 'yes' | 'no';
    contentNotes?: string;
    launchTimeline?: string;
}

interface NormalizedWebsiteConfig {
    tenantId: string;
    slug?: string;
    companyName: string;
    industry: string;
    primaryGoal: string;
    targetAudience: string;
    location: string;
    email: string;
    phone?: string;
    address?: string;
    slogan?: string;
    brandVoice?: string;
    keyFeatures?: string;
    colorPalette?: string;
    logoUrl?: string;
    hasExistingContent?: 'yes' | 'no';
    contentNotes?: string;
    launchTimeline?: string;
    description?: string;
    palette: ResolvedPalette;
    // Rendering settings provided by the wizard or website document
    settings?: {
        enableCart?: boolean;
        enableCheckout?: boolean;
        enableContact?: boolean;
        currency?: string;
        language?: string;
    };
    // Theme details (colors, logo, font)
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        logo?: string;
        font?: string;
    };
    // Domain / deployment hints
    domain?: {
        subdomain?: string;
        customDomain?: string;
        sslEnabled?: boolean;
    };
    // Optional choices from the wizard
    templateChoice?: string;
    selectedPages?: string[];
    lowStockThreshold?: number;
}

type ResolvedPalette = {
    primary: string;
    secondary: string;
};

@Injectable()
export class SmartWebsiteGeneratorService {
  private readonly logger = new Logger(SmartWebsiteGeneratorService.name);

  constructor(
    private ultraAIGenerator: UltraAIGeneratorService,
    @InjectModel('Product') private productModel: Model<any>,
  ) {}

  /**
   * GÃ©nÃ¨re un site INTELLIGENT avec VRAIES donnÃ©es
   */
  async generateSmartWebsite(config: WebsiteGenerationConfig): Promise<string> {
        const normalized = this.normalizeConfig(config);

        this.logger.log(
            `ðŸŽ¨ GÃ©nÃ©ration site intelligent pour: ${normalized.companyName} (${normalized.industry})`,
        );

        // 1. GÃ©nÃ©rer le contenu IA (SANS produits fictifs)
        const uniqueSellingPoints = normalized.keyFeatures
            ? normalized.keyFeatures
                    .split(/[\n,;]+/)
                    .map((item) => item.trim())
                    .filter(Boolean)
            : undefined;

        const goals = [
            normalized.primaryGoal,
            normalized.launchTimeline ? `Ã‰chÃ©ance: ${normalized.launchTimeline}` : null,
            normalized.brandVoice ? `Ton: ${normalized.brandVoice}` : null,
            normalized.hasExistingContent
                ? `Contenus ${normalized.hasExistingContent === 'yes' ? 'disponibles' : 'Ã  produire'}`
                : null,
        ].filter(Boolean) as string[];

        const aiContent = await this.ultraAIGenerator.generateUltraPersonalizedContent({
            type: normalized.industry,
            name: normalized.companyName,
            description: normalized.description || normalized.primaryGoal,
            location: normalized.location,
            targetAudience: normalized.targetAudience,
            uniqueSellingPoints,
            goals: goals.length ? goals : undefined,
        });

        // 2. RÃ©cupÃ©rer les VRAIS produits du tenant
        const realProducts = await this.getRealProducts(normalized.tenantId);

        // 3. GÃ©nÃ©rer le HTML avec structure complÃ¨te (Header/Body/Footer)
        const html = this.buildModernHTMLV2(normalized, aiContent, realProducts);

    this.logger.log(`âœ… Site gÃ©nÃ©rÃ© avec ${realProducts.length} produits rÃ©els`);
    return html;
  }

  /**
   * ðŸ›’ GÃ‰NÃˆRE LE SCRIPT DE CHECKOUT EXPRESS
   */
  private generateCheckoutScript(config: NormalizedWebsiteConfig): string {
    return generateExpressCheckoutScript({
      slug: config.slug || '',
      currency: config.settings?.currency || 'TND',
      whatsappNumber: config.phone,
      companyName: config.companyName,
    });
  }

  private generateCheckoutHTML(config: NormalizedWebsiteConfig): string {
    return generateExpressCheckoutHTML({
      slug: config.slug || '',
      currency: config.settings?.currency || 'TND',
      whatsappNumber: config.phone,
      companyName: config.companyName,
    });
  }



  /**
   * ðŸŽ¨ VERSION 2 - HTML STRUCTURÃ‰ AVEC HEADER/BODY/FOOTER
   */
  private buildModernHTMLV2(
      config: NormalizedWebsiteConfig,
      aiContent: any,
      realProducts: any[],
  ): string {
      const { companyName, email, palette, slug, industry, phone, location, slogan, brandVoice, keyFeatures } = config;
      const { primary: primaryColor, secondary: secondaryColor } = palette;
      
      // Utiliser le slogan du formulaire ou gÃ©nÃ©rer un par dÃ©faut
      const companySlogan = slogan || aiContent.hero?.slogan || `${industry} de qualitÃ© premium`;

      const heroHeadline = aiContent.hero?.headline || companyName;
      const heroSubheadline = aiContent.hero?.subheadline || config.primaryGoal;
      const seoTitle = aiContent.seo?.title || `${companyName} â€“ ${config.primaryGoal}`;
      const seoDescription = aiContent.seo?.description || `${companySlogan}. ${heroSubheadline}`;
      const primaryFont = 'Poppins'; // Font moderne et professionnelle
      const fontQuery = primaryFont.replace(/\s+/g, '+');

      // Configuration JSON pour runtime
      const siteConfig = {
          slug,
          companyName,
          industry,
          settings: config.settings,
          theme: config.theme,
          currency: config.settings?.currency || 'EUR',
      };
      const currency = config.settings?.currency || 'TND';
      const currencySymbol = currency === 'TND' ? 'DT' : currency === 'EUR' ? '€' : currency;
      const configJson = JSON.stringify(siteConfig).replace(/</g, '\\u003c');

      return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDescription}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Alpine.js pour interactivité -->
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.3/dist/cdn.min.js"></script>
  
  <!-- AOS Animations au scroll -->
  <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
  <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
  
  <!-- Swiper.js pour sliders professionnels -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  
  <!-- GSAP pour animations fluides -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
  
  <!-- Configuration Tailwind -->
  <script>
      tailwind.config = {
          theme: {
              extend: {
                  colors: {
                      primary: '${primaryColor}',
                      secondary: '${secondaryColor}'
                  },
                  animation: {
                      'float': 'float 3s ease-in-out infinite',
                      'slide-up': 'slide-up 0.5s ease-out',
                      'fade-in': 'fade-in 0.6s ease-out',
                      'zoom-in': 'zoom-in 0.5s ease-out',
                  },
                  keyframes: {
                      float: {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-20px)' },
                      },
                      'slide-up': {
                          '0%': { transform: 'translateY(100px)', opacity: '0' },
                          '100%': { transform: 'translateY(0)', opacity: '1' },
                      },
                      'fade-in': {
                          '0%': { opacity: '0' },
                          '100%': { opacity: '1' },
                      },
                      'zoom-in': {
                          '0%': { transform: 'scale(0.9)', opacity: '0' },
                          '100%': { transform: 'scale(1)', opacity: '1' },
                      }
                  }
              }
          }
      }
  </script>
  
  <!-- Config Site (pour runtime.js) -->
  <script id="site-config" type="application/json">
  ${configJson}
  </script>
  
  <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
      
      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }
      
      body { 
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
      }
      
      /* Gradient backgrounds ultra-modernes */
      .gradient-bg-1 {
          background: linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}15 100%);
      }
      
      .gradient-bg-2 {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      }
      
      /* Glass morphism effet vitre */
      .glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      }
      
      /* Gradient text comme les grands sites */
      .gradient-text {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 3s ease infinite;
      }
      
      @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
      }
      
      /* Hover effects premium */
      .card-hover {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      
      /* Boutons modernes avec effet shine */
      .btn-modern {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
      }
      .btn-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
      }
      .btn-modern:hover::before {
          left: 100%;
      }
      
      /* Parallax effect */
      .parallax-bg {
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
      }
      
      /* Custom scrollbar Ã©lÃ©gante */
      ::-webkit-scrollbar {
          width: 12px;
      }
      ::-webkit-scrollbar-track {
          background: #f1f1f1;
      }
      ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          border-radius: 6px;
      }
      ::-webkit-scrollbar-thumb:hover {
          background: ${primaryColor};
      }
      
      /* Animations de chargement */
      .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
      }
      
      /* Effet nÃ©on pour les titres */
      .neon-text {
          text-shadow: 
              0 0 10px ${primaryColor}80,
              0 0 20px ${primaryColor}60,
              0 0 30px ${primaryColor}40;
      }
      
      /* Image zoom au hover */
      .image-zoom {
          overflow: hidden;
      }
      .image-zoom img {
          transition: transform 0.5s ease;
      }
      .image-zoom:hover img {
          transform: scale(1.1);
      }
  </style>
</head>
<body class="antialiased bg-white">

${generateTrustBar()}
${this.buildHeader(config)}

<!-- HERO SECTION ULTRA PROFESSIONNEL -->
<section id="accueil" class="relative min-h-screen flex items-center overflow-hidden">
  <!-- Background avec gradient animÃ© -->
  <div class="absolute inset-0 gradient-bg-1">
      <div class="absolute inset-0 opacity-30">
          <div class="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div class="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style="animation-delay: 2s;"></div>
          <div class="absolute -bottom-8 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style="animation-delay: 4s;"></div>
      </div>
  </div>
  
  <!-- Contenu Hero -->
  <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-5xl mx-auto text-center">
          <!-- Badge animÃ© -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-8 shadow-lg animate-slide-up" data-aos="fade-down">
              <span class="flex h-3 w-3 relative">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <span class="text-sm font-semibold text-gray-700">✨ ${companySlogan}</span>
          </div>
          
          <!-- Titre principal avec gradient -->
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight" data-aos="zoom-in" data-aos-delay="100">
              <span class="gradient-text neon-text">${heroHeadline}</span>
          </h1>
          
          <!-- Sous-titre -->
          <p class="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed" data-aos="fade-up" data-aos-delay="200">
              ${heroSubheadline}
          </p>
          
          <!-- Statistiques en ligne -->
          <div class="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mb-12" data-aos="fade-up" data-aos-delay="300">
              <div class="text-center">
                  <div class="text-3xl md:text-4xl font-bold gradient-text">100%</div>
                  <div class="text-sm text-gray-600 mt-1">Satisfaction</div>
              </div>
              <div class="text-center">
                  <div class="text-3xl md:text-4xl font-bold gradient-text">24/7</div>
                  <div class="text-sm text-gray-600 mt-1">Support</div>
              </div>
              <div class="text-center">
                  <div class="text-3xl md:text-4xl font-bold gradient-text">⭐ 5.0</div>
                  <div class="text-sm text-gray-600 mt-1">Avis clients</div>
              </div>
          </div>
          
          <!-- Boutons CTA modernes -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center" data-aos="fade-up" data-aos-delay="400">
              <a href="#produits" class="group relative px-8 py-5 btn-modern gradient-bg-2 text-white font-bold rounded-2xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 inline-flex items-center gap-3">
                  <i class="fas fa-shopping-bag"></i>
                  <span>Découvrir nos produits</span>
                  <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </a>
              ${config.settings?.enableContact ? `
              <a href="#contact" class="group px-8 py-5 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-200 hover:border-primary hover:text-primary transition-all duration-300 inline-flex items-center gap-3 shadow-xl">
                  <i class="fas fa-phone"></i>
                  <span>Nous contacter</span>
              </a>` : ''}
          </div>
          
          <!-- Badges de confiance -->
          <div class="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60" data-aos="fade-up" data-aos-delay="500">
              <div class="flex items-center gap-2">
                  <i class="fas fa-shield-alt text-2xl text-primary"></i>
                  <span class="text-sm">Paiement sécurisé</span>
              </div>
              <div class="flex items-center gap-2">
                  <i class="fas fa-truck text-2xl text-primary"></i>
                  <span class="text-sm">Livraison rapide</span>
              </div>
              <div class="flex items-center gap-2">
                  <i class="fas fa-undo text-2xl text-primary"></i>
                  <span class="text-sm">Retour gratuit</span>
              </div>
          </div>
      </div>
  </div>
  
  <!-- Scroll indicator -->
  <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
      <a href="#produits" class="flex flex-col items-center gap-2 text-gray-600 hover:text-primary transition">
          <span class="text-xs">Défiler</span>
          <i class="fas fa-chevron-down"></i>
      </a>
  </div>
</section>

<!-- SECTION FEATURES (NouveautÃ©) -->
<section class="py-20 bg-white">
    <div class="container mx-auto px-4">
        <div class="text-center mb-16" data-aos="fade-up">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">
                <span class="gradient-text">Pourquoi nous choisir ?</span>
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Une expÃ©rience d'achat incomparable avec des avantages exclusifs
            </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- Feature 1 -->
            <div class="card-hover p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 border border-gray-100" data-aos="fade-up" data-aos-delay="100">
                <div class="w-16 h-16 rounded-2xl gradient-bg-2 flex items-center justify-center mb-6 shadow-lg">
                    <i class="fas fa-gem text-2xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">QualitÃ© Premium</h3>
                <p class="text-gray-600 leading-relaxed">
                    Des produits soigneusement sÃ©lectionnÃ©s pour leur qualitÃ© exceptionnelle
                </p>
            </div>
            
            <!-- Feature 2 -->
            <div class="card-hover p-8 rounded-3xl bg-gradient-to-br from-pink-50 to-orange-50 border border-gray-100" data-aos="fade-up" data-aos-delay="200">
                <div class="w-16 h-16 rounded-2xl gradient-bg-2 flex items-center justify-center mb-6 shadow-lg">
                    <i class="fas fa-bolt text-2xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">Livraison Express</h3>
                <p class="text-gray-600 leading-relaxed">
                    Recevez vos commandes en 24-48h partout en France
                </p>
            </div>
            
            <!-- Feature 3 -->
            <div class="card-hover p-8 rounded-3xl bg-gradient-to-br from-green-50 to-teal-50 border border-gray-100" data-aos="fade-up" data-aos-delay="300">
                <div class="w-16 h-16 rounded-2xl gradient-bg-2 flex items-center justify-center mb-6 shadow-lg">
                    <i class="fas fa-headset text-2xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">Support 24/7</h3>
                <p class="text-gray-600 leading-relaxed">
                    Une Ã©quipe Ã  votre Ã©coute pour rÃ©pondre Ã  toutes vos questions
                </p>
            </div>
        </div>
    </div>
</section>

${this.buildProductsSection(config, realProducts)}

<!-- SECTION Ã€ PROPOS MODERNE -->
<section id="apropos" class="py-20 bg-white relative overflow-hidden">
  <!-- DÃ©corations background -->
  <div class="absolute top-0 right-0 w-1/3 h-full opacity-5">
      <div class="absolute top-10 right-10 w-64 h-64 border-4 border-primary rounded-full"></div>
      <div class="absolute bottom-10 right-20 w-48 h-48 border-4 border-secondary rounded-full"></div>
  </div>
  
  <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-6xl mx-auto">
          <!-- Titre section -->
          <div class="text-center mb-16" data-aos="fade-up">
              <h2 class="text-4xl md:text-5xl font-bold mb-4">
                  <span class="gradient-text">Ã€ Propos de ${companyName}</span>
              </h2>
              <div class="w-24 h-1 gradient-bg-2 mx-auto rounded-full"></div>
          </div>
          
          <!-- Contenu en 2 colonnes -->
          <div class="grid md:grid-cols-2 gap-12 items-center">
              <!-- Texte -->
              <div data-aos="fade-right">
                  <h3 class="text-3xl font-bold mb-6">Notre Histoire</h3>
                  <p class="text-lg text-gray-700 mb-6 leading-relaxed">
                      ${aiContent.about?.story || config.description || config.primaryGoal}
                  </p>
                  <p class="text-gray-600 mb-8 leading-relaxed">
                      ${aiContent.about?.mission || 'Notre mission est de vous offrir le meilleur service possible avec des produits de qualitÃ© exceptionnelle.'}
                  </p>
                  
                  <!-- Stats -->
                  <div class="grid grid-cols-2 gap-4">
                      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50">
                          <div class="text-3xl font-bold gradient-text">500+</div>
                          <div class="text-sm text-gray-600">Clients satisfaits</div>
                      </div>
                      <div class="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-orange-50">
                          <div class="text-3xl font-bold gradient-text">98%</div>
                          <div class="text-sm text-gray-600">Taux de satisfaction</div>
                      </div>
                  </div>
              </div>
              
              <!-- Image/Illustration -->
              <div class="relative" data-aos="fade-left">
                  <div class="relative rounded-3xl overflow-hidden shadow-2xl image-zoom">
                      ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${companyName}" class="w-full h-96 object-cover"/>` : `
                      <div class="w-full h-96 gradient-bg-2 flex items-center justify-center">
                          <div class="text-center text-white">
                              <i class="fas fa-store text-6xl mb-4"></i>
                              <div class="text-2xl font-bold">${companyName}</div>
                          </div>
                      </div>`}
                  </div>
                  <!-- Floating badge -->
                  <div class="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-2xl animate-float">
                      <div class="flex items-center gap-3">
                          <div class="text-4xl">â­</div>
                          <div>
                              <div class="text-2xl font-bold gradient-text">5.0</div>
                              <div class="text-xs text-gray-600">Note moyenne</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</section>

<!-- SECTION CONTACT MODERNE -->
${config.settings?.enableContact ? `
<section id="contact" class="py-20 gradient-bg-1 relative overflow-hidden">
  <!-- Background dÃ©coratif -->
  <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl"></div>
  </div>
  
  <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-5xl mx-auto">
          <!-- Titre -->
          <div class="text-center mb-16" data-aos="fade-up">
              <h2 class="text-4xl md:text-5xl font-bold mb-4">
                  <span class="gradient-text">Contactez-nous</span>
              </h2>
              <p class="text-xl text-gray-600">Une question ? Notre Ã©quipe vous rÃ©pond rapidement</p>
          </div>
          
          <!-- Grid Contact -->
          <div class="grid md:grid-cols-2 gap-8">
              <!-- Infos de contact -->
              <div class="space-y-6" data-aos="fade-right">
                  <div class="glass rounded-2xl p-8">
                      <h3 class="text-2xl font-bold mb-6">Nos CoordonnÃ©es</h3>
                      
                      ${email ? `
                      <div class="flex items-start gap-4 mb-6 group cursor-pointer">
                          <div class="w-12 h-12 rounded-xl gradient-bg-2 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                              <i class="fas fa-envelope text-white"></i>
                          </div>
                          <div>
                              <div class="font-semibold text-gray-800">Email</div>
                              <a href="mailto:${email}" class="text-gray-600 hover:text-primary transition">${email}</a>
                          </div>
                      </div>` : ''}
                      
                      ${phone ? `
                      <div class="flex items-start gap-4 mb-6 group cursor-pointer">
                          <div class="w-12 h-12 rounded-xl gradient-bg-2 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                              <i class="fas fa-phone text-white"></i>
                          </div>
                          <div>
                              <div class="font-semibold text-gray-800">TÃ©lÃ©phone</div>
                              <a href="tel:${phone}" class="text-gray-600 hover:text-primary transition">${phone}</a>
                          </div>
                      </div>` : ''}
                      
                      ${location ? `
                      <div class="flex items-start gap-4 group cursor-pointer">
                          <div class="w-12 h-12 rounded-xl gradient-bg-2 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                              <i class="fas fa-map-marker-alt text-white"></i>
                          </div>
                          <div>
                              <div class="font-semibold text-gray-800">Adresse</div>
                              <div class="text-gray-600">${location}</div>
                          </div>
                      </div>` : ''}
                      
                      <!-- Horaires -->
                      <div class="mt-8 pt-8 border-t border-gray-200">
                          <div class="font-semibold mb-3">Horaires d'ouverture</div>
                          <div class="text-sm text-gray-600 space-y-1">
                              <div class="flex justify-between">
                                  <span>Lundi - Vendredi</span>
                                  <span class="font-medium">9h - 18h</span>
                              </div>
                              <div class="flex justify-between">
                                  <span>Samedi</span>
                                  <span class="font-medium">10h - 17h</span>
                              </div>
                              <div class="flex justify-between">
                                  <span>Dimanche</span>
                                  <span class="font-medium">FermÃ©</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <!-- Formulaire -->
              <div data-aos="fade-left">
                  <div class="glass rounded-2xl p-8">
                      <form class="space-y-6" id="contact-form">
                          <div>
                              <label class="block text-sm font-semibold mb-2 text-gray-700">Nom complet *</label>
                              <input type="text" required placeholder="John Doe" class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                          </div>
                          
                          <div>
                              <label class="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                              <input type="email" required placeholder="john@example.com" class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                          </div>
                          
                          <div>
                              <label class="block text-sm font-semibold mb-2 text-gray-700">Sujet</label>
                              <input type="text" placeholder="Demande d'information" class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                          </div>
                          
                          <div>
                              <label class="block text-sm font-semibold mb-2 text-gray-700">Message *</label>
                              <textarea required rows="5" placeholder="Ã‰crivez votre message ici..." class="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"></textarea>
                          </div>
                          
                          <button type="submit" class="w-full btn-modern gradient-bg-2 text-white py-5 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3">
                              <i class="fas fa-paper-plane"></i>
                              <span>Envoyer le message</span>
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  </div>
</section>
` : ''}

${this.buildFooter(config)}

<!-- Scripts d'animation et interactivitÃ© -->
<script>
  // Init AOS
  AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
  });
  
  // GSAP Animations
  gsap.registerPlugin(ScrollTrigger);
  
  // Animation du Hero au chargement
  gsap.from('h1', {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out'
  });
  
  // Parallax effect sur les sections
  gsap.utils.toArray('section').forEach((section) => {
      gsap.to(section, {
          scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
          }
      });
  });
  
  // Animation des cartes au hover avec GSAP
  document.querySelectorAll('.card-hover').forEach(card => {
      card.addEventListener('mouseenter', () => {
          gsap.to(card, {
              scale: 1.05,
              duration: 0.3,
              ease: 'power2.out'
          });
      });
      
      card.addEventListener('mouseleave', () => {
          gsap.to(card, {
              scale: 1,
              duration: 0.3,
              ease: 'power2.out'
          });
      });
  });
  
  // Compteur animÃ© pour les statistiques
  function animateCounter(element, target) {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
              element.textContent = target;
              clearInterval(timer);
          } else {
              element.textContent = Math.floor(current);
          }
      }, 30);
  }
  
  // Observer pour dÃ©clencher les compteurs
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const target = parseInt(entry.target.textContent);
              if (!isNaN(target)) {
                  animateCounter(entry.target, target);
                  observer.unobserve(entry.target);
              }
          }
      });
  });
  
  // Gestion du formulaire de contact
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          // Animation de succÃ¨s
          gsap.to(contactForm, {
              scale: 0.95,
              duration: 0.1,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                  alert('Merci ! Votre message a Ã©tÃ© envoyÃ© avec succÃ¨s.');
                  contactForm.reset();
              }
          });
      });
  }
  
  // Smooth scroll amÃ©liorÃ©
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
              gsap.to(window, {
                  duration: 1,
                  scrollTo: {
                      y: target,
                      offsetY: 80
                  },
                  ease: 'power3.inOut'
              });
          }
      });
  });
  
  // Effet cursor follow (optionnel)
  const cursor = document.createElement('div');
  cursor.className = 'fixed w-4 h-4 rounded-full pointer-events-none z-50 mix-blend-difference bg-white opacity-0 transition-opacity';
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
          x: e.clientX - 8,
          y: e.clientY - 8,
          duration: 0.3,
          ease: 'power2.out'
      });
      cursor.style.opacity = '1';
  });
</script>

${this.generateCheckoutHTML(config)}
${this.generateCheckoutScript(config)}
${generateWhatsAppFloat(config.phone, config.companyName)}

</body>
</html>`;
  }

  private buildHeader(config: NormalizedWebsiteConfig): string {
    const { companyName, palette, slug } = config;
    const logoUrl = config.logoUrl || '';
    return `
    <nav class="fixed w-full bg-white/95 backdrop-blur-xl z-50 shadow-lg border-b border-gray-100" x-data="{open: false}">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#accueil" class="font-black text-xl" style="color:${palette.primary}">${companyName}</a>
            <div class="hidden md:flex items-center gap-8">
                <a href="#accueil" class="text-gray-700 hover:text-primary font-medium">Accueil</a>
                <a href="#produits" class="text-gray-700 hover:text-primary font-medium">Produits</a>
                <a href="#contact" class="text-gray-700 hover:text-primary font-medium">Contact</a>
            </div>
        </div>
    </nav>`;
  }

  private buildProductsSection(config: NormalizedWebsiteConfig, realProducts: any[]): string {
    return this.generateProductsSection(realProducts, config.palette.primary, config.industry);
  }

  private buildFooter(config: NormalizedWebsiteConfig): string {
    const { companyName, email, phone, slug } = config;
    return `
    <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-6 text-center">
            <p class="text-xl font-bold mb-2">${companyName}</p>
            ${email ? `<p class="text-gray-400 text-sm">${email}</p>` : ''}
            ${phone ? `<p class="text-gray-400 text-sm">${phone}</p>` : ''}
            <p class="text-gray-500 text-xs mt-6">© ${new Date().getFullYear()} ${companyName} · Powered by EcomPilot</p>
        </div>
    </footer>`;
  }

  /**
   * Génère la section PRODUITS avec les VRAIS produits
   */
  private generateProductsSection(products: any[], primaryColor: string, industry?: string): string {
    // Si pas de produits rÃ©els, afficher un message d'invitation
    if (!products || products.length === 0) {
      return `
    <!-- Section Produits - Vide (Ajoutez vos produits via le dashboard) -->
    <section id="produits" class="relative py-28 bg-gradient-to-b from-white to-gray-50">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-4xl mx-auto">
                <span class="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary font-bold text-sm mb-6 border border-primary/20">
                    CATALOGUE
                </span>
                <h2 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Nos Produits</h2>
                <p class="text-gray-600 text-xl mb-12 font-light">Vos produits apparaÃ®tront ici une fois ajoutÃ©s</p>
                <div class="rounded-3xl p-16 border-2 shadow-2xl bg-white hover:shadow-3xl transition-shadow duration-300" style="border-color:${primaryColor}22;">
                    <div class="text-9xl mb-8">ðŸ“¦</div>
                    <h3 class="text-4xl font-black mb-6" style="color:${primaryColor}">Ajoutez Vos Produits</h3>
                    <p class="text-gray-700 text-xl leading-relaxed max-w-2xl mx-auto mb-8">
                        AccÃ©dez Ã  votre <strong>tableau de bord</strong> pour ajouter vos produits avec photos, prix et descriptions. 
                        Ils s'afficheront automatiquement ici avec un design professionnel.
                    </p>
                    <div class="flex flex-wrap gap-4 justify-center text-left mt-8 max-w-2xl mx-auto">
                        <div class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[250px]">
                            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span class="text-2xl">âœ¨</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 mb-1">Gestion Facile</h4>
                                <p class="text-sm text-gray-600">Interface intuitive pour ajouter/modifier vos produits</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[250px]">
                            <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                <span class="text-2xl">ðŸ–¼ï¸</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 mb-1">Photos IllimitÃ©es</h4>
                                <p class="text-sm text-gray-600">Ajoutez plusieurs images par produit</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 bg-gray-50 p-4 rounded-xl flex-1 min-w-[250px]">
                            <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                <span class="text-2xl">âš¡</span>
                            </div>
                            <div>
                                <h4 class="font-bold text-gray-900 mb-1">Mise Ã  Jour InstantanÃ©e</h4>
                                <p class="text-sm text-gray-600">Les changements apparaissent immÃ©diatement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
    }

    const productsHTML = products.map((product, index) => `
        <div class="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 hover:border-primary/30" 
             data-aos="zoom-in" 
             data-aos-delay="${index * 100}">
            <div class="relative overflow-hidden aspect-square">
                <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                <img src="${product.images?.[0] || 'https://via.placeholder.com/400'}" 
                     alt="${product.name}"
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                ${product.stock <= 0 ? '<div class="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">Ã‰puisÃ©</div>' : ''}
                ${product.stock > 0 && product.stock < 10 ? '<div class="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm animate-pulse">Stock limitÃ©</div>' : ''}
                ${product.isNew ? '<div class="absolute top-4 left-4 z-20 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Nouveau</div>' : ''}
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                    <div class="flex gap-3 justify-center">
                        <button class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                            <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button class="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110">
                            <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-8">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">${product.category || 'Produit'}</span>
                    ${product.rating ? `
                    <div class="flex items-center gap-1">
                        <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span class="text-sm font-bold text-gray-700">${product.rating}</span>
                    </div>
                    ` : ''}
                </div>
                <h3 class="text-2xl font-black mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">${product.name}</h3>
                <p class="text-gray-600 mb-6 line-clamp-3 leading-relaxed">${product.description || 'DÃ©couvrez ce produit exceptionnel'}</p>
                <div class="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div>
                        <div class="text-xs text-gray-500 mb-1">Prix</div>
                        <span class="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">${
                            product.price
                                ? Number(product.price).toLocaleString('fr-FR') + ' DT'
                                : 'Sur demande'
                        }</span>
                    </div>
                    <button type="button" data-buy-product
                            data-product-id="${product._id || product.id || index}"
                            data-product-name="${(product.name || product.title || 'Produit').replace(/"/g, '')}"
                            data-product-price="${product.price || 0}"
                            class="group/btn relative bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full hover:shadow-2xl transition-all duration-300 font-bold text-sm sm:text-base">
                        <span class="relative z-10">${product.stock > 0 ? 'Commander' : 'Indisponible'}</span>
                    </button>
                </div>
                <div class="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span class="px-2 py-1 bg-green-50 text-green-700 rounded-full">✓ COD</span>
                    <span class="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">✓ Livraison rapide</span>
                    ${product.stock > 0 && product.stock < 10 ? '<span class="px-2 py-1 bg-orange-50 text-orange-700 rounded-full animate-pulse">Stock limité</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');

    return `
    <!-- Section Produits RÃ‰ELS -->
    <section id="produits" class="relative py-28 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div class="absolute top-40 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
            <div class="absolute bottom-40 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-20" data-aos="fade-up">
                <span class="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary font-bold text-sm mb-6 border border-primary/20">
                    NOTRE COLLECTION
                </span>
                <h2 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">Nos Produits</h2>
                <div class="w-24 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary mx-auto rounded-full mb-6"></div>
                <p class="text-gray-600 text-2xl font-light max-w-2xl mx-auto">DÃ©couvrez notre sÃ©lection de produits d'exception</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                ${productsHTML}
            </div>
            
            ${products.length >= 12 ? `
            <div class="text-center mt-20" data-aos="fade-up">
                <a href="/products" class="group inline-flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-10 py-5 rounded-full font-black text-lg hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 hover:scale-110">
                    <span>Voir Tous les Produits</span>
                    <svg class="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </a>
            </div>
            ` : ''}
        </div>
    </section>`;
  }

  /**
   * GÃ©nÃ¨re la section valeurs
   */
    private generateValuesSection(values?: string[]): string {
    if (!values || values.length === 0) return '';

    const valuesHTML = values.map((value, index) => `
        <div class="flex items-start gap-3" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <span class="text-gray-700 font-medium">${value}</span>
        </div>
    `).join('');

    return `
    <div class="mt-12">
        <h3 class="text-2xl font-bold text-center mb-8">Nos Valeurs</h3>
        <div class="grid md:grid-cols-2 gap-4">
            ${valuesHTML}
        </div>
    </div>`;
  }

  /**
   * GÃ©nÃ¨re la section tÃ©moignages
   */
    private generateTestimonialsSection(testimonials: any[] = [], primaryColor: string): string {
        if (!testimonials || testimonials.length === 0) return '';

    const testimonialsHTML = testimonials.map((t, index) => `
        <div class="bg-white p-8 rounded-2xl shadow-lg" data-aos="fade-up" data-aos-delay="${index * 100}">
            <div class="text-yellow-500 text-2xl mb-4">${'â­'.repeat(Math.min(5, Math.max(1, Math.round(Number(t.rating) || 5))))}</div>
            <p class="text-gray-700 text-lg mb-6 italic">"${t.text}"</p>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                    ${t.author?.charAt(0) || 'A'}
                </div>
                <div>
                    <div class="font-bold">${t.author}</div>
                    <div class="text-sm text-gray-600">${t.role}</div>
                </div>
            </div>
        </div>
    `).join('');

    return `
    <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12" data-aos="fade-up">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">TÃ©moignages</h2>
                <div class="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
                <p class="text-gray-600 text-lg">Ce que disent nos clients</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                ${testimonialsHTML}
            </div>
        </div>
    </section>`;
  }

  /**
   * GÃ©nÃ¨re des produits d'exemple basÃ©s sur l'industrie
   */
  private generateExampleProducts(industry: string): any[] {
    const productsByIndustry = {
      'E-commerce': [
        {
          name: 'Montre ConnectÃ©e Premium',
          description: 'Montre intelligente avec suivi santÃ©, GPS et autonomie 7 jours. Design Ã©lÃ©gant en acier inoxydable.',
          price: 45000,
          category: 'Technologie',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
          stock: 15,
          rating: 4.8,
          isNew: true
        },
        {
          name: 'Sac Ã  Dos Cuir Vintage',
          description: 'Sac en cuir vÃ©ritable fait main, compartiment laptop 15", finitions premium.',
          price: 32000,
          category: 'Accessoires',
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
          stock: 8,
          rating: 4.9
        },
        {
          name: 'Casque Audio Sans Fil',
          description: 'RÃ©duction de bruit active, son haute fidÃ©litÃ©, 30h d\'autonomie.',
          price: 28000,
          category: 'Audio',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
          stock: 20,
          rating: 4.7
        },
        {
          name: 'Sneakers Sport Premium',
          description: 'Chaussures de sport haute performance avec technologie Air. Confort maximal.',
          price: 38000,
          category: 'Mode',
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
          stock: 12,
          rating: 4.6,
          isNew: true
        },
        {
          name: 'Parfum Luxe 100ml',
          description: 'Eau de parfum exclusive, notes boisÃ©es et florales. Tenue longue durÃ©e.',
          price: 55000,
          category: 'BeautÃ©',
          images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'],
          stock: 6,
          rating: 5.0
        },
        {
          name: 'Lunettes de Soleil Designer',
          description: 'Protection UV400, verres polarisÃ©s, monture titane ultra-lÃ©gÃ¨re.',
          price: 22000,
          category: 'Accessoires',
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'],
          stock: 25,
          rating: 4.5
        }
      ],
      'Restaurant': [
        {
          name: 'Menu Gastronomique 3 Services',
          description: 'EntrÃ©e, plat et dessert du chef. IngrÃ©dients frais et locaux.',
          price: 12500,
          category: 'Menu',
          images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'],
          stock: 100,
          rating: 4.9,
          isNew: true
        },
        {
          name: 'Plateau Fruits de Mer',
          description: 'SÃ©lection premium : huÃ®tres, crevettes, langoustines. Pour 2 personnes.',
          price: 18000,
          category: 'SpÃ©cialitÃ©',
          images: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600'],
          stock: 15,
          rating: 5.0
        },
        {
          name: 'Burger Signature du Chef',
          description: 'BÅ“uf Angus, cheddar affinÃ©, bacon croustillant, frites maison.',
          price: 8500,
          category: 'Plat',
          images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'],
          stock: 50,
          rating: 4.8
        },
        {
          name: 'Pizza Truffe & Burrata',
          description: 'PÃ¢te artisanale, truffe noire, burrata crÃ©meuse, roquette.',
          price: 9500,
          category: 'Plat',
          images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'],
          stock: 30,
          rating: 4.7,
          isNew: true
        },
        {
          name: 'Cocktail Signature Maison',
          description: 'CrÃ©ation exclusive du barman, spiritueux premium, fruits frais.',
          price: 6000,
          category: 'Boisson',
          images: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600'],
          stock: 200,
          rating: 4.6
        },
        {
          name: 'Tiramisu Maison',
          description: 'Recette traditionnelle italienne, mascarpone, cafÃ© arabica.',
          price: 4500,
          category: 'Dessert',
          images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600'],
          stock: 40,
          rating: 4.9
        }
      ],
      'Technologie': [
        {
          name: 'Laptop Pro 15" M3',
          description: 'Processeur M3, 16GB RAM, 512GB SSD, Ã©cran Retina. Performances extrÃªmes.',
          price: 850000,
          category: 'Ordinateur',
          images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
          stock: 5,
          rating: 5.0,
          isNew: true
        },
        {
          name: 'Smartphone 5G Pro Max',
          description: 'CamÃ©ra 108MP, Ã©cran 120Hz AMOLED, batterie 5000mAh, charge rapide 65W.',
          price: 520000,
          category: 'TÃ©lÃ©phone',
          images: ['https://images.unsplash.com/photo-1592286927505-b145b7b7e95c?w=600'],
          stock: 12,
          rating: 4.8
        },
        {
          name: 'Tablette Graphique Pro',
          description: 'Ã‰cran 13" 4K, stylet sans batterie, 8192 niveaux de pression.',
          price: 320000,
          category: 'Accessoire',
          images: ['https://images.unsplash.com/photo-1544824084-c7ab1f922185?w=600'],
          stock: 8,
          rating: 4.9
        },
        {
          name: 'Clavier MÃ©canique RGB',
          description: 'Switches Cherry MX, rÃ©troÃ©clairage RGB personnalisable, aluminium.',
          price: 45000,
          category: 'PÃ©riphÃ©rique',
          images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600'],
          stock: 20,
          rating: 4.7,
          isNew: true
        },
        {
          name: 'Webcam 4K Streaming',
          description: 'RÃ©solution 4K 60fps, autofocus, micro stÃ©rÃ©o intÃ©grÃ©.',
          price: 75000,
          category: 'Streaming',
          images: ['https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=600'],
          stock: 15,
          rating: 4.6
        },
        {
          name: 'SSD Externe 2TB',
          description: 'Vitesse 1000MB/s, USB-C 3.2, rÃ©sistant aux chocs.',
          price: 95000,
          category: 'Stockage',
          images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600'],
          stock: 25,
          rating: 4.8
        }
      ]
    };

    // RÃ©cupÃ©rer les produits pour cette industrie ou utiliser E-commerce par dÃ©faut
    return productsByIndustry[industry] || productsByIndustry['E-commerce'];
  }

  /**
   * GÃ©nÃ¨re une section spÃ©cifique selon la niche
   */
  private generateNicheSpecificSection(
    industry: string, 
    primaryColor: string, 
    companyName: string,
    phone?: string,
    email?: string
  ): string {
    const industry_lower = industry?.toLowerCase() || '';

    // RESTAURANT - Section Menu & RÃ©servation
    if (industry_lower.includes('restaurant') || industry_lower.includes('food') || industry_lower.includes('cafÃ©')) {
      return `
    <!-- Section Restaurant SpÃ©ciale -->
    <section class="relative py-28 bg-white overflow-hidden">
        <div class="container mx-auto px-6 relative z-10">
            <div class="max-w-6xl mx-auto">
                
                <!-- Menu du Jour -->
                <div class="text-center mb-16" data-aos="fade-up">
                    <span class="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary font-bold text-sm mb-4 border border-primary/20">
                        MENU DU JOUR
                    </span>
                    <h2 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                        DÃ©couvrez Notre Carte
                    </h2>
                    <p class="text-gray-600 text-xl max-w-3xl mx-auto">
                        Des plats prÃ©parÃ©s avec passion et des ingrÃ©dients de premiÃ¨re qualitÃ©
                    </p>
                </div>

                <!-- RÃ©servation CTA -->
                <div class="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-center text-white" data-aos="zoom-in">
                    <div class="text-6xl mb-6">ðŸ½ï¸</div>
                    <h3 class="text-4xl font-black mb-4">RÃ©servez Votre Table</h3>
                    <p class="text-xl mb-8 opacity-90">Vivez une expÃ©rience culinaire inoubliable</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        ${phone ? `
                        <a href="tel:${phone}" class="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <span>ðŸ“ž</span>
                            <span>Appelez-nous</span>
                        </a>
                        ` : ''}
                        <a href="#contact" class="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
                            <span>âœ‰ï¸</span>
                            <span>RÃ©servation en ligne</span>
                        </a>
                    </div>
                </div>

                <!-- Horaires -->
                <div class="mt-16 grid md:grid-cols-2 gap-8" data-aos="fade-up" data-aos-delay="200">
                    <div class="bg-gray-50 rounded-2xl p-8">
                        <h4 class="text-2xl font-black mb-6 flex items-center gap-3">
                            <span class="text-4xl">ðŸ•</span>
                            Horaires d'Ouverture
                        </h4>
                        <div class="space-y-3 text-lg">
                            <div class="flex justify-between">
                                <span class="font-semibold">Lundi - Vendredi</span>
                                <span class="text-gray-600">11h - 23h</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="font-semibold">Samedi - Dimanche</span>
                                <span class="text-gray-600">10h - 00h</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 rounded-2xl p-8">
                        <h4 class="text-2xl font-black mb-6 flex items-center gap-3">
                            <span class="text-4xl">ðŸŒŸ</span>
                            Services SpÃ©ciaux
                        </h4>
                        <ul class="space-y-3 text-lg">
                            <li class="flex items-center gap-3">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span>Livraison Ã  domicile</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span>Ã‰vÃ©nements privÃ©s</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <span class="w-2 h-2 bg-primary rounded-full"></span>
                                <span>Menu vÃ©gÃ©tarien</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
    }

    // E-COMMERCE - Section Avantages Boutique
    if (industry_lower.includes('e-commerce') || industry_lower.includes('boutique') || industry_lower.includes('shop')) {
      return `
    <!-- Section E-commerce Avantages -->
    <section class="relative py-28 bg-gradient-to-b from-gray-50 to-white">
        <div class="container mx-auto px-6">
            <div class="text-center mb-16" data-aos="fade-up">
                <span class="inline-block px-6 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-primary font-bold text-sm mb-4 border border-primary/20">
                    POURQUOI NOUS CHOISIR
                </span>
                <h2 class="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    Shopping en Toute Confiance
                </h2>
            </div>

            <div class="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <div class="text-center" data-aos="zoom-in" data-aos-delay="100">
                    <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                        ðŸšš
                    </div>
                    <h3 class="text-xl font-black mb-2">Livraison Rapide</h3>
                    <p class="text-gray-600">Sous 48h partout</p>
                </div>
                <div class="text-center" data-aos="zoom-in" data-aos-delay="200">
                    <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                        ðŸ’³
                    </div>
                    <h3 class="text-xl font-black mb-2">Paiement SÃ©curisÃ©</h3>
                    <p class="text-gray-600">100% protÃ©gÃ©</p>
                </div>
                <div class="text-center" data-aos="zoom-in" data-aos-delay="300">
                    <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                        â†©ï¸
                    </div>
                    <h3 class="text-xl font-black mb-2">Retours Gratuits</h3>
                    <p class="text-gray-600">30 jours satisfait</p>
                </div>
                <div class="text-center" data-aos="zoom-in" data-aos-delay="400">
                    <div class="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                        ðŸ’¬
                    </div>
                    <h3 class="text-xl font-black mb-2">Support 24/7</h3>
                    <p class="text-gray-600">Toujours lÃ  pour vous</p>
                </div>
            </div>
        </div>
    </section>`;
    }

    // TECHNOLOGIE - Section Expertise
    if (industry_lower.includes('technologie') || industry_lower.includes('tech') || industry_lower.includes('informatique')) {
      return `
    <!-- Section Tech Expertise -->
    <section class="relative py-28 bg-gray-900 text-white overflow-hidden">
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div class="container mx-auto px-6 relative z-10">
            <div class="text-center mb-16" data-aos="fade-up">
                <span class="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-primary font-bold text-sm mb-4 border border-white/20">
                    NOTRE EXPERTISE
                </span>
                <h2 class="text-5xl md:text-7xl font-black mb-6">
                    Solutions Technologiques d'Excellence
                </h2>
            </div>

            <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all" data-aos="fade-up" data-aos-delay="100">
                    <div class="text-6xl mb-4">âš¡</div>
                    <h3 class="text-2xl font-black mb-3">Performance</h3>
                    <p class="text-gray-300">Technologies de pointe pour des rÃ©sultats optimaux</p>
                </div>
                <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all" data-aos="fade-up" data-aos-delay="200">
                    <div class="text-6xl mb-4">ðŸ›¡ï¸</div>
                    <h3 class="text-2xl font-black mb-3">SÃ©curitÃ©</h3>
                    <p class="text-gray-300">Protection maximale de vos donnÃ©es</p>
                </div>
                <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all" data-aos="fade-up" data-aos-delay="300">
                    <div class="text-6xl mb-4">ðŸŽ“</div>
                    <h3 class="text-2xl font-black mb-3">Formation</h3>
                    <p class="text-gray-300">Support et accompagnement personnalisÃ©</p>
                </div>
            </div>
        </div>
    </section>`;
    }

    // Par dÃ©faut - Section gÃ©nÃ©rique
    return '';
  }

  /**
   * GÃ©nÃ¨re la section FAQ
   */
        private generateFAQSection(faqs: any[] = [], _primaryColor: string): string {
            if (!faqs || faqs.length === 0) return '';

    const faqsHTML = faqs.map((faq, index) => `
        <div class="bg-white rounded-xl shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay="${index * 50}" x-data="{open: false}">
            <button @click="open = !open" class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition">
                <h3 class="font-semibold text-lg pr-4">${faq.question}</h3>
                <svg class="w-5 h-5 transform transition-transform" :class="{'rotate-180': open}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-collapse class="px-6 pb-4">
                <p class="text-gray-600 leading-relaxed">${faq.answer}</p>
            </div>
        </div>
    `).join('');

    return `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12" data-aos="fade-up">
                <h2 class="text-4xl md:text-5xl font-bold mb-4">Questions FrÃ©quentes</h2>
                <div class="w-20 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6"></div>
                <p class="text-gray-600 text-lg">Trouvez les rÃ©ponses Ã  vos questions</p>
            </div>
            
            <div class="max-w-3xl mx-auto space-y-4">
                ${faqsHTML}
            </div>
        </div>
    </section>`;
  }

  /**
   * ðŸ—ï¸ NORMALISE LA CONFIGURATION DU SITE
   */
  private normalizeConfig(config: WebsiteGenerationConfig): NormalizedWebsiteConfig {
    const primaryColor = config.primaryColor || '#CC0000';
    const secondaryColor = config.secondaryColor || '#333333';

    return {
        tenantId: config.tenantId,
        slug: config.slug,
        companyName: config.companyName,
        industry: config.industry || config.businessType || 'ecommerce',
        primaryGoal: config.primaryGoal || 'Vendre en ligne',
        targetAudience: config.targetAudience || 'Clients potentiels',
        location: config.location || 'Tunisie',
        email: config.email || config.contactEmail || '',
        phone: config.phone,
        address: config.address,
        slogan: config.slogan,
        description: config.description,
        keyFeatures: config.keyFeatures,
        logoUrl: config.logoUrl || config.theme?.logo,
        palette: {
            primary: primaryColor,
            secondary: secondaryColor,
        },
        settings: {
            enableCart: config.settings?.enableCart ?? true,
            enableCheckout: config.settings?.enableCheckout ?? true,
            enableContact: config.settings?.enableContact ?? true,
            currency: config.settings?.currency || 'TND',
            language: config.settings?.language || 'fr',
        },
        theme: config.theme,
    };
  }

  /**
   * ðŸ“¦ RÃ‰CUPÃˆRE LES VRAIS PRODUITS DEPUIS LA DB
   */
  private async getRealProducts(tenantId: string): Promise<any[]> {
    try {
        const products = await this.productModel.find({ 
            tenantId, 
            status: 'active' 
        }).limit(12).lean();
        
        return products.map(p => ({
            id: p._id.toString(),
            name: p.title,
            description: p.description,
            price: p.variants?.[0]?.price || 0,
            images: p.images || [],
            stock: p.variants?.[0]?.inventory || 0
        }));
    } catch (error) {
        this.logger.error(`Erreur getRealProducts: ${error.message}`);
        return [];
    }
  }
}
