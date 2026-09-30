'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { X, Mail, ShieldCheck, Lock, User, Briefcase, Award, Building, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialRole }) => {
  const {
    showAuthModal,
    setShowAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>(initialRole || 'farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Expert-specific registration fields
  const [specialization, setSpecialization] = useState('Plant Pathology & Crop Health');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [institution, setInstitution] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg(null);
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    const res = await signInWithGoogle(role);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'signin') {
      const res = await signInWithEmail(email, password);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } else {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const res = await signUpWithEmail(email, password, displayName, role, {
        specialization: role === 'expert' ? specialization : undefined,
        licenseNumber: role === 'expert' ? licenseNumber : undefined,
        institution: role === 'expert' ? institution : undefined,
      });
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4E342E]/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-earth-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#E0D7C6] flex items-center justify-center text-[#795548] hover:bg-[#F9F6F0] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#4E342E]">
            {mode === 'signin' ? 'Sign in to Cultivo' : 'Create Cultivo Account'}
          </h2>
          <p className="text-xs sm:text-sm text-[#795548] mt-1">
            {role === 'expert'
              ? 'Access the Certified Agronomist Terminal to verify field cases.'
              : 'Access real-time crop disease diagnostics and field intelligence.'}
          </p>
        </div>

        {/* Role Selector Pill */}
        <div className="flex bg-[#F9F6F0] p-1 rounded-2xl border border-[#E0D7C6] mb-5">
          <button
            type="button"
            onClick={() => setRole('farmer')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'farmer'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#795548] hover:text-[#4E342E]'
            }`}
          >
            Farmer Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('expert')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === 'expert'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#795548] hover:text-[#4E342E]'
            }`}
          >
            Agronomist / Expert
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-xs sm:text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Primary Google Auth */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] text-[#4E342E] font-semibold text-sm shadow-2xs transition-all cursor-pointer min-h-[46px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google ({role === 'expert' ? 'Expert' : 'Farmer'})</span>
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-[#E0D7C6] w-full" />
          <span className="bg-[#FFFFFF] px-3 text-[11px] uppercase tracking-wider text-[#795548] font-bold">
            Or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={role === 'expert' ? 'Dr. Aris Thorne' : 'Ravi Kumar'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] placeholder-[#795548]/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={role === 'expert' ? 'agronomist@extension.org' : 'farmer@field.agri'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] placeholder-[#795548]/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] placeholder-[#795548]/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Expert Professional Credentials (When registering as Expert) */}
          {mode === 'signup' && role === 'expert' && (
            <div className="p-3.5 rounded-2xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Agronomist Credentials</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                  Agronomic Specialization
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                >
                  <option>Plant Pathology & Crop Health</option>
                  <option>Soil Microbiology & Fertility</option>
                  <option>Entomology & Pest Diagnostics</option>
                  <option>Horticulture & Canopy Architecture</option>
                  <option>Precision Agronomy & Remote Sensing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                  License / Accreditation Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CCA-IN-84920"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                  Institution / Research Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. State Agricultural Extension Services"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-earth mt-2"
          >
            {mode === 'signin' ? 'Sign In with Email' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center mt-5 text-xs text-[#795548]">
          {mode === 'signin' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#2E7D32] hover:underline cursor-pointer"
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#2E7D32] hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
