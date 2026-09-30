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
import { DivisionAlternativeCrops } from './DivisionAlternativeCrops';
import { AlternativeCropService } from '@/services/alternativeCrops';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowLeft, Printer, Share2, Sparkles, CheckCircle2, Download, FileCheck2 } from 'lucide-react';
import { downloadReportAsPdf } from '@/services/reportExport';

interface ReportViewProps {
  initialReport: CropReport;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ initialReport, onBack }) => {
  const { t, language, translateReportLive, languages } = useLanguage();
  const [report, setReport] = useState<CropReport>(initialReport);
  const [isEscalating, setIsEscalating] = useState<boolean>(false);
  const [justUpdated, setJustUpdated] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // LIVE TRANSLATOR STATE
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedReportData, setTranslatedReportData] = useState<any | null>(null);
  const [showTranslated, setShowTranslated] = useState<boolean>(language !== 'en');
  const [lastTranslatedLang, setLastTranslatedLang] = useState<string>('');

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  // REAL-TIME FIRESTORE LISTENER
  // Updates automatically when an expert submits a review from another device/browser
  useEffect(() => {
    const unsubscribe = ReportsService.subscribeToReport(initialReport.id, (updated) => {
      if (updated) {
        if (!report.expert_review && updated.expert_review) {
          setJustUpdated(true);
          setTimeout(() => setJustUpdated(false), 4000);
        }
        setReport(updated);
      }
    });

    return () => unsubscribe();
  }, [initialReport.id, report.expert_review]);

  // AUTO-TRANSLATE TRIGGER WHEN USER SELECTS NON-ENGLISH LANGUAGE OR ASKS TO TRANSLATE
  const performLiveTranslation = async (targetLang: string = language) => {
    if (targetLang === 'en') {
      setShowTranslated(false);
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateReportLive(report, targetLang);
      if (res && res.translated_report) {
        setTranslatedReportData(res.translated_report);
        setShowTranslated(true);
        setLastTranslatedLang(targetLang);
      }
    } catch (err) {
      console.warn('Live translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (language !== 'en' && lastTranslatedLang !== language) {
      performLiveTranslation(language);
    } else if (language === 'en') {
      setShowTranslated(false);
    }
  }, [language]);

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
      // Export translated report if user is in translated mode
      const exportTarget = (showTranslated && translatedReportData) ? {
        ...report,
        diagnosis: {
          ...report.diagnosis,
          ...translatedReportData.diagnosis,
        },
        recommendations: {
          ...report.recommendations,
          ...translatedReportData.recommendations,
        },
      } : report;

      await downloadReportAsPdf(exportTarget);
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

  // Compute effective view objects based on translation toggle
  const effectiveDiagnosis = (showTranslated && translatedReportData?.diagnosis && report.diagnosis)
    ? {
        ...report.diagnosis,
        plant_type: translatedReportData.diagnosis.plant_type || report.diagnosis.plant_type,
        disease_name: translatedReportData.diagnosis.disease_name || report.diagnosis.disease_name,
        confidence_explanation: translatedReportData.diagnosis.confidence_explanation || report.diagnosis.confidence_explanation,
        root_cause_analysis: translatedReportData.diagnosis.root_cause_analysis || report.diagnosis.root_cause_analysis,
        visual_symptoms: translatedReportData.diagnosis.visual_symptoms?.length ? translatedReportData.diagnosis.visual_symptoms : report.diagnosis.visual_symptoms,
        recommended_next_steps: translatedReportData.diagnosis.recommended_next_steps?.length ? translatedReportData.diagnosis.recommended_next_steps : report.diagnosis.recommended_next_steps,
        differential_diagnoses: translatedReportData.diagnosis.differential_diagnoses?.length ? translatedReportData.diagnosis.differential_diagnoses : report.diagnosis.differential_diagnoses,
        government_guideline: translatedReportData.diagnosis.government_guideline ? {
          ...report.diagnosis.government_guideline,
          ...translatedReportData.diagnosis.government_guideline,
        } : report.diagnosis.government_guideline,
      }
    : report.diagnosis;

  const effectiveRecommendations = (showTranslated && translatedReportData?.recommendations && report.recommendations)
    ? {
        ...report.recommendations,
        ordered_action_plan: translatedReportData.recommendations.ordered_action_plan?.length ? translatedReportData.recommendations.ordered_action_plan : report.recommendations.ordered_action_plan,
        organic_solutions: translatedReportData.recommendations.organic_solutions?.length ? translatedReportData.recommendations.organic_solutions : report.recommendations.organic_solutions,
        chemical_solutions: translatedReportData.recommendations.chemical_solutions?.length ? translatedReportData.recommendations.chemical_solutions : report.recommendations.chemical_solutions,
        preventive_actions: translatedReportData.recommendations.preventive_actions?.length ? translatedReportData.recommendations.preventive_actions : report.recommendations.preventive_actions,
        monitoring_guidance: translatedReportData.recommendations.monitoring_guidance?.length ? translatedReportData.recommendations.monitoring_guidance : report.recommendations.monitoring_guidance,
      }
    : report.recommendations;

  const effectiveExpertReview = (showTranslated && translatedReportData?.expert_review && report.expert_review)
    ? {
        ...report.expert_review,
        assessment: translatedReportData.expert_review.assessment || report.expert_review.assessment,
        recommendations: translatedReportData.expert_review.recommendations || report.expert_review.recommendations,
      }
    : report.expert_review;

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

      {/* LIVE AI TRANSLATION CONTROL BAR */}
      <div className="bg-gradient-to-r from-[#2E7D32]/10 via-[#F9F6F0] to-[#FFFFFF] border-2 border-[#2E7D32]/30 rounded-3xl p-4 sm:p-5 shadow-earth flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5 text-[#81C784]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
                Live AI Agronomic Translator
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/15 text-[#2E7D32]">
                {currentLangObj.flag} {currentLangObj.nativeName}
              </span>
              {showTranslated && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                  Translated Live
                </span>
              )}
            </div>
            <p className="text-xs text-[#795548] mt-0.5">
              {isTranslating
                ? `Translating entire agronomic diagnosis and prescription into ${currentLangObj.nativeName} in real-time...`
                : showTranslated
                ? `Viewing full diagnosis, ICAR advisory, and dosages in ${currentLangObj.nativeName}.`
                : `Translate complete technical diagnosis and action plans into ${currentLangObj.nativeName}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {showTranslated ? (
            <button
              onClick={() => setShowTranslated(false)}
              className="px-3 py-1.5 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] text-xs font-bold text-[#4E342E] transition-all cursor-pointer shadow-xs"
            >
              View Original (English)
            </button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => performLiveTranslation(language === 'en' ? 'hi' : language)}
              isLoading={isTranslating}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#81C784]" />}
              className="text-xs font-bold shadow-earth"
            >
              {language === 'en' ? 'Translate to Hindi' : `Translate Live (${currentLangObj.nativeName})`}
            </Button>
          )}

          {showTranslated && (
            <button
              onClick={() => performLiveTranslation(language)}
              disabled={isTranslating}
              className="p-1.5 rounded-xl border border-[#E0D7C6] bg-white hover:bg-[#F9F6F0] text-[#2E7D32] transition-colors cursor-pointer"
              title="Refresh Live Translation"
            >
              <Sparkles className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
            </button>
          )}
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
      {hasExpertReview && effectiveExpertReview && (
        <div className="relative">
          <ExpertNoteCard review={effectiveExpertReview} />
        </div>
      )}

      {/* DIVISION 3: AI DIAGNOSIS & ROOT CAUSE */}
      {effectiveDiagnosis && <DivisionDiagnosis diagnosis={effectiveDiagnosis} />}

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
      {effectiveRecommendations && (
        <DivisionActionPlan plan={effectiveRecommendations} />
      )}

      {/* HIGH-PROFIT & HIGH-YIELD ALTERNATIVE CROPS FOR THIS AREA */}
      {(report.alternative_crops || (report.location && report.environment)) && (
        <DivisionAlternativeCrops
          advisory={
            report.alternative_crops ||
            AlternativeCropService.suggestCrops(
              report.location,
              report.environment.soil,
              report.environment.weather,
              report.diagnosis?.plant_type
            )
          }
        />
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
