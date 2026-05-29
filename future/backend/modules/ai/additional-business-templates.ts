// Templates additionnels pour plus de types de business
// À intégrer dans enhanced-ai-content.service.ts

export const additionalBusinessTemplates = {
  // ✂️ SALON DE COIFFURE
  coiffure: {
    slogan: `Révélez votre beauté naturelle`,
    description: (companyName: string, city: string) => 
      `${companyName} à ${city} est votre salon de beauté de référence pour sublimer votre style. Notre équipe de coiffeurs diplômés maîtrise les dernières techniques et tendances. Que vous souhaitiez une coupe moderne, une coloration raffinée, un soin capillaire en profondeur ou un relooking complet, nous créons le look qui vous ressemble. Ambiance détendue et professionnelle garantie.`,
    services: [
      { name: 'Coupe Femme + Brushing', description: 'Coupe personnalisée avec conseil morphologie', icon: '💇‍♀️', price: '45€', duration: '1h' },
      { name: 'Coloration Complète', description: 'Coloration totale avec produits premium sans ammoniaque', icon: '🎨', price: '70€', duration: '2h' },
      { name: 'Balayage / Mèches', description: 'Technique moderne pour un effet naturel et lumineux', icon: '✨', price: '85€', duration: '2h30' },
      { name: 'Soin Capillaire', description: 'Soin restructurant avec massage crânien relaxant', icon: '💆‍♀️', price: '35€', duration: '45min' }
    ],
    testimonials: [
      { name: 'Léa R.', rating: 5, text: 'Meilleur salon! Ma coiffeuse a parfaitement compris. Résultat bluffant!', date: '2024-03' },
      { name: 'Camille M.', rating: 5, text: 'Balayage magnifique et naturel. Équipe professionnelle!', date: '2024-03' },
      { name: 'Emma D.', rating: 5, text: 'Moment de détente parfait. Cheveux sublimes!', date: '2024-03' }
    ],
    faq: [
      { q: 'Faut-il prendre rendez-vous?', a: 'Oui, réservation recommandée en ligne 24/7' },
      { q: 'Quels produits utilisez-vous?', a: 'Marques professionnelles: L\'Oréal, Kérastase' },
      { q: 'Proposez-vous des forfaits?', a: 'Oui! Forfait mariée, carte fidélité, tarifs étudiants' }
    ],
    keywords: ['coiffure', 'salon beauté', 'coiffeur', 'coloration', 'balayage']
  },

  // 🏠 IMMOBILIER
  immobilier: {
    slogan: `Votre partenaire immobilier de confiance`,
    description: (companyName: string, city: string) =>
      `${companyName} est votre agence immobilière de référence à ${city}. Expertise reconnue depuis 15 ans, nous vous accompagnons dans tous vos projets: achat, vente, location, investissement. Portefeuille diversifié et accompagnement personnalisé du premier contact jusqu'à la signature chez le notaire.`,
    services: [
      { name: 'Vente de Bien', description: 'Estimation gratuite, home staging, diffusion multicanale', icon: '🏡', price: 'Commission vendeur' },
      { name: 'Achat Immobilier', description: 'Recherche personnalisée, visites, négociation, financement', icon: '🔑', price: 'Honoraires acquéreur' },
      { name: 'Gestion Locative', description: 'Recherche locataires, encaissement, gestion complète', icon: '📋', price: '7% HT loyers' },
      { name: 'Investissement', description: 'Conseil défiscalisation, sélection biens rentables', icon: '💰', price: 'Sur devis' }
    ],
    testimonials: [
      { name: 'François M.', rating: 5, text: 'Vente en 3 semaines! Agent professionnel et excellent négociateur!', date: '2024-03' },
      { name: 'Sophie L.', rating: 5, text: 'Premier achat, accompagnement parfait de A à Z. Merci!', date: '2024-03' },
      { name: 'Laurent P.', rating: 5, text: 'Gestion locative au top! Plus de soucis, tout est géré!', date: '2024-03' }
    ],
    faq: [
      { q: 'Comment estimez-vous mon bien?', a: 'Estimation gratuite sous 48h basée sur le marché local' },
      { q: 'Quels sont vos honoraires?', a: 'Transparents: 5-7% vente, honoraires acquéreur achat' },
      { q: 'Délai moyen de vente?', a: '60-90 jours à ${city} selon prix et emplacement' }
    ],
    keywords: ['immobilier', 'vente', 'location', 'investissement', 'agence']
  },

  // 📸 PHOTOGRAPHE
  photographe: {
    slogan: `Capturer l'émotion de l'instant`,
    description: (companyName: string, city: string) =>
      `${companyName}, photographe professionnel à ${city}, immortalise vos moments précieux. Spécialisé mariage, portrait, événementiel. 10 ans d'expérience, équipement pro Canon, approche personnalisée. Transformez vos souvenirs en œuvres d'art intemporelles.`,
    services: [
      { name: 'Mariage Complet', description: 'Journée complète: 500+ photos retouchées + album premium', icon: '💒', price: 'Dès 1200€', duration: 'Journée' },
      { name: 'Séance Portrait', description: 'Studio ou extérieur. 20 photos retouchées + 5 tirages', icon: '📷', price: '180€', duration: '1h30' },
      { name: 'Événement Corporate', description: 'Reportage entreprise, livraison rapide 48h', icon: '🏢', price: '90€/h' },
      { name: 'Book Professionnel', description: 'Book mannequin/comédien. 30 photos HD retouchées', icon: '📸', price: '250€', duration: '2h' }
    ],
    testimonials: [
      { name: 'Marie & Thomas', rating: 5, text: 'Photos de mariage sublimes! Discret, professionnel, créatif!', date: '2024-03' },
      { name: 'Isabelle G.', rating: 5, text: 'Portrait famille magique! Enfants à l\'aise, photos pleines d\'émotion!', date: '2024-03' },
      { name: 'TechCorp', rating: 5, text: 'Très pro pour notre séminaire! Livraison rapide, qualité top!', date: '2024-03' }
    ],
    faq: [
      { q: 'Quand réserver un mariage?', a: '8-12 mois à l\'avance, surtout mai-septembre' },
      { q: 'Recevons-nous toutes les photos?', a: '400-600 photos retouchées HD + galerie en ligne' },
      { q: 'Proposez-vous des albums?', a: 'Oui! Albums premium sur-mesure, plusieurs formats' }
    ],
    keywords: ['photographe', 'photo mariage', 'portrait', 'shooting', 'événementiel']
  },

  // 🎓 ÉCOLE
  ecole: {
    slogan: `Apprendre, grandir, réussir`,
    description: (companyName: string, city: string) =>
      `${companyName}, établissement d'excellence à ${city}. Depuis 20 ans, environnement stimulant où chaque élève développe son potentiel. Équipe qualifiée, méthodes modernes, infrastructures récentes. Excellence académique + épanouissement personnel. Inscriptions ouvertes!`,
    services: [
      { name: 'Programme Primaire', description: 'CP-CM2, pédagogie active, max 20 élèves, suivi individualisé', icon: '📚', price: '380€/mois' },
      { name: 'Collège', description: '6ème-3ème avec options renforcées, préparation brevet', icon: '🎒', price: '420€/mois' },
      { name: 'Soutien Scolaire', description: 'Cours particuliers par matière, progression garantie', icon: '✏️', price: '35€/h' },
      { name: 'Ateliers Périscolaires', description: 'Théâtre, robotique, arts, sports, musique inclus', icon: '🎨', price: 'Inclus' }
    ],
    testimonials: [
      { name: 'Catherine D.', rating: 5, text: 'Enfants épanouis! Équipe bienveillante, résultats excellents!', date: '2024-03' },
      { name: 'Alexandre M.', rating: 5, text: 'Fils en difficulté, maintenant confiant grâce au soutien!', date: '2024-03' },
      { name: 'Sophie L.', rating: 5, text: 'Structure moderne, programme enrichi, communication top!', date: '2024-03' }
    ],
    faq: [
      { q: 'Conditions d\'inscription?', a: 'Sur dossier avec entretien. Inscription dès janvier recommandée' },
      { q: 'Proposez-vous une cantine?', a: 'Oui! Menus équilibrés quotidiens. 8€/repas ou 140€/mois' },
      { q: 'Projet pédagogique?', a: 'Pédagogie active, classes réduites, langues, sciences, créativité' }
    ],
    keywords: ['école', 'éducation', 'enseignement', 'formation', 'scolarité']
  },

  // 💼 AGENCE
  agency: {
    slogan: `Votre succès, notre mission`,
    description: (companyName: string, city: string) =>
      `${companyName}, agence de services professionnels à ${city}. Accompagnement stratégique et opérationnel des entreprises. Experts pluridisciplinaires, solutions sur-mesure, résultats mesurables. Conseil, digital, marketing, formation. Transformons vos défis en opportunités!`,
    services: [
      { name: 'Conseil Stratégique', description: 'Diagnostic, plan d\'action, feuille de route complète', icon: '🎯', price: 'Dès 2500€', duration: '1-3 mois' },
      { name: 'Transformation Digitale', description: 'Process, outils, CRM, automatisation. Audit + implémentation', icon: '💻', price: 'Sur devis', duration: '2-6 mois' },
      { name: 'Marketing Digital', description: 'SEO, SEA, social media, content. ROI garanti', icon: '📈', price: 'Dès 1500€/mois' },
      { name: 'Formation & Coaching', description: 'Formations sur-mesure équipes + coaching dirigeants', icon: '🎓', price: '800€/jour' }
    ],
    testimonials: [
      { name: 'Startup TechVision', rating: 5, text: 'Accompagnement levée de fonds exceptionnel! 2M€ levés!', date: '2024-03' },
      { name: 'PME Industrie+', rating: 5, text: 'Transformation digitale réussie! +40% productivité, ROI 8 mois!', date: '2024-03' },
      { name: 'FashionStyle', rating: 5, text: 'Stratégie marketing qui a doublé notre CA! Équipe top!', date: '2024-03' }
    ],
    faq: [
      { q: 'Comment se déroule une mission?', a: 'Audit > Stratégie > Implémentation > Suivi. Reporting hebdo' },
      { q: 'Travaillez-vous avec les PME?', a: 'Oui! Solutions adaptées à tous budgets et tailles d\'entreprise' },
      { q: 'Garantissez-vous les résultats?', a: 'Objectifs clairs, KPIs mesurables, engagement performance' }
    ],
    keywords: ['agence', 'conseil', 'consulting', 'digital', 'stratégie', 'marketing']
  }
};

