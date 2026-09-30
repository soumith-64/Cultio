'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';
import {
  X,
  Mail,
  ShieldCheck,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Award,
  KeyRound,
} from 'lucide-react';
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
    sendPhoneOtp,
    verifyPhoneOtp,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>(initialRole || 'farmer');
  
  // Farmer authentication method: phone (default) vs email
  const [farmerAuthMethod, setFarmerAuthMethod] = useState<'phone' | 'email'>('phone');
  
  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneSuccessMsg, setPhoneSuccessMsg] = useState<string | null>(null);

  // Email & Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
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
    setOtpSent(false);
    setOtpCode('');
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    const fullNumber = cleaned.startsWith('91') && cleaned.length > 10 ? `+${cleaned}` : `+91${cleaned}`;
    const res = await sendPhoneOtp(fullNumber);
    if (res.success) {
      setOtpSent(true);
      setPhoneSuccessMsg(`Verification code sent to ${fullNumber}`);
    } else {
      setErrorMsg(res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    const res = await verifyPhoneOtp(otpCode.trim());
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid OTP code.');
    }
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
          className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-earth-xl relative my-auto text-left"
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
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F9F6F0] rounded-2xl border border-[#E0D7C6] mb-4">
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
            <div className="w-10 h-10 bg-[#2E7D32]/10 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
              {role === 'expert'
                ? mode === 'signin'
                  ? 'Agronomist Terminal Sign In'
                  : 'Register Expert Account'
                : 'Cultivator Sign In / Register'}
            </h2>
            <p className="text-xs text-[#795548] mt-0.5">
              {role === 'expert'
                ? 'Clinical access for certified crop advisors and ICAR researchers.'
                : 'Sign in with your mobile phone or email to access crop health diagnostics.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-3 p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: FARMER / CULTIVATOR AUTHENTICATION                     */}
          {/* ============================================================== */}
          {role === 'farmer' && (
            <div className="space-y-3.5">
              {/* Farmer Sub-Tabs: Phone (Primary) vs Email */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F9F6F0] rounded-xl border border-[#E0D7C6]">
                <button
                  type="button"
                  onClick={() => {
                    setFarmerAuthMethod('phone');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    farmerAuthMethod === 'phone'
                      ? 'bg-white text-[#2E7D32] shadow-xs border border-[#E0D7C6]/60'
                      : 'text-[#795548] hover:text-[#4E342E]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span>Mobile Phone</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFarmerAuthMethod('email');
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    farmerAuthMethod === 'email'
                      ? 'bg-white text-[#2E7D32] shadow-xs border border-[#E0D7C6]/60'
                      : 'text-[#795548] hover:text-[#4E342E]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-[#795548]" />
                  <span>Email & Password</span>
                </button>
              </div>

              {/* METHOD A: DIRECT MOBILE PHONE NUMBER & OTP */}
              {farmerAuthMethod === 'phone' && (
                <div className="space-y-3">
                  {!otpSent ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                          Mobile Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-xs font-bold text-[#4E342E] shrink-0">
                            <span>🇮🇳 +91</span>
                          </div>
                          <input
                            type="tel"
                            placeholder="Enter 10-digit mobile number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            maxLength={10}
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] placeholder-[#795548]/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isLoading}
                        className="w-full font-bold shadow-earth"
                      >
                        Send Verification OTP
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 animate-fadeIn">
                      {phoneSuccessMsg && (
                        <div className="p-2.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/25 text-[#2E7D32] text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                          <span>{phoneSuccessMsg}</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#795548]">
                            Enter 6-Digit OTP Code
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                            className="text-[11px] text-[#2E7D32] hover:underline font-semibold cursor-pointer"
                          >
                            Change Number
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          maxLength={6}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-center text-lg font-mono tracking-widest font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                          required
                        />
                        <span className="block text-[11px] text-[#795548] mt-1 text-center">
                          Demo test code: <code className="font-mono font-bold text-[#2E7D32]">123456</code>
                        </span>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isLoading}
                        className="w-full font-bold shadow-earth"
                      >
                        Verify OTP & Sign In
                      </Button>
                    </form>
                  )}

                  {/* 1-Tap Instant WhatsApp / SMS Verification via Phone.Email */}
                  <div className="pt-1">
                    <div className="relative my-2.5 flex items-center justify-center">
                      <div className="border-t border-[#E0D7C6] w-full" />
                      <span className="bg-[#FFFFFF] px-2.5 text-[10px] uppercase tracking-wider text-[#795548] font-bold">
                        Or 1-Tap Instant Verification
                      </span>
                    </div>

                    <PhoneEmailButton
                      clientId="13311688567845248231"
                      onSuccess={handlePhoneSuccess}
                      disabled={isLoading || isVerifyingPhone}
                    />
                  </div>
                </div>
              )}

              {/* METHOD B: EMAIL & PASSWORD FORM */}
              {farmerAuthMethod === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-3 animate-fadeIn">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Ravi Kumar"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="farmer@field.agri"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="w-full font-bold shadow-earth"
                  >
                    {mode === 'signin' ? 'Sign In with Email' : 'Create Cultivator Account'}
                  </Button>

                  <div className="text-center text-xs text-[#795548] pt-1">
                    {mode === 'signin' ? (
                      <span>
                        New cultivator?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="font-bold text-[#2E7D32] hover:underline cursor-pointer"
                        >
                          Register here
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
                </form>
              )}

              {/* Google Continue (Always available for farmers) */}
              <div className="relative my-2.5 flex items-center justify-center">
                <div className="border-t border-[#E0D7C6] w-full" />
                <span className="bg-[#FFFFFF] px-2.5 text-[10px] uppercase tracking-wider text-[#795548] font-bold">
                  Or with Google
                </span>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading || isVerifyingPhone}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] text-[#4E342E] font-semibold text-xs shadow-2xs transition-all cursor-pointer min-h-[42px]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: AGRICULTURAL EXPERT AUTHENTICATION                      */}
          {/* ============================================================== */}
          {role === 'expert' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* SAMPLE EXPERT CREDENTIALS CALLOUT FOR EVALUATORS */}
              <div className="p-3.5 rounded-2xl bg-[#FFF8E1] border-2 border-[#FFE082] space-y-2">
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

              {/* Expert Email & Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Dr. Priya Sharma"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="expert@cultivo.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#795548] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                    required
                    minLength={6}
                  />
                </div>

                {mode === 'signup' && (
                  <div className="p-3.5 rounded-2xl bg-[#2E7D32]/5 border border-[#2E7D32]/20 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5" />
                      <span>Accreditation Details</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                        Specialization
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                      >
                        <option>Plant Pathology & Crop Health</option>
                        <option>Soil Microbiology & Fertility</option>
                        <option>Entomology & Pest Diagnostics</option>
                        <option>Horticulture & Canopy Architecture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                        License Number / Accreditation Passkey
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ICAR-EXP-2026"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#795548] mb-0.5">
                        Institution / Research Station
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Indian Council of Agricultural Research"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7C6] bg-white text-xs text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="w-full font-bold shadow-earth"
                >
                  {mode === 'signin' ? 'Sign In as Accredited Expert' : 'Register Agronomist Account'}
                </Button>
              </form>

              <div className="text-center text-xs text-[#795548]">
                {mode === 'signin' ? (
                  <span>
                    New agronomist?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-bold text-[#2E7D32] hover:underline cursor-pointer"
                    >
                      Register accreditation
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
          )}
        </div>
      </div>
    </div>
  );
};
