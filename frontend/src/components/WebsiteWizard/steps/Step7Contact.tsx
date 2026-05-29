import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

interface Step7Props {
  data: {
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
  onChange: (data: any) => void;
}

export function Step7Contact({ data, onChange }: Step7Props) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleSocialChange = (platform: string, value: string) => {
    onChange({
      ...data,
      social: { ...data.social, [platform]: value },
    });
  };

  const handleFooterChange = (field: string, value: any) => {
    onChange({
      ...data,
      footer: { ...data.footer, [field]: value },
    });
  };

  const addFooterColumn = () => {
    const newColumns = [...data.footer.columns, { title: '', links: [] }];
    handleFooterChange('columns', newColumns);
  };

  const removeFooterColumn = (index: number) => {
    const newColumns = data.footer.columns.filter((_, i) => i !== index);
    handleFooterChange('columns', newColumns);
  };

  const updateFooterColumn = (index: number, field: 'title' | 'links', value: any) => {
    const newColumns = [...data.footer.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    handleFooterChange('columns', newColumns);
  };

  const addLink = (columnIndex: number) => {
    const newColumns = [...data.footer.columns];
    newColumns[columnIndex].links.push({ label: '', url: '' });
    handleFooterChange('columns', newColumns);
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...data.footer.columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter((_, i) => i !== linkIndex);
    handleFooterChange('columns', newColumns);
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const newColumns = [...data.footer.columns];
    newColumns[columnIndex].links[linkIndex] = {
      ...newColumns[columnIndex].links[linkIndex],
      [field]: value,
    };
    handleFooterChange('columns', newColumns);
  };

  return (
    <div className="space-y-8">
      {/* Formulaire de contact */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">Formulaire de contact</h3>
            <p className="text-sm text-gray-600">Permettre aux visiteurs de vous contacter</p>
          </div>
          <Switch
            checked={data.enableContactForm}
            onCheckedChange={(checked) => handleChange('enableContactForm', checked)}
          />
        </div>

        {data.enableContactForm && (
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              ✅ Les visiteurs pourront vous envoyer des messages via le formulaire de contact
            </p>
          </div>
        )}
      </div>

      {/* Réseaux sociaux */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Réseaux Sociaux</h3>
        <p className="text-sm text-gray-600">Ajoutez vos liens de réseaux sociaux</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Facebook className="w-5 h-5 text-blue-600" />
            <Input
              placeholder="https://facebook.com/votre-page"
              value={data.social.facebook || ''}
              onChange={(e) => handleSocialChange('facebook', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Instagram className="w-5 h-5 text-pink-600" />
            <Input
              placeholder="https://instagram.com/votre-compte"
              value={data.social.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Twitter className="w-5 h-5 text-blue-400" />
            <Input
              placeholder="https://twitter.com/votre-compte"
              value={data.social.twitter || ''}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5 text-blue-700" />
            <Input
              placeholder="https://linkedin.com/company/votre-entreprise"
              value={data.social.linkedin || ''}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">Configuration du Footer</h3>
            <p className="text-sm text-gray-600">Organisez les liens dans le pied de page</p>
          </div>
          <Button onClick={addFooterColumn} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter colonne
          </Button>
        </div>

        {data.footer.columns.length === 0 && (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-sm text-gray-600">
            Aucune colonne de footer. Ajoutez des colonnes pour organiser vos liens.
          </div>
        )}

        <div className="space-y-6">
          {data.footer.columns.map((column, columnIndex) => (
            <div key={columnIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <span className="font-medium">Colonne #{columnIndex + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFooterColumn(columnIndex)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Titre de la colonne</Label>
                <Input
                  placeholder="Ex: Produits, Entreprise, Support"
                  value={column.title}
                  onChange={(e) => updateFooterColumn(columnIndex, 'title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Liens</Label>
                  <Button
                    onClick={() => addLink(columnIndex)}
                    variant="ghost"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Lien
                  </Button>
                </div>

                {column.links.length === 0 && (
                  <p className="text-xs text-gray-500">Aucun lien dans cette colonne</p>
                )}

                {column.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Texte du lien"
                        value={link.label}
                        onChange={(e) => updateLink(columnIndex, linkIndex, 'label', e.target.value)}
                        size="sm"
                      />
                      <Input
                        placeholder="/page-url"
                        value={link.url}
                        onChange={(e) => updateLink(columnIndex, linkIndex, 'url', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => removeLink(columnIndex, linkIndex)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Newsletter</h3>
            <p className="text-sm text-gray-600">Permettre l'inscription à la newsletter dans le footer</p>
          </div>
          <Switch
            checked={data.footer.newsletterEnabled}
            onCheckedChange={(checked) => handleFooterChange('newsletterEnabled', checked)}
          />
        </div>
      </div>

      {/* Copyright */}
      <div className="space-y-2">
        <Label htmlFor="copyright">Texte de copyright</Label>
        <Textarea
          id="copyright"
          rows={2}
          placeholder="© 2025 Votre Entreprise. Tous droits réservés."
          value={data.footer.copyrightText}
          onChange={(e) => handleFooterChange('copyrightText', e.target.value)}
        />
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-900">
          <strong>🎉 Dernière étape complétée !</strong> Vous êtes prêt à créer votre site. 
          Cliquez sur "Créer mon site" pour générer votre site web avec toutes ces informations.
        </p>
      </div>
    </div>
  );
}
