import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Copy, RefreshCw, Wand2, MessageSquare, FileText, Mail, ShoppingBag } from 'lucide-react';

interface AIContentGeneratorProps {
  onInsertContent: (content: { text: string; html: string }) => void;
  existingContext?: string;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onInsertContent, existingContext }) => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<'hero' | 'product' | 'about' | 'blog' | 'email'>('hero');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'luxury' | 'energetic'>('professional');
  const [language, setLanguage] = useState('fr');
  const [keywords, setKeywords] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const contentTemplates = {
    hero: {
      icon: Wand2,
      title: 'Hero Section',
      description: 'Titre accrocheur et appel à l\'action',
      prompts: [
        'Créer un hero pour une boutique de vêtements éco-responsables',
        'Hero pour une agence de marketing digital',
        'Section hero pour un restaurant gastronomique',
      ],
    },
    product: {
      icon: ShoppingBag,
      title: 'Description Produit',
      description: 'Descriptions engageantes pour vos produits',
      prompts: [
        'Description pour un sac à main en cuir artisanal',
        'Présentation d\'une montre connectée haut de gamme',
        'Description de chaussures de running innovantes',
      ],
    },
    about: {
      icon: FileText,
      title: 'À Propos',
      description: 'Histoire de marque et valeurs',
      prompts: [
        'Histoire d\'une startup tech française',
        'Présentation d\'une marque de cosmétiques bio',
        'À propos d\'un cabinet de conseil',
      ],
    },
    blog: {
      icon: MessageSquare,
      title: 'Article de Blog',
      description: 'Articles optimisés SEO',
      prompts: [
        'Article sur les tendances e-commerce 2024',
        'Guide complet du SEO pour débutants',
        'Top 10 des stratégies marketing',
      ],
    },
    email: {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Emails persuasifs et conversions',
      prompts: [
        'Email de bienvenue pour nouveaux clients',
        'Email de relance panier abandonné',
        'Newsletter mensuelle avec promotions',
      ],
    },
  };

  const generateContent = async () => {
    setGenerating(true);
    
    try {
      // Simuler l'appel à l'API IA (vous pouvez intégrer OpenAI, Claude, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Contenu généré basé sur le type et le ton
      const generated = generateMockContent();
      setGeneratedContent(generated);
      
      // Générer des suggestions alternatives
      const newSuggestions = [
        'Variante plus concise',
        'Version avec storytelling',
        'Approche émotionnelle',
      ];
      setSuggestions(newSuggestions);
      
      toast({
        title: 'Contenu généré !',
        description: 'Votre contenu IA est prêt',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le contenu',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateMockContent = (): string => {
    const templates: Record<string, Record<string, string>> = {
      hero: {
        professional: `# Transformez Votre Vision en Réalité\n\nDécouvrez notre expertise au service de votre réussite. Des solutions innovantes, un accompagnement personnalisé, des résultats mesurables.\n\n**Démarrer maintenant →**`,
        casual: `# Prêt à Changer la Donne ?\n\nOn a exactement ce qu'il vous faut pour passer au niveau supérieur. Simple, efficace, et ça marche vraiment.\n\n**C'est parti ! 🚀**`,
        luxury: `# L'Excellence à Votre Portée\n\nUne expérience unique, un savoir-faire d'exception. Rejoignez l'élite de ceux qui n'acceptent que le meilleur.\n\n**Découvrir la collection →**`,
      },
      product: {
        professional: `## Sac en Cuir Premium - Collection Artisanale\n\nFabriqué à la main par nos artisans experts, ce sac allie élégance intemporelle et durabilité exceptionnelle. Cuir pleine fleur italien, finitions soignées, design polyvalent.\n\n### Caractéristiques:\n- Cuir italien pleine fleur\n- Multiples compartiments intérieurs\n- Dimensions: 35 x 28 x 12 cm\n- Garantie à vie\n\n**Prix: 299€** | Livraison offerte`,
        casual: `## Le Sac Qui Fait Tout !\n\nGénial pour le boulot, parfait pour les weekends. Ce sac en cuir ultra-solide va devenir votre meilleur pote. Fait main, classe, et qui dure des années.\n\n**299€** - Tu vas l'adorer !`,
      },
      about: {
        professional: `## Notre Histoire\n\nFondée en 2020, notre entreprise est née d'une vision claire: révolutionner l'industrie par l'innovation et l'excellence. Aujourd'hui, nous servons plus de 10,000 clients satisfaits à travers le monde.\n\n### Nos Valeurs\n\n**Innovation** - Nous repoussons constamment les limites\n**Qualité** - L'excellence sans compromis\n**Durabilité** - Un engagement pour l'avenir`,
        friendly: `## Hey, Bienvenue Chez Nous ! 👋\n\nOn a démarré cette aventure en 2020 avec une idée simple: faire les choses différemment. Aujourd'hui, on est super fiers d'aider plus de 10,000 personnes chaque jour.\n\nCe qui nous anime ? L'innovation, la qualité, et surtout, vous rendre heureux !`,
      },
    };

    const typeTemplates = templates[contentType];
    if (!typeTemplates) return '';
    
    return typeTemplates[tone] || typeTemplates.professional || '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copié !',
      description: 'Le contenu a été copié dans le presse-papier',
    });
  };

  const insertIntoPage = () => {
    if (!generatedContent) return;
    
    // Convertir le markdown en HTML basique
    const html = generatedContent
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');
    
    onInsertContent({ text: generatedContent, html });
    
    toast({
      title: 'Contenu inséré !',
      description: 'Le contenu a été ajouté à votre page',
    });
  };

  const currentTemplate = contentTemplates[contentType];
  const Icon = currentTemplate.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Générateur de Contenu IA
        </CardTitle>
        <CardDescription>
          Créez du contenu de qualité professionnelle instantanément
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={contentType} onValueChange={(v: any) => setContentType(v)}>
          <TabsList className="grid w-full grid-cols-5">
            {Object.entries(contentTemplates).map(([key, template]) => {
              const TabIcon = template.icon;
              return (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <TabIcon className="w-3 h-3 mr-1" />
                  {template.title.split(' ')[0]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(contentTemplates).map(([key, template]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Suggestions de prompts</Label>
                <div className="flex flex-wrap gap-2">
                  {template.prompts.map((p, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(p)}
                      className="text-xs"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Décrivez votre besoin</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Exemple: ${currentTemplate.prompts[0]}`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ton / Style</Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professionnel</SelectItem>
                  <SelectItem value="casual">Décontracté</SelectItem>
                  <SelectItem value="friendly">Amical</SelectItem>
                  <SelectItem value="luxury">Luxe</SelectItem>
                  <SelectItem value="energetic">Énergique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Mots-clés (optionnel)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Ex: innovation, qualité, premium"
            />
          </div>

          <Button
            onClick={generateContent}
            disabled={!prompt || generating}
            className="w-full"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer le Contenu
              </>
            )}
          </Button>
        </div>

        {generatedContent && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge className="bg-green-500">Généré</Badge>
                Contenu IA
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateContent}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Régénérer
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {generatedContent}
              </pre>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Variantes suggérées</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, i) => (
                    <Button key={i} variant="outline" size="sm">
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={insertIntoPage} className="flex-1">
                Insérer dans la Page
              </Button>
              <Button variant="outline" onClick={() => setGeneratedContent('')}>
                Effacer
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Astuce Pro
          </h4>
          <p className="text-xs text-muted-foreground">
            Plus votre prompt est détaillé, meilleur sera le résultat. Incluez le public cible,
            les bénéfices clés, et le ton souhaité pour un contenu sur-mesure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContentGenerator;