// Fonction helper pour générer le contenu enrichi
export function generateEnrichedContent(businessType: string, companyName: string, city: string) {
  const template = additionalBusinessTemplates[businessType];
  
  if (!template) return null;

  return {
    slogan: template.slogan,
    description: typeof template.description === 'function' 
      ? template.description(companyName, city) 
      : template.description,
    keywords: template.keywords.concat([city]),
    services: template.services,
    testimonials: template.testimonials,
    faq: template.faq.map(f => ({
      question: f.q,
      answer: f.a.replace('${city}', city),
      category: 'Général'
    })),
    blogPosts: [
      { title: `Guide ${businessType} 2024`, excerpt: 'Découvrez nos conseils...', category: 'Guide', readTime: '5 min' },
      { title: `Tendances ${businessType}`, excerpt: 'Les nouveautés...', category: 'Tendances', readTime: '4 min' },
      { title: `Réussir avec ${companyName}`, excerpt: 'Nos secrets...', category: 'Conseils', readTime: '6 min' }
    ],
    callToActions: [
      'Contactez-nous',
      'Demandez un devis gratuit',
      'Réservez maintenant',
      'Découvrez nos services'
    ],
    socialProof: {
      yearsExperience: 10,
      happyClients: 1000,
      awards: 3
    }
  };
}
