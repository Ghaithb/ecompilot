import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { 
  Globe, 
  Share2, 
  GraduationCap, 
  Target, 
  Package,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const PLATFORMS_ECOMMERCE = ['Shopify', 'WooCommerce', 'PrestaShop', 'Magento', 'BigCommerce', 'Autre'];
const PLATFORMS_SOCIAL = ['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'Twitter', 'Pinterest'];
const PLATFORMS_MARKETING = ['Google Ads', 'Facebook Ads', 'Email Marketing', 'SEO', 'Influenceurs', 'Autre'];
const PRODUCT_CATEGORIES = ['Vêtements', 'Électronique', 'Cosmétiques', 'Maison', 'Alimentation', 'Sport', 'Autre'];
const TRAINING_TYPES = ['Formation en ligne', 'Diplôme universitaire', 'Bootcamp', 'Autodidacte', 'Certification', 'Autre'];
const SITE_ARCHITECTURES = [
  { value: 'simple', label: 'Site vitrine simple' },
  { value: 'catalog', label: 'Catalogue / Boutique' },
  { value: 'marketplace', label: 'Marketplace multi‑vendeurs' },
  { value: 'blog', label: 'Blog / Magazine' },
  { value: 'custom', label: 'Architecture personnalisée' },
];

const ADVANCED_FEATURES = [
  'Multi-vendor',
  'Abonnements',
  'Gestion de stock avancée',
  'Multilingue',
  'Passerelles de paiement',
  'Intégration CRM',
  'SEO avancé',
];

export default function OnboardingSurveyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0); // Commence à 0 pour le type d'activité
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 9; // étapes 0..8 (totalSteps = 9)

  const [formData, setFormData] = useState({
    businessType: '',
    businessTypeOther: '',
    discoverySource: '',
    discoverySourceOther: '',
    ecommerceExperience: '',
    hasTraining: false,
    trainingTypes: [] as string[],
    trainingDetails: '',
    hasPreviousExperience: false,
    usedEcommercePlatforms: [] as string[],
    usedSocialMediaPlatforms: [] as string[],
    usedMarketingTools: [] as string[],
    mainGoal: '',
    mainGoalOther: '',
    marketingBudget: '',
    expectedProductCount: '',
    productCategories: [] as string[],
    productCategoriesOther: '',
    // Comportement clients
    targetAges: [] as string[],
    targetGenders: [] as string[],
    buyingFrequency: '',
    avgOrderValue: '',
    peakMonths: [] as string[],
    topAcquisitionChannels: [] as string[],
    preferredPaymentMethods: [] as string[],
    returnsRate: '',
    devicePreference: '',
  // Détails du site/brand fournis par l'utilisateur (final step)
  siteName: '',
  brandName: '',
  contactEmail: '',
  contactPhone: '',
  slogan: '',
  logoUrl: '',
    hasExistingWebsite: false,
    existingWebsiteUrl: '',
    existingWebsitePlatform: '',
    wantsToConnectExistingSite: false,
    wantsToCreateNewSite: false,
    teamSize: '',
    additionalNotes: '',
    // New fields
    ecommerceDifficulties: '',
    otherDomainDifficulties: '',
    siteArchitecturePreference: 'catalog',
    advancedFeatures: [] as string[],
    buyDomain: false,
    desiredDomainName: '',
    domainProvider: '',
  });

  const progress = (currentStep / (totalSteps - 1)) * 100;

  const handleNext = () => {
    // Validation par étape
    if (currentStep === 0 && !formData.businessType) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un type d\'activité', variant: 'destructive' });
      return;
    }
    if (currentStep === 1 && !formData.discoverySource) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une réponse', variant: 'destructive' });
      return;
    }
    if (currentStep === 3 && !formData.ecommerceExperience) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner votre expérience', variant: 'destructive' });
      return;
    }
    if (currentStep === 5 && !formData.mainGoal) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner votre objectif', variant: 'destructive' });
      return;
    }

    // If last step (index totalSteps-1) then submit
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // validation: if user wants to create new site or buy domain, require site name
      if ((formData.wantsToCreateNewSite || formData.buyDomain) && !formData.siteName) {
        toast({ title: 'Erreur', description: 'Veuillez préciser le nom du site souhaité', variant: 'destructive' });
        return;
      }
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/onboarding/survey/complete', formData);
      
      toast({
        title: '✅ Questionnaire complété !',
        description: 'Passons maintenant à la création de votre site web !',
      });

      // Redirection selon le choix de l'utilisateur
      setTimeout(() => {
        const businessType = formData.businessType || 'ecommerce';
        
        // Si l'utilisateur veut connecter son site existant
        if (formData.wantsToConnectExistingSite && formData.hasExistingWebsite) {
          navigate('/integrations', { 
            state: { 
              mode: 'connect-existing',
              platform: formData.existingWebsitePlatform,
              websiteUrl: formData.existingWebsiteUrl,
              recommendations: response.data.recommendations,
              surveyData: formData 
            } 
          });
        } 
        // Sinon, création d'un nouveau site
        else {
          navigate('/website', {
            state: {
              recommendations: response.data.recommendations,
              surveyData: formData,
            },
          });
        }
      }, 1500);
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  const updateArrayField = (field: keyof typeof formData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(v => v !== value)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Personnalisons votre expérience
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Quelques questions pour mieux vous accompagner (Étape {currentStep}/{totalSteps})
            </CardDescription>
            <Progress value={progress} className="mt-4 h-2" />
          </CardHeader>

          <CardContent className="pt-6">
            {/* ÉTAPE 0: Type d'activité */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Quel type d'activité avez-vous ?</h3>
                </div>

                <RadioGroup value={formData.businessType} onValueChange={(value: string) => setFormData({ ...formData, businessType: value })}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'ecommerce', label: '🛍️ E-commerce / Boutique en ligne', desc: 'Vente de produits en ligne' },
                      { value: 'restaurant', label: '🍴 Restaurant', desc: 'Restaurant, bistro, pizzeria' },
                      { value: 'cafe', label: '☕ Café / Salon de thé', desc: 'Café, salon de thé, bar' },
                      { value: 'service', label: '💼 Services professionnels', desc: 'Conseil, formation, freelance' },
                      { value: 'marketplace', label: '🏪 Marketplace', desc: 'Plateforme multi-vendeurs' },
                      { value: 'blog', label: '✍️ Blog / Média', desc: 'Blog, magazine, actualités' },
                      { value: 'portfolio', label: '🎨 Portfolio', desc: 'Portfolio créatif, artiste' },
                      { value: 'autre', label: '🎯 Autre activité', desc: 'Autre type d\'activité' },
                    ].map((option) => (
                      <div key={option.value} className="flex flex-col border rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all">
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={option.value} className="cursor-pointer font-medium text-base">{option.label}</Label>
                            <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {formData.businessType === 'autre' && (
                  <Input
                    placeholder="Précisez votre type d'activité..."
                    value={formData.businessTypeOther}
                    onChange={(e) => setFormData({ ...formData, businessTypeOther: e.target.value })}
                    className="mt-4"
                  />
                )}

                {formData.businessType && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      ✅ Parfait ! Nous allons adapter les questions à votre type d'activité.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ÉTAPE 1: Découverte */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Comment avez-vous découvert EcomPilot ?</h3>
                </div>

                <RadioGroup value={formData.discoverySource} onValueChange={(value: string) => setFormData({ ...formData, discoverySource: value })}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'internet', label: 'Recherche internet' },
                      { value: 'social_media', label: 'Réseaux sociaux' },
                      { value: 'bouche_a_oreille', label: 'Bouche à oreille' },
                      { value: 'publicite', label: 'Publicité' },
                      { value: 'moteur_recherche', label: 'Moteur de recherche' },
                      { value: 'autre', label: 'Autre' },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {formData.discoverySource === 'autre' && (
                  <Input
                    placeholder="Précisez..."
                    value={formData.discoverySourceOther}
                    onChange={(e) => setFormData({ ...formData, discoverySourceOther: e.target.value })}
                  />
                )}
              </motion.div>
            )}

            {/* ÉTAPE 2: Expérience & Formation */}
            {currentStep === 2 && formData.businessType === 'ecommerce' && (
              <motion.div
                key="step2-notif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6"
              >
                <p className="text-sm text-purple-800">
                  🛍️ Questions adaptées pour une boutique e-commerce
                </p>
              </motion.div>
            )}
            {currentStep === 2 && formData.businessType === 'restaurant' && (
              <motion.div
                key="step2-notif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
              >
                <p className="text-sm text-orange-800">
                  🍴 Questions adaptées pour un restaurant
                </p>
              </motion.div>
            )}
            {currentStep === 2 && formData.businessType === 'cafe' && (
              <motion.div
                key="step2-notif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
              >
                <p className="text-sm text-amber-800">
                  ☕ Questions adaptées pour un café
                </p>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Votre expérience en e-commerce</h3>
                </div>

                <div className="space-y-4">
                  <Label>
                    {formData.businessType === 'restaurant' && 'Depuis combien d\'années êtes-vous dans la restauration ?'}
                    {formData.businessType === 'cafe' && 'Depuis combien d\'années êtes-vous dans ce secteur ?'}
                    {(formData.businessType === 'ecommerce' || !formData.businessType) && 'Depuis combien d\'années êtes-vous dans l\'e-commerce ?'}
                    {formData.businessType === 'service' && 'Depuis combien d\'années proposez-vous vos services ?'}
                    {formData.businessType === 'blog' && 'Depuis combien d\'années créez-vous du contenu ?'}
                    {formData.businessType === 'portfolio' && 'Depuis combien d\'années exercez-vous votre activité ?'}
                    {formData.businessType === 'marketplace' && 'Depuis combien d\'années gérez-vous des plateformes ?'}
                  </Label>
                  <RadioGroup value={formData.ecommerceExperience} onValueChange={(value: string) => {
                    // If user selects 'débutant', clear previous experience/tool selections
                    if (value === 'debutant') {
                      setFormData(prev => ({
                        ...prev,
                        ecommerceExperience: value,
                        hasPreviousExperience: false,
                        usedEcommercePlatforms: [],
                        usedSocialMediaPlatforms: [],
                        usedMarketingTools: []
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, ecommerceExperience: value }));
                    }
                  }}>
                    <div className="space-y-2">
                      {[
                        { value: 'debutant', label: '🌱 Débutant (je commence)' },
                        { value: '0-1_an', label: '0-1 an d\'expérience' },
                        { value: '1-3_ans', label: '1-3 ans d\'expérience' },
                        { value: '3-5_ans', label: '3-5 ans d\'expérience' },
                        { value: '5_plus_ans', label: '5+ ans d\'expérience' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasTraining"
                      checked={formData.hasTraining}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, hasTraining: checked })}
                    />
                    <Label htmlFor="hasTraining" className="font-medium">
                      {formData.businessType === 'restaurant' && 'J\'ai suivi des formations en hôtellerie/restauration'}
                      {formData.businessType === 'cafe' && 'J\'ai suivi des formations en hôtellerie/barista'}
                      {(formData.businessType === 'ecommerce' || !formData.businessType) && 'J\'ai suivi des formations en e-commerce/marketing'}
                      {formData.businessType === 'service' && 'J\'ai suivi des formations dans mon domaine'}
                      {formData.businessType === 'blog' && 'J\'ai suivi des formations en rédaction/journalisme'}
                      {formData.businessType === 'portfolio' && 'J\'ai suivi des formations créatives'}
                      {formData.businessType === 'marketplace' && 'J\'ai suivi des formations en gestion de plateforme'}
                    </Label>
                  </div>

                  {formData.hasTraining && (
                    <div className="ml-6 space-y-3">
                      <Label>Type de formations :</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {TRAINING_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`training-${type}`}
                              checked={formData.trainingTypes.includes(type)}
                              onCheckedChange={(checked: boolean) => updateArrayField('trainingTypes', type, checked)}
                            />
                            <Label htmlFor={`training-${type}`} className="text-sm">{type}</Label>
                          </div>
                        ))}
                      </div>
                      <Textarea
                        placeholder="Détails sur vos formations (optionnel)..."
                        value={formData.trainingDetails}
                        onChange={(e) => setFormData({ ...formData, trainingDetails: e.target.value })}
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 3: Expérience & Outils */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Outils et plateformes utilisés</h3>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="hasPreviousExperience"
                    checked={formData.hasPreviousExperience}
                    onCheckedChange={(checked: boolean) => {
                      setFormData(prev => ({
                        ...prev,
                        hasPreviousExperience: checked,
                        // clear tool selections when unchecking
                        usedEcommercePlatforms: checked ? prev.usedEcommercePlatforms : [],
                        usedSocialMediaPlatforms: checked ? prev.usedSocialMediaPlatforms : [],
                        usedMarketingTools: checked ? prev.usedMarketingTools : []
                      }));
                    }}
                  />
                  <Label htmlFor="hasPreviousExperience" className="font-medium">
                    J'ai déjà de l'expérience en e-commerce
                  </Label>
                </div>

                {formData.hasPreviousExperience && (
                  <div className="space-y-6 pt-4 ml-6">
                    {/* If user selected 'débutant', explain tools are disabled */}
                    {formData.ecommerceExperience === 'debutant' ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                        Vous avez indiqué être débutant — les choix d'outils/platformes sont désactivés.
                      </div>
                    ) : null}

                    <div>
                      <Label className="mb-3 block">Plateformes e-commerce utilisées :</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS_ECOMMERCE.map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ecom-${platform}`}
                              checked={formData.usedEcommercePlatforms.includes(platform)}
                              onCheckedChange={(checked: boolean) => updateArrayField('usedEcommercePlatforms', platform, checked)}
                              disabled={formData.ecommerceExperience === 'debutant'}
                            />
                            <Label htmlFor={`ecom-${platform}`} className="text-sm">{platform}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Réseaux sociaux utilisés :</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS_SOCIAL.map((platform) => (
                          <div key={platform} className="flex items-center space-x-2">
                            <Checkbox
                              id={`social-${platform}`}
                              checked={formData.usedSocialMediaPlatforms.includes(platform)}
                              onCheckedChange={(checked: boolean) => updateArrayField('usedSocialMediaPlatforms', platform, checked)}
                              disabled={formData.ecommerceExperience === 'debutant'}
                            />
                            <Label htmlFor={`social-${platform}`} className="text-sm">{platform}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Outils marketing utilisés :</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS_MARKETING.map((tool) => (
                          <div key={tool} className="flex items-center space-x-2">
                            <Checkbox
                              id={`marketing-${tool}`}
                              checked={formData.usedMarketingTools.includes(tool)}
                              onCheckedChange={(checked: boolean) => updateArrayField('usedMarketingTools', tool, checked)}
                              disabled={formData.ecommerceExperience === 'debutant'}
                            />
                            <Label htmlFor={`marketing-${tool}`} className="text-sm">{tool}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ÉTAPE 4: Comportement des clients */}
            {currentStep === 4 && (
              <motion.div
                key="step3-behavior"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Comportement de vos clients</h3>
                </div>

                <div className="space-y-4">
                  <Label>Tranche d'âge principale de vos clients (plusieurs possibles)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['<18','18-24','25-34','35-44','45-54','55+'].map(age => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${age}`}
                          checked={formData.targetAges.includes(age)}
                          onCheckedChange={(checked: boolean) => updateArrayField('targetAges', age, checked)}
                        />
                        <Label htmlFor={`age-${age}`} className="text-sm">{age}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Genre principal</Label>
                  <div className="flex gap-3 mt-2">
                    {['All','Male','Female','Other'].map(g => (
                      <div key={g} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${g}`}
                          checked={formData.targetGenders.includes(g)}
                          onCheckedChange={(checked: boolean) => updateArrayField('targetGenders', g, checked)}
                        />
                        <Label htmlFor={`gender-${g}`} className="text-sm">{g}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Fréquence d'achat approximative</Label>
                  <RadioGroup value={formData.buyingFrequency} onValueChange={(value: string) => setFormData({ ...formData, buyingFrequency: value })}>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: 'weekly', label: 'Hebdomadaire' },
                        { value: 'monthly', label: 'Mensuelle' },
                        { value: 'quarterly', label: 'Trimestrielle' },
                        { value: 'annually', label: 'Annuelle' },
                      ].map(opt => (
                        <div key={opt.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={opt.value} id={opt.value} />
                          <Label htmlFor={opt.value} className="cursor-pointer text-sm">{opt.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Panier moyen (AOV)</Label>
                    <Input
                      placeholder="Ex: 49.99"
                      value={formData.avgOrderValue}
                      onChange={(e) => setFormData({ ...formData, avgOrderValue: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Montant moyen dépensé par commande (en €)</p>
                  </div>

                  <div>
                    <Label>Taux de retours estimé (%)</Label>
                    <Input
                      placeholder="Ex: 5"
                      value={formData.returnsRate}
                      onChange={(e) => setFormData({ ...formData, returnsRate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Mois de pointe (saisonnalité)</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                      <div key={m} className="flex items-center space-x-2">
                        <Checkbox
                          id={`month-${m}`}
                          checked={formData.peakMonths.includes(m)}
                          onCheckedChange={(checked: boolean) => updateArrayField('peakMonths', m, checked)}
                        />
                        <Label htmlFor={`month-${m}`} className="text-sm">{m}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Canaux d'acquisition principaux</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {['Organic Search','Paid Ads','Social Media','Email','Referrals','Marketplaces','In-store'].map(ch => (
                      <div key={ch} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chan-${ch}`}
                          checked={formData.topAcquisitionChannels.includes(ch)}
                          onCheckedChange={(checked: boolean) => updateArrayField('topAcquisitionChannels', ch, checked)}
                        />
                        <Label htmlFor={`chan-${ch}`} className="text-sm">{ch}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Méthodes de paiement préférées</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {['Card','PayPal','Bank Transfer','Cash','Mobile Pay'].map(pm => (
                      <div key={pm} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pay-${pm}`}
                          checked={formData.preferredPaymentMethods.includes(pm)}
                          onCheckedChange={(checked: boolean) => updateArrayField('preferredPaymentMethods', pm, checked)}
                        />
                        <Label htmlFor={`pay-${pm}`} className="text-sm">{pm}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Préférence d'appareil</Label>
                  <RadioGroup value={formData.devicePreference} onValueChange={(value: string) => setFormData({ ...formData, devicePreference: value })}>
                    <div className="flex gap-3 mt-2">
                      {[
                        { value: 'mobile', label: 'Mobile' },
                        { value: 'desktop', label: 'Desktop' },
                        { value: 'both', label: 'Les deux' },
                      ].map(o => (
                        <div key={o.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={o.value} id={`device-${o.value}`} />
                          <Label htmlFor={`device-${o.value}`} className="cursor-pointer text-sm">{o.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 5: Objectifs & Budget */}
            {currentStep === 5 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Vos objectifs</h3>
                </div>

                <div className="space-y-4">
                  <Label>Quel est votre objectif principal ?</Label>
                  <RadioGroup value={formData.mainGoal} onValueChange={(value: string) => setFormData({ ...formData, mainGoal: value })}>
                    <div className="space-y-2">
                      {[
                        { value: 'lancer_boutique', label: '🚀 Lancer ma boutique en ligne' },
                        { value: 'augmenter_ventes', label: '📈 Augmenter mes ventes' },
                        { value: 'automatiser_processus', label: '⚙️ Automatiser mes processus' },
                        { value: 'ameliorer_marketing', label: '📣 Améliorer mon marketing' },
                        { value: 'gerer_inventaire', label: '📦 Gérer mon inventaire' },
                        { value: 'autre', label: 'Autre objectif' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {formData.mainGoal === 'autre' && (
                    <Input
                      placeholder="Précisez votre objectif..."
                      value={formData.mainGoalOther}
                      onChange={(e) => setFormData({ ...formData, mainGoalOther: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <Label>Budget marketing mensuel prévu :</Label>
                  <RadioGroup value={formData.marketingBudget} onValueChange={(value: string) => setFormData({ ...formData, marketingBudget: value })}>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'moins_100', label: 'Moins de 100€' },
                        { value: '100-500', label: '100€ - 500€' },
                        { value: '500-1000', label: '500€ - 1000€' },
                        { value: '1000-5000', label: '1000€ - 5000€' },
                        { value: '5000_plus', label: '5000€+' },
                        { value: 'pas_encore_defini', label: 'Pas encore défini' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 6: Produits & Équipe */}
            {currentStep === 6 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Vos produits et équipe</h3>
                </div>

                <div className="space-y-4">
                  <Label>Combien de produits prévoyez-vous de vendre ?</Label>
                  <RadioGroup value={formData.expectedProductCount} onValueChange={(value: string) => setFormData({ ...formData, expectedProductCount: value })}>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: '1-10', label: '1-10 produits' },
                        { value: '10-50', label: '10-50 produits' },
                        { value: '50-100', label: '50-100 produits' },
                        { value: '100-500', label: '100-500 produits' },
                        { value: '500_plus', label: '500+ produits' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Catégories de produits :</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={formData.productCategories.includes(category)}
                          onCheckedChange={(checked: boolean) => updateArrayField('productCategories', category, checked)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                  {formData.productCategories.includes('Autre') && (
                    <Input
                      placeholder="Précisez..."
                      value={formData.productCategoriesOther}
                      onChange={(e) => setFormData({ ...formData, productCategoriesOther: e.target.value })}
                    />
                  )}
                  {formData.productCategories.includes('Autre') && (
                    <Input
                      placeholder="Précisez..."
                      value={formData.productCategoriesOther}
                      onChange={(e) => setFormData({ ...formData, productCategoriesOther: e.target.value })}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Taille de votre équipe :</Label>
                  <RadioGroup value={formData.teamSize} onValueChange={(value: string) => setFormData({ ...formData, teamSize: value })}>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'solo', label: '👤 Solo' },
                        { value: '2-5', label: '2-5 personnes' },
                        { value: '6-10', label: '6-10 personnes' },
                        { value: '11-50', label: '11-50 personnes' },
                        { value: '50_plus', label: '50+ personnes' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer text-sm">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasExistingWebsite"
                      checked={formData.hasExistingWebsite}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, hasExistingWebsite: checked })}
                    />
                    <Label htmlFor="hasExistingWebsite" className="font-medium">J'ai déjà un site web déployé</Label>
                  </div>
                  
                  {formData.hasExistingWebsite && (
                    <div className="ml-6 space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">URL de votre site actuel :</Label>
                        <Input
                          type="url"
                          placeholder="https://monsite.com"
                          value={formData.existingWebsiteUrl}
                          onChange={(e) => setFormData({ ...formData, existingWebsiteUrl: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Sur quelle plateforme est votre site ?</Label>
                        <RadioGroup 
                          value={formData.existingWebsitePlatform} 
                          onValueChange={(value: string) => setFormData({ ...formData, existingWebsitePlatform: value })}
                        >
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'shopify', label: '🛍️ Shopify' },
                              { value: 'woocommerce', label: '🔌 WooCommerce' },
                              { value: 'prestashop', label: '🛒 PrestaShop' },
                              { value: 'magento', label: '🏪 Magento' },
                              { value: 'odoo', label: '🔷 Odoo' },
                              { value: 'bigcommerce', label: '🏬 BigCommerce' },
                              { value: 'wix', label: '🎨 Wix' },
                              { value: 'squarespace', label: '◼️ Squarespace' },
                              { value: 'wordpress', label: '📝 WordPress' },
                              { value: 'drupal', label: '🔵 Drupal' },
                              { value: 'joomla', label: '🟠 Joomla' },
                              { value: 'custom', label: '⚙️ Site custom' },
                              { value: 'autre', label: '📦 Autre' },
                            ].map((option) => (
                              <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-white">
                                <RadioGroupItem value={option.value} id={option.value} />
                                <Label htmlFor={option.value} className="cursor-pointer text-sm">{option.label}</Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="border-t border-blue-300 pt-4 space-y-3">
                        <p className="text-sm font-medium text-blue-900">Que souhaitez-vous faire ?</p>
                        
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="wantsToConnectExistingSite"
                            checked={formData.wantsToConnectExistingSite}
                            onCheckedChange={(checked: boolean) => {
                              setFormData({ 
                                ...formData, 
                                wantsToConnectExistingSite: checked,
                                wantsToCreateNewSite: checked ? false : formData.wantsToCreateNewSite
                              });
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor="wantsToConnectExistingSite" className="cursor-pointer font-medium text-sm">
                              🔗 Connecter mon site existant à votre dashboard admin
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                              Gérez vos produits/services depuis notre interface professionnelle
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="wantsToCreateNewSite"
                            checked={formData.wantsToCreateNewSite}
                            onCheckedChange={(checked: boolean) => {
                              setFormData({ 
                                ...formData, 
                                wantsToCreateNewSite: checked,
                                wantsToConnectExistingSite: checked ? false : formData.wantsToConnectExistingSite
                              });
                            }}
                          />
                          <div className="flex-1">
                            <Label htmlFor="wantsToCreateNewSite" className="cursor-pointer font-medium text-sm">
                              ✨ Créer un nouveau site avec EcomPilot
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">
                              Nous créons un nouveau site optimisé pour vous
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Textarea
                  placeholder="Remarques ou informations supplémentaires (optionnel)..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={3}
                />
              </motion.div>
            )}

            {/* ÉTAPE 7: Questions de difficultés spécifiques (conditional) */}
            {currentStep === 7 && formData.businessType === 'ecommerce' && (
              <motion.div
                key="step7-difficulties"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold">Difficultés rencontrées en vente en ligne</h3>
                </div>

                <div>
                  <Label>Rencontrez-vous des difficultés particulières ?</Label>
                  <Textarea
                    placeholder="Par ex: acquisition clients, logistique, retours, conversion..."
                    value={formData.ecommerceDifficulties}
                    onChange={(e) => setFormData({ ...formData, ecommerceDifficulties: e.target.value })}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Autres difficultés (si vous avez répondu autre chose)</Label>
                  <Input
                    placeholder="Précisez si nécessaire..."
                    value={formData.otherDomainDifficulties}
                    onChange={(e) => setFormData({ ...formData, otherDomainDifficulties: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {/* ÉTAPE 8 (final): Architecture du site, fonctionnalités avancées, achat de domaine */}
            {currentStep === 8 && (
              <motion.div
                key="step8-site-architecture"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold">Préférences de site et nom de domaine</h2>
                  <p className="text-muted-foreground">Choisissez l'architecture et les fonctionnalités que vous souhaitez pour votre site.</p>
                </div>

                <div>
                  <Label>Architecture souhaitée</Label>
                  <RadioGroup value={formData.siteArchitecturePreference} onValueChange={(value: string) => setFormData({ ...formData, siteArchitecturePreference: value })}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {SITE_ARCHITECTURES.map(opt => (
                        <div key={opt.value} className="flex items-center space-x-2 border rounded-lg p-2 hover:bg-gray-50">
                          <RadioGroupItem value={opt.value} id={`arch-${opt.value}`} />
                          <Label htmlFor={`arch-${opt.value}`} className="cursor-pointer text-sm">{opt.label}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Fonctionnalités avancées souhaitées (plusieurs)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {ADVANCED_FEATURES.map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feat-${feature}`}
                          checked={formData.advancedFeatures.includes(feature)}
                          onCheckedChange={(checked: boolean) => updateArrayField('advancedFeatures', feature, checked)}
                        />
                        <Label htmlFor={`feat-${feature}`} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="buyDomain"
                      checked={formData.buyDomain}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, buyDomain: checked })}
                    />
                    <Label htmlFor="buyDomain" className="font-medium">Souhaitez-vous que nous achetions un domaine pour vous ?</Label>
                  </div>

                  {formData.buyDomain && (
                    <div className="ml-6 mt-3 space-y-3">
                      <div>
                        <Label>Nom de domaine souhaité</Label>
                        <Input
                          placeholder="ex: monsite.fr"
                          value={formData.desiredDomainName}
                          onChange={(e) => setFormData({ ...formData, desiredDomainName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>Fournisseur préféré (optionnel)</Label>
                        <Input
                          placeholder="ex: OVH, GoDaddy, Gandi..."
                          value={formData.domainProvider}
                          onChange={(e) => setFormData({ ...formData, domainProvider: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium">Détails de votre site / marque</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Nom du site</Label>
                      <Input
                        value={formData.siteName}
                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                        placeholder="Ex: monsite.com / Nom de la boutique"
                      />
                    </div>

                    <div>
                      <Label>Nom de la marque / service</Label>
                      <Input
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder="Ex: La Maison du Parfum"
                      />
                    </div>

                    <div>
                      <Label>Email de contact</Label>
                      <Input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="contact@exemple.com"
                      />
                    </div>

                    <div>
                      <Label>Téléphone de contact</Label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Slogan (optionnel)</Label>
                      <Input
                        value={formData.slogan}
                        onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                        placeholder="Ex: L'excellence des fragrances"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Logo (optionnel)</Label>
                          <FileUpload
                            endpoint="upload/image"
                        accept="image/*"
                        maxSize={5}
                        label="Uploader votre logo"
                        currentUrl={formData.logoUrl}
                        onUploadSuccess={(url) => setFormData({ ...formData, logoUrl: url })}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-8 border-t mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {currentStep === totalSteps ? (
                  <>
                    {isSubmitting ? 'Envoi...' : 'Terminer'}
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
