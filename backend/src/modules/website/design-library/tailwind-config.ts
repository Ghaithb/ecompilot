/**
 * Configuration Tailwind pour le Design System Ecompilot
 */

export const TAILWIND_CDN = `
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
            },
            accent: {
              400: '#fbbf24',
              500: '#f59e0b',
              600: '#d97706',
            },
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            display: ['Outfit', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          animation: {
            'fade-in': 'fadeIn 0.6s ease-out',
            'fade-in-up': 'fadeInUp 0.6s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'slide-in-left': 'slideInLeft 0.5s ease-out',
            'slide-in-right': 'slideInRight 0.5s ease-out',
            'scale-in': 'scaleIn 0.4s ease-out',
            'bounce-slow': 'bounce 3s infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(30px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            slideUp: {
              '0%': { transform: 'translateY(20px)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' },
            },
            slideInLeft: {
              '0%': { transform: 'translateX(-30px)', opacity: '0' },
              '100%': { transform: 'translateX(0)', opacity: '1' },
            },
            slideInRight: {
              '0%': { transform: 'translateX(30px)', opacity: '0' },
              '100%': { transform: 'translateX(0)', opacity: '1' },
            },
            scaleIn: {
              '0%': { transform: 'scale(0.95)', opacity: '0' },
              '100%': { transform: 'scale(1)', opacity: '1' },
            },
          },
        },
      },
    }
  </script>
`;

export const FONTS_CDN = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
`;

export const ANIMATIONS_CSS = `
  <style>
    /* Smooth scroll behavior */
    html {
      scroll-behavior: smooth;
    }
    
    /* Custom animations */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Glass morphism */
    .glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    /* Grid background pattern */
    .bg-grid-pattern {
      background-image: 
        linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    
    /* Hide scrollbar but keep functionality */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
`;

export const GSAP_CDN = `
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>
  <script>
    gsap.registerPlugin(ScrollTrigger);
    
    // Animate elements on scroll
    document.addEventListener('DOMContentLoaded', () => {
      gsap.utils.toArray('.animate-on-scroll').forEach((elem) => {
        gsap.from(elem, {
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });
  </script>
`;
