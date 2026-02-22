'use client';

import { LayoutDashboard, Bell, User, Activity, Globe, LogOut, X, ScrollText } from 'lucide-react';
import Image from 'next/image';

/**
 * Application sidebar — shared across all dashboard sections.
 * Nav items use distinct icons (Activity for monitoring, ScrollText for system logs).
 */
export default function Sidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, user }) {
  const menuItems = [
    { id: 'dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
    { id: 'monitoring', label: 'Regular Monitoring', icon: Activity },
    { id: 'alerts',     label: 'Alerts',             icon: Bell },
    { id: 'domains',    label: 'Domain Monitor',     icon: Globe },
    { id: 'profile',    label: 'Profile',            icon: User },
    { id: 'system',     label: 'System',             icon: ScrollText }, // Fix: was incorrectly Activity
  ];

  const handleMenuClick = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-900 border-r border-gray-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="relative h-14 w-36">
              <Image src="/logo.png" alt="Rakshak AI" fill className="object-contain" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => handleMenuClick(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-gray-900 font-medium'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="px-4 py-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-white font-medium">Operational</span>
            </div>
          </div>

          {user && (
            <div className="px-4 py-3 bg-gray-800/60 rounded-lg">
              <p className="text-xs text-gray-400 truncate mb-2">{user.email}</p>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors w-full"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
