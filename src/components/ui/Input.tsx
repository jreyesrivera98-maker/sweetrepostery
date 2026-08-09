import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClass} flex flex-col gap-1.5`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 bg-white border rounded-xl text-sm font-inter text-text min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200
            ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
