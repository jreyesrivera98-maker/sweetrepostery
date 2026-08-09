import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-2xl bg-surface/50">
      <div className="w-16 h-16 rounded-full bg-secondary-light flex items-center justify-center mb-6">
        <Icon size={32} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold font-poppins text-text mb-2">{title}</h3>
      <p className="text-muted font-inter max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
