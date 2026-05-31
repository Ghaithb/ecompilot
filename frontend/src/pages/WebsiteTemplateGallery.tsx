import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiUrl, getAuthHeaders, resolveUploadUrl } from '@/lib/apiConfig';
import {
  Sparkles, 
  ArrowRight, 
  Check,
  ShoppingBag,
  Coffee,
  Scissors,
  Home,
  Utensils,
  Camera,
  Building,
  Briefcase
} from 'lucide-react';

const WebsiteTemplateGallery: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    city: '',
  });

  const templates = [
    {
      id: 'parfum',
      name: 'Boutique Parfum',
      description: 'Élégant et luxueux',
      icon: ShoppingBag,
      color: 'from-purple-500 to-pink-500',
      preview: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
      features: ['E-commerce', 'Galerie', 'Blog'],
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      description: 'Appétissant et moderne',
      icon: Utensils,
      color: 'from-orange-500 to-red-500',
      preview: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      features: ['Réservations', 'Menu', 'Galerie'],
    },
    {
      id: 'cafe',
      name: 'Café',
      description: 'Chaleureux et convivial',
      icon: Coffee,
      color: 'from-amber-500 to-orange-500',
      preview: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
      features: ['Menu', 'Réservations', 'Contact'],
    },
    {
      id: 'coiffure',
      name: 'Salon de beauté',
      description: 'Chic et professionnel',
      icon: Scissors,
      color: 'from-pink-500 to-rose-500',
      preview: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      features: ['Réservations', 'Services', 'Galerie'],
    },
    {
      id: 'immobilier',
      name: 'Immobilier',
      description: 'Professionnel et moderne',
      icon: Home,
      color: 'from-blue-500 to-cyan-500',
      preview: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
      features: ['Catalogue', 'Contact', 'Recherche'],
    },
    {
      id: 'photographe',
      name: 'Photographe',
      description: 'Portfolio créatif',
      icon: Camera,
      color: 'from-indigo-500 to-purple-500',
      preview: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
      features: ['Portfolio', 'Galerie', 'Réservations'],
    },
    {
      id: 'ecole',
      name: 'École / Formation',
      description: 'Éducatif et structuré',
      icon: Building,
      color: 'from-green-500 to-teal-500',
      preview: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
      features: ['Cours', 'Inscriptions', 'Blog'],
    },
    {
      id: 'agency',
      name: 'Agence / Services',
      description: 'Corporate et professionnel',
      icon: Briefcase,
      color: 'from-slate-500 to-gray-500',
      preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      features: ['Services', 'Portfolio', 'Contact'],
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowQuickForm(true);
  };

  const handleGenerate = async () => {
    if (!formData.companyName || !formData.email) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir au moins le nom et l\'email',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl('/website/generate'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          businessType: selectedTemplate,
          companyName: formData.companyName,
          email: formData.email,
          // Champs optionnels - IA va générer le reste
          phone: formData.phone,
          city: formData.city,
        }),
      });

      if (response.ok) {
        await response.json();
        toast({
          title: '✨ Site créé !',
          description: 'Votre site a été généré avec succès',
        });
        
        // Rediriger vers la page de gestion
        setTimeout(() => {
          navigate('/website');
        }, 1500);
      } else if (response.status === 401) {
        // Token expiré ou invalide
        toast({
          title: 'Session expirée',
          description: 'Veuillez vous reconnecter',
          variant: 'destructive',
        });
        localStorage.removeItem('auth_token');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la génération');
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (showQuickForm) {
    const template = templates.find(t => t.id === selectedTemplate);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowQuickForm(false)}
            className="mb-4"
          >
            ← Retour aux templates
          </Button>

          <Card className="border-2 border-primary shadow-2xl">
            <CardHeader className={`bg-gradient-to-r ${template?.color} text-white`}>
              <CardTitle className="text-3xl flex items-center gap-3">
                {template?.icon && <template.icon className="w-8 h-8" />}
                {template?.name}
              </CardTitle>
              <p className="text-white/90 text-lg">
                Quelques informations pour personnaliser votre site
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label className="text-lg">Nom de votre entreprise *</Label>
                <Input
                  placeholder="Ex: Ma Belle Boutique"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="mt-2 text-lg p-6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="contact@exemple.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    placeholder="06 00 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Ville</Label>
                <Input
                  placeholder="Paris"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Fonctionnalités incluses :
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template?.features.map((feature) => (
                    <span key={feature} className="px-3 py-1 bg-white rounded-full text-sm">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={generating}
                size="lg"
                className="w-full text-lg py-6"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Créer mon site maintenant !
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ⏱️ Votre site sera prêt en 30 secondes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choisissez votre template
          </h1>
          <p className="text-xl text-muted-foreground">
            En 1 clic, créez un site professionnel et moderne
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary overflow-hidden"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={template.preview} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-60 group-hover:opacity-40 transition-opacity`} />
                  <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                  <p className="text-muted-foreground mb-4">{template.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {template.features.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full group-hover:bg-primary" variant="outline">
                    Utiliser ce template
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Besoin d'un design sur mesure ?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/website/wizard')}
          >
            Utiliser le créateur avancé
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTemplateGallery;
