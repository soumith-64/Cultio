import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#E0D7C6] bg-[#FFFFFF] py-8 text-[#795548]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 flex items-center justify-center text-[#2E7D32]">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-[#4E342E]">
            Cultivo Agricultural Intelligence
          </span>
          <span className="text-xs text-[#795548] hidden md:inline">
            — Evidence-based decision support for farmers
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
            Privacy Guaranteed
          </span>
          <span className="inline-flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5 text-[#F57C00]" />
            Agronomist Backed
          </span>
          <span>© {new Date().getFullYear()} Cultivo</span>
        </div>
      </div>
    </footer>
  );
};
