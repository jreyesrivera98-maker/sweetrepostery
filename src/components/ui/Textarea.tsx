import React, { type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, fullWidth = true, rows = 3, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${widthClass} flex flex-col gap-1.5`}>
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            px-3 py-2 bg-white border rounded-xl text-sm font-inter text-text
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-all duration-200 resize-none
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

Textarea.displayName = 'Textarea';
