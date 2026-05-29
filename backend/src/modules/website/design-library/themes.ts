/**
 * Thèmes prédéfinis pour le Design System
 */

export const THEME_PRESETS = {
  minimal: {
    name: 'Minimal',
    description: 'Design épuré et moderne',
    heroStyle: 'minimal',
    colors: {
      primary: '#0ea5e9',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
    },
    font: {
      display: 'Outfit',
      body: 'Inter',
    },
  },
  
  luxury: {
    name: 'Luxury',
    description: 'Élégant et raffiné',
    heroStyle: 'luxury',
    colors: {
      primary: '#000000',
      secondary: '#d4af37',
      accent: '#ffffff',
    },
    font: {
      display: 'Playfair Display',
      body: 'Montserrat',
    },
  },
  
  ecommerce: {
    name: 'E-commerce',
    description: 'Dynamique et conversion-oriented',
    heroStyle: 'ecommerce',
    colors: {
      primary: '#0ea5e9',
      secondary: '#f59e0b',
      accent: '#8b5cf6',
    },
    font: {
      display: 'Outfit',
      body: 'Inter',
    },
  },
  
  restaurant: {
    name: 'Restaurant',
    description: 'Chaleureux et appétissant',
    heroStyle: 'restaurant',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#fbbf24',
    },
    font: {
      display: 'Outfit',
      body: 'Inter',
    },
  },
};

/**
 * Sélectionne automatiquement le thème selon le type de business
 */
export function selectThemeForBusiness(businessType: string): string {
  const themeMap: Record<string, string> = {
    parfum: 'luxury',
    coiffure: 'minimal',
    restaurant: 'restaurant',
    cafe: 'restaurant',
    immobilier: 'minimal',
    photographe: 'minimal',
    ecommerce: 'ecommerce',
    agency: 'minimal',
  };
  
  return themeMap[businessType] || 'minimal';
}
