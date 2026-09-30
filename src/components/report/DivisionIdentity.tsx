import React from 'react';
import { CropReport } from '@/types';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { MapPin, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DivisionIdentityProps {
  report: CropReport;
}

export const DivisionIdentity: React.FC<DivisionIdentityProps> = ({ report }) => {
  const diag = report.diagnosis;

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
            {diag?.confidence && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F9F6F0] text-[#795548] border border-[#E0D7C6]">
                {(diag.confidence * 100).toFixed(0)}% Confidence
              </span>
            )}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548] block">
              Identified Crop Specimen
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4E342E] tracking-tight">
              {diag?.plant_type || 'Processing Crop...'}
            </h1>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6] space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Primary Condition / Pathogen
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
