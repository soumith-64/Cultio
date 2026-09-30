'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { X, Phone, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    signInWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    isLoading,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'options' | 'phone_input' | 'otp_verify'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setAuthMode('options');
    setErrorMsg(null);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await sendPhoneOtp(phoneNumber);
    if (res.success) {
      setAuthMode('otp_verify');
    } else {
      setErrorMsg(res.error || 'Failed to send verification code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = await verifyPhoneOtp(otpCode);
    if (res.success) {
      handleClose();
    } else {
      setErrorMsg(res.error || 'Invalid code. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4E342E]/55 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-earth-xl relative">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#E0D7C6] flex items-center justify-center text-[#795548] hover:bg-[#F9F6F0] cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#2E7D32]/10 text-[#2E7D32] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-[#4E342E]">
            Sign in to Cultivo
          </h2>
          <p className="text-sm text-[#795548] mt-1">
            Access intelligent crop health diagnostics and agronomist reviews.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Options Screen */}
        {authMode === 'options' && (
          <div className="space-y-3.5">
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-[#E0D7C6] bg-[#FFFFFF] hover:bg-[#F9F6F0] text-[#4E342E] font-semibold text-base shadow-sm transition-all cursor-pointer min-h-[48px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-[#E0D7C6] w-full" />
              <span className="bg-[#FFFFFF] px-3 text-xs uppercase tracking-wider text-[#795548] font-semibold">
                Or
              </span>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setAuthMode('phone_input')}
              leftIcon={<Phone className="w-5 h-5 text-[#2E7D32]" />}
            >
              Continue with Phone Number
            </Button>
          </div>
        )}

        {/* Phone Input Screen */}
        {authMode === 'phone_input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#4E342E] mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] placeholder-[#795548]/50 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-[#795548] mt-1.5">
                We will send a 6-digit confirmation code via SMS.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode('options')}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send OTP
              </Button>
            </div>
          </form>
        )}

        {/* OTP Verification Screen */}
        {authMode === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#4E342E] mb-1.5">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-bold px-4 py-3 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                required
                autoFocus
              />
              <div className="flex justify-between items-center text-xs text-[#795548] mt-2">
                <span>Code sent to {phoneNumber}</span>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[#2E7D32] font-semibold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode('phone_input')}
                className="flex-1"
              >
                Change Number
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
                rightIcon={<Check className="w-4 h-4" />}
              >
                Verify & Sign In
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
