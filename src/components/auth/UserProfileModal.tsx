'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/config/firebase';
import {
  X,
  User,
  ShieldCheck,
  Sprout,
  LogOut,
  Mail,
  Award,
  Building,
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
  const { user, signOut, selectRole } = useAuth();

  if (!isOpen || !user) return null;

  const isExpert = user.role === 'expert';

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleToggleRole = async () => {
    const nextRole = isExpert ? 'farmer' : 'expert';
    await selectRole(nextRole);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-earth-xl border border-[#E0D7C6] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white overflow-hidden shadow-inner">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="text-xl font-extrabold tracking-tight truncate">
                  {user.displayName || (isExpert ? 'Dr. Agronomist' : 'Field Cultivator')}
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                  isExpert ? 'bg-[#F57C00] text-white' : 'bg-[#81C784]/30 text-white'
                }`}
              >
                {isExpert ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Certified Agronomist
                  </>
                ) : (
                  <>
                    <Sprout className="w-3.5 h-3.5" />
                    Field Farmer
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Account Details */}
          <div className="bg-[#F9F6F0] rounded-2xl p-4 border border-[#E0D7C6] space-y-2.5">
            <div className="text-xs font-extrabold text-[#795548] uppercase tracking-wider">
              Account Credentials
            </div>

            {user.email && (
              <div className="flex items-center gap-2.5 text-xs text-[#4E342E]">
                <Mail className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span className="font-semibold">{user.email}</span>
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
            <div className="bg-[#FFF8E1] rounded-2xl p-4 border border-[#FFE082] space-y-2.5">
              <div className="text-xs font-extrabold text-[#F57C00] uppercase tracking-wider flex items-center gap-1.5">
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
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#F57C00] hover:text-[#E65100]"
              >
                <span>Open Agronomist Command Terminal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-[#E8F5E9] rounded-2xl p-4 border border-[#C8E6C9] space-y-2">
              <div className="text-xs font-extrabold text-[#2E7D32] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Field Cultivator Status
              </div>
              <p className="text-xs text-[#4E342E] leading-relaxed">
                Enabled for live specimen camera captures, microclimate telemetry, and direct escalation to certified agronomists.
              </p>
            </div>
          )}

          {/* Switch Role Option */}
          <div className="pt-2">
            <button
              onClick={handleToggleRole}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] text-xs font-bold text-[#4E342E] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isExpert ? <Sprout className="w-4 h-4 text-[#2E7D32]" /> : <ShieldCheck className="w-4 h-4 text-[#F57C00]" />}
                <span>Switch Role to {isExpert ? 'Field Farmer' : 'Agricultural Expert'}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#795548]" />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F9F6F0] border-t border-[#E0D7C6] flex items-center justify-between gap-3">
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
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
