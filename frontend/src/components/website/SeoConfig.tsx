import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, X } from 'lucide-react';

interface SeoConfigProps {
  seo: any;
  onSave: (seo: any) => void;
  saving: boolean;
}

const SeoConfig: React.FC<SeoConfigProps> = ({ seo, onSave, saving }) => {
  const [localSeo, setLocalSeo] = useState(seo);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    setLocalSeo(seo);
  }, [seo]);

  const handleChange = (field: string, value: any) => {
    setLocalSeo({
      ...localSeo,
      [field]: value,
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      handleChange('keywords', [...(localSeo.keywords || []), newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    const keywords = [...(localSeo.keywords || [])];
    keywords.splice(index, 1);
    handleChange('keywords', keywords);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration SEO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Titre SEO</Label>
          <Input
            placeholder="Mon Site Web - Description"
            value={localSeo.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {(localSeo.title || '').length}/60 caractères
          </p>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            placeholder="Décrivez votre site en quelques phrases..."
            value={localSeo.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            maxLength={160}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {(localSeo.description || '').length}/160 caractères
          </p>
        </div>

        <div>
          <Label>Mots-clés</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Ajouter un mot-clé"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            />
            <Button type="button" onClick={addKeyword}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(localSeo.keywords || []).map((keyword: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <Label>Image Open Graph</Label>
          <Input
            placeholder="https://example.com/og-image.jpg"
            value={localSeo.ogImage || ''}
            onChange={(e) => handleChange('ogImage', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Image affichée lors du partage sur les réseaux sociaux (1200x630px recommandé)
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(localSeo)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer le SEO'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeoConfig;
