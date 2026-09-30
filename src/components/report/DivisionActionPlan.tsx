'use client';

import React, { useState } from 'react';
import { RecommendationPlan } from '@/types';
import { ListOrdered, Leaf, FlaskConical, Shield, Search } from 'lucide-react';

interface DivisionActionPlanProps {
  plan: RecommendationPlan;
}

export const DivisionActionPlan: React.FC<DivisionActionPlanProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'organic' | 'chemical' | 'preventive' | 'monitoring'>('plan');

  return (
    <section className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-3xl p-6 sm:p-8 shadow-earth space-y-6">
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

      {/* Tab 5: Monitoring Guidance */}
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
