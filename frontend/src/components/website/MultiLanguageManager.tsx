import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Plus, Trash2, Check, Copy, Wand2, AlertCircle } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
  enabled: boolean;
  completeness: number;
}

interface Translation {
  key: string;
  translations: Record<string, string>;
  autoTranslated?: boolean;
}

interface MultiLanguageManagerProps {
  pageId: string;
  onSave: (languages: Language[], translations: Translation[]) => void;
}

const languages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', isDefault: true, enabled: true, completeness: 100 },
  { code: 'en', name: 'English', flag: '🇬🇧', isDefault: false, enabled: false, completeness: 0 },
  { code: 'es', name: 'Español', flag: '🇪🇸', isDefault: false, enabled: false, completeness: 0 },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', isDefault: false, enabled: false, completeness: 0 },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', isDefault: false, enabled: false, completeness: 0 },
  { code: 'pt', name: 'Português', flag: '🇵🇹', isDefault: false, enabled: false, completeness: 0 },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', isDefault: false, enabled: false, completeness: 0 },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', isDefault: false, enabled: false, completeness: 0 },
  { code: 'zh', name: '中文', flag: '🇨🇳', isDefault: false, enabled: false, completeness: 0 },
  { code: 'ja', name: '日本語', flag: '🇯🇵', isDefault: false, enabled: false, completeness: 0 },
];

