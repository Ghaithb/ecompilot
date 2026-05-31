import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService, RegionalPricing } from '@/services/currencyService';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp, Users, MapPin, Check } from 'lucide-react';

export default function CurrencySettingsPage() {
  const { selectedCurrency, currencies, loading: currenciesLoading, setCurrency, formatPrice } = useCurrency();
  const [pricing, setPricing] = useState<RegionalPricing | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPricing();
  }, [selectedCurrency]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await currencyService.getPricingByCurrency(selectedCurrency);
      setPricing(data);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
    toast({
      title: 'Devise changée',
      description: `La devise a été changée en ${code}`,
    });
  };

  const getCurrencyFlag = (code: string) => {
    const flags: Record<string, string> = {
      EUR: '🇪🇺', USD: '🇺🇸', XOF: '🇸🇳', XAF: '🇨🇲',
      NGN: '🇳🇬', GHS: '🇬🇭', KES: '🇰🇪', ZAR: '🇿🇦',
      MAD: '🇲🇦', TND: '🇹🇳', DZD: '🇩🇿', EGP: '🇪🇬',
    };
    return flags[code] || '💱';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Devises & Tarification</h1>
        <p className="text-gray-500">Gérez les devises et consultez les tarifs régionaux</p>
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currenciesLoading ? (
          <p className="text-sm text-muted-foreground col-span-full">Chargement des devises...</p>
        ) : (currencies ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full">Aucune devise disponible.</p>
        ) : (
          (currencies ?? []).map((currency) => (
          <Card
            key={currency.code}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCurrency === currency.code
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                : ''
            }`}
            onClick={() => handleCurrencyChange(currency.code)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getCurrencyFlag(currency.code)}</span>
                  <div>
                    <CardTitle className="text-lg">{currency.code}</CardTitle>
                    <CardDescription className="text-xs">{currency.name}</CardDescription>
                  </div>
                </div>
                {selectedCurrency === currency.code && (
                  <Check className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{(currency.population / 1000000).toFixed(0)}M personnes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{currency.countries.length} pays</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>Min: {currency.minAmount} {currency.symbol}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Regional Pricing */}
      {pricing && (
        <Card>
          <CardHeader>
            <CardTitle>Tarifs Régionaux - {pricing.currency}</CardTitle>
            <CardDescription>
              Région: {pricing.region} | Tarifs adaptés au pouvoir d'achat local
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="border rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Starter</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(pricing.plans.starter.monthly)}</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(pricing.plans.starter.yearly)}/an (2 mois gratuits)
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {(pricing.plans.starter.features ?? []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 space-y-4 relative">
                <Badge className="absolute -top-3 right-4 bg-blue-500">Populaire</Badge>
                <div>
                  <h3 className="text-lg font-bold">Pro</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(pricing.plans.pro.monthly)}</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(pricing.plans.pro.yearly)}/an (2 mois gratuits)
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {(pricing.plans.pro.features ?? []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Plan */}
              <div className="border rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Business</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{formatPrice(pricing.plans.business.monthly)}</span>
                    <span className="text-gray-500">/mois</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatPrice(pricing.plans.business.yearly)}/an (2 mois gratuits)
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {(pricing.plans.business.features ?? []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Conversion Automatique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Les prix sont automatiquement convertis dans la devise sélectionnée.
            Les taux de change sont mis à jour quotidiennement. Pour les devises
            Franc CFA (XOF/XAF), le taux fixe BCE est utilisé (1 EUR = 655.957 CFA).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
