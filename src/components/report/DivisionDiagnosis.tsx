import React from 'react';
import { Diagnosis } from '@/types';
import { Sparkles, AlertTriangle, Eye, Activity, CheckCircle2 } from 'lucide-react';

interface DivisionDiagnosisProps {
  diagnosis: Diagnosis;
}

export const DivisionDiagnosis: React.FC<DivisionDiagnosisProps> = ({ diagnosis }) => {
  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-5">
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
              Diagnostic Explanation & Root Cause
            </h2>
          </div>
        </div>

        {diagnosis.confidence && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#81C784]/20 text-[#2E7D32] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{(diagnosis.confidence * 100).toFixed(0)}% Confidence Match</span>
          </div>
        )}
      </div>

      {/* Uncertainty Disclaimer if present */}
      {diagnosis.uncertainty_note && (
        <div className="p-4 rounded-2xl bg-[#FFA000]/15 border border-[#FFA000]/40 text-[#E65100] text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F57C00]" />
          <div>
            <span className="font-bold block">Scientific Uncertainty Notice:</span>
            <span className="text-xs sm:text-sm mt-0.5 block leading-relaxed">
              {diagnosis.uncertainty_note}
            </span>
          </div>
        </div>
      )}

      {/* Visual Symptoms Observed */}
      {diagnosis.visual_symptoms && diagnosis.visual_symptoms.length > 0 && (
        <div className="bg-[#F9F6F0] p-4 sm:p-5 rounded-2xl border border-[#E0D7C6]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548] mb-3">
            <Eye className="w-4 h-4 text-[#2E7D32]" />
            <span>Visual Evidence Detected on Specimen:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-[#4E342E]">
            {diagnosis.visual_symptoms.map((symptom, i) => (
              <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E0D7C6]">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32] mt-1.5 flex-shrink-0" />
                <span className="leading-snug">{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Root Cause & Environmental Correlation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#795548]">
          <Activity className="w-4 h-4 text-[#2E7D32]" />
          <span>Root Cause & Environmental Drivers:</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#E0D7C6] text-[#4E342E] text-base leading-relaxed font-normal shadow-sm">
          {diagnosis.root_cause_analysis}
        </div>
      </div>
    </section>
  );
};
