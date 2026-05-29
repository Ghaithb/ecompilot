import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { currencyService, Currency } from '@/services/currencyService';

interface CurrencyContextType {
  selectedCurrency: string;
  currencies: Currency[];
  loading: boolean;
  setCurrency: (code: string) => void;
  formatPrice: (amount: number) => string;
  convertPrice: (amount: number, from: string) => Promise<number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(() => {
    return localStorage.getItem('selectedCurrency') || 'TND';
  });
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await currencyService.getAllCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const setCurrency = (code: string) => {
    setSelectedCurrency(code);
    localStorage.setItem('selectedCurrency', code);
  };

  const formatPrice = (amount: number): string => {
    const list = Array.isArray(currencies) ? currencies : [];
    const currency = list.find(c => c.code === selectedCurrency);
    if (!currency) return `${amount} ${selectedCurrency}`;

    const formatted = currencyService.formatCurrency(amount, selectedCurrency, currency.decimals);
    return `${formatted} ${currency.symbol}`;
  };

  const convertPrice = async (amount: number, from: string): Promise<number> => {
    if (from === selectedCurrency) return amount;
    
    try {
      const result = await currencyService.convert(amount, from, selectedCurrency);
      return result.converted.amount;
    } catch (error) {
      console.error('Error converting price:', error);
      return amount;
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        currencies,
        loading,
        setCurrency,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
