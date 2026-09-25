import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'NGN' | 'GBP' | 'EUR';

type CurrencyInfo = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  rate: number; // multiplier from NGN base
};

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: { code: 'NGN', symbol: '₦', label: 'NGN', locale: 'en-NG', rate: 1 },
  USD: { code: 'USD', symbol: '$', label: 'USD', locale: 'en-US', rate: 1 / 1500 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP', locale: 'en-GB', rate: 1 / 1900 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR', locale: 'de-DE', rate: 1 / 1650 },
};

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInNaira: number) => string;
  convert: (amountInNaira: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function detectDefaultCurrency(): CurrencyCode {
  if (typeof navigator !== 'undefined') {
    const locale = navigator.language || '';
    if (locale.includes('en-GB')) return 'GBP';
    if (locale.includes('de') || locale.includes('fr') || locale.includes('es') || locale.includes('it')) return 'EUR';
    if (locale.includes('en-NG')) return 'NGN';
  }
  return 'USD';
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => detectDefaultCurrency());

  const convert = useCallback((amountInNaira: number) => {
    const info = CURRENCIES[currency];
    return Math.round(amountInNaira * info.rate);
  }, [currency]);

  const formatPrice = useCallback((amountInNaira: number) => {
    const info = CURRENCIES[currency];
    const converted = amountInNaira * info.rate;
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: info.code === 'NGN' ? 0 : 2,
      maximumFractionDigits: info.code === 'NGN' ? 0 : 2,
    }).format(converted);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
