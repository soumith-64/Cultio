'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ShieldCheck, Check } from 'lucide-react';

export const RoleModal: React.FC = () => {
  const { showRoleModal, selectRole, user } = useAuth();

  if (!showRoleModal) return null;

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
              Profile Setup
            </span>
            <h2 id="role-modal-title" className="text-2xl font-bold text-[#4E342E] mt-2">
              How will you use Cultivo?
            </h2>
            <p className="text-sm text-[#795548] mt-1">
              Choose your primary perspective. You can change or test both roles at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Farmer Role Option */}
            <button
              onClick={() => selectRole('farmer')}
              className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#E0D7C6] hover:border-[#2E7D32] hover:bg-[#2E7D32]/5 bg-[#FFFFFF] transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-3xl">🌱</span>
              </div>
              <h3 className="text-lg font-bold text-[#4E342E] group-hover:text-[#2E7D32]">
                Farmer
              </h3>
              <p className="text-xs text-[#795548] mt-2 leading-relaxed">
                Capture crop photos in your field, receive instant AI disease diagnostics, and escalate cases to certified agronomists.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32]">
                <span>Select Farmer Role</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Expert Role Option */}
            <button
              onClick={() => selectRole('expert')}
              className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-[#E0D7C6] hover:border-[#2E7D32] hover:bg-[#2E7D32]/5 bg-[#FFFFFF] transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F57C00]/10 text-[#F57C00] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-3xl">👨‍🌾</span>
              </div>
              <h3 className="text-lg font-bold text-[#4E342E] group-hover:text-[#2E7D32]">
                Agricultural Expert
              </h3>
              <p className="text-xs text-[#795548] mt-2 leading-relaxed">
                Review farmer escalated reports, inspect environmental soil & weather telemetry, and provide binding agronomic notes.
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#2E7D32]">
                <span>Select Expert Role</span>
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
