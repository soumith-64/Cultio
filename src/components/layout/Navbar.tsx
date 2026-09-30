'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/config/firebase';
import Link from 'next/link';
import { Sprout, ShieldCheck, User, LogOut, ArrowLeftRight, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserProfileModal } from '@/components/auth/UserProfileModal';
import { LanguageSelector } from '@/components/layout/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

interface NavbarProps {
  currentView: 'farmer' | 'expert' | 'landing' | 'scan' | 'report';
  onNavigate: (view: 'farmer' | 'expert' | 'landing') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, signOut, setShowAuthModal, selectRole, isApprovedExpert } = useAuth();
  const { t } = useLanguage();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E0D7C6] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#2E7D32]/25 shadow-earth flex items-center justify-center bg-white group-hover:scale-105 transition-all p-0.5">
            <img src="/logo.png" alt="Cultio Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#2E7D32]">
                CULTIO
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#EFE8DC] text-[#795548]">
                SOIL • CROP
              </span>
            </div>
            <p className="text-[11px] text-[#795548] font-medium leading-tight hidden sm:block">
              Soil • Crop • Knowledge | AI Diagnostics
            </p>
          </div>
        </button>

        {/* Center / Role Navigation */}
        <div className="flex items-center gap-2">
          {/* In-App Language Selector */}
          <LanguageSelector />

          {/* Only show Expert Portal link to certified experts (never to farmers) */}
          {isApprovedExpert && user?.role === 'expert' && (
            <div className="flex items-center bg-[#F9F6F0] p-1 rounded-xl border border-[#E0D7C6]">
              <Link
                href="/expert"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2E7D32] text-white shadow-sm transition-all cursor-pointer"
                title="Open Dedicated Expert Agronomist Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span className="hidden xs:inline">{t('expert_portal')}</span>
              </Link>
            </div>
          )}

          {/* Sync Status Pill */}
          <div
            className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F9F6F0] text-[#795548] border border-[#E0D7C6]"
            title={
              isFirebaseConfigured
                ? 'Connected to Firebase Firestore Live Synchronization'
                : 'Running in Local Prototype Reactive Mode'
            }
          >
            <Cloud className="w-3 h-3 text-[#2E7D32]" />
            <span>{isFirebaseConfigured ? t('live_cloud_sync') : 'Local Live'}</span>
          </div>

          {/* User Profile / Auth Action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] transition-colors cursor-pointer group text-left"
                title="View Account & Accreditation Profile"
                aria-label="View Profile"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2E7D32]/10 border border-[#2E7D32]/20 flex items-center justify-center text-[#2E7D32] overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#4E342E] leading-tight group-hover:text-[#2E7D32] transition-colors">
                    {user?.displayName || 'Cultivator'}
                  </span>
                  <span className="text-[9px] text-[#795548] uppercase tracking-wider font-semibold">
                    {user?.role === 'expert' ? 'Agronomist' : 'Farmer'}
                  </span>
                </div>
              </button>

              <button
                onClick={signOut}
                className="w-9 h-9 rounded-xl border border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] flex items-center justify-center text-[#795548] hover:text-[#D32F2F] transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              leftIcon={<User className="w-3.5 h-3.5" />}
            >
              Sign In
            </Button>
          )}

          {/* User Profile Modal */}
          <UserProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />
        </div>
      </div>
    </header>
  );
};
