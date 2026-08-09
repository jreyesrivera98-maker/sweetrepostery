import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
  color?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  onClick,
  color = '#6C5CE7',
}) => {
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div 
      className={`kpi-card glass-card p-6 rounded-[1rem] bg-surface shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted font-inter">{title}</h3>
        <div 
          className="p-2 rounded-full"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h2 className="text-3xl font-bold text-text font-poppins">{value}</h2>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : isNegative ? <ArrowDownRight size={16} /> : null}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      {trendLabel && (
        <p className="text-xs text-muted mt-2 font-inter">{trendLabel}</p>
      )}
    </div>
  );
};
