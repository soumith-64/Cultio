'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sprout,
  Camera,
  ShieldCheck,
  User,
  History,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: any) => void;
  onStartScan: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onStartScan,
  onOpenProfile,
}) => {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const { t } = useLanguage();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E0D7C6] px-3 py-1.5 shadow-earth-lg"
      aria-label="Mobile Navigation Bar"
    >
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('farmer')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            currentView === 'farmer' || currentView === 'landing'
              ? 'text-[#2E7D32] font-bold'
              : 'text-[#795548] hover:text-[#4E342E]'
          }`}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t('plots')}</span>
        </button>

        {/* Center Elevate Action: Live Field Scan */}
        <button
          onClick={onStartScan}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
          title="Start Live Specimen Camera Capture"
          aria-label="Capture Specimen Photo"
        >
          <div className="w-13 h-13 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-earth-lg border-3 border-white group-hover:bg-[#1B5E20] group-hover:scale-105 active:scale-95 transition-all">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-extrabold text-[#2E7D32] mt-0.5 tracking-tight">
            {t('ai_scan')}
          </span>
        </button>

        {/* Expert Portal Direct Link (Expert Role Only) */}
        {user?.role === 'expert' && (
          <Link
            href="/expert"
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#795548] hover:text-[#2E7D32] transition-all cursor-pointer"
            title="Dedicated Expert Agronomist Portal"
          >
            <ShieldCheck className="w-5 h-5 mb-0.5 text-[#2E7D32]" />
            <span className="text-[10px] font-bold tracking-tight">Expert</span>
          </Link>
        )}

        {/* User Profile */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              onOpenProfile();
            } else {
              setShowAuthModal(true);
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            isAuthenticated ? 'text-[#4E342E]' : 'text-[#795548]'
          }`}
        >
          <div className="relative">
            {isAuthenticated && user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-5 h-5 rounded-full object-cover border border-[#2E7D32] mb-0.5"
              />
            ) : (
              <User className="w-5 h-5 mb-0.5" />
            )}
            {isAuthenticated && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2E7D32]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight font-medium">
            {isAuthenticated ? t('profile') : t('sign_in')}
          </span>
        </button>
      </div>
    </nav>
  );
};
