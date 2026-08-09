import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-text font-poppins">{title}</h1>
        {description && (
          <p className="text-muted font-inter mt-1">{description}</p>
        )}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </header>
  );
};
