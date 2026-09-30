import React from 'react';
import { Severity, ReportStatus } from '@/types';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className = '',
  size = 'md',
}) => {
  const configs = {
    HEALTHY: {
      label: 'Healthy / Vigorous',
      bg: 'bg-[#388E3C]/12 text-[#2E7D32] border-[#388E3C]/30',
      icon: <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2E7D32]" />,
    },
    LOW: {
      label: 'Low Risk',
      bg: 'bg-[#81C784]/20 text-[#2E7D32] border-[#81C784]/40',
      icon: <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#2E7D32]" />,
    },
    MODERATE: {
      label: 'Moderate Risk',
      bg: 'bg-[#FFA000]/15 text-[#E65100] border-[#FFA000]/40',
      icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#F57C00]" />,
    },
    CRITICAL: {
      label: 'Critical Condition',
      bg: 'bg-[#D32F2F]/15 text-[#B71C1C] border-[#D32F2F]/40',
      icon: <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#D32F2F]" />,
    },
  }[severity] || {
    label: severity,
    bg: 'bg-[#795548]/10 text-[#4E342E] border-[#795548]/20',
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#795548]" />,
  };

  const sizeClass = {
    sm: 'text-xs py-1 px-2.5 rounded-md gap-1',
    md: 'text-sm font-semibold py-1.5 px-3.5 rounded-lg gap-1.5',
    lg: 'text-base font-bold py-2 px-4 rounded-xl gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center border font-medium ${configs.bg} ${sizeClass} ${className}`}
      role="status"
      aria-label={`Severity level: ${configs.label}`}
    >
      {configs.icon}
      <span>{configs.label}</span>
    </span>
  );
};

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const configs = {
    CREATED: {
      label: 'Created',
      bg: 'bg-[#EFE8DC] text-[#4E342E] border-[#E0D7C6]',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    PROCESSING: {
      label: 'Analyzing Pipeline...',
      bg: 'bg-[#FFA000]/15 text-[#E65100] border-[#FFA000]/30',
      icon: <span className="w-2 h-2 rounded-full bg-[#F57C00] animate-ping mr-0.5" />,
    },
    AI_ANALYZED: {
      label: 'AI Diagnosed',
      bg: 'bg-[#2E7D32]/12 text-[#2E7D32] border-[#2E7D32]/30',
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#2E7D32]" />,
    },
    PENDING_EXPERT: {
      label: 'Awaiting Expert Review',
      bg: 'bg-[#F57C00]/15 text-[#E65100] border-[#F57C00]/40',
      icon: <Clock className="w-3.5 h-3.5 text-[#F57C00]" />,
    },
    EXPERT_REVIEWED: {
      label: 'Expert Agronomist Verified',
      bg: 'bg-[#2E7D32] text-white border-[#1B5E20] shadow-sm',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#81C784]" />,
    },
  }[status] || {
    label: status,
    bg: 'bg-[#EFE8DC] text-[#4E342E] border-[#E0D7C6]',
    icon: null,
  };

  const sizeClass = {
    sm: 'text-xs py-0.5 px-2 rounded-md gap-1',
    md: 'text-sm font-semibold py-1 px-3 rounded-lg gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center border font-medium ${configs.bg} ${sizeClass} ${className}`}
      role="status"
    >
      {configs.icon}
      <span>{configs.label}</span>
    </span>
  );
};
