import React from 'react';
import { Diagnosis } from '@/types';
import {
  Sparkles,
  AlertTriangle,
  Eye,
  Activity,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  MessageSquareText,
  Globe,
  Landmark,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';

interface DivisionDiagnosisProps {
  diagnosis: Diagnosis;
}

export const DivisionDiagnosis: React.FC<DivisionDiagnosisProps> = ({ diagnosis }) => {
  const confLevel =
    diagnosis.confidence_level ||
    ((diagnosis.confidence ?? 0) >= 0.8 ? 'High' : (diagnosis.confidence ?? 0) >= 0.5 ? 'Moderate' : 'Low');

  const gov = diagnosis.government_guideline;

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E0D7C6]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
              Division 3 — AI Agronomic Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
              Diagnostic Explanation & Differential Evaluation
            </h2>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            confLevel === 'High'
              ? 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]/40'
              : confLevel === 'Low'
              ? 'bg-[#9E9E9E]/15 text-[#616161] border-[#9E9E9E]/40'
              : 'bg-[#FFA000]/15 text-[#E65100] border-[#FFA000]/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>Confidence: {confLevel}</span>
        </div>
      </div>

      {/* Confidence Assessment & Botanical Explanation */}
      {diagnosis.confidence_explanation && (
        <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6] flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-extrabold ${
              confLevel === 'High'
                ? 'bg-[#81C784]/20 text-[#2E7D32]'
                : confLevel === 'Low'
                ? 'bg-[#9E9E9E]/20 text-[#616161]'
                : 'bg-[#FFA000]/20 text-[#E65100]'
            }`}
          >
            {confLevel === 'High' ? 'H' : confLevel === 'Low' ? 'L' : 'M'}
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548] block">
              Botanical & Optical Diagnostic Confidence ({confLevel})
            </span>
            <p className="text-xs sm:text-sm text-[#4E342E] leading-relaxed">
              {diagnosis.confidence_explanation}
            </p>
          </div>
        </div>
      )}

      {/* MULTILINGUAL FARMER PROBLEM DESCRIPTION & AI TRANSLATION */}
      {diagnosis.farmer_notes && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EFE8DC]/50 border border-[#E0D7C6] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4E342E]">
              <MessageSquareText className="w-4 h-4 text-[#2E7D32]" />
              <span>Farmer Field Problem Description</span>
            </div>
            {diagnosis.detected_language && (
              <span className="text-[11px] font-bold text-[#2E7D32] bg-[#81C784]/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Detected: {diagnosis.detected_language}</span>
              </span>
            )}
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E0D7C6] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#795548] block">
              Farmer Native Input:
            </span>
            <p className="text-sm font-semibold text-[#4E342E] italic leading-relaxed">
              &ldquo;{diagnosis.farmer_notes}&rdquo;
            </p>
          </div>

          {diagnosis.translated_notes && diagnosis.translated_notes !== diagnosis.farmer_notes && (
            <div className="bg-[#2E7D32]/5 p-3 rounded-xl border border-[#2E7D32]/20 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1">
                <Globe className="w-3 h-3" />
                AI Agronomic Translation:
              </span>
              <p className="text-xs sm:text-sm text-[#2E7D32] font-medium leading-relaxed">
                {diagnosis.translated_notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* OFFICIAL GOVERNMENT AGRICULTURAL ADVISORY (ICAR & CIBRC APPROVED) */}
      {gov && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#2E7D32]/10 via-[#F9F6F0] to-[#81C784]/10 border-2 border-[#2E7D32]/40 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2E7D32]/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32] block">
                  Official Government Advisory
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#4E342E]">
                  {gov.authority}
                </h3>
              </div>
            </div>

            <a
              href={gov.official_portal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] bg-white border border-[#2E7D32]/30 px-3 py-1.5 rounded-xl hover:bg-[#2E7D32] hover:text-white transition-all shadow-2xs"
            >
              <span>Kisan Suvidha Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-[#795548] uppercase tracking-wider">
              Advisory Protocol:
            </span>
            <div className="text-sm sm:text-base font-bold text-[#2E7D32]">
              {gov.advisory_title}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E0D7C6] text-xs sm:text-sm text-[#4E342E] leading-relaxed shadow-2xs">
            {gov.standard_practice}
          </div>

          {gov.approved_formulations && gov.approved_formulations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4E342E]">
                <FlaskConical className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>CIBRC Officially Approved Formulations & Dosages:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gov.approved_formulations.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-white px-3 py-2.5 rounded-xl border border-[#2E7D32]/20 text-xs text-[#2E7D32] font-semibold shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Symptoms Observed (Strictly Grounded) */}
      {diagnosis.visual_symptoms && diagnosis.visual_symptoms.length > 0 && (
        <div className="bg-[#F9F6F0] p-4 sm:p-5 rounded-2xl border border-[#E0D7C6] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548]">
            <Eye className="w-4 h-4 text-[#2E7D32]" />
            <span>Visual Evidence Detected on Specimen:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#4E342E]">
            {diagnosis.visual_symptoms.map((symptom, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] mt-1.5 flex-shrink-0" />
                <span className="leading-snug text-xs sm:text-sm font-medium">{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Differential Diagnoses (Plausible Alternatives with Rationales) */}
      {diagnosis.differential_diagnoses && diagnosis.differential_diagnoses.length > 0 && (
        <div className="bg-[#F9F6F0] p-4 sm:p-5 rounded-2xl border border-[#E0D7C6] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548]">
            <GitBranch className="w-4 h-4 text-[#F57C00]" />
            <span>Differential Diagnoses (Plausible Alternatives):</span>
          </div>
          <p className="text-xs text-[#795548]">
            Symptoms have visual overlap. The following candidate conditions are under active consideration:
          </p>
          <div className="space-y-2.5">
            {diagnosis.differential_diagnoses.map((diff, i) => (
              <div
                key={i}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E0D7C6] space-y-1 shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#FFA000]/15 text-[#E65100] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-[#4E342E]">
                    {diff.condition}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#795548] pl-7 leading-relaxed">
                  {diff.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty Notice (Only displayed when real diagnostic ambiguity exists and not high confidence) */}
      {diagnosis.uncertainty_note && confLevel !== 'High' && (
        <div className="p-4 rounded-2xl bg-[#FFA000]/12 border border-[#FFA000]/40 text-[#E65100] text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F57C00]" />
          <div className="space-y-0.5">
            <span className="font-bold block text-xs sm:text-sm">
              Agronomic Observation Note:
            </span>
            <span className="text-xs sm:text-sm block leading-relaxed text-[#795548]">
              {diagnosis.uncertainty_note}
            </span>
          </div>
        </div>
      )}

      {/* Root Cause & Environmental Correlation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548]">
          <Activity className="w-4 h-4 text-[#2E7D32]" />
          <span>Root Cause & Environmental Drivers:</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E0D7C6] text-[#4E342E] text-sm sm:text-base leading-relaxed font-normal shadow-2xs">
          {diagnosis.root_cause_analysis}
        </div>
      </div>

      {/* Recommended Safe Next Steps (Conservative & Low-Risk First) */}
      {diagnosis.recommended_next_steps && diagnosis.recommended_next_steps.length > 0 && (
        <div className="bg-[#2E7D32]/5 p-4 sm:p-5 rounded-2xl border border-[#2E7D32]/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Recommended Next Steps (Standard Field Actions):</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#4E342E]">
            {diagnosis.recommended_next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-[#2E7D32] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed font-medium">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
