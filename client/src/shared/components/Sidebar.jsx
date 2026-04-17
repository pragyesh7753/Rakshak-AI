'use client';

import {
  LayoutDashboard,
  Bell,
  User,
  MailWarning,
  Globe,
  LogOut,
  X,
  ScrollText,
  MessageCircleWarning,
  ShieldAlert,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats',
  },
  {
    id: 'social-intelligence',
    label: 'Social Intelligence',
    icon: MessageCircleWarning,
    description: 'Reddit threat feed',
  },
  {
    id: 'domains',
    label: 'Domain Intelligence',
    icon: Globe,
    description: 'Typosquatting monitor',
  },
  {
    id: 'email-intelligence',
    label: 'Email Intelligence',
    icon: MailWarning,
    description: 'Forwarded email analysis',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: Bell,
    description: 'Security notifications',
    hasBadge: true,
  },
  {
    id: 'profile',
    label: 'Organization',
    icon: Building2,
    description: 'Org settings',
  },
  {
    id: 'system',
    label: 'System Logs',
    icon: ScrollText,
    description: 'Pipeline & logs',
  },
];

/**
 * SOC-grade application sidebar.
 * Shows active item with a blue left accent bar + subtle bg highlight.
 * Unread alerts are shown as a red badge on the Alerts item.
 */
export default function Sidebar({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  user,
  unreadAlertCount = 0,
}) {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleMenuClick = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/login' });
    navigate('/login', { replace: true });
  };

  const userEmail = user?.email ?? user?.primaryEmailAddress?.emailAddress ?? '';
  const userInitials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : 'RA';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#1e293b', borderRight: '1px solid #334155' }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between" style={{ borderBottom: '1px solid #334155', minHeight: '64px' }}>
          <div className="flex items-center w-full justify-center">
            <img 
              src="/logo.png" 
              alt="Rakshak AI" 
              className="h-20 w-auto max-w-[180px]" 
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
            Navigation
          </p>
          <ul className="space-y-0.5">
            {MENU_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              const MenuIcon = item.icon;
              const showBadge = item.hasBadge && unreadAlertCount > 0;

              return (
                <li key={item.id}>
                  <button
                    id={`sidebar-${item.id}`}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative group"
                    style={
                      isActive
                        ? {
                            background: 'rgba(96,165,250,0.1)',
                            color: '#f8fafc',
                          }
                        : {
                            color: '#cbd5e1',
                          }
                    }
                  >
                    {/* Active left accent bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                        style={{ background: '#60a5fa' }}
                      />
                    )}

                    {/* Icon */}
                    <MenuIcon
                      className="w-4.5 h-4.5 flex-shrink-0 transition-colors"
                      style={{ width: 18, height: 18, color: isActive ? '#60a5fa' : '#94a3b8' }}
                    />

                    {/* Label */}
                    <span
                      className="flex-1 text-left text-sm font-medium"
                      style={{ color: isActive ? '#f8fafc' : '#cbd5e1' }}
                    >
                      {item.label}
                    </span>

                    {/* Alert badge */}
                    {showBadge && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: '#f87171', color: '#fff' }}
                      >
                        {unreadAlertCount > 99 ? '99+' : unreadAlertCount}
                      </span>
                    )}

                    {/* Hover chevron for inactive items */}
                    {!isActive && (
                      <ChevronRight
                        className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity"
                        style={{ color: '#94a3b8' }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ── */}
        <div className="px-3 pb-4 space-y-2" style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
          {/* Operational status */}
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{ background: '#0f172a' }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }} />
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>Systems Operational</span>
          </div>

          {/* User info */}
          {user && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: '#0f172a' }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #22d3ee)',
                  color: '#fff',
                }}
              >
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: '#f8fafc' }}>
                  {userEmail}
                </p>
                <p className="text-[10px]" style={{ color: '#94a3b8' }}>Administrator</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-md transition-colors hover:bg-red-500/20"
                style={{ color: '#be1c0dff' }}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
