import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Palette, 
  Home, 
  Briefcase, 
  Users, 
  Star, 
  Phone,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

// Import des étapes
import { Step1BasicInfo } from './steps/Step1BasicInfo';
import { Step2Visual } from './steps/Step2Visual';
import { Step3HomePage } from './steps/Step3HomePage';
import { Step4Services } from './steps/Step4Services';
import { Step5About } from './steps/Step5About';
import { Step6Testimonials } from './steps/Step6Testimonials';
import { Step7Contact } from './steps/Step7Contact';

interface WizardData {
  // Étape 1: Infos de base
  basicInfo: {
    businessType: string;
    companyName: string;
    slogan: string;
    city: string;
    email: string;
    phone: string;
    address: string;
  };
  // Étape 2: Visuel
  visual: {
    logo?: File | string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontTitle: string;
    fontBody: string;
  };
  // Étape 3: Page d'accueil
  homePage: {
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    ctaLink: string;
    heroImage?: File | string;
    description: string;
    highlights: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  // Étape 4: Services
  services: Array<{
    name: string;
    description: string;
    price?: number;
    duration?: string;
    image?: File | string;
  }>;
  // Étape 5: À propos
  about: {
    story: string;
    foundingYear?: number;
    teamSize?: number;
    values: string[];
    team: Array<{
      name: string;
      role: string;
      bio: string;
      photo?: File | string;
    }>;
  };
  // Étape 6: Témoignages
  testimonials: {
    reviews: Array<{
      name: string;
      content: string;
      rating: number;
      photo?: File | string;
    }>;
    stats: {
      yearsExperience: number;
      happyClients: number;
      projectsCompleted: number;
    };
  };
  // Étape 7: Contact
  contact: {
    enableContactForm: boolean;
    social: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    footer: {
      columns: Array<{
        title: string;
        links: Array<{ label: string; url: string }>;
      }>;
      newsletterEnabled: boolean;
      copyrightText: string;
    };
  };
}

const steps = [
  { id: 1, name: 'Informations', icon: Building2 },
  { id: 2, name: 'Identité visuelle', icon: Palette },
  { id: 3, name: 'Page d\'accueil', icon: Home },
  { id: 4, name: 'Services', icon: Briefcase },
  { id: 5, name: 'À propos', icon: Users },
  { id: 6, name: 'Témoignages', icon: Star },
  { id: 7, name: 'Contact', icon: Phone },
];

export function WebsiteWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    basicInfo: {
      businessType: '',
      companyName: '',
      slogan: '',
      city: '',
      email: '',
      phone: '',
      address: '',
    },
    visual: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      fontTitle: 'Inter',
      fontBody: 'Inter',
    },
    homePage: {
      heroTitle: '',
      heroSubtitle: '',
      ctaText: 'Découvrir',
      ctaLink: '/products',
      description: '',
      highlights: [],
    },
    services: [],
    about: {
      story: '',
      values: [],
      team: [],
    },
    testimonials: {
      reviews: [],
      stats: {
        yearsExperience: 0,
        happyClients: 0,
        projectsCompleted: 0,
      },
    },
    contact: {
      enableContactForm: true,
      social: {},
      footer: {
        columns: [],
        newsletterEnabled: true,
        copyrightText: `© ${new Date().getFullYear()} Tous droits réservés.`,
      },
    },
  });

  const updateData = (section: keyof WizardData, newData: any) => {
    setData(prev => ({
      ...prev,
      [section]: newData,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Données finales:', data);
    // TODO: Appel API pour créer le site
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer votre site web</h1>
          <p className="text-gray-600">
            Remplissez les informations pour personnaliser votre site
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center flex-1 ${
                    step.id !== steps.length ? 'relative' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center hidden md:block ${
                      isActive ? 'font-semibold text-primary' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                  
                  {/* Ligne de connexion */}
                  {step.id !== steps.length && (
                    <div
                      className={`absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ width: 'calc(100% - 48px)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Étape {currentStep} sur {steps.length}
          </p>
        </div>

        {/* Contenu de l'étape */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = steps[currentStep - 1].icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                  {steps[currentStep - 1].name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Rendu conditionnel des étapes */}
                {currentStep === 1 && (
                  <Step1BasicInfo
                    data={data.basicInfo}
                    onChange={(newData) => updateData('basicInfo', newData)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Visual
                    data={data.visual}
                    onChange={(newData) => updateData('visual', newData)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3HomePage
                    data={data.homePage}
                    onChange={(newData) => updateData('homePage', newData)}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Services
                    data={data.services}
                    onChange={(newData) => updateData('services', newData)}
                  />
                )}
                {currentStep === 5 && (
                  <Step5About
                    data={data.about}
                    onChange={(newData) => updateData('about', newData)}
                  />
                )}
                {currentStep === 6 && (
                  <Step6Testimonials
                    data={data.testimonials}
                    onChange={(newData) => updateData('testimonials', newData)}
                  />
                )}
                {currentStep === 7 && (
                  <Step7Contact
                    data={data.contact}
                    onChange={(newData) => updateData('contact', newData)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>

              {currentStep < steps.length ? (
                <Button onClick={nextStep}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Créer mon site
                </Button>
              )}
            </div>
          </div>

          {/* Preview / Aide */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">💡 Conseils</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStep === 1 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Informations de base</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Choisissez un nom mémorable</li>
                      <li>Le slogan doit être court et impactant</li>
                      <li>Vérifiez que vos coordonnées sont correctes</li>
                    </ul>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Identité visuelle</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Utilisez des couleurs de votre secteur</li>
                      <li>Gardez un bon contraste pour la lisibilité</li>
                      <li>Votre logo doit être clair (PNG avec fond transparent)</li>
                    </ul>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Page d'accueil</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Le titre doit capturer l'attention en 3 secondes</li>
                      <li>Mettez 3-5 points forts maximum</li>
                      <li>Utilisez une image de qualité professionnelle</li>
                    </ul>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Services</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Décrivez les bénéfices, pas les caractéristiques</li>
                      <li>Incluez le prix si possible (transparence)</li>
                      <li>Ajoutez 4-8 services principaux</li>
                    </ul>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">À propos</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Racontez votre histoire authentiquement</li>
                      <li>Présentez les personnes clés</li>
                      <li>Mettez en avant vos valeurs</li>
                    </ul>
                  </div>
                )}
                {currentStep === 6 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Témoignages</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Les avis réels sont plus crédibles</li>
                      <li>Ajoutez des chiffres concrets</li>
                      <li>Variez les types de clients</li>
                    </ul>
                  </div>
                )}
                {currentStep === 7 && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Contact & Footer</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Facilitez le contact (email visible)</li>
                      <li>Ajoutez vos réseaux sociaux actifs</li>
                      <li>Incluez les mentions légales</li>
                    </ul>
                  </div>
                )}

                {/* Sauvegarde automatique */}
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Sauvegarde automatique activée
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
