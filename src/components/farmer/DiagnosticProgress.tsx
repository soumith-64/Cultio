'use client';

import React from 'react';
import { PipelineProgressStep } from '@/types';
import { Check, Loader2, AlertCircle, Circle } from 'lucide-react';

interface DiagnosticProgressProps {
  steps: PipelineProgressStep[];
  currentStepLabel?: string;
}

export const DiagnosticProgress: React.FC<DiagnosticProgressProps> = ({
  steps,
  currentStepLabel,
}) => {
  return (
    <div className="bg-[#FFFFFF] border-2 border-[#81C784]/60 rounded-3xl p-6 sm:p-8 shadow-earth-lg max-w-xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#81C784]/20 text-[#2E7D32]">
          Scientific Diagnostic Pipeline
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-[#4E342E] mt-2">
          Analyzing Agricultural Evidence
        </h3>
        <p className="text-sm text-[#795548] mt-1">
          {currentStepLabel || 'Cross-referencing crop imagery with microclimate telemetry...'}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3.5 my-6">
        {steps.map((step, idx) => {
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all ${
                step.state === 'active'
                  ? 'bg-[#2E7D32]/8 border-[#2E7D32] shadow-sm'
                  : step.state === 'completed'
                  ? 'bg-[#F9F6F0] border-[#E0D7C6]/80'
                  : step.state === 'failed'
                  ? 'bg-[#D32F2F]/10 border-[#D32F2F]/40'
                  : 'bg-white/60 border-transparent opacity-60'
              }`}
            >
              {/* Step Icon */}
              <div className="mt-0.5 flex-shrink-0">
                {step.state === 'completed' && (
                  <div className="w-6 h-6 rounded-full bg-[#2E7D32] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                {step.state === 'active' && (
                  <div className="w-6 h-6 rounded-full bg-[#F57C00] text-white flex items-center justify-center animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                )}
                {step.state === 'failed' && (
                  <div className="w-6 h-6 rounded-full bg-[#D32F2F] text-white flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                )}
                {step.state === 'pending' && (
                  <div className="w-6 h-6 rounded-full border-2 border-[#E0D7C6] text-[#795548] flex items-center justify-center">
                    <Circle className="w-2.5 h-2.5 text-[#E0D7C6]" />
                  </div>
                )}
              </div>

              {/* Step Text & Detail */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold ${
                      step.state === 'active'
                        ? 'text-[#2E7D32]'
                        : step.state === 'completed'
                        ? 'text-[#4E342E]'
                        : step.state === 'failed'
                        ? 'text-[#D32F2F]'
                        : 'text-[#795548]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.state === 'active' && (
                    <span className="text-[11px] font-semibold text-[#F57C00] uppercase tracking-wider animate-pulse">
                      In Progress
                    </span>
                  )}
                  {step.state === 'completed' && (
                    <span className="text-[11px] font-semibold text-[#2E7D32] uppercase tracking-wider">
                      Verified
                    </span>
                  )}
                </div>

                {step.detail && (
                  <p className="text-xs text-[#795548] mt-0.5 leading-relaxed font-mono">
                    {step.detail}
                  </p>
                )}
                {step.error && (
                  <p className="text-xs text-[#D32F2F] mt-0.5 font-medium">
                    {step.error}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-xs text-[#795548] bg-[#F9F6F0] p-3 rounded-xl border border-[#E0D7C6]">
        🌱 Parallel processing: Telemetry and computer vision are computed simultaneously for field efficiency.
      </div>
    </div>
  );
};
