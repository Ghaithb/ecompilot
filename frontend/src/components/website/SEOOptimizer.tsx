import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  Image as ImageIcon,
  FileText,
  Globe,
  TrendingUp,
} from 'lucide-react';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: any;
}

interface SEOScore {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'success';
    message: string;
  }>;
}

interface SEOOptimizerProps {
  data: SEOData;
  onChange: (data: SEOData) => void;
  pageContent?: string;
}

const SEOOptimizer: React.FC<SEOOptimizerProps> = ({ data, onChange, pageContent }) => {
  const [seoData, setSeoData] = useState<SEOData>(data);
  const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, issues: [] });
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    analyzeSEO();
  }, [seoData, pageContent]);

  useEffect(() => {
    onChange(seoData);
  }, [seoData]);

  const analyzeSEO = () => {
    const issues: Array<{ type: 'error' | 'warning' | 'success'; message: string }> = [];
    let score = 0;

    // Analyse du titre
    if (!seoData.title) {
      issues.push({ type: 'error', message: 'Le titre de la page est requis' });
    } else if (seoData.title.length < 30) {
      issues.push({ type: 'warning', message: 'Le titre est trop court (minimum 30 caractères)' });
      score += 5;
    } else if (seoData.title.length > 60) {
      issues.push({ type: 'warning', message: 'Le titre est trop long (maximum 60 caractères)' });
      score += 5;
    } else {
      issues.push({ type: 'success', message: 'Longueur du titre optimale' });
      score += 15;
    }

    // Analyse de la description
    if (!seoData.description) {
      issues.push({ type: 'error', message: 'La meta description est requise' });
    } else if (seoData.description.length < 120) {
      issues.push({ type: 'warning', message: 'La description est trop courte (minimum 120 caractères)' });
      score += 10;
    } else if (seoData.description.length > 160) {
      issues.push({ type: 'warning', message: 'La description est trop longue (maximum 160 caractères)' });
      score += 10;
    } else {
      issues.push({ type: 'success', message: 'Longueur de la description optimale' });
      score += 20;
    }

    // Analyse des mots-clés
    if (!seoData.keywords || seoData.keywords.length === 0) {
      issues.push({ type: 'warning', message: 'Aucun mot-clé défini' });
    } else if (seoData.keywords.length < 3) {
      issues.push({ type: 'warning', message: 'Ajoutez plus de mots-clés (minimum 3 recommandés)' });
      score += 5;
    } else if (seoData.keywords.length > 10) {
      issues.push({ type: 'warning', message: 'Trop de mots-clés (maximum 10 recommandés)' });
      score += 10;
    } else {
      issues.push({ type: 'success', message: 'Nombre de mots-clés optimal' });
      score += 15;
    }

    // Open Graph
    if (seoData.ogImage) {
      issues.push({ type: 'success', message: 'Image Open Graph définie' });
      score += 10;
    } else {
      issues.push({ type: 'warning', message: 'Image Open Graph manquante (recommandée pour les partages sociaux)' });
    }

    if (seoData.ogTitle || seoData.ogDescription) {
      issues.push({ type: 'success', message: 'Métadonnées Open Graph personnalisées' });
      score += 10;
    }

    // URL canonique
    if (seoData.canonicalUrl) {
      issues.push({ type: 'success', message: 'URL canonique définie' });
      score += 10;
    }

    // Structured Data
    if (seoData.structuredData) {
      issues.push({ type: 'success', message: 'Données structurées présentes' });
      score += 10;
    } else {
      issues.push({ type: 'warning', message: 'Données structurées manquantes (recommandées pour un meilleur référencement)' });
    }

    // Analyse du contenu
    if (pageContent) {
      const wordCount = pageContent.split(/\s+/).length;
      if (wordCount < 300) {
        issues.push({ type: 'warning', message: 'Contenu trop court (minimum 300 mots recommandés)' });
      } else {
        issues.push({ type: 'success', message: `Contenu suffisant (${wordCount} mots)` });
        score += 10;
      }

      // Vérifier les images avec alt
      const imgWithoutAlt = (pageContent.match(/<img(?![^>]*alt=)/gi) || []).length;
      if (imgWithoutAlt > 0) {
        issues.push({ type: 'warning', message: `${imgWithoutAlt} image(s) sans attribut alt` });
      } else if (pageContent.includes('<img')) {
        issues.push({ type: 'success', message: 'Toutes les images ont un attribut alt' });
        score += 10;
      }

      // Vérifier les headings
      const h1Count = (pageContent.match(/<h1/gi) || []).length;
      if (h1Count === 0) {
        issues.push({ type: 'error', message: 'Aucun titre H1 trouvé' });
      } else if (h1Count > 1) {
        issues.push({ type: 'warning', message: 'Plusieurs H1 détectés (un seul recommandé)' });
        score += 5;
      } else {
        issues.push({ type: 'success', message: 'Structure de titres correcte' });
        score += 10;
      }
    }

    setSeoScore({ score: Math.min(score, 100), issues });
  };

  const addKeyword = () => {
    if (keywordInput && !seoData.keywords?.includes(keywordInput)) {
      setSeoData({
        ...seoData,
        keywords: [...(seoData.keywords || []), keywordInput],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoData({
      ...seoData,
      keywords: seoData.keywords?.filter(k => k !== keyword) || [],
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À améliorer';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Optimisation SEO
            </CardTitle>
            <CardDescription>
              Optimisez votre référencement pour les moteurs de recherche
            </CardDescription>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(seoScore.score)}`}>
              {seoScore.score}
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(seoScore.score)}
            </div>
          </div>
        </div>
        <Progress value={seoScore.score} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basique</TabsTrigger>
            <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            <TabsTrigger value="analysis">Analyse</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seo-title">
                Titre de la page *
                <span className="text-xs text-muted-foreground ml-2">
                  ({seoData.title?.length || 0}/60)
                </span>
              </Label>
              <Input
                id="seo-title"
                value={seoData.title || ''}
                onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                placeholder="Titre optimisé pour le SEO"
                maxLength={60}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo-description">
                Meta Description *
                <span className="text-xs text-muted-foreground ml-2">
                  ({seoData.description?.length || 0}/160)
                </span>
              </Label>
              <Textarea
                id="seo-description"
                value={seoData.description || ''}
                onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                placeholder="Description concise et attrayante de votre page"
                maxLength={160}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Mots-clés</Label>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  placeholder="Ajouter un mot-clé"
                />
                <Button onClick={addKeyword} type="button">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {seoData.keywords?.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="og-title">Titre Open Graph</Label>
              <Input
                id="og-title"
                value={seoData.ogTitle || ''}
                onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                placeholder="Titre pour les partages sur les réseaux sociaux"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-description">Description Open Graph</Label>
              <Textarea
                id="og-description"
                value={seoData.ogDescription || ''}
                onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
                placeholder="Description pour les partages sur les réseaux sociaux"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og-image">Image Open Graph (URL)</Label>
              <Input
                id="og-image"
                value={seoData.ogImage || ''}
                onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Recommandé: 1200x630 pixels
              </p>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="canonical">URL Canonique</Label>
              <Input
                id="canonical"
                value={seoData.canonicalUrl || ''}
                onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                placeholder="https://example.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robots">Robots Meta Tag</Label>
              <Input
                id="robots"
                value={seoData.robots || ''}
                onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                placeholder="index, follow"
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-3">
            <div className="space-y-2">
              {seoScore.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-3 rounded-lg ${
                    issue.type === 'error'
                      ? 'bg-red-50 text-red-800'
                      : issue.type === 'warning'
                      ? 'bg-orange-50 text-orange-800'
                      : 'bg-green-50 text-green-800'
                  }`}
                >
                  {issue.type === 'error' && <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  {issue.type === 'warning' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  {issue.type === 'success' && <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                  <span className="text-sm">{issue.message}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Recommandations
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Utilisez des titres descriptifs et uniques</li>
                <li>• Incluez vos mots-clés principaux naturellement</li>
                <li>• Optimisez les images avec des attributs alt</li>
                <li>• Créez un contenu de qualité et pertinent</li>
                <li>• Assurez une bonne structure de headings (H1, H2, H3)</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SEOOptimizer;
export type { SEOData };
