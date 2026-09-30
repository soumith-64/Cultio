import React from 'react';
import { EnvironmentData } from '@/types';
import { Thermometer, Droplets, Gauge, Mountain, Layers, HelpCircle } from 'lucide-react';

interface DivisionEnvironmentProps {
  environment: EnvironmentData;
}

export const DivisionEnvironment: React.FC<DivisionEnvironmentProps> = ({ environment }) => {
  const { weather, soil } = environment;

  // Determine agronomic humidity risk
  const isHighHumidityRisk = weather.humidity > 75;
  const isOptimalPh = soil.soil_ph >= 6.0 && soil.soil_ph <= 7.2;

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
            Environmental Telemetry
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
            Microclimate & Soil Parameters
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F9F6F0] text-[#795548] border border-[#E0D7C6]">
          Simultaneous Ingestion
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Weather Intelligence Card */}
        <div className="bg-[#F9F6F0] border border-[#E0D7C6] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E0D7C6]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Weather Conditions
            </span>
            <span className="text-xs font-medium text-[#2E7D32]">
              {weather.condition || 'Atmospheric Baseline'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            {/* Temp */}
            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
              <Thermometer className="w-5 h-5 text-[#F57C00] mx-auto mb-1" />
              <div className="text-lg sm:text-xl font-extrabold text-[#4E342E]">
                {weather.temp}°C
              </div>
              <span className="text-[11px] font-semibold text-[#795548]">
                Temperature
              </span>
            </div>

            {/* Humidity */}
            <div
              className={`p-3 rounded-xl border shadow-sm ${
                isHighHumidityRisk
                  ? 'bg-[#FFA000]/10 border-[#FFA000]/40'
                  : 'bg-white border-[#E0D7C6]'
              }`}
            >
              <Droplets className="w-5 h-5 text-[#2E7D32] mx-auto mb-1" />
              <div className="text-lg sm:text-xl font-extrabold text-[#4E342E]">
                {weather.humidity}%
              </div>
              <span className="text-[11px] font-semibold text-[#795548]">
                Rel. Humidity
              </span>
            </div>

            {/* Pressure */}
            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
              <Gauge className="w-5 h-5 text-[#795548] mx-auto mb-1" />
              <div className="text-lg sm:text-xl font-extrabold text-[#4E342E]">
                {weather.pressure}
              </div>
              <span className="text-[11px] font-semibold text-[#795548]">
                hPa Pressure
              </span>
            </div>
          </div>

          {isHighHumidityRisk && (
            <p className="text-xs text-[#E65100] font-medium bg-[#FFA000]/15 p-2 rounded-lg">
              ⚠️ Elevated humidity (&gt;75%) accelerates fungal spore propagation on leaf canopies.
            </p>
          )}
        </div>

        {/* Soil Intelligence Card */}
        <div className="bg-[#F9F6F0] border border-[#E0D7C6] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E0D7C6]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
              Soil Intelligence
            </span>
            <span className="text-xs font-medium text-[#2E7D32]">
              {soil.organic_matter || 'Regional Horizon'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-center">
            {/* Soil Type */}
            <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm flex flex-col justify-center">
              <Mountain className="w-5 h-5 text-[#795548] mx-auto mb-1" />
              <div className="text-sm font-bold text-[#4E342E] line-clamp-1">
                {soil.soil_type}
              </div>
              <span className="text-[11px] font-semibold text-[#795548] mt-0.5">
                Soil Classification
              </span>
            </div>

            {/* Soil pH */}
            <div
              className={`p-3 rounded-xl border shadow-sm ${
                isOptimalPh
                  ? 'bg-white border-[#E0D7C6]'
                  : 'bg-[#FFA000]/10 border-[#FFA000]/40'
              }`}
            >
              <Layers className="w-5 h-5 text-[#2E7D32] mx-auto mb-1" />
              <div className="text-lg sm:text-xl font-extrabold text-[#4E342E]">
                {soil.soil_ph}
              </div>
              <span className="text-[11px] font-semibold text-[#795548]">
                Soil pH {isOptimalPh ? '(Optimal)' : '(Stress)'}
              </span>
            </div>
          </div>

          <div className="text-xs text-[#795548] bg-white p-2 rounded-lg border border-[#E0D7C6] flex items-center justify-between">
            <span>Natural Soil Infiltration:</span>
            <span className="font-bold text-[#4E342E]">{soil.drainage || 'Good Drainage'}</span>
          </div>
        </div>
      </div>

      {/* Hydrological & Water Intelligence Card */}
      {(() => {
        const water = environment.water || environment.weather.water;
        if (!water) return null;

        const isDeficit = water.water_stress_status === 'Moisture Deficit';
        const isSaturated = water.water_stress_status === 'Saturated / Waterlogged';

        return (
          <div className="bg-[#F9F6F0] border border-[#E0D7C6] rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0D7C6]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#795548]">
                  Hydrological & Water Intelligence
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2E7D32]/10 text-[#2E7D32]">
                  Live Reanalysis
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isDeficit
                    ? 'bg-[#FFA000]/15 text-[#E65100] border-[#FFA000]/40'
                    : isSaturated
                    ? 'bg-[#D32F2F]/15 text-[#B71C1C] border-[#D32F2F]/40'
                    : 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]/40'
                }`}
              >
                Water Status: {water.water_stress_status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              {/* Root Zone Moisture */}
              <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
                <div className="text-lg sm:text-xl font-extrabold text-[#2E7D32]">
                  {water.soil_moisture_root_zone_percent}%
                </div>
                <span className="text-[11px] font-semibold text-[#795548] block mt-0.5">
                  Root Moisture (3-9cm)
                </span>
              </div>

              {/* Surface Soil Moisture */}
              <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
                <div className="text-lg sm:text-xl font-extrabold text-[#4E342E]">
                  {water.soil_moisture_surface_percent}%
                </div>
                <span className="text-[11px] font-semibold text-[#795548] block mt-0.5">
                  Surface Moisture (0-1cm)
                </span>
              </div>

              {/* 24h Rainfall */}
              <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
                <div className="text-lg sm:text-xl font-extrabold text-[#0288D1]">
                  {water.precipitation_24h_mm} mm
                </div>
                <span className="text-[11px] font-semibold text-[#795548] block mt-0.5">
                  24h Precipitation
                </span>
              </div>

              {/* Reference Evapotranspiration */}
              <div className="bg-white p-3 rounded-xl border border-[#E0D7C6] shadow-sm">
                <div className="text-lg sm:text-xl font-extrabold text-[#F57C00]">
                  {water.evapotranspiration_mm} mm/d
                </div>
                <span className="text-[11px] font-semibold text-[#795548] block mt-0.5">
                  Evapotranspiration (ET₀)
                </span>
              </div>
            </div>

            {/* Irrigation Action Guidance */}
            <div className="text-xs text-[#4E342E] bg-white p-3 rounded-xl border border-[#E0D7C6] flex items-start gap-2 shadow-2xs">
              <span className="font-bold text-[#2E7D32] flex-shrink-0">Agronomic Water Guidance:</span>
              <span className="leading-relaxed">{water.irrigation_advice}</span>
            </div>
          </div>
        );
      })()}
    </section>
  );
};
