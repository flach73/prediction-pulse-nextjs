'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DashboardLayout({ children, onRefresh, isRefreshing }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background dark:bg-dark">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}
        `}
      >
        {/* Navbar */}
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between text-sm text-textSecondary-light dark:text-textSecondary-dark">
            <span>© 2025 Prediction Pulse</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a 
                href="https://github.com/flach73/prediction-pulse-nextjs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
