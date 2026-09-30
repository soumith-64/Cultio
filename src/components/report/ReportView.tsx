'use client';

import React, { useEffect, useState } from 'react';
import { CropReport } from '@/types';
import { ReportsService } from '@/services/reports';
import { DivisionIdentity } from './DivisionIdentity';
import { DivisionEnvironment } from './DivisionEnvironment';
import { DivisionDiagnosis } from './DivisionDiagnosis';
import { DivisionActionPlan } from './DivisionActionPlan';
import { DivisionEscalation } from './DivisionEscalation';
import { ExpertNoteCard } from './ExpertNoteCard';
import { DivisionHistoryInsights } from './DivisionHistoryInsights';
import { DivisionComputerVision } from './DivisionComputerVision';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Printer, Share2, Sparkles, CheckCircle2, Download, FileCheck2 } from 'lucide-react';
import { downloadReportAsPdf } from '@/services/reportExport';

interface ReportViewProps {
  initialReport: CropReport;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ initialReport, onBack }) => {
  const { t } = useLanguage();
  const [report, setReport] = useState<CropReport>(initialReport);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // REAL-TIME FIRESTORE LISTENER
  // Updates automatically when an expert submits a review from another device/browser
  useEffect(() => {
    const unsubscribe = ReportsService.subscribeToReport(initialReport.id, (updated) => {
      if (updated) {
        // If an expert review just landed, trigger a subtle celebration/update cue
        if (!report.expert_review && updated.expert_review) {
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 4000);
        }
        setReport(updated);
      }
    });

    return () => unsubscribe();
  }, [initialReport.id, report.expert_review]);

  const handleRequestExpert = async () => {
    setIsEscalating(true);
    try {
      await ReportsService.updateReportStatus(report.id, 'PENDING_EXPERT');
      setReport((prev) => ({
        ...prev,
        status: 'PENDING_EXPERT',
        updated_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Failed to request expert review:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadReportAsPdf(report);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const hasExpertReview = Boolean(report.expert_review);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          {t('back_to_dashboard')}
        </Button>

        <div className="flex items-center gap-2">
          {/* Download Official Report Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            leftIcon={downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-[#81C784]" /> : <Download className="w-4 h-4" />}
            className="font-bold shadow-earth text-xs"
          >
            {isDownloading ? 'Compiling PDF...' : downloadSuccess ? 'Downloaded!' : 'Download Report'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
            className="hidden sm:inline-flex text-xs"
          >
            {t('print_report')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Cultivo Diagnosis — ${report.diagnosis?.plant_type || 'Crop'}`,
                  text: `Agricultural diagnosis for ${report.diagnosis?.plant_type}: ${report.diagnosis?.disease_name}`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Report link copied to clipboard!');
              }
            }}
            leftIcon={<Share2 className="w-4 h-4" />}
            className="text-xs"
          >
            {t('share_report')}
          </Button>
        </div>
      </div>

      {/* Real-time Update Alert Banner */}
      {justUpdated && (
        <div className="bg-[#2E7D32] text-white p-4 rounded-2xl flex items-center justify-between shadow-earth-lg animate-bounce">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#81C784]" />
            <span>Real-time Alert: Certified Agronomist review just submitted!</span>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">Updated Live</span>
        </div>
      )}

      {/* DIVISION 1: IDENTITY & STATUS */}
      <DivisionIdentity report={report} />

      {/* DIRECTIVE 29: EXPERT REVIEW PRIORITY */}
      {/* When an expert review exists, it MUST appear ABOVE the AI recommendation */}
      {hasExpertReview && report.expert_review && (
        <div className="relative">
          <ExpertNoteCard review={report.expert_review} />
        </div>
      )}

      {/* DIVISION 3: AI DIAGNOSIS & ROOT CAUSE */}
      {report.diagnosis && <DivisionDiagnosis diagnosis={report.diagnosis} />}

      {/* HISTORICAL FIELD INTELLIGENCE & LONGITUDINAL SUGGESTIONS */}
      {report.historical_insight && (
        <DivisionHistoryInsights insight={report.historical_insight} />
      )}

      {/* COMPUTER VISION FOLIAR ANALYTICS & LESION SEGMENTATION */}
      {report.cv_metrics && (
        <DivisionComputerVision
          metrics={report.cv_metrics}
          originalImageUrl={report.image_url}
        />
      )}

      {/* DIVISION 2: ENVIRONMENTAL CONTEXT */}
      <DivisionEnvironment environment={report.environment} />

      {/* DIVISION 4: ACTION PLAN */}
      {report.recommendations && (
        <DivisionActionPlan plan={report.recommendations} />
      )}

      {/* PROFESSIONAL DOCUMENT EXPORT CALLOUT */}
      <div className="bg-gradient-to-r from-[#2E7D32]/10 via-[#F9F6F0] to-[#FFFFFF] border-2 border-[#2E7D32]/25 rounded-3xl p-5 sm:p-6 shadow-earth flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] bg-[#2E7D32]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <FileCheck2 className="w-3 h-3" />
              Official Agronomic PDF
            </span>
            <span className="text-[11px] text-[#795548] font-semibold">ICAR & CIBRC Standard Format</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#4E342E]">
            Download Full Diagnostic Report
          </h3>
          <p className="text-xs text-[#795548] max-w-xl leading-relaxed">
            Includes high-resolution foliar computer vision metrics, microclimate edaphic tables, pathogen differential assessments, and approved chemical dosages with regulated Pre-Harvest Intervals (PHI).
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadPdf}
            isLoading={isDownloading}
            leftIcon={downloadSuccess ? <CheckCircle2 className="w-4 h-4 text-[#81C784]" /> : <Download className="w-4 h-4" />}
            className="font-bold shadow-earth whitespace-nowrap"
          >
            {isDownloading ? 'Generating PDF...' : downloadSuccess ? 'Report Downloaded!' : 'Download PDF Report'}
          </Button>
        </div>
      </div>

      {/* DIVISION 5: EXPERT ESCALATION */}
      <DivisionEscalation
        status={report.status}
        onRequestExpert={handleRequestExpert}
        isLoading={isEscalating}
      />
    </div>
  );
};
