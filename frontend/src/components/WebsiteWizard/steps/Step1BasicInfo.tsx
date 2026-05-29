import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step1Props {
  data: {
    businessType: string;
    companyName: string;
    slogan: string;
    city: string;
    email: string;
    phone: string;
    address: string;
  };
  onChange: (data: any) => void;
}

const businessTypes = [
  { value: 'parfum', label: '🌸 Parfumerie' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'cafe', label: '☕ Café' },
  { value: 'coiffure', label: '💇 Salon de coiffure' },
  { value: 'immobilier', label: '🏠 Immobilier' },
  { value: 'garage', label: '🔧 Garage Auto' },
  { value: 'medecin', label: '👨‍⚕️ Cabinet médical' },
  { value: 'dentiste', label: '🦷 Dentiste' },
  { value: 'fitness', label: '💪 Salle de sport' },
  { value: 'hotel', label: '🏨 Hôtel' },
  { value: 'ecommerce', label: '🛍️ E-commerce' },
  { value: 'autre', label: '📦 Autre' },
];

export function Step1BasicInfo({ data, onChange }: Step1Props) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="businessType">Type d'activité *</Label>
        <Select value={data.businessType} onValueChange={(value) => handleChange('businessType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez votre secteur d'activité" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Nom de l'entreprise *</Label>
        <Input
          id="companyName"
          placeholder="Ex: Essence de Luxe"
          value={data.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slogan">Slogan / Accroche *</Label>
        <Input
          id="slogan"
          placeholder="Ex: L'élégance à la française"
          value={data.slogan}
          onChange={(e) => handleChange('slogan', e.target.value)}
          required
        />
        <p className="text-xs text-gray-500">Une phrase courte qui résume votre proposition de valeur</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="contact@entreprise.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="01 23 45 67 89"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse complète *</Label>
        <Input
          id="address"
          placeholder="123 Rue Example"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Ville *</Label>
        <Input
          id="city"
          placeholder="Paris"
          value={data.city}
          onChange={(e) => handleChange('city', e.target.value)}
          required
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>💡 Astuce:</strong> Ces informations apparaîtront sur votre page de contact et dans le footer de votre site.
        </p>
      </div>
    </div>
  );
}
