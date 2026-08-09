import React, { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'solid', children, ...props }, ref) => {
    const baseStyles = 'rounded-brand overflow-hidden transition-all duration-250';
    
    const variants = {
      glass: 'bg-white/85 backdrop-blur-[12px] border border-secondary/40 shadow-[0_8px_32px_rgba(108,92,231,0.04)]',
      solid: 'bg-white border border-border shadow-sm',
      outline: 'bg-transparent border-2 border-border',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
