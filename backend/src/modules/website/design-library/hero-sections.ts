/**
 * Hero Sections Modernes - Design System Ecompilot
 * 10 variantes professionnelles pour différents besoins
 */

export const HERO_SECTIONS = {
  /**
   * MINIMAL - Design épuré et moderne
   * Idéal pour : SaaS, Tech, Services professionnels
   */
  minimal: (data: any) => `
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      <!-- Decorative Blobs -->
      <div class="absolute top-20 -right-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div class="absolute bottom-20 -left-20 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 mb-6 animate-fade-in">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span class="text-sm font-medium text-gray-700">${data.badge || '✨ Nouveau'}</span>
        </div>
        
        <!-- Title -->
        <h1 class="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up" style="animation-delay: 0.1s;">
          ${data.companyName}
        </h1>
        
        <!-- Subtitle -->
        <p class="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
          ${data.companySlogan || 'Découvrez l\'excellence à chaque instant'}
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in-up" style="animation-delay: 0.3s;">
          <button class="group inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
            Commencer maintenant
            <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
          <button class="inline-flex items-center justify-center rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-semibold px-8 py-4 transition-all duration-200">
            En savoir plus
          </button>
        </div>
        
        <!-- Social Proof -->
        <div class="flex flex-wrap items-center justify-center gap-8 text-gray-600 animate-fade-in" style="animation-delay: 0.4s;">
          <div class="text-center">
            <div class="text-4xl font-bold text-gray-900 mb-1">10k+</div>
            <div class="text-sm text-gray-600">Clients satisfaits</div>
          </div>
          <div class="w-px h-16 bg-gray-300"></div>
          <div class="text-center">
            <div class="text-4xl font-bold text-gray-900 mb-1">4.9/5</div>
            <div class="text-sm text-gray-600">Note moyenne</div>
          </div>
          <div class="w-px h-16 bg-gray-300"></div>
          <div class="text-center">
            <div class="text-4xl font-bold text-gray-900 mb-1">24/7</div>
            <div class="text-sm text-gray-600">Support disponible</div>
          </div>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>
  `,

  /**
   * LUXURY - Élégant et raffiné
   * Idéal pour : Parfums, Bijoux, Mode haut de gamme
   */
  luxury: (data: any) => `
    <section class="relative min-h-screen flex items-center bg-black text-white overflow-hidden">
      <!-- Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      <!-- Animated Lines -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
        <div class="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
        <div class="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Left: Text -->
          <div class="space-y-8">
            <div class="inline-block px-6 py-2 border border-white/20 rounded-full text-sm font-light tracking-[0.3em] uppercase animate-fade-in">
              ${data.collection || 'Collection 2024'}
            </div>
            
            <h1 class="text-7xl lg:text-8xl font-display font-light leading-[0.95] animate-fade-in-up" style="animation-delay: 0.1s;">
              ${data.companyName}
            </h1>
            
            <p class="text-xl text-gray-300 font-light leading-relaxed max-w-lg animate-fade-in-up" style="animation-delay: 0.2s;">
              ${data.companySlogan || 'L\'élégance à l\'état pur. Une expérience sensorielle unique.'}
            </p>
            
            <div class="flex gap-6 animate-fade-in-up" style="animation-delay: 0.3s;">
              <button class="px-10 py-4 bg-white text-black font-medium tracking-wide hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                DÉCOUVRIR
              </button>
              <button class="px-10 py-4 border border-white/30 hover:border-white/50 font-light tracking-wide transition-all duration-300">
                NOTRE HISTOIRE
              </button>
            </div>
            
            <!-- Features -->
            <div class="flex gap-12 pt-8 text-sm font-light tracking-wide animate-fade-in" style="animation-delay: 0.4s;">
              <div>
                <div class="text-white/50 mb-2">LIVRAISON</div>
                <div>Gratuite</div>
              </div>
              <div>
                <div class="text-white/50 mb-2">GARANTIE</div>
                <div>À vie</div>
              </div>
              <div>
                <div class="text-white/50 mb-2">EXPERTISE</div>
                <div>Depuis 1990</div>
              </div>
            </div>
          </div>
          
          <!-- Right: Image -->
          <div class="relative animate-fade-in" style="animation-delay: 0.5s;">
            <div class="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img src="${data.heroImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'}" 
                   alt="${data.companyName}" 
                   class="w-full h-full object-cover">
            </div>
            <!-- Glow Effect -->
            <div class="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/20 blur-[120px] rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  `,

  /**
   * E-COMMERCE - Dynamique et conversion-oriented
   * Idéal pour : Boutiques en ligne, Produits
   */
  ecommerce: (data: any) => `
    <section class="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 lg:py-0 lg:min-h-screen overflow-hidden">
      <!-- Background Shapes -->
      <div class="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
      <div class="absolute bottom-20 left-10 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style="animation-delay: 4s;"></div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 lg:flex lg:items-center lg:min-h-screen">
        <div class="grid lg:grid-cols-2 gap-12 items-center w-full">
          <!-- Left: Text & CTA -->
          <div class="space-y-8 lg:pr-12">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-medium shadow-lg animate-fade-in">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              ${data.promo || 'Offre spéciale -30%'}
            </div>
            
            <h1 class="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight animate-fade-in-up" style="animation-delay: 0.1s;">
              ${data.companyName}
            </h1>
            
            <p class="text-xl text-gray-600 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
              ${data.companyDescription || 'Découvrez notre collection exclusive de produits premium. Qualité garantie, livraison rapide.'}
            </p>
            
            <!-- CTA -->
            <div class="flex flex-wrap gap-4 animate-fade-in-up" style="animation-delay: 0.3s;">
              <button class="group inline-flex items-center justify-center rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
                Acheter maintenant
                <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
              <button class="inline-flex items-center justify-center rounded-xl border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold px-8 py-4 transition-all duration-200">
                Voir la collection
              </button>
            </div>
            
            <!-- Trust Badges -->
            <div class="grid grid-cols-3 gap-6 pt-6 animate-fade-in" style="animation-delay: 0.4s;">
              <div class="text-center p-4 rounded-xl bg-white shadow-sm">
                <div class="text-3xl mb-2">🚚</div>
                <div class="text-sm font-medium text-gray-700">Livraison<br/>gratuite</div>
              </div>
              <div class="text-center p-4 rounded-xl bg-white shadow-sm">
                <div class="text-3xl mb-2">✓</div>
                <div class="text-sm font-medium text-gray-700">Garantie<br/>2 ans</div>
              </div>
              <div class="text-center p-4 rounded-xl bg-white shadow-sm">
                <div class="text-3xl mb-2">💳</div>
                <div class="text-sm font-medium text-gray-700">Paiement<br/>sécurisé</div>
              </div>
            </div>
          </div>
          
          <!-- Right: Product Showcase -->
          <div class="relative lg:h-[600px] animate-fade-in" style="animation-delay: 0.5s;">
            <div class="grid grid-cols-2 gap-4 h-full">
              <div class="space-y-4">
                <div class="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 hover:rotate-2 transition-all duration-300">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" alt="Product" class="w-full h-full object-cover">
                </div>
                <div class="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 hover:-rotate-2 transition-all duration-300">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" alt="Product" class="w-full h-full object-cover">
                </div>
              </div>
              <div class="space-y-4 pt-8">
                <div class="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 hover:-rotate-2 transition-all duration-300">
                  <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400" alt="Product" class="w-full h-full object-cover">
                </div>
                <div class="aspect-square rounded-2xl overflow-hidden shadow-xl transform hover:scale-105 hover:rotate-2 transition-all duration-300">
                  <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400" alt="Product" class="w-full h-full object-cover">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  /**
   * RESTAURANT - Appétissant et chaleureux
   * Idéal pour : Restaurants, Cafés, Food
   */
  restaurant: (data: any) => `
    <section class="relative min-h-screen bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0">
        <img src="${data.backgroundImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920'}" 
             alt="Restaurant" 
             class="w-full h-full object-cover opacity-20">
        <div class="absolute inset-0 bg-gradient-to-r from-orange-900/90 to-red-900/80"></div>
      </div>
      
      <!-- Content -->
      <div class="relative z-10 min-h-screen flex items-center">
        <div class="max-w-7xl mx-auto px-6 py-20">
          <div class="max-w-3xl">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8 animate-fade-in">
              <span>🍽️</span>
              ${data.badge || 'Ouvert tous les jours'}
            </div>
            
            <h1 class="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up" style="animation-delay: 0.1s;">
              ${data.companyName}
            </h1>
            
            <p class="text-2xl text-white/90 font-light mb-10 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s;">
              ${data.companySlogan || 'Une expérience gastronomique inoubliable dans une ambiance chaleureuse'}
            </p>
            
            <div class="flex flex-wrap gap-4 mb-12 animate-fade-in-up" style="animation-delay: 0.3s;">
              <button class="px-8 py-4 bg-white text-orange-900 font-bold rounded-xl hover:bg-orange-50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                Réserver une table
              </button>
              <button class="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200">
                Voir le menu
              </button>
            </div>
            
            <!-- Info Cards -->
            <div class="grid grid-cols-3 gap-4 animate-fade-in" style="animation-delay: 0.4s;">
              <div class="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-center text-white">
                <div class="text-3xl font-bold mb-1">★ 4.8</div>
                <div class="text-sm text-white/80">Note</div>
              </div>
              <div class="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-center text-white">
                <div class="text-3xl font-bold mb-1">500+</div>
                <div class="text-sm text-white/80">Avis</div>
              </div>
              <div class="p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-center text-white">
                <div class="text-3xl font-bold mb-1">15</div>
                <div class="text-sm text-white/80">Ans</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
};

export default HERO_SECTIONS;
