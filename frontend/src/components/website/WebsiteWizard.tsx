import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from '@/components/ui/file-upload';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';
import {
  Store, 
  Coffee, 
  Utensils, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Building2,
  Stethoscope,
  Scale,
  Beer,
  Scissors,
  Shirt,
  Wrench,
  Hammer,
  GraduationCap,
  Plane,
  Cross
} from 'lucide-react';

  import AdsIntegrations from '@/components/integrations/AdsIntegrations';
  import AggregatedAdsView from '@/components/integrations/AggregatedAdsView';
// Types de business disponibles - 18 templates au total!
const BUSINESS_TYPES = [
  {
    id: 'parfum',
    name: 'Boutique de Parfum',
    icon: Sparkles,
    description: 'Vente de parfums et produits de luxe',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'cafe',
    name: 'Café / Coffee Shop',
    icon: Coffee,
    description: 'Café, boissons chaudes et snacks',
    color: 'from-amber-700 to-orange-500',
  },
  {
    id: 'sandwich',
    name: 'Sandwicherie / Fast Food',
    icon: Utensils,
    description: 'Sandwichs, salades et repas rapides',
    color: 'from-green-600 to-emerald-500',
  },
  {
    id: 'immobilier',
    name: 'Agence Immobilière',
    icon: Building2,
    description: 'Vente et location de biens immobiliers',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Général',
    icon: Store,
    description: 'Boutique en ligne multi-produits',
    color: 'from-indigo-600 to-purple-500',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: Utensils,
    description: 'Restaurant, bistrot, gastronomie',
    color: 'from-red-600 to-orange-500',
  },
  {
    id: 'medecin',
    name: 'Cabinet Médical',
    icon: Stethoscope,
    description: 'Médecin, dentiste, professionnel santé',
    color: 'from-teal-600 to-cyan-500',
  },
  {
    id: 'avocat',
    name: 'Cabinet d\'Avocat',
    icon: Scale,
    description: 'Avocat, notaire, profession juridique',
    color: 'from-slate-700 to-slate-500',
  },
  {
    id: 'photographe',
    name: 'Photographe / Studio',
    icon: Sparkles,
    description: 'Photographie, studio, événements',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'fitness',
    name: 'Salle de Sport / Fitness',
    icon: Store,
    description: 'Gym, fitness, musculation',
    color: 'from-orange-600 to-red-500',
  },
  // 🆕 8 NOUVEAUX TEMPLATES AFRICAINS
  {
    id: 'buvette',
    name: 'Buvette / Bar / Maquis',
    icon: Beer,
    description: 'Bar, maquis, boissons et grillades',
    color: 'from-orange-600 to-orange-500',
    badge: '🆕',
  },
  {
    id: 'coiffure',
    name: 'Salon de Coiffure',
    icon: Scissors,
    description: 'Coiffure, beauté, esthétique',
    color: 'from-pink-600 to-pink-500',
    badge: '🆕',
  },
  {
    id: 'couture',
    name: 'Atelier de Couture',
    icon: Shirt,
    description: 'Couture, retouches, sur-mesure',
    color: 'from-purple-600 to-purple-500',
    badge: '🆕',
  },
  {
    id: 'garage',
    name: 'Garage / Mécanique Auto',
    icon: Wrench,
    description: 'Réparation auto, mécanique',
    color: 'from-blue-600 to-blue-500',
    badge: '🆕',
  },
  {
    id: 'quincaillerie',
    name: 'Quincaillerie',
    icon: Hammer,
    description: 'Matériaux, outils, construction',
    color: 'from-green-700 to-green-600',
    badge: '🆕',
  },
  {
    id: 'ecole',
    name: 'École / Formation',
    icon: GraduationCap,
    description: 'École, cours, formation',
    color: 'from-cyan-600 to-cyan-500',
    badge: '🆕',
  },
  {
    id: 'voyage',
    name: 'Agence de Voyage',
    icon: Plane,
    description: 'Voyages, billets, circuits',
    color: 'from-sky-600 to-sky-500',
    badge: '🆕',
  },
  {
    id: 'pharmacie',
    name: 'Pharmacie',
    icon: Cross,
    description: 'Médicaments, parapharmacie',
    color: 'from-emerald-600 to-emerald-500',
    badge: '🆕',
  },
];

