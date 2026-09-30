'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ShieldCheck, Check, Lock, ArrowRight } from 'lucide-react';

export const RoleModal: React.FC = () => {
  const { showRoleModal, selectRole, isApprovedExpert, verifyAndElevateExpert } = useAuth();
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!showRoleModal) return null;

  const handleSelectExpert = async () => {
    if (isApprovedExpert) {
      await selectRole('expert');
    } else {
      setShowKeyPrompt(true);
    }
  };

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setIsVerifying(true);
    setKeyError(null);

    const res = await verifyAndElevateExpert(keyInput.trim());
    setIsVerifying(false);
    if (res.success) {
      setShowKeyPrompt(false);
    } else {
      setKeyError(res.error || 'Authorization failed. This ID is not in the approved expert registry.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#4E342E]/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-modal-title"
    >
      <div className="flex min-h-full items-center justify-center py-6 text-center">
        <div
          className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-earth-xl my-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#81C784]/25 text-[#2E7D32]">
              Workspace Setup
            </span>
            <h2 id="role-modal-title" className="text-2xl font-bold text-[#4E342E] mt-2">
              Welcome to Cultio
            </h2>
            <p className="text-xs sm:text-sm text-[#795548] mt-1">
              Cultio delivers real-time AI disease diagnostics and field microclimate telemetry for cultivators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Farmer Role Option - Primary for all users */}
            <button
              onClick={() => selectRole('farmer')}
              className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#2E7D32] bg-[#2E7D32]/5 hover:bg-[#2E7D32]/10 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#2E7D32]/15 text-[#2E7D32] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-lg font-bold text-[#2E7D32]">
                Field Farmer
              </h3>
              <p className="text-xs text-[#795548] mt-2 leading-relaxed">
                Capture live crop specimen photos, receive instant AI diagnostics, and escalate cases to agronomists.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32]">
                <span>Launch Farmer Workspace</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Expert Role Option - Accredited Only */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#E0D7C6] bg-white relative">
              <div className="w-16 h-16 rounded-2xl bg-[#F9F6F0] text-[#795548] flex items-center justify-center mb-3">
                {isApprovedExpert ? <span className="text-3xl">👨‍🌾</span> : <Lock className="w-7 h-7 text-[#795548]" />}
              </div>
              <h3 className="text-lg font-bold text-[#4E342E]">
                Agronomist Terminal
              </h3>
              <p className="text-xs text-[#795548] mt-2 leading-relaxed">
                {isApprovedExpert
                  ? 'Access the clinical terminal to review escalated field scans and issue prescriptions.'
                  : 'Restricted to ICAR-certified researchers and authorized institutional agronomists.'}
              </p>

              {!showKeyPrompt ? (
                <button
                  type="button"
                  onClick={handleSelectExpert}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#795548] hover:text-[#2E7D32] transition-colors cursor-pointer"
                >
                  <span>{isApprovedExpert ? 'Open Terminal' : 'Accredited Passkey Required'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <form onSubmit={handleVerifyKey} className="mt-3 w-full space-y-2 animate-fadeIn text-left">
                  <input
                    type="text"
                    placeholder="Enter ID / Passkey"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] focus:outline-none focus:ring-1 focus:ring-[#2E7D32]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="flex-1 py-1 bg-[#2E7D32] text-white text-[11px] font-bold rounded-md hover:bg-[#1B5E20] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Unlock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowKeyPrompt(false)}
                      className="px-2 py-1 text-[11px] text-[#795548] hover:text-[#4E342E]"
                    >
                      Cancel
                    </button>
                  </div>
                  {keyError && (
                    <p className="text-[10px] text-[#D32F2F] font-semibold">{keyError}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
