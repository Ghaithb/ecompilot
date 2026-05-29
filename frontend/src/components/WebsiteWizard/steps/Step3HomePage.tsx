import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

interface Step3Props {
  data: {
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
  onChange: (data: any) => void;
}

const iconOptions = [
  { value: 'star', label: '⭐ Étoile' },
  { value: 'check', label: '✅ Check' },
  { value: 'heart', label: '❤️ Coeur' },
  { value: 'trophy', label: '🏆 Trophée' },
  { value: 'shield', label: '🛡️ Bouclier' },
  { value: 'zap', label: '⚡ Éclair' },
  { value: 'gift', label: '🎁 Cadeau' },
  { value: 'target', label: '🎯 Cible' },
];

export function Step3HomePage({ data, onChange }: Step3Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof data.heroImage === 'string' ? data.heroImage : null
  );

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleChange('heroImage', file);
    }
  };

  const addHighlight = () => {
    const newHighlights = [
      ...data.highlights,
      { icon: 'star', title: '', description: '' },
    ];
    handleChange('highlights', newHighlights);
  };

  const removeHighlight = (index: number) => {
    const newHighlights = data.highlights.filter((_, i) => i !== index);
    handleChange('highlights', newHighlights);
  };

  const updateHighlight = (index: number, field: string, value: string) => {
    const newHighlights = [...data.highlights];
    newHighlights[index] = { ...newHighlights[index], [field]: value };
    handleChange('highlights', newHighlights);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Section Hero (Première impression)</h3>
        
        <div className="space-y-2">
          <Label htmlFor="heroTitle">Titre principal *</Label>
          <Input
            id="heroTitle"
            placeholder="Bienvenue chez [Votre Entreprise]"
            value={data.heroTitle}
            onChange={(e) => handleChange('heroTitle', e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">Sous-titre *</Label>
          <Input
            id="heroSubtitle"
            placeholder="Découvrez nos services d'exception..."
            value={data.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ctaText">Texte du bouton *</Label>
            <Input
              id="ctaText"
              placeholder="Découvrir"
              value={data.ctaText}
              onChange={(e) => handleChange('ctaText', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctaLink">Lien du bouton</Label>
            <Input
              id="ctaLink"
              placeholder="/products"
              value={data.ctaLink}
              onChange={(e) => handleChange('ctaLink', e.target.value)}
            />
          </div>
        </div>

        {/* Image Hero */}
        <div className="space-y-2">
          <Label>Image Hero</Label>
          <div className="border-2 border-dashed rounded-lg p-4">
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview}
                  alt="Hero preview"
                  className="w-full h-48 object-cover rounded"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImagePreview(null);
                    handleChange('heroImage', undefined);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">Cliquez pour uploader</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="hero-image"
                />
                <label htmlFor="hero-image">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choisir une image</span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description de l'entreprise *</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Décrivez votre entreprise, votre mission, ce qui vous rend unique..."
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <p className="text-xs text-gray-500">2-3 paragraphes recommandés</p>
      </div>

      {/* Points Forts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Points Forts</h3>
          <Button onClick={addHighlight} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {data.highlights.length === 0 && (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-600">
            Aucun point fort ajouté. Cliquez sur "Ajouter" pour commencer.
          </div>
        )}

        {data.highlights.map((highlight, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium">Point fort #{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeHighlight(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Icône</Label>
                <Select
                  value={highlight.icon}
                  onValueChange={(value) => updateHighlight(index, 'icon', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label>Titre</Label>
                <Input
                  placeholder="Ex: Qualité garantie"
                  value={highlight.title}
                  onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={2}
                placeholder="Décrivez brièvement cet avantage..."
                value={highlight.description}
                onChange={(e) => updateHighlight(index, 'description', e.target.value)}
              />
            </div>
          </div>
        ))}

        {data.highlights.length < 5 && data.highlights.length > 0 && (
          <p className="text-xs text-gray-500">
            💡 Recommandé: 3-5 points forts maximum
          </p>
        )}
      </div>
    </div>
  );
}