// Palettes de couleurs prédéfinies par type de business
const COLOR_PALETTES = {
  parfum: [
    { name: 'Luxe Violet', primary: '#8b5cf6', secondary: '#ec4899', preview: 'from-violet-500 to-pink-500' },
    { name: 'Rose Élégant', primary: '#d946ef', secondary: '#f472b6', preview: 'from-fuchsia-500 to-pink-400' },
    { name: 'Or Prestige', primary: '#ca8a04', secondary: '#f59e0b', preview: 'from-yellow-600 to-amber-500' },
  ],
  cafe: [
    { name: 'Café Chaud', primary: '#78350f', secondary: '#f97316', preview: 'from-amber-900 to-orange-500' },
    { name: 'Cappuccino', primary: '#a16207', secondary: '#eab308', preview: 'from-yellow-700 to-yellow-500' },
    { name: 'Expresso', primary: '#431407', secondary: '#92400e', preview: 'from-amber-950 to-amber-800' },
  ],
  sandwich: [
    { name: 'Vert Frais', primary: '#059669', secondary: '#10b981', preview: 'from-emerald-600 to-emerald-500' },
    { name: 'Appétissant', primary: '#dc2626', secondary: '#f97316', preview: 'from-red-600 to-orange-500' },
    { name: 'Naturel', primary: '#65a30d', secondary: '#84cc16', preview: 'from-lime-600 to-lime-500' },
  ],
  immobilier: [
    { name: 'Bleu Confiance', primary: '#2563eb', secondary: '#06b6d4', preview: 'from-blue-600 to-cyan-500' },
    { name: 'Professionnel', primary: '#1e40af', secondary: '#3b82f6', preview: 'from-blue-800 to-blue-500' },
    { name: 'Moderne', primary: '#0891b2', secondary: '#22d3ee', preview: 'from-cyan-600 to-cyan-400' },
  ],
  ecommerce: [
    { name: 'Indigo Moderne', primary: '#4f46e5', secondary: '#8b5cf6', preview: 'from-indigo-600 to-purple-500' },
    { name: 'Violet Dynamique', primary: '#7c3aed', secondary: '#a855f7', preview: 'from-violet-600 to-purple-500' },
    { name: 'Bleu Ciel', primary: '#0284c7', secondary: '#0ea5e9', preview: 'from-sky-600 to-sky-500' },
  ],
  restaurant: [
    { name: 'Rouge Passion', primary: '#dc2626', secondary: '#f97316', preview: 'from-red-600 to-orange-500' },
    { name: 'Bordeaux Chic', primary: '#991b1b', secondary: '#dc2626', preview: 'from-red-900 to-red-600' },
    { name: 'Orange Chaleureux', primary: '#ea580c', secondary: '#fb923c', preview: 'from-orange-600 to-orange-400' },
  ],
  medecin: [
    { name: 'Bleu Médical', primary: '#0891b2', secondary: '#06b6d4', preview: 'from-cyan-600 to-cyan-500' },
    { name: 'Vert Santé', primary: '#059669', secondary: '#10b981', preview: 'from-emerald-600 to-emerald-500' },
    { name: 'Bleu Confiance', primary: '#0284c7', secondary: '#22d3ee', preview: 'from-sky-600 to-cyan-400' },
  ],
  avocat: [
    { name: 'Gris Anthracite', primary: '#334155', secondary: '#64748b', preview: 'from-slate-700 to-slate-500' },
    { name: 'Bleu Marine', primary: '#1e3a8a', secondary: '#3b82f6', preview: 'from-blue-900 to-blue-500' },
    { name: 'Or Prestige', primary: '#a16207', secondary: '#ca8a04', preview: 'from-yellow-700 to-yellow-600' },
  ],
};

interface WizardData {
  // Étape 1: Type de business
  businessType: string;
  
  // Étape 2: Informations de l'entreprise
  companyName: string;
  companySlogan: string;
  companyDescription: string;
  
  // Étape 3: Coordonnées
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  
  // Étape 4: Préférences de design
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  
  // Étape 5: Fonctionnalités
  features: {
    enableCart: boolean;
    enableBooking: boolean;
    enableContact: boolean;
    enableBlog: boolean;
    enableGallery: boolean;
    enableTestimonials: boolean;
  };
}

