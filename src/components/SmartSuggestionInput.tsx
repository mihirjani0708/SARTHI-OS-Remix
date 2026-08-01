/**
 * SmartSuggestionInput.tsx
 * Reusable Smart Dropdown / Combobox input component for SARTHI forms.
 * Features auto-complete, fuzzy matching, keyboard navigation (Up/Down/Enter/Esc),
 * mobile-friendly touch targets, auto-focus, and instant selection.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Check, ChevronDown, History } from 'lucide-react';
import { smartSuggestionService, SuggestionType, SuggestionItem } from '../services/suggestions/smartSuggestionService';

interface SmartSuggestionInputProps {
  type: SuggestionType;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const SmartSuggestionInput: React.FC<SmartSuggestionInputProps> = ({
  type,
  value,
  onChange,
  label,
  placeholder = 'Type or select...',
  autoFocus = false,
  required = false,
  className = '',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch suggestions based on current value
    const list = smartSuggestionService.getSuggestions(type, value, 10);
    setSuggestions(list);
    setHighlightedIndex(-1);
  }, [type, value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    smartSuggestionService.addHistory(type, itemValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all pr-9"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          tabIndex={-1}
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 scrollbar-thin">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 mb-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" /> Smart Suggestions
            </span>
            <span>Use ↑↓ Enter</span>
          </div>

          {suggestions.map((item, idx) => {
            const isSelected = value.toLowerCase() === item.value.toLowerCase();
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={`${item.value}-${idx}`}
                type="button"
                onClick={() => handleSelect(item.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  isHighlighted
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : isSelected
                    ? 'bg-slate-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {item.isHistory ? (
                    <History className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  )}
                  <span className="truncate">{item.value}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.category && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                      {item.category}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
