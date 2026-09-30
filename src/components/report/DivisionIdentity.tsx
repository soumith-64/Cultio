import React from 'react';
import { CropReport } from '@/types';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Calendar, CheckCircle2, ShieldCheck, Landmark, MessageSquareText } from 'lucide-react';

interface DivisionIdentityProps {
  report: CropReport;
}

export const DivisionIdentity: React.FC<DivisionIdentityProps> = ({ report }) => {
  const { t } = useLanguage();
  const diag = report.diagnosis;
  const conf = diag?.confidence_level || ((diag?.confidence ?? 0) >= 0.8 ? 'High' : (diag?.confidence ?? 0) >= 0.5 ? 'Moderate' : 'Low');

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Crop Photo Preview with High Outdoor Contrast */}
        <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-[#F9F6F0] border-2 border-[#E0D7C6] flex-shrink-0 shadow-inner relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.image_url}
            alt={diag?.plant_type || 'Crop Specimen'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
            Field Image
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            {diag?.severity && (
              <SeverityBadge severity={diag.severity} size="md" />
            )}
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                conf === 'High'
                  ? 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]/40'
                  : conf === 'Low'
                  ? 'bg-[#9E9E9E]/15 text-[#616161] border-[#9E9E9E]/40'
                  : 'bg-[#FFA000]/15 text-[#E65100] border-[#FFA000]/40'
              }`}
            >
              Confidence: {conf}
            </span>

            {diag?.government_guideline && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30 flex items-center gap-1">
                <Landmark className="w-3 h-3" />
                <span>{t('gov_guidelines')}</span>
              </span>
            )}

            {diag?.farmer_notes && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-[#EFE8DC] text-[#4E342E] border-[#E0D7C6] flex items-center gap-1">
                <MessageSquareText className="w-3 h-3 text-[#2E7D32]" />
                <span>Farmer Notes</span>
              </span>
            )}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548] block">
              {t('crop_identification')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4E342E] tracking-tight">
              {diag?.plant_type || 'Processing Crop...'}
            </h1>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6] space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              {t('primary_condition')}
            </span>
            <div className="text-lg sm:text-xl font-bold text-[#D32F2F]">
              {diag?.disease_name || 'Analyzing symptoms...'}
            </div>
          </div>

          {/* Location & Timestamp Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#795548] pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-[#F57C00]" />
              <span>
                {report.location.regionName ||
                  `Lat ${report.location.latitude.toFixed(4)}, Lng ${report.location.longitude.toFixed(4)}`}
              </span>
              {report.location.isFallback && (
                <span className="text-[10px] font-bold text-[#F57C00] bg-[#FFA000]/15 px-1.5 py-0.5 rounded">
                  Fallback Coords
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-[#2E7D32]" />
              <span>
                {new Date(report.created_at).toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
