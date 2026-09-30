'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  Sprout,
  Camera,
  MapPin,
  CloudSun,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onStartDiagnosis: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDiagnosis }) => {
  const { setShowAuthModal, isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#FDFBF7] to-[#F5EFE6] border border-[#E0D7C6] rounded-3xl p-6 sm:p-12 shadow-earth-lg text-center">
        {/* Soft natural radial glows */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#81C784]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#F57C00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#81C784]/20 border border-[#81C784]/40 text-[#2E7D32] text-xs font-bold uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-[#2E7D32]" />
            <span>Intelligent Agricultural Instrument</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#4E342E] tracking-tight leading-[1.15]">
            Protect Your Crops With <span className="text-[#2E7D32]">Scientific Certainty</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#795548] leading-relaxed max-w-xl mx-auto">
            Cultivo connects your field photos with local weather and soil intelligence to diagnose crop ailments and prescribe proven organic and targeted treatments.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Button
              variant="primary"
              size="xl"
              onClick={onStartDiagnosis}
              className="w-full sm:w-auto font-black shadow-earth hover:shadow-earth-lg"
              leftIcon={<Camera className="w-6 h-6" />}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start Crop Diagnosis
            </Button>

            {!isAuthenticated ? (
              <Button
                variant="secondary"
                size="xl"
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto font-semibold"
              >
                Sign In
              </Button>
            ) : (
              <div className="text-xs font-semibold text-[#2E7D32] bg-[#81C784]/20 px-4 py-3 rounded-2xl border border-[#81C784]/40 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Signed in as {user?.displayName} ({user?.role})</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-[#795548] font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              No Data Reselling
            </span>
            <span className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-[#F57C00]" />
              OpenWeather & Soil Intelligence
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#2E7D32]" />
              Human Agronomist Escalation
            </span>
          </div>
        </div>
      </section>

      {/* CORE PRODUCT EXPERIENCE: CAPTURE → LOCATE → UNDERSTAND → ANALYZE → DIAGNOSE → RECOMMEND → ESCALATE */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
            Evidence-Based Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4E342E] mt-1">
            How Cultivo Works in the Field
          </h2>
          <p className="text-sm text-[#795548] mt-1">
            Combining visual plant symptoms with environmental drivers for genuine agronomical accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 shadow-earth space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold text-lg">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D32]">
              Step 1 • Visual Capture
            </span>
            <h3 className="text-lg font-bold text-[#4E342E]">
              Photograph Affected Leaves
            </h3>
            <p className="text-xs sm:text-sm text-[#795548] leading-relaxed">
              Take a close-up photo of leaf spots, rust pustules, or wilting stems directly from your mobile browser without installing bulky native apps.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 shadow-earth space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F57C00]/10 text-[#F57C00] flex items-center justify-center font-bold text-lg">
              <CloudSun className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#F57C00]">
              Step 2 • Environment & Soil
            </span>
            <h3 className="text-lg font-bold text-[#4E342E]">
              Retrieve Field Telemetry
            </h3>
            <p className="text-xs sm:text-sm text-[#795548] leading-relaxed">
              Cultivo detects coordinates and concurrently pulls microclimate temperature, relative humidity, and soil pH to correlate environmental triggers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 shadow-earth space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold text-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E7D32]">
              Step 3 • Human Agronomist
            </span>
            <h3 className="text-lg font-bold text-[#4E342E]">
              Escalate to Real Experts
            </h3>
            <p className="text-xs sm:text-sm text-[#795548] leading-relaxed">
              Receive structured AI recommendations immediately, with 1-tap escalation to certified human agronomists who verify diagnoses in real time.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FOOTER BANNER */}
      <section className="bg-[#2E7D32] text-white rounded-3xl p-8 sm:p-10 text-center shadow-earth-xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">
          Ready to Inspect Your First Crop?
        </h2>
        <p className="text-white/80 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Open the camera, locate your plot, and get a complete scientific action plan in seconds.
        </p>
        <div className="pt-2">
          <Button
            variant="accent"
            size="lg"
            onClick={onStartDiagnosis}
            className="font-bold shadow-lg"
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Launch Field Instrument Now
          </Button>
        </div>
      </section>
    </div>
  );
};
