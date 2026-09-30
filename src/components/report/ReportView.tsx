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
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

interface ReportViewProps {
  initialReport: CropReport;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ initialReport, onBack }) => {
  const [report, setReport] = useState<CropReport>(initialReport);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [justUpdated, setJustUpdated] = useState<boolean>(false);

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
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
            className="hidden sm:inline-flex text-xs"
          >
            Print Report
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
            Share
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

      {/* DIVISION 2: ENVIRONMENTAL CONTEXT */}
      <DivisionEnvironment environment={report.environment} />

      {/* DIVISION 4: ACTION PLAN */}
      {report.recommendations && (
        <DivisionActionPlan plan={report.recommendations} />
      )}

      {/* DIVISION 5: EXPERT ESCALATION */}
      <DivisionEscalation
        status={report.status}
        onRequestExpert={handleRequestExpert}
        isLoading={isEscalating}
      />
    </div>
  );
};
