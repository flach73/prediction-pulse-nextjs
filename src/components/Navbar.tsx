'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface NavbarProps {
  sidebarCollapsed?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Navbar({ sidebarCollapsed = false, onRefresh, isRefreshing = false }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    // Sync search input with URL
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <nav
      className={`
        sticky top-0 z-30
        bg-white/80 dark:bg-dark-paper/80
        backdrop-blur-md
        border-b border-border-light dark:border-border-dark
        transition-all duration-300
        ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}
      `}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-textSecondary-light dark:text-textSecondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2
              bg-gray-100 dark:bg-dark-lighter
              border border-transparent
              rounded-lg
              text-textPrimary-light dark:text-textPrimary-dark
              placeholder-textSecondary-light dark:placeholder-textSecondary-dark
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              transition-all
            "
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg className="w-4 h-4 text-textSecondary-light dark:text-textSecondary-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="
              p-2 rounded-lg
              text-textSecondary-light dark:text-textSecondary-dark
              hover:bg-gray-100 dark:hover:bg-dark-lighter
              disabled:opacity-50
              transition-colors
            "
            title="Refresh data"
          >
            <svg
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="
              p-2 rounded-lg
              text-textSecondary-light dark:text-textSecondary-dark
              hover:bg-gray-100 dark:hover:bg-dark-lighter
              transition-colors
            "
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <button
            className="
              relative p-2 rounded-lg
              text-textSecondary-light dark:text-textSecondary-dark
              hover:bg-gray-100 dark:hover:bg-dark-lighter
              transition-colors
            "
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {/* User Avatar */}
          <button
            className="
              w-9 h-9 rounded-full
              bg-primary/10
              flex items-center justify-center
              text-primary font-semibold
              hover:bg-primary/20
              transition-colors
            "
          >
            PP
          </button>
        </div>
      </div>
    </nav>
  );
}
