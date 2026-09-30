'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/config/firebase';
import { useLanguage } from '@/context/LanguageContext';
import {
  X,
  User,
  ShieldCheck,
  Sprout,
  LogOut,
  Mail,
  Award,
  Calendar,
  CheckCircle2,
  Cloud,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut, selectRole, isApprovedExpert, verifyAndElevateExpert } = useAuth();
  const { t } = useLanguage();
  const [showVerification, setShowVerification] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const isExpert = user.role === 'expert' && isApprovedExpert;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleToggleRole = async () => {
    if (!isApprovedExpert) return;
    const nextRole = isExpert ? 'farmer' : 'expert';
    await selectRole(nextRole);
  };

  const handleVerifyKey = async () => {
    if (!accessKey.trim()) return;
    setIsVerifying(true);
    setVerificationError(null);
    try {
      const res = await verifyAndElevateExpert(accessKey.trim());
      if (res.success) {
        setShowVerification(false);
        setAccessKey('');
      } else {
        setVerificationError(res.error || 'Verification failed. ID or passkey is invalid.');
      }
    } catch {
      setVerificationError('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-6 text-center">
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-earth-xl border border-[#E0D7C6] overflow-hidden flex flex-col my-auto text-left relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner - Compact and always in view */}
          <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] px-5 py-4 sm:px-6 sm:py-5 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white overflow-hidden shadow-inner flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 id="profile-modal-title" className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                    {user.displayName || (isExpert ? 'Dr. Agronomist' : 'Field Cultivator')}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                    isExpert ? 'bg-[#F57C00] text-white' : 'bg-[#81C784]/30 text-white'
                  }`}
                >
                  {isExpert ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      Certified Agronomist
                    </>
                  ) : (
                    <>
                      <Sprout className="w-3 h-3" />
                      Field Farmer
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Body with proper max-height so it never overflows offscreen */}
          <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto max-h-[55vh]">
            {/* Account Details */}
            <div className="bg-[#F9F6F0] rounded-2xl p-3.5 sm:p-4 border border-[#E0D7C6] space-y-2">
              <div className="text-[11px] font-extrabold text-[#795548] uppercase tracking-wider">
                Account Credentials
              </div>

              {user.email && (
                <div className="flex items-center gap-2.5 text-xs text-[#4E342E]">
                  <Mail className="w-4 h-4 text-[#2E7D32] shrink-0" />
                  <span className="font-semibold truncate">{user.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 text-xs text-[#795548]">
                <Calendar className="w-4 h-4 text-[#795548] shrink-0" />
                <span>
                  Account ID: <code className="font-mono text-[11px] text-[#4E342E]">{user.uid.slice(0, 14)}...</code>
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#2E7D32] font-semibold pt-1 border-t border-[#E0D7C6]/60">
                <Cloud className="w-4 h-4 shrink-0" />
                <span>{isFirebaseConfigured ? 'Live Cloud Firestore Connected' : 'Local Real-Time Active'}</span>
              </div>
            </div>

            {/* Role Accreditation or Farm Profile */}
            {isExpert ? (
              <div className="bg-[#FFF8E1] rounded-2xl p-3.5 sm:p-4 border border-[#FFE082] space-y-2">
                <div className="text-[11px] font-extrabold text-[#F57C00] uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Agronomist Accreditation
                </div>
                <div className="text-xs text-[#4E342E] space-y-1">
                  <div>
                    <span className="text-[#795548] font-medium">Specialization:</span>{' '}
                    <span className="font-bold">{user.specialization || 'Plant Pathology & Crop Protection'}</span>
                  </div>
                  <div>
                    <span className="text-[#795548] font-medium">License / ID:</span>{' '}
                    <span className="font-bold font-mono">{user.licenseNumber || 'CCA-REG-ACTIVE'}</span>
                  </div>
                  <div>
                    <span className="text-[#795548] font-medium">Institution:</span>{' '}
                    <span className="font-bold">{user.institution || 'State Agricultural Extension'}</span>
                  </div>
                </div>
                <Link
                  href="/expert"
                  onClick={onClose}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#F57C00] hover:text-[#E65100]"
                >
                  <span>Open Agronomist Command Terminal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="bg-[#E8F5E9] rounded-2xl p-3.5 sm:p-4 border border-[#C8E6C9] space-y-1.5">
                <div className="text-[11px] font-extrabold text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Field Cultivator Status
                </div>
                <p className="text-xs text-[#4E342E] leading-relaxed">
                  Enabled for live specimen camera captures, microclimate telemetry, and direct escalation to certified agronomists.
                </p>
              </div>
            )}

            {/* Role Management: Approved Experts vs Standard Users */}
            <div className="pt-1">
              {isApprovedExpert ? (
                <button
                  onClick={handleToggleRole}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] text-xs font-bold text-[#4E342E] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {isExpert ? <Sprout className="w-4 h-4 text-[#2E7D32]" /> : <ShieldCheck className="w-4 h-4 text-[#F57C00]" />}
                    <span>Switch to {isExpert ? 'Field Farmer Workspace' : 'Agronomist Command Terminal'}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#795548]" />
                </button>
              ) : (
                <div>
                  {!showVerification ? (
                    <button
                      onClick={() => setShowVerification(true)}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-dashed border-[#E0D7C6] hover:border-[#2E7D32] bg-white hover:bg-[#F9F6F0] text-xs font-semibold text-[#795548] transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                        <span>Accredited Agronomist Verification</span>
                      </span>
                      <span className="text-[11px] font-bold text-[#2E7D32]">Verify ID →</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#2E7D32]/25 space-y-2.5 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-[#2E7D32] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Enter Approved Agronomist ID</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowVerification(false);
                            setVerificationError(null);
                          }}
                          className="text-[11px] text-[#795548] hover:text-[#4E342E] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-[11px] text-[#795548] leading-tight">
                        Enter your approved institutional ID (e.g. @icar.gov.in) or accreditation passkey.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Passkey (e.g. ICAR-EXP-2026)"
                          value={accessKey}
                          onChange={(e) => setAccessKey(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E0D7C6] bg-white text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyKey}
                          disabled={isVerifying || !accessKey.trim()}
                          className="px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-bold rounded-lg hover:bg-[#1B5E20] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isVerifying ? 'Checking...' : 'Unlock'}
                        </button>
                      </div>
                      {verificationError && (
                        <p className="text-[11px] text-[#D32F2F] font-semibold">{verificationError}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Always docked and visible */}
          <div className="p-3.5 sm:p-4 bg-[#F9F6F0] border-t border-[#E0D7C6] flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E0D7C6] text-xs font-bold text-[#4E342E] hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 py-2.5 rounded-xl bg-[#D32F2F]/10 hover:bg-[#D32F2F] text-[#D32F2F] hover:text-white border border-[#D32F2F]/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('sign_out')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
