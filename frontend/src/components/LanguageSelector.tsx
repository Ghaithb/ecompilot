import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

const LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳', direction: 'rtl' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const selectedLanguage = LANGUAGES.some((l) => l.code === i18n.language)
    ? i18n.language
    : 'fr';

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  const currentLanguage = LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-lg">{currentLanguage?.flag}</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
