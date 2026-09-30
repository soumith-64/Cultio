import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  // Mobile-first touch target sizes (minimum 44px height for md, lg, xl)
  const sizeClasses = {
    sm: 'text-sm py-2 px-3 min-h-[36px] rounded-lg gap-1.5',
    md: 'text-base font-medium py-3 px-5 min-h-[46px] rounded-xl gap-2',
    lg: 'text-lg font-semibold py-3.5 px-6 min-h-[52px] rounded-xl gap-2.5',
    xl: 'text-xl font-bold py-4 px-8 min-h-[60px] rounded-2xl gap-3 shadow-earth',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#2E7D32] hover:bg-[#1B5E20] text-white active:bg-[#1B5E20] shadow-earth hover:shadow-earth-lg border border-[#2E7D32]',
    secondary:
      'bg-[#F9F6F0] hover:bg-[#EFE8DC] text-[#4E342E] border border-[#E0D7C6] active:bg-[#E5DCCF]',
    accent:
      'bg-[#F57C00] hover:bg-[#E65100] text-white active:bg-[#E65100] shadow-earth hover:shadow-earth-lg border border-[#F57C00]',
    outline:
      'bg-transparent hover:bg-[#2E7D32]/10 text-[#2E7D32] border-2 border-[#2E7D32] active:bg-[#2E7D32]/20',
    danger:
      'bg-[#D32F2F] hover:bg-[#B71C1C] text-white active:bg-[#B71C1C] shadow-earth border border-[#D32F2F]',
    ghost:
      'bg-transparent hover:bg-[#4E342E]/5 text-[#4E342E] border-none active:bg-[#4E342E]/10',
  }[variant];

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/40 focus:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
