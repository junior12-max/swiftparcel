import { useState } from 'react';
import { Package, Menu, X, ChevronDown } from 'lucide-react';
import { useCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currency';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Track', href: '#track' },
  { label: 'Book Shipment', href: '#book' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setCurrencyOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Swift<span className="text-green-700">Parcel</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* Currency dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Select currency"
              >
                <span className="text-green-700 font-semibold">{CURRENCIES[currency].symbol}</span>
                <span className="text-xs">{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {currencyOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCurrencyOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-100 bg-white shadow-lg py-1 z-20">
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                      <button
                        key={code}
                        onClick={() => handleCurrencyChange(code)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          currency === code
                            ? 'text-green-700 bg-green-50 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-semibold w-5">{CURRENCIES[code].symbol}</span>
                          {code}
                        </span>
                        {currency === code && (
                          <span className="w-2 h-2 rounded-full bg-green-700" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <a
              href="#book"
              className="text-sm font-semibold text-white bg-green-700 px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile currency (inline) */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-700"
              aria-label="Select currency"
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].symbol} {code}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#book"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white bg-green-700 px-5 py-2.5 rounded-lg mt-2"
            >
              Get Started
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
