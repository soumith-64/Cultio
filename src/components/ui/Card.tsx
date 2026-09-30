import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'elevated' | 'accent' | 'expert';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  const variantClasses = {
    surface:
      'bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl shadow-earth',
    subtle:
      'bg-[#F9F6F0] border border-[#E0D7C6]/80 rounded-2xl',
    elevated:
      'bg-[#FFFFFF] border border-[#E0D7C6] rounded-2xl shadow-earth-lg',
    accent:
      'bg-[#81C784]/10 border border-[#81C784]/40 rounded-2xl shadow-earth',
    expert:
      'bg-gradient-to-br from-[#FFFDF9] to-[#F5EFE6] border-2 border-[#2E7D32]/30 rounded-2xl shadow-earth-lg',
  }[variant];

  return (
    <div className={`${variantClasses} ${paddingClasses} transition-all ${className}`} {...props}>
      {children}
    </div>
  );
};
