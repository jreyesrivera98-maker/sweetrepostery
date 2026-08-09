import React from 'react';

export interface SwitchProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <label className={`flex items-center justify-between p-4 bg-gray-50 border border-border rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${className}`}>
      {(label || description) && (
        <div>
          {label && <span className="block text-sm font-bold text-gray-900">{label}</span>}
          {description && <span className="block text-xs text-gray-600">{description}</span>}
        </div>
      )}
      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
};
