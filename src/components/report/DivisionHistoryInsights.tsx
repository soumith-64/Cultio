'use client';

import React from 'react';
import { HistoricalInsight } from '@/types';
import {
  History,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface DivisionHistoryInsightsProps {
  insight: HistoricalInsight;
}

export const DivisionHistoryInsights: React.FC<DivisionHistoryInsightsProps> = ({ insight }) => {
  if (!insight.has_previous_data) {
    return (
      <section className="bg-[#F9F6F0] border border-[#E0D7C6] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-[#2E7D32] font-bold text-sm mb-1">
          <History className="w-4 h-4 text-[#2E7D32]" />
          <span>Historical Baseline Established</span>
        </div>
        <p className="text-xs text-[#795548] leading-relaxed">
          This is the first live diagnostic analysis stored for this crop specimen. Subsequent field scans will automatically cross-reference this baseline to track recovery rate and pathogen recurrence.
        </p>
      </section>
    );
  }

  const isDeteriorating = insight.severity_trend === 'deteriorating';
  const isImproving = insight.severity_trend === 'improving';

  return (
    <section className="bg-gradient-to-br from-[#FFFFFF] to-[#F9F6F0] border-2 border-[#2E7D32]/30 rounded-3xl p-6 sm:p-8 shadow-earth space-y-5 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E0D7C6]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
            <History className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32]">
              Historical Intelligence & Longitudinal Suggestions
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
              Field Trend & Treatment Continuity
            </h2>
          </div>
        </div>

        {/* Trend Indicator Badge */}
        <div className="flex items-center gap-1.5">
          {isDeteriorating && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D32F2F]/15 border border-[#D32F2F]/30 text-[#B71C1C] text-xs font-bold">
              <TrendingDown className="w-4 h-4" />
              <span>Condition Escalated</span>
            </span>
          )}
          {isImproving && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#388E3C]/15 border border-[#388E3C]/30 text-[#2E7D32] text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Condition Improving</span>
            </span>
          )}
          {!isDeteriorating && !isImproving && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFA000]/15 border border-[#FFA000]/30 text-[#E65100] text-xs font-bold">
              <span>Stable / Persistent</span>
            </span>
          )}
        </div>
      </div>

      {/* Recurrence Warning Alert */}
      {insight.pathogen_recurrence_alert && (
        <div className="p-4 rounded-2xl bg-[#FFA000]/15 border border-[#FFA000]/40 text-[#E65100] text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F57C00]" />
          <div>
            <span className="font-bold block">Historical Pathogen Pattern:</span>
            <span className="text-xs sm:text-sm mt-0.5 block leading-relaxed">
              {insight.pathogen_recurrence_alert}
            </span>
          </div>
        </div>
      )}

      {/* Previous Analysis Metadata & Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Analysis Reference */}
        <div className="bg-white p-4 rounded-2xl border border-[#E0D7C6] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#795548] flex items-center justify-between">
            <span>Stored Farm Scans</span>
            <span className="text-[#2E7D32] font-extrabold">{insight.previous_analyses_count} Previous Analyses</span>
          </div>
          <div className="text-xs text-[#795548] space-y-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>
                Last Analyzed:{' '}
                <strong>
                  {insight.last_analyzed_date
                    ? new Date(insight.last_analyzed_date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </strong>
              </span>
            </div>
            <div>
              Prior Severity Baseline: <strong>{insight.previous_severity || 'Recorded'}</strong>
            </div>
            {typeof insight.lesion_area_change_percent === 'number' && (
              <div className="pt-1 font-semibold">
                Lesion Spread Delta:{' '}
                <span
                  className={
                    insight.lesion_area_change_percent > 0
                      ? 'text-[#D32F2F]'
                      : 'text-[#2E7D32]'
                  }
                >
                  {insight.lesion_area_change_percent > 0 ? '+' : ''}
                  {insight.lesion_area_change_percent}%{' '}
                  {insight.lesion_area_change_percent > 0 ? '(Expansion)' : '(Recovery)'}
                </span>
                {typeof insight.previous_lesion_percent === 'number' && (
                  <span className="text-[10px] text-[#795548] ml-1">
                    (was {insight.previous_lesion_percent}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actionable Continuity Guidance */}
        <div className="bg-white p-4 rounded-2xl border border-[#E0D7C6] space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] block">
            Agronomic Suggestion Based on History:
          </span>
          <p className="text-xs sm:text-sm text-[#4E342E] leading-relaxed">
            {insight.treatment_continuity_suggestion ||
              'Compare symptom progression against previous scans to ensure treatment efficacy.'}
          </p>
        </div>
      </div>

      {/* Environmental Pattern Insight */}
      {insight.environmental_recurrence_pattern && (
        <div className="bg-[#81C784]/15 p-3.5 rounded-2xl border border-[#81C784]/40 text-xs text-[#2E7D32] flex items-start gap-2.5">
          <Layers className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
          <span>
            <strong>Environmental Pattern:</strong> {insight.environmental_recurrence_pattern}
          </span>
        </div>
      )}
    </section>
  );
};
