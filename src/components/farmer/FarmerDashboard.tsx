'use client';

import React from 'react';
import { CropReport } from '@/types';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import {
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  History,
  AlertCircle,
  Landmark,
} from 'lucide-react';

interface FarmerDashboardProps {
  onScanClick: () => void;
  reports: CropReport[];
  onSelectReport: (report: CropReport) => void;
  isProcessing?: boolean;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onScanClick,
  reports,
  onSelectReport,
  isProcessing = false,
}) => {
  const { t } = useLanguage();
  const pendingExpertCount = reports.filter(
    (r) => r.status === 'PENDING_EXPERT'
  ).length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* PRIMARY CTA SECTION — VISUALLY DOMINANT */}
      <section className="bg-gradient-to-b from-[#FFFFFF] to-[#F5EFE6] border-2 border-[#2E7D32]/30 rounded-3xl p-6 sm:p-10 shadow-earth-lg text-center relative overflow-hidden">
        {/* Subtle decorative leaf watermark */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#81C784]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#F57C00]/10 blur-2xl pointer-events-none" />

        <div className="max-w-xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#81C784]/20 border border-[#81C784]/40 text-[#2E7D32] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>{t('hero_badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#4E342E] tracking-tight leading-tight">
            {t('hero_title')}
          </h1>

          <p className="text-base sm:text-lg text-[#795548] leading-relaxed">
            {t('hero_subtitle')}
          </p>

          {/* GIANT DOMINANT CTA BUTTON */}
          <div className="pt-2">
            <button
              onClick={onScanClick}
              disabled={isProcessing}
              id="scan-crop-primary-button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-4 py-5 px-10 rounded-2xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-extrabold text-xl sm:text-2xl shadow-earth-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-2 border-[#1B5E20] min-h-[64px]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="tracking-wide">{t('scan_crop_cta')}</span>
            </button>
            <p className="text-xs text-[#795548] font-medium mt-2">
              Works directly with your phone camera or uploaded field photos • Official ICAR standards
            </p>
          </div>
        </div>
      </section>

      {/* QUICK STATUS TICKER / PENDING EXPERT REVIEWS NOTIFICATION */}
      {pendingExpertCount > 0 && (
        <div className="bg-[#FFA000]/15 border border-[#FFA000]/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-[#E65100]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFA000]/25 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-[#E65100]" />
            </div>
            <span className="text-sm font-semibold">
              {pendingExpertCount} {pendingExpertCount === 1 ? 'diagnosis is' : 'diagnoses are'} currently awaiting Agronomist review. You will receive real-time updates here.
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#FFA000]/20 hidden sm:inline">
            Live Queue
          </span>
        </div>
      )}

      {/* SUPPORTING SECTION: PREVIOUS DIAGNOSTIC REPORTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#2E7D32]" />
            <h2 className="text-xl font-bold text-[#4E342E]">
              {t('recent_diagnoses')}
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#795548]">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} Logged
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl p-8 text-center text-[#795548] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F6F0] flex items-center justify-center mx-auto text-[#2E7D32]">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#4E342E]">
              {t('no_reports_title')}
            </h3>
            <p className="text-xs text-[#795548] max-w-sm mx-auto">
              {t('no_reports_desc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const diag = report.diagnosis;
              const isReviewed = report.status === 'EXPERT_REVIEWED';

              return (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="bg-[#FFFFFF] hover:bg-[#FDFBF7] border border-[#E0D7C6] hover:border-[#2E7D32] rounded-2xl p-4 shadow-earth hover:shadow-earth-lg transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex gap-3.5">
                    {/* Crop Image Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F9F6F0] flex-shrink-0 border border-[#E0D7C6]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.image_url}
                        alt={diag?.plant_type || 'Crop Specimen'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {diag?.severity && (
                          <SeverityBadge severity={diag.severity} size="sm" />
                        )}
                        <StatusBadge status={report.status} size="sm" />
                      </div>

                      <h3 className="font-bold text-base text-[#4E342E] mt-1.5 truncate group-hover:text-[#2E7D32]">
                        {diag?.plant_type || 'Analyzing Crop...'}
                      </h3>

                      <p className="text-xs text-[#795548] font-medium truncate">
                        {diag?.disease_name || 'Processing telemetry...'}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-[#795548] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F57C00]" />
                          {report.location.isFallback ? 'Coimbatore Belt' : 'Field GPS'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(report.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expert Note Preview Banner if reviewed */}
                  {isReviewed && report.expert_review && (
                    <div className="mt-3 pt-2.5 border-t border-[#E0D7C6] bg-[#81C784]/10 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl flex items-center justify-between text-xs text-[#2E7D32]">
                      <div className="flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                        <span>Agronomist Note by {report.expert_review.expert_name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}

                  {!isReviewed && (
                    <div className="mt-3 pt-2 border-t border-[#E0D7C6] flex items-center justify-between text-xs text-[#795548]">
                      <span>{t('view_full_report')}</span>
                      <ChevronRight className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
