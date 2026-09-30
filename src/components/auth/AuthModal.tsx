'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import { X, Mail, ShieldCheck, Lock, User, Briefcase, Award, Building, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { PhoneEmailButton } from './PhoneEmailButton';

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
    loginWithPhoneEmail,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>(initialRole || 'farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneSuccessMsg, setPhoneSuccessMsg] = useState<string | null>(null);
  
  // Expert-specific registration fields
  const [specialization, setSpecialization] = useState('Plant Pathology & Crop Health');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [institution, setInstitution] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setErrorMsg(null);
  };

  const handleInstantDemoExpertLogin = async () => {
    setErrorMsg(null);
    setEmail('expert@cultivo.ai');
    setPassword('password123');
    const res = await signInWithEmail('expert@cultivo.ai', 'password123');
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handleFillDemoExpertDetails = () => {
    setEmail('expert@cultivo.ai');
    setPassword('password123');
    setDisplayName('Dr. Priya Sharma');
    setSpecialization('Plant Pathology & Crop Health');
    setLicenseNumber('ICAR-EXP-2026');
    setInstitution('Indian Council of Agricultural Research (ICAR)');
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    const res = await signInWithGoogle(role);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  const handlePhoneSuccess = async (userJsonUrl: string) => {
    setIsVerifyingPhone(true);
    setErrorMsg(null);
    setPhoneSuccessMsg('Phone verified! Fetching authenticated profile...');
    try {
      const res = await loginWithPhoneEmail(userJsonUrl);
      if (!res.success && res.error) {
        setErrorMsg(res.error);
        setPhoneSuccessMsg(null);
      }
    } catch {
      setErrorMsg('Failed to complete phone login. Please try again.');
      setPhoneSuccessMsg(null);
    } finally {
      setIsVerifyingPhone(false);
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
        licenseNumber: role === 'expert' ? (licenseNumber || 'ICAR-EXP-2026') : undefined,
        institution: role === 'expert' ? (institution || 'Indian Council of Agricultural Research') : undefined,
      });
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#4E342E]/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div className="flex min-h-full items-center justify-center py-6 text-center">
        <div
          className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-earth-xl relative my-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#E0D7C6] flex items-center justify-center text-[#795548] hover:bg-[#F9F6F0] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* TWO DEDICATED TABS: Normal Person (Farmer) vs Agricultural Expert */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F9F6F0] rounded-2xl border border-[#E0D7C6] mb-5">
            <button
              type="button"
              onClick={() => {
                setRole('farmer');
                setErrorMsg(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'farmer'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#795548] hover:text-[#4E342E] hover:bg-white/60'
              }`}
            >
              <span>🌱</span>
              <span className="truncate">Farmer / Cultivator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('expert');
                setErrorMsg(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'expert'
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'text-[#795548] hover:text-[#4E342E] hover:bg-white/60'
              }`}
            >
              <span>🔬</span>
              <span className="truncate">Agricultural Expert</span>
            </button>
          </div>

          {/* Modal Header */}
          <div className="text-center mb-4">
            <div className="w-11 h-11 bg-[#2E7D32]/10 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto mb-2.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
              {role === 'expert'
                ? mode === 'signin'
                  ? 'Agronomist Terminal Sign In'
                  : 'Register Expert Account'
                : mode === 'signin'
                ? 'Sign in as Field Cultivator'
                : 'Create Cultivator Account'}
            </h2>
            <p className="text-xs text-[#795548] mt-1">
              {role === 'expert'
                ? 'Clinical access for certified crop advisors, plant pathologists, and ICAR researchers.'
                : 'Access live crop disease diagnostics, soil telemetry, and verified field reports.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-xs sm:text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* SAMPLE EXPERT CREDENTIALS CALLOUT (UNDER EXPERT TAB) */}
          {role === 'expert' && (
            <div className="p-3.5 rounded-2xl bg-[#FFF8E1] border-2 border-[#FFE082] mb-4 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E65100] flex items-center gap-1.5">
                  <span>🔑</span>
                  <span>Sample Expert Login (Evaluation Ready)</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F57C00] text-white">
                  Demo
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#4E342E] bg-white/90 p-2.5 rounded-xl border border-[#FFE082]/70 font-mono">
                <div><span className="text-[#795548] font-sans font-semibold">Email:</span> expert@cultivo.ai</div>
                <div><span className="text-[#795548] font-sans font-semibold">Password:</span> password123</div>
                <div><span className="text-[#795548] font-sans font-semibold">Passkey:</span> ICAR-EXP-2026</div>
                <div><span className="text-[#795548] font-sans font-semibold">Affiliation:</span> ICAR Research</div>
              </div>

              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleInstantDemoExpertLogin}
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#1B5E20] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#81C784]" />
                  <span>⚡ Instant Sign In as Expert</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoExpertDetails}
                  className="py-2 px-3 rounded-xl border border-[#E0D7C6] bg-white text-[#4E342E] text-xs font-bold hover:bg-[#F9F6F0] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Fill Form
                </button>
              </div>
            </div>
          )}

          {/* Phone.Email Instant OTP Sign In / Register (Farmer Tab Only) */}
          {role === 'farmer' && (
            <div className="p-3.5 rounded-2xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1.5">
                  <span>📱</span>
                  <span>Instant Mobile OTP</span>
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-[#795548] leading-tight">
                Sign in or register directly using real WhatsApp or SMS OTP. No password needed.
              </p>
              <PhoneEmailButton
                clientId="13311688567845248231"
                onSuccess={handlePhoneSuccess}
                disabled={isLoading || isVerifyingPhone}
              />
              {phoneSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-[#2E7D32]/15 border border-[#2E7D32]/30 text-[#2E7D32] text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                  <span>{phoneSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-[#E0D7C6] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] uppercase tracking-wider text-[#795548] font-bold">
              {role === 'farmer' ? 'Or with Google' : 'Or with Google Account'}
            </span>
          </div>

          {/* Primary Google Auth */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading || isVerifyingPhone}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] text-[#4E342E] font-semibold text-xs shadow-2xs transition-all cursor-pointer min-h-[42px]"
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
            <span>Continue with Google</span>
          </button>

          <div className="relative my-3 flex items-center justify-center">
            <div className="border-t border-[#E0D7C6] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-[10px] uppercase tracking-wider text-[#795548] font-bold">
              Or with credentials
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
                    placeholder={role === 'expert' ? 'Dr. Priya Sharma' : 'Ravi Kumar'}
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
                  placeholder={role === 'expert' ? 'expert@cultivo.ai' : 'farmer@field.agri'}
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
              <div className="p-3.5 rounded-2xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 space-y-3 animate-fadeIn">
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
                    placeholder="e.g. ICAR-EXP-2026"
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
                    placeholder="e.g. Indian Council of Agricultural Research (ICAR)"
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
              {role === 'expert'
                ? mode === 'signin'
                  ? 'Sign In as Accredited Expert'
                  : 'Create Agronomist Account'
                : mode === 'signin'
                ? 'Sign In with Email'
                : 'Create Cultivator Account'}
            </Button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center mt-4 text-xs text-[#795548]">
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
    </div>
  );
};
