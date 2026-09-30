'use client';

import React, { useState } from 'react';
import { RecommendationPlan } from '@/types';
import { ListOrdered, Leaf, FlaskConical, Shield, Search, Landmark, ExternalLink, CheckCircle2 } from 'lucide-react';

interface DivisionActionPlanProps {
  plan: RecommendationPlan;
}

export const DivisionActionPlan: React.FC<DivisionActionPlanProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'organic' | 'chemical' | 'preventive' | 'monitoring' | 'gov'>('plan');

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
            Division 4 — Action Plan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4E342E]">
            Actionable Agronomic Guidance
          </h2>
          <p className="text-xs sm:text-sm text-[#795548] mt-1">
            Follow the sequential steps to halt disease progression and restore crop vitality.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-[#2E7D32] text-xs font-bold self-start sm:self-auto">
          <Landmark className="w-3.5 h-3.5" />
          <span>ICAR & CIBRC Grounded</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#E0D7C6] text-xs font-bold no-scrollbar">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'plan'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#4E342E] hover:bg-[#F9F6F0]'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Immediate Action Plan</span>
        </button>

        <button
          onClick={() => setActiveTab('organic')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'organic'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#4E342E] hover:bg-[#F9F6F0]'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-[#81C784]" />
          <span>Organic Solutions</span>
        </button>

        <button
          onClick={() => setActiveTab('chemical')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'chemical'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#4E342E] hover:bg-[#F9F6F0]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-[#FFA000]" />
          <span>Targeted Treatments</span>
        </button>

        <button
          onClick={() => setActiveTab('preventive')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preventive'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#4E342E] hover:bg-[#F9F6F0]'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Preventive Actions</span>
        </button>

        <button
          onClick={() => setActiveTab('gov')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'gov'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#2E7D32] bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Govt Agriculture Standards</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'monitoring'
              ? 'bg-[#2E7D32] text-white shadow-sm'
              : 'text-[#4E342E] hover:bg-[#F9F6F0]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#795548]" />
          <span>Field Monitoring</span>
        </button>
      </div>

      {/* Tab 1: Ordered Action Plan */}
      {activeTab === 'plan' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Sequential Field Execution:
          </div>
          {plan.ordered_action_plan.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6] transition-all"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2E7D32] text-white font-extrabold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                {idx + 1}
              </div>
              <div className="text-base text-[#4E342E] font-medium leading-relaxed pt-0.5">
                {step.replace(/^Step \d+:\s*/i, '')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Organic Solutions */}
      {activeTab === 'organic' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
            Biological & Organic Interventions:
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {plan.organic_solutions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#81C784]/12 border border-[#81C784]/40 text-[#2E7D32]"
              >
                <Leaf className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
                <span className="text-sm font-semibold text-[#4E342E] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Chemical Solutions */}
      {activeTab === 'chemical' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E65100]">
            Targeted Chemical Protectants (Follow Label Safety & PHI):
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {plan.chemical_solutions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#FFA000]/10 border border-[#FFA000]/40 text-[#E65100]"
              >
                <FlaskConical className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#E65100]" />
                <span className="text-sm font-semibold text-[#4E342E] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Preventive Actions */}
      {activeTab === 'preventive' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Cultural & Preventive Practices:
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {plan.preventive_actions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6]"
              >
                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
                <span className="text-sm font-medium text-[#4E342E] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Government Standards & Portals */}
      {activeTab === 'gov' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-[#2E7D32]/10 border border-[#2E7D32]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
              <Landmark className="w-4 h-4 text-[#2E7D32]" />
              <span>Official National Agricultural Portals & Trust Framework:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4E342E] leading-relaxed">
              Cultivo aligns with official agricultural guidelines from the Ministry of Agriculture and ICAR. Use these verified government web portals for authentic crop advisories, subsidies, and registered pesticide lists:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://kisansuvidha.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border-2 border-[#2E7D32]/30 hover:border-[#2E7D32] transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2E7D32] uppercase">Kisan Suvidha Portal</span>
                  <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-[#4E342E] mb-1">
                  National Farmer Welfare & Plant Protection
                </h4>
                <p className="text-xs text-[#795548] leading-relaxed">
                  Provides live mandi prices, official agro-advisories from local Krishi Vigyan Kendras (KVK), and weather risk alerts.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D32] mt-3 block">
                kisansuvidha.gov.in ↗
              </span>
            </a>

            <a
              href="https://soilhealth.dac.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border-2 border-[#81C784]/40 hover:border-[#2E7D32] transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2E7D32] uppercase">Soil Health Card Portal</span>
                  <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-[#4E342E] mb-1">
                  Dept of Agriculture & Farmers Welfare
                </h4>
                <p className="text-xs text-[#795548] leading-relaxed">
                  Standardized macro and micro-nutrient status, soil pH correction dosage recommendations, and fertilizer calculator.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D32] mt-3 block">
                soilhealth.dac.gov.in ↗
              </span>
            </a>

            <a
              href="https://icar.org.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border-2 border-[#E0D7C6] hover:border-[#2E7D32] transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#795548] uppercase">ICAR Research Portal</span>
                  <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-[#4E342E] mb-1">
                  Indian Council of Agricultural Research
                </h4>
                <p className="text-xs text-[#795548] leading-relaxed">
                  Peer-reviewed package of practices for horticultural and field crops across all Indian agro-climatic zones.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D32] mt-3 block">
                icar.org.in ↗
              </span>
            </a>

            <a
              href="https://cibrc.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white border-2 border-[#E0D7C6] hover:border-[#2E7D32] transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#795548] uppercase">CIBRC Agrochemical Registry</span>
                  <ExternalLink className="w-4 h-4 text-[#2E7D32] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-[#4E342E] mb-1">
                  Central Insecticides Board
                </h4>
                <p className="text-xs text-[#795548] leading-relaxed">
                  Statutory list of registered pesticides, bio-fungicides, label claim dosages, and waiting period mandates.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#2E7D32] mt-3 block">
                cibrc.gov.in ↗
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Tab 6: Monitoring Guidance */}
      {activeTab === 'monitoring' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold uppercase tracking-wider text-[#795548]">
            Ongoing Scouting & Monitoring Protocol:
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {plan.monitoring_guidance.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-2xl bg-[#F9F6F0] border border-[#E0D7C6]"
              >
                <Search className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#795548]" />
                <span className="text-sm font-medium text-[#4E342E] leading-relaxed">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