const WebsiteWizard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  
  const [data, setData] = useState<WizardData>({
    businessType: '',
    companyName: '',
    companySlogan: '',
    companyDescription: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
    email: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    features: {
      enableCart: true,
      enableBooking: false,
      enableContact: true,
      enableBlog: false,
      enableGallery: true,
      enableTestimonials: true,
    },
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Accepte différents formats: +33 1 23 45 67 89, 01 23 45 67 89, etc.
    const re = /^[\d\s+()-]{10,}$/;
    return re.test(phone);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!data.businessType) {
          toast({
            title: 'Erreur',
            description: 'Veuillez sélectionner un type de business',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 2:
        if (!data.companyName || !data.companyDescription) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir tous les champs obligatoires',
            variant: 'destructive',
          });
          return false;
        }
        if (data.companyName.length < 2) {
          toast({
            title: 'Erreur',
            description: 'Le nom de l\'entreprise doit contenir au moins 2 caractères',
            variant: 'destructive',
          });
          return false;
        }
        if (data.companyDescription.length < 20) {
          toast({
            title: 'Erreur',
            description: 'La description doit contenir au moins 20 caractères',
            variant: 'destructive',
          });
          return false;
        }
        break;
      case 3:
        if (!data.city || !data.email || !data.phone) {
          toast({
            title: 'Erreur',
            description: 'Veuillez remplir les coordonnées principales',
            variant: 'destructive',
          });
          return false;
        }
        if (!validateEmail(data.email)) {
          toast({
            title: 'Email invalide',
            description: 'Veuillez entrer une adresse email valide',
            variant: 'destructive',
          });
          return false;
        }
        if (!validatePhone(data.phone)) {
          toast({
            title: 'Téléphone invalide',
            description: 'Veuillez entrer un numéro de téléphone valide',
            variant: 'destructive',
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (retryCount = 0) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast({
          title: 'Non authentifié',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }
      
      // Transformer les données pour correspondre au DTO backend
      const requestData = {
        companyName: data.companyName,
        business: {
          industry: data.businessType || 'E-commerce',
          primaryGoal: data.companySlogan || undefined,
          description: data.companyDescription || undefined,
          targetAudience: undefined,
          keyFeatures: undefined,
        },
        contact: {
          email: data.email,
          phone: data.phone || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          country: data.country || undefined,
        },
        branding: {
          slogan: data.companySlogan || undefined,
          brandVoice: undefined,
          colorPalette: undefined,
          primaryColor: data.primaryColor || undefined,
          secondaryColor: data.secondaryColor || undefined,
          logoUrl: undefined,
        },
        contentStrategy: {
          hasExistingContent: 'no' as 'no',
          contentNotes: undefined,
          launchTimeline: undefined,
        },
      };

      // Générer automatiquement le site selon les données
      const response = await fetch(apiUrl('/website/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        } else if (response.status === 400) {
          throw new Error(errorData.message || 'Données invalides. Vérifiez vos informations.');
        } else if (response.status === 409) {
          throw new Error('Un site avec ce nom existe déjà.');
        } else if (response.status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer dans quelques instants.');
        } else {
          throw new Error(errorData.message || 'Erreur lors de la génération du site');
        }
      }

      const result = await response.json();

      toast({
        title: 'Succès! 🎉',
        description: 'Votre site web a été généré avec succès',
      });

      // Rediriger vers la page de prévisualisation
      setTimeout(() => {
        navigate('/site-preview', { 
          state: { 
            siteData: {
              website: result.website,
              homePage: result.homePage,
              stats: {
                totalPages: 1, // Page d'accueil générée
                totalProducts: 0, // Pas de produits pour l'instant
                lastUpdated: new Date().toISOString(),
              }
            }
          } 
        });
      }, 500);
      
    } catch (error: any) {
      // Détection erreur réseau
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (retryCount < 2) {
          toast({
            title: 'Reconnexion...',
            description: `Tentative ${retryCount + 1}/2`,
          });
          // Retry après 2 secondes
          setTimeout(() => handleSubmit(retryCount + 1), 2000);
          return;
        } else {
          toast({
            title: 'Erreur de connexion',
            description: 'Impossible de joindre le serveur. Vérifiez votre connexion internet.',
            variant: 'destructive',
          });
        }
      } else if (error.message.includes('Session expirée')) {
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast({
          title: 'Erreur',
          description: error.message || 'Une erreur inattendue s\'est produite',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Lire les query params et le state de navigation pour préremplir le wizard
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || window.location.search);
      const type = params.get('type');

      const stateAny: any = (location && (location as any).state) || {};
      const survey = stateAny?.surveyData;

      let updated: Partial<WizardData> | null = null;

      if (type) {
        updated = { ...(updated || {}), businessType: type };
      }

      if (survey) {
        // Préremplissage basique depuis le questionnaire
        updated = {
          ...(updated || {}),
          businessType: survey.businessType || (updated && (updated as any).businessType) || (type ?? ''),
          companyDescription: survey.additionalNotes || survey.trainingDetails || '',
        };

        // Si survey indique ecommerce ou objectifs liés à vendre, activer le panier
        if (survey.businessType === 'ecommerce' || survey.mainGoal?.includes('boutique') || survey.mainGoal?.includes('lancer')) {
          updated.features = { ...(data.features || {}), enableCart: true } as WizardData['features'];
        }

  // mark as prefilled (no state kept)
      }

      if (updated) {
        setData((prev) => ({ ...prev, ...updated } as WizardData));
      }

      // Si le state demande une génération immédiate (ex: venant du questionnaire avec volonté de création)
      const shouldAutoGenerate = !!(stateAny?.generateImmediate || survey?.wantsToCreateNewSite);
      if (shouldAutoGenerate) {
        // attendre un court instant pour laisser React appliquer le setData
        setTimeout(() => {
          handleSubmit();
        }, 600);
      }
    } catch (err) {
      // Ignorer les erreurs de parsing
      console.debug('No prefill data for WebsiteWizard', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Étape 1: Choix du type de business
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Quel type de business avez-vous ?</h2>
        <p className="text-muted-foreground">
          Sélectionnez le type qui correspond le mieux à votre activité
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {BUSINESS_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.businessType === type.id;
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => setData({ ...data, businessType: type.id })}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${type.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Étape 2: Informations de l'entreprise
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Informations de votre entreprise</h2>
        <p className="text-muted-foreground">
          Ces informations apparaîtront sur votre site web
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Nom de l'entreprise *</Label>
          <Input
            id="companyName"
            value={data.companyName}
            onChange={(e) => setData({ ...data, companyName: e.target.value })}
            placeholder="Ex: La Maison du Parfum"
            className="text-lg"
          />
        </div>

        <div>
          <Label htmlFor="companySlogan">Slogan (optionnel)</Label>
          <Input
            id="companySlogan"
            value={data.companySlogan}
            onChange={(e) => setData({ ...data, companySlogan: e.target.value })}
            placeholder="Ex: L'excellence des fragrances depuis 1990"
          />
        </div>

        <div>
          <Label htmlFor="companyDescription">Description de l'entreprise *</Label>
          <Textarea
            id="companyDescription"
            value={data.companyDescription}
            onChange={(e) => setData({ ...data, companyDescription: e.target.value })}
            placeholder="Décrivez votre entreprise, vos produits, votre histoire..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cette description sera utilisée pour la page d'accueil et le référencement
          </p>
        </div>
      </div>
    </div>
  );

  // Étape 3: Coordonnées
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Vos coordonnées</h2>
        <p className="text-muted-foreground">
          Ces informations permettront à vos clients de vous contacter
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="contact@exemple.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            placeholder="123 rue de la République"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => setData({ ...data, city: e.target.value })}
              placeholder="Paris"
            />
          </div>

          <div>
            <Label htmlFor="postalCode">Code Postal</Label>
            <Input
              id="postalCode"
              value={data.postalCode}
              onChange={(e) => setData({ ...data, postalCode: e.target.value })}
              placeholder="75001"
            />
          </div>

          <div>
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => setData({ ...data, country: e.target.value })}
              placeholder="France"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Étape 4: Préférences de design
  const renderStep4 = () => {
    const palettes = data.businessType ? COLOR_PALETTES[data.businessType as keyof typeof COLOR_PALETTES] || [] : [];
    
    return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personnalisez votre design</h2>
        <p className="text-muted-foreground">
          Choisissez les couleurs qui représentent votre marque
        </p>
      </div>

      <div className="space-y-4">
        {/* Palettes Prédéfinies */}
        {palettes.length > 0 && (
          <div>
            <Label className="mb-3 block">Palettes recommandées pour votre secteur</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {palettes.map((palette) => (
                <Card
                  key={palette.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    data.primaryColor === palette.primary && data.secondaryColor === palette.secondary
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setData({ 
                    ...data, 
                    primaryColor: palette.primary, 
                    secondaryColor: palette.secondary 
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${palette.preview}`}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{palette.name}</span>
                      {data.primaryColor === palette.primary && data.secondaryColor === palette.secondary && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Ou choisissez vos propres couleurs ci-dessous
            </p>
          </div>
        )}

        {/* Sélecteurs de Couleurs Manuels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="primaryColor">Couleur Principale</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="primaryColor"
                type="color"
                value={data.primaryColor}
                onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                className="w-20 h-12 cursor-pointer"
              />
              <Input
                value={data.primaryColor}
                onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilisée pour les boutons et éléments importants
            </p>
          </div>

          <div>
            <Label htmlFor="secondaryColor">Couleur Secondaire</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="secondaryColor"
                type="color"
                value={data.secondaryColor}
                onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                className="w-20 h-12 cursor-pointer"
              />
              <Input
                value={data.secondaryColor}
                onChange={(e) => setData({ ...data, secondaryColor: e.target.value })}
                placeholder="#8b5cf6"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Utilisée pour les accents et détails
            </p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-lg border">
          <h3 className="font-semibold mb-4">Aperçu des couleurs</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div
                className="h-24 rounded-lg mb-2"
                style={{ backgroundColor: data.primaryColor }}
              ></div>
              <p className="text-sm text-center">Principale</p>
            </div>
            <div className="flex-1">
              <div
                className="h-24 rounded-lg mb-2"
                style={{ backgroundColor: data.secondaryColor }}
              ></div>
              <p className="text-sm text-center">Secondaire</p>
            </div>
            <div className="flex-1">
              <div className="h-24 rounded-lg mb-2 bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${data.primaryColor}, ${data.secondaryColor})`
                }}
              ></div>
              <p className="text-sm text-center">Dégradé</p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="logoUrl">Logo de votre entreprise (optionnel)</Label>
          <FileUpload
            endpoint="upload/image"
            accept="image/*"
            maxSize={5}
            label="Uploader votre logo"
            currentUrl={data.logoUrl}
            onUploadSuccess={(url) => setData({ ...data, logoUrl: url })}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Formats acceptés: PNG, JPG, SVG (max 5MB)
          </p>
        </div>
      </div>
    </div>
    );
  };

  // Étape 5: Fonctionnalités
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Fonctionnalités de votre site</h2>
        <p className="text-muted-foreground">
          Sélectionnez les fonctionnalités dont vous avez besoin
        </p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'enableCart', label: 'Panier & E-Commerce', description: 'Vente de produits en ligne' },
          { key: 'enableBooking', label: 'Réservation en ligne', description: 'Système de prise de rendez-vous' },
          { key: 'enableContact', label: 'Formulaire de contact', description: 'Permettre aux visiteurs de vous contacter' },
          { key: 'enableBlog', label: 'Blog / Actualités', description: 'Publier des articles et actualités' },
          { key: 'enableGallery', label: 'Galerie photo', description: 'Afficher vos photos et réalisations' },
          { key: 'enableTestimonials', label: 'Témoignages clients', description: 'Afficher les avis de vos clients' },
        ].map((feature) => (
          <Card
            key={feature.key}
            className={`cursor-pointer transition-all ${
              data.features[feature.key as keyof typeof data.features]
                ? 'bg-primary/5 border-primary'
                : ''
            }`}
            onClick={() =>
              setData({
                ...data,
                features: {
                  ...data.features,
                  [feature.key]: !data.features[feature.key as keyof typeof data.features],
                },
              })
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${
                    data.features[feature.key as keyof typeof data.features]
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      data.features[feature.key as keyof typeof data.features]
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    } mt-0.5`}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ads integrations & aggregated view */}
      <div className="p-6 bg-card rounded-lg border">
        <AdsIntegrations />
        <div className="my-4" />
        <AggregatedAdsView />
      </div>

      <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
        <h3 className="font-semibold mb-2">✨ Prêt à générer votre site ?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Nous allons créer un site web professionnel personnalisé avec tous les éléments que
          vous avez configurés. Vous pourrez ensuite le modifier avec notre éditeur visuel.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary" />
          <span>Design responsive (mobile & desktop)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary" />
          <span>Optimisé pour le référencement (SEO)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-primary" />
          <span>Performances optimales</span>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step < currentStep
                      ? 'bg-primary text-white'
                      : step === currentStep
                      ? 'bg-primary text-white ring-4 ring-primary/30'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < totalSteps && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8">{renderCurrentStep()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => handleSubmit()} disabled={loading} size="lg" className="min-w-[200px]">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer mon site web
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteWizard;
