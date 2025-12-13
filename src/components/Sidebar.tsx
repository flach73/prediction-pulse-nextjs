'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    path: '/',
  },
  {
    title: 'All Markets',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    path: '/',
  },
  {
    title: 'Kalshi',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    path: '/?source=kalshi',
    badge: 'K',
    badgeColor: 'info',
  },
  {
    title: 'Polymarket',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    path: '/?source=polymarket',
    badge: 'P',
    badgeColor: 'success',
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSource = searchParams.get('source');

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' && !currentSource;
    }
    if (path.includes('?source=')) {
      const source = path.split('source=')[1];
      return currentSource === source;
    }
    return pathname === path;
  };

  const badgeColors = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        bg-white dark:bg-dark-paper
        border-r border-border-light dark:border-border-dark
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark">
        <Link href="/" className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Prediction<span className="text-primary">Pulse</span>
            </span>
          )}
        </Link>
        
        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className={`
            p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-lighter
            text-textSecondary-light dark:text-textSecondary-dark
            transition-colors
            ${collapsed ? 'absolute -right-3 top-6 bg-white dark:bg-dark-paper border border-border-light dark:border-border-dark shadow-sm' : ''}
          `}
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {!collapsed && (
          <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-wider text-textSecondary-light dark:text-textSecondary-dark">
            Markets
          </p>
        )}
        
        {menuItems.map((item) => (
          <Link
            key={item.path + item.title}
            href={item.path}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200
              ${isActive(item.path)
                ? 'bg-primary text-white shadow-md'
                : 'text-textSecondary-light dark:text-textSecondary-dark hover:bg-gray-100 dark:hover:bg-dark-lighter'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? item.title : undefined}
          >
            {item.icon}
            {!collapsed && (
              <>
                <span className="flex-1 font-medium">{item.title}</span>
                {item.badge && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${badgeColors[item.badgeColor || 'primary']}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-light dark:border-border-dark">
          <div className="p-4 rounded-lg bg-primary/10">
            <p className="text-sm font-medium text-primary">Data Sources</p>
            <p className="text-xs text-textSecondary-light dark:text-textSecondary-dark mt-1">
              Kalshi + Polymarket APIs
            </p>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-1 text-xs bg-info/20 text-info rounded">Kalshi</span>
              <span className="px-2 py-1 text-xs bg-success/20 text-success rounded">Polymarket</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}