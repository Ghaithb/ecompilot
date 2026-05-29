import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

export default function CurrencySelector() {
  const { selectedCurrency, currencies, loading, setCurrency } = useCurrency();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <DollarSign className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  const getCurrencyFlag = (code: string) => {
    const flags: Record<string, string> = {
      EUR: '🇪🇺',
      USD: '🇺🇸',
      XOF: '🇸🇳', // Franc CFA Ouest
      XAF: '🇨🇲', // Franc CFA Centre
      NGN: '🇳🇬',
      GHS: '🇬🇭',
      KES: '🇰🇪',
      ZAR: '🇿🇦',
      MAD: '🇲🇦',
      TND: '🇹🇳',
      DZD: '🇩🇿',
      EGP: '🇪🇬',
    };
    return flags[code] || '💱';
  };

  return (
    <Select value={selectedCurrency} onValueChange={setCurrency}>
      <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCurrencyFlag(selectedCurrency)}</span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {Array.isArray(currencies) && currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCurrencyFlag(currency.code)}</span>
              <div className="flex flex-col">
                <span className="font-medium">{currency.code}</span>
                <span className="text-xs text-gray-500">{currency.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
