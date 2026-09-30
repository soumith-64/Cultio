'use client';

import React, { useState } from 'react';
import { ComputerVisionMetrics } from '@/types';
import { Eye, Layers, Activity, Sparkles, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface DivisionComputerVisionProps {
  metrics: ComputerVisionMetrics;
  originalImageUrl: string;
}

export const DivisionComputerVision: React.FC<DivisionComputerVisionProps> = ({
  metrics,
  originalImageUrl,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const isSevereDamage = metrics.lesion_surface_area_percent > 30;
  const isModerateDamage = metrics.lesion_surface_area_percent > 12;

  const currentDisplayImage =
    showOverlay && metrics.annotated_overlay_url
      ? metrics.annotated_overlay_url
      : originalImageUrl;

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0D7C6]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32]">
              Computer Vision & Mathematical Feature Extraction
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
              Foliar Lesion Segmentation & Metrics
            </h2>
          </div>
        </div>

        {metrics.annotated_overlay_url && (
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              showOverlay
                ? 'bg-[#D32F2F] text-white border-[#B71C1C] shadow-sm'
                : 'bg-[#F9F6F0] text-[#4E342E] border-[#E0D7C6] hover:bg-[#EFE8DC]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{showOverlay ? 'Hide Lesion Mask' : 'Show CV Lesion Mask'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left = Visual Preview (Original or Mask), Right = Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Interactive Foliar Image with Mask Toggle */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#E0D7C6] bg-[#F9F6F0] aspect-[4/3] shadow-inner group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentDisplayImage}
            alt="Foliar Lesion Detection"
            className="w-full h-full object-cover transition-all duration-300"
          />

          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#81C784]" />
            <span>
              {showOverlay ? 'CV Segmented Lesion Mask' : 'Original Field Capture'}
            </span>
          </div>

          {showOverlay && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-sm text-white p-2 rounded-xl text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block" />
                <span>Red: Necrotic Lesions</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFAA00] inline-block" />
                <span>Amber: Chlorosis</span>
              </span>
            </div>
          )}
        </div>

        {/* Empirical Numerical Metrics */}
        <div className="space-y-4">
          {/* Primary Damage Gauge */}
          <div className="bg-[#F9F6F0] p-5 rounded-2xl border border-[#E0D7C6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
                Foliar Lesion Surface Area
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isSevereDamage
                    ? 'bg-[#D32F2F]/15 text-[#B71C1C]'
                    : isModerateDamage
                    ? 'bg-[#FFA000]/15 text-[#E65100]'
                    : 'bg-[#388E3C]/15 text-[#2E7D32]'
                }`}
              >
                {isSevereDamage ? 'Critical' : isModerateDamage ? 'Moderate' : 'Low Spread'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#4E342E]">
                {metrics.lesion_surface_area_percent}%
              </span>
              <span className="text-xs font-semibold text-[#795548]">
                of foliar lamina affected
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#E0D7C6] h-3 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${metrics.healthy_canopy_percent}%` }}
                className="bg-[#2E7D32] h-full"
                title={`Healthy Tissue: ${metrics.healthy_canopy_percent}%`}
              />
              <div
                style={{ width: `${metrics.color_distribution.chlorotic_yellow}%` }}
                className="bg-[#FFA000] h-full"
                title={`Chlorosis: ${metrics.color_distribution.chlorotic_yellow}%`}
              />
              <div
                style={{ width: `${metrics.color_distribution.necrotic_brown}%` }}
                className="bg-[#D32F2F] h-full"
                title={`Necrosis: ${metrics.color_distribution.necrotic_brown}%`}
              />
            </div>
          </div>

          {/* Color Spectrum Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] inline-block mb-1" />
              <div className="font-extrabold text-[#4E342E] text-base">
                {metrics.color_distribution.healthy_green}%
              </div>
              <span className="text-[10px] text-[#795548] font-semibold block">
                Healthy Green
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFA000] inline-block mb-1" />
              <div className="font-extrabold text-[#4E342E] text-base">
                {metrics.color_distribution.chlorotic_yellow}%
              </div>
              <span className="text-[10px] text-[#795548] font-semibold block">
                Chlorotic Yellow
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] inline-block mb-1" />
              <div className="font-extrabold text-[#4E342E] text-base">
                {metrics.color_distribution.necrotic_brown}%
              </div>
              <span className="text-[10px] text-[#795548] font-semibold block">
                Necrotic Tissue
              </span>
            </div>
          </div>

          {/* Chlorophyll Index (ExG) */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E0D7C6] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#4E342E] block">
                Vegetation Health Index (ExG)
              </span>
              <span className="text-[11px] text-[#795548]">
                Excess Green Index measurement (2G - R - B)
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#2E7D32]">
                {metrics.chlorophyll_health_index > 0 ? `+${metrics.chlorophyll_health_index}` : metrics.chlorophyll_health_index}
              </span>
              <span className="text-[10px] text-[#795548] block font-semibold">
                {metrics.chlorophyll_health_index > 0.4 ? 'Vigorous' : 'Suppressed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
