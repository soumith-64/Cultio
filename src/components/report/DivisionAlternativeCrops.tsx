'use client';

import React from 'react';
import { AlternativeCropAdvisory } from '@/types';
import { TrendingUp, Sprout, DollarSign, Clock, Droplets, ShieldCheck, Award, BarChart3, CheckCircle2 } from 'lucide-react';

interface DivisionAlternativeCropsProps {
  advisory?: AlternativeCropAdvisory;
}

export const DivisionAlternativeCrops: React.FC<DivisionAlternativeCropsProps> = ({ advisory }) => {
  if (!advisory || !advisory.top_profit_crops || advisory.top_profit_crops.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E0D7C6] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E0D7C6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/20 flex items-center justify-center text-[#2E7D32] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#4E342E]">
                High-Profit & High-Yield Alternative Crops
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                Area-Optimized
              </span>
            </div>
            <p className="text-xs text-[#795548] mt-0.5">
              Recommended for your specific soil type, pH, and microclimate to maximize revenue while breaking disease cycles.
            </p>
          </div>
        </div>

        {/* Fast Agronomic Match Badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-full bg-[#FFF8E1] border border-[#FFE082] text-xs font-bold text-[#F57C00]">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Yield & Profit Maximizer</span>
        </div>
      </div>

      {/* Area Context Summary Banner */}
      <div className="p-3.5 rounded-xl bg-[#F9F6F0] border border-[#E0D7C6] text-xs text-[#4E342E] flex items-start gap-2.5">
        <Sprout className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#2E7D32]">Field Soil & Climate Profile: </span>
          {advisory.area_summary}
          <div className="text-[11px] text-[#795548] mt-1 font-medium">
            {advisory.soil_climate_match_rationale}
          </div>
        </div>
      </div>

      {/* Crops Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {advisory.top_profit_crops.map((crop, idx) => {
          const isTopRank = idx === 0;

          return (
            <div
              key={crop.crop_name}
              className={`rounded-xl p-4 border transition-all flex flex-col justify-between space-y-4 ${
                isTopRank
                  ? 'bg-gradient-to-b from-[#F1F8E9] to-white border-[#81C784] shadow-sm ring-1 ring-[#81C784]/40'
                  : 'bg-white border-[#E0D7C6] hover:border-[#81C784]'
              }`}
            >
              {/* Card Title & Rank */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#2E7D32] text-white flex items-center gap-1">
                    {isTopRank ? <Award className="w-3 h-3" /> : `#${idx + 1}`}
                    {isTopRank ? 'Top Recommended' : `Option #${idx + 1}`}
                  </span>

                  {/* Suitability Score */}
                  <div className="flex items-center gap-1 text-xs font-extrabold text-[#2E7D32]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{crop.suitability_score}% Match</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-[#4E342E] leading-snug">
                    {crop.crop_name}
                  </h4>
                  <div className="text-[11px] font-semibold text-[#795548] flex items-center gap-1 mt-0.5">
                    <span>Variety:</span>
                    <span className="text-[#2E7D32] font-bold">{crop.variety_recommendation}</span>
                  </div>
                </div>

                {/* Profit & Yield Badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#E8F5E9] border border-[#C8E6C9] text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#1B5E20]">
                      <DollarSign className="w-3.5 h-3.5 text-[#2E7D32]" />
                      <span>Est. Net Profit</span>
                    </div>
                    <span className="font-extrabold text-[#1B5E20] text-right">
                      {crop.estimated_profit_per_acre}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#FFF8E1] border border-[#FFE082] text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#E65100]">
                      <Sprout className="w-3.5 h-3.5 text-[#F57C00]" />
                      <span>Expected Yield</span>
                    </div>
                    <span className="font-extrabold text-[#E65100] text-right">
                      {crop.expected_yield}
                    </span>
                  </div>
                </div>
              </div>

              {/* Agronomic Details */}
              <div className="space-y-2 text-xs text-[#4E342E] pt-2 border-t border-[#E0D7C6]/60">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1 text-[#795548]">
                    <Clock className="w-3.5 h-3.5 text-[#795548]" />
                    <span>{crop.growth_duration_days}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#795548]">
                    <Droplets className="w-3.5 h-3.5 text-[#0288D1]" />
                    <span>Water: {crop.water_requirement}</span>
                  </div>
                </div>

                {/* Reason for Area */}
                <div className="p-2.5 rounded-lg bg-[#F9F6F0] border border-[#E0D7C6]/80 text-[11px] leading-relaxed">
                  <span className="font-bold text-[#4E342E]">Why this thrives: </span>
                  <span className="text-[#795548]">{crop.reason_for_area}</span>
                </div>

                {/* Disease Break / Rotation Benefit */}
                <div className="p-2.5 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB] text-[11px] text-[#0D47A1] leading-relaxed flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1565C0] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Rotation Advantage: </span>
                    {crop.rotation_benefit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
