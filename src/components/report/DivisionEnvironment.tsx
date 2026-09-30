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
    </section>
  );
};
