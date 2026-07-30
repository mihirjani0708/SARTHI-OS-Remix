import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Phone } from 'lucide-react';

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string; // e.g. '+91'
  flag: string; // '🇮🇳'
  digits: number; // 10
  placeholder: string; // '98765 43210'
}

export const COUNTRIES: CountryOption[] = [
  {
    code: 'IN',
    name: 'India',
    dialCode: '+91',
    flag: '🇮🇳',
    digits: 10,
    placeholder: '98765 43210',
  },
  {
    code: 'US',
    name: 'United States',
    dialCode: '+1',
    flag: '🇺🇸',
    digits: 10,
    placeholder: '202 555 0143',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    dialCode: '+971',
    flag: '🇦🇪',
    digits: 9,
    placeholder: '50 123 4567',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    dialCode: '+44',
    flag: '🇬🇧',
    digits: 10,
    placeholder: '7911 123456',
  },
  {
    code: 'SG',
    name: 'Singapore',
    dialCode: '+65',
    flag: '🇸🇬',
    digits: 8,
    placeholder: '8123 4567',
  },
  {
    code: 'CA',
    name: 'Canada',
    dialCode: '+1',
    flag: '🇨🇦',
    digits: 10,
    placeholder: '416 555 0123',
  },
  {
    code: 'AU',
    name: 'Australia',
    dialCode: '+61',
    flag: '🇦🇺',
    digits: 9,
    placeholder: '412 345 678',
  },
];

export interface PhoneInputProps {
  value: string; // Stored value e.g. '+919876543210' or raw '9876543210'
  onChange: (fullPhoneNumber: string, isValid: boolean, localDigits: string) => void;
  required?: boolean;
  theme?: 'dark' | 'light';
  placeholder?: string;
  label?: string;
  className?: string;
  error?: string | null;
  disabled?: boolean;
}

// Helper to extract country & 10 local digits from any input string
export function parsePhoneNumber(inputVal: string): { country: CountryOption; localDigits: string } {
  const clean = (inputVal || '').trim();
  let matchedCountry = COUNTRIES[0]; // Default India +91

  // Check if input starts with a known dial code
  for (const c of COUNTRIES) {
    const rawDial = c.dialCode.replace('+', '');
    if (clean.startsWith(c.dialCode) || clean.startsWith(rawDial)) {
      matchedCountry = c;
      break;
    }
  }

  // Extract digits
  let allDigits = clean.replace(/\D/g, '');
  const dialDigits = matchedCountry.dialCode.replace(/\D/g, '');

  // Strip dial code if present at start
  if (allDigits.startsWith(dialDigits)) {
    allDigits = allDigits.slice(dialDigits.length);
  } else if (allDigits.length === matchedCountry.digits + 1 && allDigits.startsWith('0')) {
    // Strip leading 0 if 11 digits (e.g. 09876543210 -> 9876543210)
    allDigits = allDigits.slice(1);
  }

  // Take up to target digits
  const localDigits = allDigits.slice(0, matchedCountry.digits);
  return { country: matchedCountry, localDigits };
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  required = false,
  theme = 'dark',
  placeholder,
  label = 'Mobile Number',
  className = '',
  error,
  disabled = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]); // India +91
  const [localDigits, setLocalDigits] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
      setLocalDigits(parsed.localDigits);
    } else if (!localDigits) {
      setSelectedCountry(COUNTRIES[0]);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Strip all non-numeric characters
    const numericOnly = raw.replace(/\D/g, '');
    
    // Truncate to maximum allowed digits for selected country (10 for India)
    const truncated = numericOnly.slice(0, selectedCountry.digits);
    setLocalDigits(truncated);

    const fullNum = truncated ? `${selectedCountry.dialCode}${truncated}` : '';
    const isValid = truncated.length === selectedCountry.digits;
    onChange(fullNum, isValid, truncated);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const parsed = parsePhoneNumber(pastedText);
    setSelectedCountry(parsed.country);
    setLocalDigits(parsed.localDigits);

    const fullNum = parsed.localDigits
      ? `${parsed.country.dialCode}${parsed.localDigits}`
      : '';
    const isValid = parsed.localDigits.length === parsed.country.digits;
    onChange(fullNum, isValid, parsed.localDigits);
  };

  const handleSelectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    // Recalculate with existing digits truncated to new country length
    const truncated = localDigits.slice(0, country.digits);
    setLocalDigits(truncated);

    const fullNum = truncated ? `${country.dialCode}${truncated}` : '';
    const isValid = truncated.length === country.digits;
    onChange(fullNum, isValid, truncated);
  };

  const isComplete = localDigits.length === selectedCountry.digits;
  const isDark = theme === 'dark';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            className={`text-xs font-bold block ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : localDigits.length > 0
                ? isDark
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : 'bg-amber-100 text-amber-700'
                : isDark
                ? 'text-slate-500'
                : 'text-slate-400'
            }`}
          >
            {localDigits.length}/{selectedCountry.digits} digits
          </span>
        </div>
      )}

      <div className="relative flex items-center" ref={dropdownRef}>
        {/* Country Selector Dropdown Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-l-2xl border-r-0 border transition-all cursor-pointer select-none font-semibold text-xs ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-750'
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Select Country Code"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-bold tracking-tight text-xs">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Country Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-60 rounded-2xl shadow-2xl border z-50 overflow-hidden py-1 backdrop-blur-xl ${
                isDark
                  ? 'bg-slate-900/95 border-slate-800 text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}
            >
              <div className="px-3 py-1.5 border-b border-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Country
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-800/30">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-blue-600/10 hover:text-blue-400 transition-colors ${
                      selectedCountry.code === c.code
                        ? isDark
                          ? 'bg-blue-600/20 text-blue-400 font-bold'
                          : 'bg-blue-50 text-blue-600 font-bold'
                        : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-mono text-[11px] opacity-80">{c.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 10-Digit Phone Input Field */}
        <div className="relative w-full">
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            required={required}
            disabled={disabled}
            placeholder={placeholder || selectedCountry.placeholder}
            value={localDigits}
            onChange={handleDigitsChange}
            onPaste={handlePaste}
            maxLength={selectedCountry.digits}
            className={`w-full pl-3 pr-10 py-2.5 sm:py-3 rounded-r-2xl border font-mono text-xs font-semibold focus:outline-none transition-all ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
            } ${
              isComplete
                ? isDark
                  ? 'border-emerald-500/50 focus:border-emerald-500'
                  : 'border-emerald-500 focus:border-emerald-600'
                : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          {/* Complete Status Check Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
            {isComplete ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            ) : (
              <Phone
                className={`w-3.5 h-3.5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-rose-400 font-medium pl-1 flex items-center gap-1">
          <span>⚠️ {error}</span>
        </p>
      )}
    </div>
  );
};
