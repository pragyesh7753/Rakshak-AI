'use client';

import { RefreshCw } from 'lucide-react';

const SECTION_TITLES = {
  dashboard:  'Threat Intelligence Dashboard',
  monitoring: 'Regular Threat Detection',
  alerts:     'Security Alerts',
  domains:    'Domain Monitoring',
  profile:    'Organization Profile',
  system:     'System Logs',
};

/**
 * Sticky header bar shown above all dashboard sections.
 */
export default function DashboardHeader({ activeSection, onMenuToggle, onRefresh, refreshing }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
            {SECTION_TITLES[activeSection] ?? 'Dashboard'}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 hidden sm:block">
            Real-time cybersecurity monitoring and threat analysis
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-cyan-500 text-gray-900 font-medium rounded-lg hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
