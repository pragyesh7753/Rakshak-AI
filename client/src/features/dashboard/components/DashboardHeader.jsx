'use client';

import { RefreshCw, Bell, Search, Menu } from 'lucide-react';

const SECTION_META = {
  dashboard:            { title: 'Overview Dashboard',     sub: 'Real-time threat intelligence across all channels' },
  'social-intelligence':{ title: 'Social Intelligence',    sub: 'AI-analyzed Reddit posts for threat detection' },
  domains:              { title: 'Domain Intelligence',     sub: 'Typosquatting and lookalike domain monitoring' },
  'email-intelligence': { title: 'Email Intelligence',      sub: 'AI analysis of forwarded suspicious emails' },
  alerts:               { title: 'Security Alerts',         sub: 'Unread notifications and escalated threats' },
  profile:              { title: 'Organization',            sub: 'Organization profile and settings' },
  system:               { title: 'System Logs',             sub: 'Pipeline runs and processing logs' },
};

/**
 * Sticky top navigation bar with dynamic title, search, notification bell, and user avatar.
 */
export default function DashboardHeader({
  activeSection,
  onMenuToggle,
  onRefresh,
  refreshing,
  unreadAlertCount = 0,
  userInitials = 'RA',
}) {
  const meta = SECTION_META[activeSection] ?? SECTION_META.dashboard;

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 py-3"
      style={{ background: '#1e293b', borderBottom: '1px solid #334155', minHeight: 64 }}
    >
      {/* Mobile hamburger */}
      <button
        id="navbar-menu-toggle"
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: '#94a3b8' }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title (left) */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <h2 className="text-base font-semibold truncate" style={{ color: '#f8fafc' }}>
          {meta.title}
        </h2>
        <p className="text-xs truncate" style={{ color: '#94a3b8' }}>
          {meta.sub}
        </p>
      </div>

      {/* Mobile title */}
      <div className="flex-1 sm:hidden">
        <h2 className="text-base font-semibold truncate" style={{ color: '#f8fafc' }}>
          {meta.title}
        </h2>
      </div>

      {/* Search bar (center-ish, hidden on very small) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg flex-shrink-0" style={{ background: '#0f172a', border: '1px solid #334155', width: 260 }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search threats, domains, emails..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: '#cbd5e1' }}
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <button
          id="navbar-refresh"
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg transition-colors disabled:opacity-50"
          style={{ color: '#94a3b8', background: '#0f172a', border: '1px solid #334155' }}
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Notification bell */}
        <button
          id="navbar-notifications"
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#94a3b8', background: '#0f172a', border: '1px solid #334155' }}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
              style={{ background: '#f87171', color: '#fff' }}
            >
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #60a5fa, #22d3ee)', color: '#fff' }}
          title="User profile"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
