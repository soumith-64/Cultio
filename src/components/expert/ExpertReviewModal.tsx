'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CropReport, ExpertReview } from '@/types';
import { ReportsService } from '@/services/reports';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Thermometer,
  Droplets,
  Gauge,
  Layers,
  MapPin,
  Clock,
  Send,
  FileText,
} from 'lucide-react';

interface ExpertReviewModalProps {
  report: CropReport;
  onClose: () => void;
  onReviewSubmitted: (updatedReport: CropReport) => void;
}

export const ExpertReviewModal: React.FC<ExpertReviewModalProps> = ({
  report,
  onClose,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [assessment, setAssessment] = useState(
    report.expert_review?.assessment || ''
  );
  const [recommendations, setRecommendations] = useState(
    report.expert_review?.recommendations || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const diag = report.diagnosis;
  const env = report.environment;

  // Preset agronomic clinical templates
  const applyTemplate = (type: 'confirm' | 'mild' | 'healthy') => {
    if (type === 'confirm') {
      setAssessment(
        `Visual foliar lesions match ${diag?.disease_name || 'suspected pathogen'}. High ambient humidity (${env.weather.humidity}%) confirms high risk of sporulation. Lesion margin chlorosis indicates active spreading.`
      );
      setRecommendations(
        'Immediate rogueing of infected lower foliage. Cease overhead irrigation. Apply protectant copper or systemic fungicide within 24 hours. Re-scout plot in 4 days.'
      );
    } else if (type === 'mild') {
      setAssessment(
        'Visual examination shows early minor necrotic stress. Environmental conditions are within manageable thresholds; this may be early physiological stress rather than systemic blight.'
      );
      setRecommendations(
        'Monitor foliage for 48 hours before applying synthetic chemicals. Apply biological Trichoderma or neem formulation and test soil drainage.'
      );
    } else {
      setAssessment(
        'Plant foliage demonstrates healthy chlorophyll distribution and good turgor. No visible fungal pustules, bacterial ooze, or viral mosaics identified.'
      );
      setRecommendations(
        'Continue regular biological maintenance. Maintain consistent soil moisture and inspect lower leaves once per week.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment.trim() || !recommendations.trim()) {
      setErrorMsg('Please provide both clinical assessment and actionable recommendations.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const review: ExpertReview = {
      expert_uid: user?.uid || 'expert_verified_01',
      expert_name: user?.displayName || 'Dr. K. Swaminathan, Agronomist',
      expert_title: 'Senior Agricultural Scientist & Plant Pathologist',
      assessment: assessment.trim(),
      recommendations: recommendations.trim(),
      reviewed_at: new Date().toISOString(),
    };

    try {
      await ReportsService.submitExpertReview(report.id, review);
      const updated: CropReport = {
        ...report,
        expert_review: review,
        status: 'EXPERT_REVIEWED',
        updated_at: new Date().toISOString(),
      };
      onReviewSubmitted(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-[#4E342E]/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFFFFF] border-2 border-[#2E7D32]/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-earth-xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-[#E0D7C6] bg-gradient-to-r from-[#FFFFFF] to-[#F9F6F0] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#81C784]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32]">
                Agricultural Expert Review Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
                Review Case: {diag?.plant_type || 'Crop Specimen'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[#E0D7C6] flex items-center justify-center text-[#795548] hover:bg-[#EFE8DC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/30 text-[#B71C1C] text-sm">
              {errorMsg}
            </div>
          )}

          {/* TWO COLUMN GRID: Left = Crop Photo & Telemetry, Right = AI Diagnosis & Review Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Large Crop Image & Environmental Context */}
            <div className="space-y-4">
              {/* Large Crop Image */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0D7C6] bg-[#F9F6F0] aspect-[4/3] shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={report.image_url}
                  alt={diag?.plant_type || 'Crop Specimen'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2.5 py-1 rounded text-xs font-bold">
                  Specimen Photo
                </div>
              </div>

              {/* Environmental Telemetry */}
              <div className="bg-[#F9F6F0] p-4 rounded-2xl border border-[#E0D7C6] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#795548] block">
                  Field Telemetry at Capture
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#E0D7C6] flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-[#F57C00]" />
                    <span>Temp: <strong>{env.weather.temp}°C</strong></span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E0D7C6] flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[#2E7D32]" />
                    <span>Humidity: <strong>{env.weather.humidity}%</strong></span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E0D7C6] flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-[#795548]" />
                    <span>Pressure: <strong>{env.weather.pressure} hPa</strong></span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#E0D7C6] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2E7D32]" />
                    <span>Soil pH: <strong>{env.soil.soil_ph}</strong></span>
                  </div>
                </div>
                <div className="text-[11px] text-[#795548] bg-white p-2 rounded-xl border border-[#E0D7C6]">
                  Soil Horizon: <strong>{env.soil.soil_type}</strong>
                </div>
              </div>

              {/* Computer Vision Lesion Metrics for Expert Inspection */}
              {report.cv_metrics && (
                <div className="bg-white p-3.5 rounded-2xl border border-[#E0D7C6] text-xs space-y-2 shadow-sm">
                  <div className="flex items-center justify-between font-bold text-[#4E342E]">
                    <span>Computer Vision Lesion Area:</span>
                    <span className="text-[#D32F2F] text-sm font-black">
                      {report.cv_metrics.lesion_surface_area_percent}% Affected
                    </span>
                  </div>
                  <div className="w-full bg-[#E0D7C6] h-2.5 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${report.cv_metrics.healthy_canopy_percent}%` }}
                      className="bg-[#2E7D32] h-full"
                    />
                    <div
                      style={{ width: `${report.cv_metrics.color_distribution.chlorotic_yellow}%` }}
                      className="bg-[#FFA000] h-full"
                    />
                    <div
                      style={{ width: `${report.cv_metrics.color_distribution.necrotic_brown}%` }}
                      className="bg-[#D32F2F] h-full"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#795548] pt-0.5">
                    <span>ExG Index: {report.cv_metrics.chlorophyll_health_index > 0 ? `+${report.cv_metrics.chlorophyll_health_index}` : report.cv_metrics.chlorophyll_health_index}</span>
                    <span>Healthy Tissue: {report.cv_metrics.color_distribution.healthy_green}%</span>
                    <span>Necrosis: {report.cv_metrics.color_distribution.necrotic_brown}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: AI Baseline Diagnosis & Review Input */}
            <div className="space-y-4">
              {/* AI Baseline Diagnosis Banner */}
              <div className="bg-[#81C784]/15 border border-[#81C784]/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Diagnostic Baseline</span>
                  </div>
                  {diag?.severity && <SeverityBadge severity={diag.severity} size="sm" />}
                </div>

                <div className="text-base font-bold text-[#4E342E]">
                  {diag?.disease_name}
                </div>

                <p className="text-xs text-[#795548] leading-relaxed line-clamp-3">
                  {diag?.root_cause_analysis}
                </p>
              </div>

              {/* Quick Template Fillers */}
              <div>
                <span className="text-xs font-bold text-[#795548] uppercase tracking-wider block mb-1.5">
                  Insert Standard Agronomic Finding:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('confirm')}
                    className="text-xs font-medium py-1 px-2.5 rounded-lg bg-[#F9F6F0] hover:bg-[#EFE8DC] text-[#4E342E] border border-[#E0D7C6] cursor-pointer"
                  >
                    Confirm Pathogen
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('mild')}
                    className="text-xs font-medium py-1 px-2.5 rounded-lg bg-[#F9F6F0] hover:bg-[#EFE8DC] text-[#4E342E] border border-[#E0D7C6] cursor-pointer"
                  >
                    Early / Mild Stress
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('healthy')}
                    className="text-xs font-medium py-1 px-2.5 rounded-lg bg-[#F9F6F0] hover:bg-[#EFE8DC] text-[#4E342E] border border-[#E0D7C6] cursor-pointer"
                  >
                    Vigorous / Healthy
                  </button>
                </div>
              </div>

              {/* Expert Review Input Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4E342E] mb-1">
                    Professional Clinical Assessment
                  </label>
                  <textarea
                    rows={3}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Provide your professional assessment of the crop's condition..."
                    className="w-full p-3 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4E342E] mb-1">
                    Actionable Agronomic Recommendations
                  </label>
                  <textarea
                    rows={3}
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Prescribe specific chemical or organic sprays, dosage, pruning, or irrigation modifications..."
                    className="w-full p-3 rounded-xl border border-[#E0D7C6] bg-[#F9F6F0] text-[#4E342E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32] leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    className="flex-1 font-bold shadow-earth"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Expert Review
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
