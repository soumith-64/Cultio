'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '@/context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] text-[#4E342E] text-xs font-bold transition-all cursor-pointer shadow-sm"
        title="Change Application Language"
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{currentOption.flag}</span>
        {!compact && (
          <span className="hidden sm:inline-block max-w-[80px] truncate">
            {currentOption.nativeName}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-[#795548]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-earth-xl border border-[#E0D7C6] py-1.5 z-50 animate-fadeIn">
          <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#795548] border-b border-[#E0D7C6]/60">
            Select Language
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#2E7D32]/10 text-[#2E7D32] font-bold'
                      : 'text-[#4E342E] hover:bg-[#F9F6F0]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    {lang.nativeName !== lang.name && (
                      <span className="text-[10px] text-[#795548]">({lang.name})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#2E7D32]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
