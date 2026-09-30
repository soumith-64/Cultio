import React from 'react';

export const Skeleton: React.FC<{
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}> = ({ className = 'h-4 w-full', rounded = 'md' }) => {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`bg-[#EAE2D5] animate-pulse ${roundedClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ReportContextualSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto" aria-label="Loading crop report...">
      {/* Identity & Status Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl p-6 shadow-earth space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="flex gap-4 items-center">
          <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>

      {/* Environmental Context Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl p-6 shadow-earth space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F9F6F0] p-4 rounded-xl space-y-2 border border-[#E0D7C6]">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="bg-[#F9F6F0] p-4 rounded-xl space-y-2 border border-[#E0D7C6]">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="bg-[#F9F6F0] p-4 rounded-xl space-y-2 border border-[#E0D7C6]">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="bg-[#F9F6F0] p-4 rounded-xl space-y-2 border border-[#E0D7C6]">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      {/* AI Analysis Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl p-6 shadow-earth space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Action Plan Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl p-6 shadow-earth space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
