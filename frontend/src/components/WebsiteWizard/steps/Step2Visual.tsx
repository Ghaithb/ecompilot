import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface Step2Props {
  data: {
    logo?: File | string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontTitle: string;
    fontBody: string;
  };
  onChange: (data: any) => void;
}

const fonts = [
  { value: 'Inter', label: 'Inter (Moderne)' },
  { value: 'Poppins', label: 'Poppins (Populaire)' },
  { value: 'Roboto', label: 'Roboto (Classique)' },
  { value: 'Playfair Display', label: 'Playfair Display (Élégant)' },
  { value: 'Montserrat', label: 'Montserrat (Pro)' },
  { value: 'Open Sans', label: 'Open Sans (Lisible)' },
];

export function Step2Visual({ data, onChange }: Step2Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(
    typeof data.logo === 'string' ? data.logo : null
  );

  const handleColorChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      onChange({
        ...data,
        logo: file,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Logo de l'entreprise</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {logoPreview ? (
            <div className="space-y-4">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="max-w-full h-32 object-contain mx-auto"
              />
              <button
                onClick={() => {
                  setLogoPreview(null);
                  onChange({ ...data, logo: undefined });
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Cliquez pour uploader votre logo</p>
                <p className="text-xs text-gray-500">PNG, JPG ou SVG (max 5MB)</p>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          {!logoPreview && (
            <label
              htmlFor="logo-upload"
              className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90"
            >
              Choisir un fichier
            </label>
          )}
        </div>
      </div>

      {/* Couleurs */}
      <div className="space-y-4">
        <h3 className="font-medium">Palette de couleurs</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Couleur principale</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="primaryColor"
                value={data.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="#4F46E5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Couleur secondaire</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="secondaryColor"
                value={data.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="#10B981"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accentColor">Couleur d'accent</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="accentColor"
                value={data.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-16 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={data.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>

        {/* Preview couleurs */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium mb-3">Aperçu de la palette:</p>
          <div className="flex gap-4">
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: data.primaryColor }}
              />
              <p className="text-xs text-gray-600">Principale</p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: data.secondaryColor }}
              />
              <p className="text-xs text-gray-600">Secondaire</p>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: data.accentColor }}
              />
              <p className="text-xs text-gray-600">Accent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Polices */}
      <div className="space-y-4">
        <h3 className="font-medium">Typographie</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fontTitle">Police des titres</Label>
            <Select
              value={data.fontTitle}
              onValueChange={(value) => onChange({ ...data, fontTitle: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontBody">Police du contenu</Label>
            <Select
              value={data.fontBody}
              onValueChange={(value) => onChange({ ...data, fontBody: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview fonts */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p
            className="text-2xl font-bold"
            style={{ fontFamily: data.fontTitle }}
          >
            Exemple de titre
          </p>
          <p
            className="text-base"
            style={{ fontFamily: data.fontBody }}
          >
            Exemple de paragraphe avec le texte du corps. Voici à quoi ressemblera votre contenu.
          </p>
        </div>
      </div>
    </div>
  );
}
