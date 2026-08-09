import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  pill?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', pill = true, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold font-poppins';
    
    const variants = {
      primary: 'bg-primary/15 text-primary',
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      danger: 'bg-danger/20 text-danger',
      info: 'bg-blue-100 text-blue-800',
      default: 'bg-gray-100 text-gray-800',
    };

    const radius = pill ? 'rounded-full' : 'rounded-md';

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${radius} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
