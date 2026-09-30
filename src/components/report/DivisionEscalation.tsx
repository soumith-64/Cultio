'use client';

import React from 'react';
import { ReportStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

interface DivisionEscalationProps {
  status: ReportStatus;
  onRequestExpert: () => void;
  isLoading?: boolean;
}

export const DivisionEscalation: React.FC<DivisionEscalationProps> = ({
  status,
  onRequestExpert,
  isLoading = false,
}) => {
  const isReviewed = status === 'EXPERT_REVIEWED';
  const isPending = status === 'PENDING_EXPERT';

  if (isReviewed) {
    return (
      <div className="bg-[#2E7D32]/10 border-2 border-[#2E7D32]/40 rounded-3xl p-6 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-[#81C784]" />
        </div>
        <h3 className="text-lg font-bold text-[#2E7D32]">
          Expert Review Complete
        </h3>
        <p className="text-xs sm:text-sm text-[#795548] max-w-md mx-auto">
          A certified agronomist has reviewed this diagnosis. Their clinical assessment is displayed at the top of this report.
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="bg-[#FFA000]/15 border-2 border-[#FFA000]/50 rounded-3xl p-6 sm:p-8 text-center space-y-3 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-[#FFA000]/25 text-[#E65100] flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-[#E65100]">
          Expert Review Requested
        </h3>
        <p className="text-sm text-[#795548] max-w-lg mx-auto leading-relaxed">
          Your crop case and environmental telemetry have been dispatched to our on-duty agricultural experts. You do not need to refresh; this report will automatically update the moment their review is submitted.
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#E65100] bg-white px-3.5 py-1.5 rounded-full border border-[#FFA000]/40">
          <span className="w-2 h-2 rounded-full bg-[#F57C00] animate-ping" />
          <span>Real-time listener active</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-r from-[#FFFFFF] to-[#F9F6F0] border-2 border-[#E0D7C6] hover:border-[#2E7D32]/50 rounded-3xl p-6 sm:p-8 shadow-earth text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto">
        <UserCheck className="w-6 h-6" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
          Division 5 — Human Validation
        </span>
        <h3 className="text-xl font-bold text-[#4E342E]">
          Want a Human Agronomist to Validate This?
        </h3>
        <p className="text-xs sm:text-sm text-[#795548] leading-relaxed">
          Escalate your crop photograph and microclimate conditions to certified agricultural scientists for second-opinion clinical confirmation.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onRequestExpert}
          isLoading={isLoading}
          className="w-full sm:w-auto font-bold shadow-earth px-8 min-h-[50px]"
          leftIcon={<ShieldCheck className="w-5 h-5" />}
        >
          Request Expert Review
        </Button>
      </div>
    </section>
  );
};
