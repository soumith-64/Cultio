import React from 'react';
import { ExpertReview } from '@/types';
import { ShieldCheck, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';

interface ExpertNoteCardProps {
  review: ExpertReview;
}

export const ExpertNoteCard: React.FC<ExpertNoteCardProps> = ({ review }) => {
  return (
    <section className="bg-gradient-to-br from-[#FFFFFF] to-[#F1F8E9] border-2 border-[#2E7D32] rounded-3xl p-6 sm:p-8 shadow-earth-lg animate-fadeIn relative overflow-hidden">
      {/* Verified Banner Top Right */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2E7D32]/20 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#81C784]" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2E7D32] block">
              Human Professional Review
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#4E342E] tracking-tight">
              EXPERT AGRONOMIST NOTE
            </h2>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2E7D32] text-white text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#81C784]" />
          <span>Verified Diagnosis</span>
        </div>
      </div>

      {/* Reviewer Credentials */}
      <div className="flex items-center gap-3 mb-6 bg-white/80 p-3.5 rounded-2xl border border-[#2E7D32]/20">
        <div className="w-11 h-11 rounded-full bg-[#2E7D32]/15 text-[#2E7D32] flex items-center justify-center font-bold text-lg flex-shrink-0">
          <UserCheck className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base text-[#4E342E]">
            {review.expert_name}
          </div>
          <div className="text-xs text-[#795548]">
            {review.expert_title || 'Certified Agricultural Agronomist'}
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#795548] flex-shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>{new Date(review.reviewed_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Assessment Body */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] mb-1.5">
            Agronomist Clinical Assessment
          </h3>
          <div className="p-4 rounded-2xl bg-white border border-[#2E7D32]/20 text-[#4E342E] text-base leading-relaxed italic shadow-inner">
            &ldquo;{review.assessment}&rdquo;
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] mb-1.5">
            Direct Expert Prescription & Advice
          </h3>
          <div className="p-4 rounded-2xl bg-white border border-[#2E7D32]/20 text-[#4E342E] text-base leading-relaxed font-medium">
            {review.recommendations}
          </div>
        </div>
      </div>
    </section>
  );
};
