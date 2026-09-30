'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, MapPin, Camera, Database, FileSpreadsheet, Lock } from 'lucide-react';

export const PrivacyConsentModal: React.FC = () => {
  const { showConsentModal, grantPrivacyConsent, declinePrivacyConsent } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!showConsentModal || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] overflow-y-auto bg-[#4E342E]/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="flex min-h-full items-center justify-center py-6 text-center">
        <div
          className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-earth-xl my-auto text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with lock / privacy badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-xl sm:text-2xl font-bold text-[#4E342E]">
                Privacy & Hardware Consent
              </h2>
              <p className="text-xs text-[#795548]">
                Transparency in how Cultivo uses your device permissions
              </p>
            </div>
          </div>

          {/* Required Wording Callout */}
          <div className="p-4 rounded-2xl bg-[#81C784]/15 border-2 border-[#81C784]/50 my-4 text-[#2E7D32] font-semibold text-base sm:text-lg leading-snug flex items-start gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
            <blockquote>
              &ldquo;Your location and photos are strictly used to analyze your soil and crops. We do not sell your data.&rdquo;
            </blockquote>
          </div>

          {/* Explanations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 text-left text-sm text-[#4E342E]">
            <div className="p-3.5 rounded-xl bg-[#F9F6F0] border border-[#E0D7C6]">
              <div className="flex items-center gap-2 font-bold text-[#2E7D32] mb-1">
                <MapPin className="w-4 h-4 text-[#F57C00]" />
                <span>Why Location is Required</span>
              </div>
              <p className="text-xs text-[#795548] leading-relaxed">
                Coordinates retrieve your local microclimatic temperature, atmospheric humidity, and soil profile (pH, texture) necessary for scientific diagnosis.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9F6F0] border border-[#E0D7C6]">
              <div className="flex items-center gap-2 font-bold text-[#2E7D32] mb-1">
                <Camera className="w-4 h-4 text-[#2E7D32]" />
                <span>Why Camera is Required</span>
              </div>
              <p className="text-xs text-[#795548] leading-relaxed">
                Direct photo capture allows AI computer vision and agronomists to inspect leaf lesions, pustules, discoloration, and pest activity.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9F6F0] border border-[#E0D7C6]">
              <div className="flex items-center gap-2 font-bold text-[#795548] mb-1">
                <Database className="w-4 h-4 text-[#795548]" />
                <span>Where Images are Stored</span>
              </div>
              <p className="text-xs text-[#795548] leading-relaxed">
                Photographs are safely encrypted in your personal Firebase Storage bucket. They are never published publicly or shared with commercial advertisers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F9F6F0] border border-[#E0D7C6]">
              <div className="flex items-center gap-2 font-bold text-[#2E7D32] mb-1">
                <FileSpreadsheet className="w-4 h-4 text-[#2E7D32]" />
                <span>How Reports are Used</span>
              </div>
              <p className="text-xs text-[#795548] leading-relaxed">
                Reports compile an actionable treatment plan for you and facilitate professional verification when you escalate to human agricultural experts.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={declinePrivacyConsent}
              className="flex-1 text-sm"
            >
              Decline (Use Approximate Zone)
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={grantPrivacyConsent}
              className="flex-1 font-bold shadow-earth"
            >
              Allow & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
