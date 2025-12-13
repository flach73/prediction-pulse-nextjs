'use client';

import { ReactNode } from 'react';

// Base Card Component
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-paper
        rounded-card
        shadow-card dark:shadow-card-dark
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between p-5 pb-0 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-textSecondary-light dark:text-textSecondary-dark mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card Content
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

// Statistics Card
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
  iconColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconColor = 'primary',
  subtitle,
}: StatsCardProps) {
  const iconBgColors = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    info: 'bg-info/10 text-info',
  };

  const changeColors = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-textSecondary-light dark:text-textSecondary-dark',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                {value}
              </span>
              {change && (
                <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                  {change}
                </span>
              )}
            </div>
            {subtitle && (
              <span className="text-xs text-textSecondary-light dark:text-textSecondary-dark">
                {subtitle}
              </span>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconBgColors[iconColor]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Market Card (for individual markets)
interface MarketCardProps {
  title: string;
  source: 'kalshi' | 'polymarket';
  probability: number;
  change24h?: number;
  volume?: string;
  onClick?: () => void;
}

export function MarketCard({
  title,
  source,
  probability,
  change24h,
  volume,
  onClick,
}: MarketCardProps) {
  const sourceColors = {
    kalshi: 'bg-info/10 text-info border-info/20',
    polymarket: 'bg-success/10 text-success border-success/20',
  };

  const probabilityColor = probability >= 70 
    ? 'text-success' 
    : probability >= 30 
      ? 'text-warning' 
      : 'text-error';

  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded border ${sourceColors[source]}`}>
            {source === 'kalshi' ? 'Kalshi' : 'Polymarket'}
          </span>
          {change24h !== undefined && (
            <span className={`text-sm font-medium ${change24h >= 0 ? 'text-success' : 'text-error'}`}>
              {change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}%
            </span>
          )}
        </div>
        
        <h4 className="text-base font-medium text-textPrimary-light dark:text-textPrimary-dark mb-3 line-clamp-2">
          {title}
        </h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${probabilityColor}`}>
              {probability}%
            </span>
            <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Yes
            </span>
          </div>
          
          {volume && (
            <span className="text-sm text-textSecondary-light dark:text-textSecondary-dark">
              Vol: {volume}
            </span>
          )}
        </div>

        {/* Probability Bar */}
        <div className="mt-3 h-1.5 bg-gray-100 dark:bg-dark-lighter rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              probability >= 70 ? 'bg-success' : probability >= 30 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${probability}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Chart Card Wrapper
interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, action, children, className = '' }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <CardContent className="pt-4">
        {children}
      </CardContent>
    </Card>
  );
}
