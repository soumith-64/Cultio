'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/config/firebase';
import Link from 'next/link';
import { Sprout, ShieldCheck, User, LogOut, ArrowLeftRight, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  currentView: 'farmer' | 'expert' | 'landing' | 'scan' | 'report';
  onNavigate: (view: 'farmer' | 'expert' | 'landing') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated, signOut, setShowAuthModal, selectRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E0D7C6] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white shadow-earth group-hover:bg-[#1B5E20] transition-colors">
            <Sprout className="w-6 h-6 text-[#81C784]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#2E7D32]">
                CULTIVO
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#EFE8DC] text-[#795548]">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#795548] font-medium leading-tight hidden sm:block">
              AI Agricultural Diagnostics & Decision Support
            </p>
          </div>
        </button>

        {/* Center / Role Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F9F6F0] p-1 rounded-xl border border-[#E0D7C6]">
            <button
              onClick={() => {
                selectRole('farmer');
                onNavigate('farmer');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === 'farmer' || user?.role === 'farmer'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#4E342E] hover:bg-[#EFE8DC]'
              }`}
              title="Farmer Diagnostic Workspace"
            >
              <Sprout className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Farmer Portal</span>
            </button>

            <Link
              href="/expert"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#4E342E] hover:bg-[#EFE8DC] transition-all cursor-pointer"
              title="Open Dedicated Expert Agronomist Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="hidden xs:inline">Expert Portal</span>
            </Link>
          </div>

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
            <span>{isFirebaseConfigured ? 'Live Cloud Sync' : 'Local Real-Time'}</span>
          </div>

          {/* User Profile / Auth Action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#4E342E] leading-tight">
                  {user?.displayName || 'Active Cultivator'}
                </span>
                <span className="text-[10px] text-[#795548] uppercase tracking-wider">
                  {user?.role === 'expert' ? 'Agronomist' : 'Farmer'}
                </span>
              </div>
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
        </div>
      </div>
    </header>
  );
};
