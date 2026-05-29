import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface ThemeConfigProps {
  theme: any;
  onSave: (theme: any) => void;
  saving: boolean;
}

const ThemeConfig: React.FC<ThemeConfigProps> = ({ theme, onSave, saving }) => {
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleChange = (field: string, value: string) => {
    setLocalTheme({
      ...localTheme,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration du Thème</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Couleur Principale</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={localTheme.primaryColor || '#3B82F6'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={localTheme.primaryColor || '#3B82F6'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Couleur Secondaire</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={localTheme.secondaryColor || '#10B981'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={localTheme.secondaryColor || '#10B981'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Couleur d'Accent</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={localTheme.accentColor || '#F59E0B'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={localTheme.accentColor || '#F59E0B'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Couleur du Texte</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={localTheme.textColor || '#1F2937'}
                onChange={(e) => handleChange('textColor', e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={localTheme.textColor || '#1F2937'}
                onChange={(e) => handleChange('textColor', e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label>Police</Label>
            <select
              className="w-full border rounded-md p-2"
              value={localTheme.font || 'Inter'}
              onChange={(e) => handleChange('font', e.target.value)}
            >
              <option value="Inter">Inter (Modern)</option>
              <option value="Georgia">Georgia (Classique)</option>
              <option value="Roboto">Roboto</option>
              <option value="Playfair Display">Playfair Display (Élégant)</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Open Sans">Open Sans</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label>URL du Logo</Label>
            <Input
              placeholder="https://example.com/logo.png"
              value={localTheme.logo || ''}
              onChange={(e) => handleChange('logo', e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>URL du Favicon</Label>
            <Input
              placeholder="https://example.com/favicon.ico"
              value={localTheme.favicon || ''}
              onChange={(e) => handleChange('favicon', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(localTheme)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer le thème'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeConfig;
