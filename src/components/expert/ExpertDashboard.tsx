'use client';

import React, { useState } from 'react';
import { CropReport } from '@/types';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ExpertReviewModal } from './ExpertReviewModal';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck2,
  Filter,
  Eye,
} from 'lucide-react';

interface ExpertDashboardProps {
  reports: CropReport[];
  onReportReviewed?: (report: CropReport) => void;
}

export const ExpertDashboard: React.FC<ExpertDashboardProps> = ({
  reports,
  onReportReviewed,
}) => {
  const [selectedReport, setSelectedReport] = useState<CropReport | null>(null);
  const [filterMode, setFilterMode] = useState<'pending' | 'reviewed' | 'all'>('pending');

  // Filter reports
  const pendingReports = reports.filter((r) => r.status === 'PENDING_EXPERT');
  const reviewedReports = reports.filter((r) => r.status === 'EXPERT_REVIEWED');

  const displayedReports =
    filterMode === 'pending'
      ? pendingReports
      : filterMode === 'reviewed'
      ? reviewedReports
      : reports;

  // Sort by submission time (most recent first)
  const sortedReports = [...displayedReports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Expert Portal Hero Header */}
      <div className="bg-gradient-to-r from-[#FFFFFF] to-[#F1F8E9] border-2 border-[#2E7D32]/30 rounded-3xl p-6 sm:p-8 shadow-earth flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0 shadow-earth">
            <ShieldCheck className="w-8 h-8 text-[#81C784]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
              <span>Agronomy Verification Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4E342E]">
              Agricultural Expert Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#795548] mt-0.5">
              Review escalated field cases, cross-examine soil and weather metrics, and issue binding agronomic notes.
            </p>
          </div>
        </div>

        {/* Real-time Counter Badge */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-2xl bg-white border border-[#2E7D32]/20 flex-shrink-0">
          <span className="text-xs font-bold text-[#795548] uppercase tracking-wider">
            Pending Queue
          </span>
          <span className="text-2xl font-black text-[#2E7D32]">
            {pendingReports.length} {pendingReports.length === 1 ? 'Case' : 'Cases'}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E0D7C6]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'pending'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white text-[#4E342E] border border-[#E0D7C6] hover:bg-[#F9F6F0]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Reviews ({pendingReports.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('reviewed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'reviewed'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white text-[#4E342E] border border-[#E0D7C6] hover:bg-[#F9F6F0]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#81C784]" />
            <span>Verified Cases ({reviewedReports.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'all'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-white text-[#4E342E] border border-[#E0D7C6] hover:bg-[#F9F6F0]'
            }`}
          >
            <span>All Submissions ({reports.length})</span>
          </button>
        </div>

        <div className="text-xs text-[#795548] font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Sorted by submission recency</span>
        </div>
      </div>

      {/* Reports Queue List */}
      {sortedReports.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-12 text-center text-[#795548] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F9F6F0] flex items-center justify-center mx-auto text-[#2E7D32]">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-[#4E342E]">
            {filterMode === 'pending'
              ? 'No Reports Awaiting Review'
              : 'No Reports Found in this View'}
          </h3>
          <p className="text-xs text-[#795548] max-w-md mx-auto">
            {filterMode === 'pending'
              ? 'All farmer escalated diagnoses have been reviewed by agronomists. New field cases will stream here via live sync.'
              : 'Switch filter tabs above to view other diagnostic records.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedReports.map((report) => {
            const diag = report.diagnosis;
            const isPending = report.status === 'PENDING_EXPERT';

            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isPending
                    ? 'bg-[#FFFFFF] border-[#2E7D32] shadow-earth hover:shadow-earth-lg'
                    : 'bg-[#FFFFFF] border-[#E0D7C6] hover:border-[#2E7D32] shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Specimen Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F9F6F0] border border-[#E0D7C6] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={report.image_url || report.thumbnail_url}
                      alt={diag?.plant_type || 'Crop Specimen'}
                      onError={(e) => {
                        if (report.thumbnail_url && e.currentTarget.src !== report.thumbnail_url) {
                          e.currentTarget.src = report.thumbnail_url;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Identification & Condition */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {diag?.severity && (
                        <SeverityBadge severity={diag.severity} size="sm" />
                      )}
                      <StatusBadge status={report.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-base text-[#4E342E] group-hover:text-[#2E7D32] truncate">
                      {diag?.plant_type || 'Field Crop Specimen'}
                    </h3>

                    <p className="text-xs text-[#D32F2F] font-semibold truncate">
                      {diag?.disease_name}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#795548] pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#F57C00]" />
                        {report.location.regionName || 'Field Coordinates'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#2E7D32]" />
                        {new Date(report.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Action CTA */}
                <div className="flex-shrink-0 flex items-center justify-end sm:flex-col sm:items-end gap-2">
                  <Button
                    variant={isPending ? 'primary' : 'outline'}
                    size="sm"
                    className="font-bold"
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    {isPending ? 'Review Case Now' : 'Inspect Review'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <ExpertReviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onReviewSubmitted={(updated) => {
            if (onReportReviewed) onReportReviewed(updated);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};