const MultiLanguageManager: React.FC<MultiLanguageManagerProps> = ({ pageId, onSave }) => {
  const [activeLanguages, setActiveLanguages] = useState<Language[]>(languages);
  const [currentLang, setCurrentLang] = useState('fr');
  const [translations, setTranslations] = useState<Translation[]>([
    {
      key: 'hero.title',
      translations: {
        fr: 'Bienvenue sur Notre Site',
        en: 'Welcome to Our Website',
        es: 'Bienvenido a Nuestro Sitio',
      },
    },
    {
      key: 'hero.subtitle',
      translations: {
        fr: 'Découvrez nos produits exceptionnels',
        en: 'Discover our exceptional products',
        es: 'Descubre nuestros productos excepcionales',
      },
    },
    {
      key: 'cta.button',
      translations: {
        fr: 'Commencer',
        en: 'Get Started',
        es: 'Comenzar',
      },
    },
  ]);
  const [newKey, setNewKey] = useState('');
  const { toast } = useToast();

  const toggleLanguage = (langCode: string) => {
    setActiveLanguages(prev => 
      prev.map(lang => 
        lang.code === langCode 
          ? { ...lang, enabled: !lang.enabled }
          : lang
      )
    );
  };

  const setDefaultLanguage = (langCode: string) => {
    setActiveLanguages(prev =>
      prev.map(lang => ({
        ...lang,
        isDefault: lang.code === langCode,
      }))
    );
  };

  const autoTranslate = async (fromLang: string, toLang: string) => {
    toast({
      title: 'Traduction automatique',
      description: `Traduction de ${fromLang} vers ${toLang} en cours...`,
    });

    // Simuler la traduction automatique
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updated = translations.map(t => {
      if (t.translations[fromLang] && !t.translations[toLang]) {
        return {
          ...t,
          translations: {
            ...t.translations,
            [toLang]: `[Auto-traduit] ${t.translations[fromLang]}`,
          },
          autoTranslated: true,
        };
      }
      return t;
    });

    setTranslations(updated);

    // Mettre à jour le pourcentage de complétion
    updateCompleteness(toLang);

    toast({
      title: 'Traduction terminée',
      description: `${updated.length} traductions générées`,
    });
  };

  const updateCompleteness = (langCode: string) => {
    const total = translations.length;
    const translated = translations.filter(t => t.translations[langCode]).length;
    const percentage = (translated / total) * 100;

    setActiveLanguages(prev =>
      prev.map(lang =>
        lang.code === langCode
          ? { ...lang, completeness: Math.round(percentage) }
          : lang
      )
    );
  };

  const addTranslationKey = () => {
    if (!newKey) return;

    const exists = translations.find(t => t.key === newKey);
    if (exists) {
      toast({
        title: 'Erreur',
        description: 'Cette clé existe déjà',
        variant: 'destructive',
      });
      return;
    }

    setTranslations(prev => [
      ...prev,
      {
        key: newKey,
        translations: {},
      },
    ]);

    setNewKey('');
  };

  const updateTranslation = (key: string, lang: string, value: string) => {
    setTranslations(prev =>
      prev.map(t =>
        t.key === key
          ? {
              ...t,
              translations: { ...t.translations, [lang]: value },
              autoTranslated: false,
            }
          : t
      )
    );
  };

  const deleteTranslationKey = (key: string) => {
    setTranslations(prev => prev.filter(t => t.key !== key));
  };

  const exportTranslations = () => {
    const data = {
      languages: activeLanguages.filter(l => l.enabled),
      translations,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${pageId}.json`;
    a.click();

    toast({
      title: 'Export réussi',
      description: 'Fichier de traductions téléchargé',
    });
  };

  const enabledLanguages = activeLanguages.filter(l => l.enabled);
  const currentLanguage = activeLanguages.find(l => l.code === currentLang);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Gestion Multi-Langue
            </CardTitle>
            <CardDescription>
              Traduisez votre site en plusieurs langues
            </CardDescription>
          </div>
          <Button onClick={exportTranslations} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="languages">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="languages">Langues</TabsTrigger>
            <TabsTrigger value="translations">Traductions</TabsTrigger>
          </TabsList>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-4">
            <div className="grid gap-3">
              {activeLanguages.map(lang => (
                <Card key={lang.code} className={lang.enabled ? 'border-primary/50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lang.name}</span>
                            {lang.isDefault && (
                              <Badge variant="default" className="text-xs">
                                Par défaut
                              </Badge>
                            )}
                            {lang.autoTranslated && (
                              <Badge variant="outline" className="text-xs">
                                <Wand2 className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-32 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${lang.completeness}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {lang.completeness}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lang.enabled && !lang.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultLanguage(lang.code)}
                          >
                            Définir par défaut
                          </Button>
                        )}
                        
                        {lang.enabled && lang.completeness < 100 && !lang.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const defaultLang = activeLanguages.find(l => l.isDefault);
                              if (defaultLang) {
                                autoTranslate(defaultLang.code, lang.code);
                              }
                            }}
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Auto-traduire
                          </Button>
                        )}

                        <Switch
                          checked={lang.enabled}
                          onCheckedChange={() => toggleLanguage(lang.code)}
                          disabled={lang.isDefault}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Traduction Automatique</p>
                  <p className="text-muted-foreground">
                    Utilisez la traduction automatique comme point de départ, 
                    puis affinez manuellement pour une qualité optimale.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations" className="space-y-4">
            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <Label>Langue actuelle:</Label>
              <Select value={currentLang} onValueChange={setCurrentLang}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {enabledLanguages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentLanguage && (
                <Badge variant="outline">
                  {currentLanguage.completeness}% traduit
                </Badge>
              )}
            </div>

            {/* Add Translation Key */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Nouvelle clé (ex: footer.copyright)"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTranslationKey()}
                  />
                  <Button onClick={addTranslationKey}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Translation List */}
            <div className="space-y-3">
              {translations.map(translation => (
                <Card key={translation.key}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {translation.key}
                          </code>
                          {translation.autoTranslated && (
                            <Badge variant="outline" className="text-xs">
                              <Wand2 className="w-3 h-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTranslationKey(translation.key)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid gap-3">
                        {enabledLanguages.map(lang => {
                          const hasTranslation = translation.translations[lang.code];
                          return (
                            <div key={lang.code} className="flex items-center gap-3">
                              <span className="text-xl">{lang.flag}</span>
                              <div className="flex-1 relative">
                                <Input
                                  value={translation.translations[lang.code] || ''}
                                  onChange={(e) =>
                                    updateTranslation(translation.key, lang.code, e.target.value)
                                  }
                                  placeholder={`Traduction en ${lang.name}...`}
                                  className={!hasTranslation ? 'border-orange-500' : ''}
                                />
                                {hasTranslation && (
                                  <Check className="w-4 h-4 text-green-600 absolute right-3 top-1/2 -translate-y-1/2" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {translations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune traduction pour le moment</p>
                <p className="text-sm">Ajoutez votre première clé de traduction ci-dessus</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={() => onSave(activeLanguages, translations)}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Sauvegarder les Traductions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiLanguageManager;
