import { Injectable, Logger } from '@nestjs/common';
import { UltraAIGeneratorService } from './ultra-ai-generator.service';

/**
 * SERVICE INTERNATIONALISATION
 * 
 * Support multi-langue pour:
 * - Génération contenu IA dans plusieurs langues
 * - Templates traduits
 * - Interface utilisateur multilingue
 */

type Language = 'fr' | 'en' | 'es' | 'ar' | 'pt' | 'de' | 'it';

interface I18nContent {
  language: Language;
  hero: {
    headline: string;
    subheadline: string;
    cta: string[];
  };
  about: {
    title: string;
    story: string;
    mission: string;
    vision: string;
    values: string[];
  };
  common: {
    home: string;
    products: string;
    about: string;
    contact: string;
    buy: string;
    addToCart: string;
    viewMore: string;
    send: string;
    name: string;
    email: string;
    message: string;
  };
}

@Injectable()
export class I18nGeneratorService {
  private readonly logger = new Logger(I18nGeneratorService.name);

  constructor(private ultraAIGenerator: UltraAIGeneratorService) {}

  /**
   * Langues supportées
   */
  private readonly languages: Record<Language, string> = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    ar: 'العربية',
    pt: 'Português',
    de: 'Deutsch',
    it: 'Italiano'
  };

  /**
   * Génère du contenu dans une langue spécifique
   */
  async generateContent(
    context: any,
    language: Language = 'fr'
  ): Promise<any> {
    this.logger.log(`🌍 Génération contenu en ${this.languages[language]}`);

    // Modifier le prompt pour la langue
    const localizedContext = {
      ...context,
      language: this.languages[language],
      languageCode: language,
      languageInstructions: this.getLanguageInstructions(language)
    };

    return await this.ultraAIGenerator.generateUltraPersonalizedContent(localizedContext);
  }

  /**
   * Instructions spécifiques par langue
   */
  private getLanguageInstructions(language: Language): string {
    const instructions = {
      fr: 'Génère le contenu en français de France avec un ton professionnel et chaleureux.',
      en: 'Generate content in English (US/UK) with a professional and friendly tone.',
      es: 'Genera el contenido en español con un tono profesional y amigable.',
      ar: 'أنشئ المحتوى باللغة العربية بلهجة احترافية وودية.',
      pt: 'Gere o conteúdo em português (Brasil/Portugal) com tom profissional e amigável.',
      de: 'Erstelle den Inhalt auf Deutsch mit einem professionellen und freundlichen Ton.',
      it: 'Genera il contenuto in italiano con un tono professionale e amichevole.'
    };

    return instructions[language];
  }

  /**
   * Traductions communes par langue
   */
  private getCommonTranslations(language: Language): I18nContent['common'] {
    const translations: Record<Language, I18nContent['common']> = {
      fr: {
        home: 'Accueil',
        products: 'Produits',
        about: 'À Propos',
        contact: 'Contact',
        buy: 'Acheter',
        addToCart: 'Ajouter au panier',
        viewMore: 'Voir plus',
        send: 'Envoyer',
        name: 'Nom',
        email: 'Email',
        message: 'Message'
      },
      en: {
        home: 'Home',
        products: 'Products',
        about: 'About',
        contact: 'Contact',
        buy: 'Buy',
        addToCart: 'Add to cart',
        viewMore: 'View more',
        send: 'Send',
        name: 'Name',
        email: 'Email',
        message: 'Message'
      },
      es: {
        home: 'Inicio',
        products: 'Productos',
        about: 'Acerca de',
        contact: 'Contacto',
        buy: 'Comprar',
        addToCart: 'Agregar al carrito',
        viewMore: 'Ver más',
        send: 'Enviar',
        name: 'Nombre',
        email: 'Correo',
        message: 'Mensaje'
      },
      ar: {
        home: 'الرئيسية',
        products: 'المنتجات',
        about: 'عن',
        contact: 'اتصل',
        buy: 'شراء',
        addToCart: 'أضف إلى السلة',
        viewMore: 'عرض المزيد',
        send: 'إرسال',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        message: 'رسالة'
      },
      pt: {
        home: 'Início',
        products: 'Produtos',
        about: 'Sobre',
        contact: 'Contato',
        buy: 'Comprar',
        addToCart: 'Adicionar ao carrinho',
        viewMore: 'Ver mais',
        send: 'Enviar',
        name: 'Nome',
        email: 'E-mail',
        message: 'Mensagem'
      },
      de: {
        home: 'Startseite',
        products: 'Produkte',
        about: 'Über uns',
        contact: 'Kontakt',
        buy: 'Kaufen',
        addToCart: 'In den Warenkorb',
        viewMore: 'Mehr sehen',
        send: 'Senden',
        name: 'Name',
        email: 'E-Mail',
        message: 'Nachricht'
      },
      it: {
        home: 'Home',
        products: 'Prodotti',
        about: 'Chi siamo',
        contact: 'Contatti',
        buy: 'Acquista',
        addToCart: 'Aggiungi al carrello',
        viewMore: 'Vedi di più',
        send: 'Invia',
        name: 'Nome',
        email: 'Email',
        message: 'Messaggio'
      }
    };

    return translations[language];
  }

  /**
   * Génère le site dans plusieurs langues
   */
  async generateMultilingualSite(
    context: any,
    languages: Language[]
  ): Promise<Record<Language, any>> {
    this.logger.log(`🌐 Génération site multilingue: ${languages.join(', ')}`);

    const contents: Record<Language, any> = {} as Record<Language, any>;

    for (const lang of languages) {
      contents[lang] = await this.generateContent(context, lang);
    }

    return contents;
  }

  /**
   * Détecte la langue préférée de l'utilisateur
   */
  detectLanguage(acceptLanguage: string): Language {
    const languageCodes = acceptLanguage.split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2));

    for (const code of languageCodes) {
      if (this.languages[code as Language]) {
        return code as Language;
      }
    }

    return 'fr'; // Défaut
  }

  /**
   * Retourne toutes les langues supportées
   */
  getSupportedLanguages(): Record<Language, string> {
    return this.languages;
  }

  /**
   * Génère un sélecteur de langue HTML
   */
  generateLanguageSelector(currentLanguage: Language): string {
    const options = Object.entries(this.languages)
      .map(([code, name]) => `
        <option value="${code}" ${code === currentLanguage ? 'selected' : ''}>
          ${name}
        </option>
      `).join('');

    return `
      <div class="language-selector">
        <select id="language-select" class="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-primary outline-none">
          ${options}
        </select>
      </div>
      <script>
        document.getElementById('language-select').addEventListener('change', function(e) {
          const lang = e.target.value;
          window.location.href = window.location.pathname + '?lang=' + lang;
        });
      </script>
    `;
  }

  /**
   * Ajoute les balises hreflang pour SEO multi-langue
   */
  generateHreflangTags(baseUrl: string, availableLanguages: Language[]): string {
    return availableLanguages.map(lang => 
      `<link rel="alternate" hreflang="${lang}" href="${baseUrl}?lang=${lang}">`
    ).join('\n');
  }

  /**
   * Direction du texte (LTR ou RTL)
   */
  getTextDirection(language: Language): 'ltr' | 'rtl' {
    return language === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * Attributs HTML pour la langue
   */
  getHtmlAttributes(language: Language): string {
    const dir = this.getTextDirection(language);
    return `lang="${language}" dir="${dir}"`;
  }
}
