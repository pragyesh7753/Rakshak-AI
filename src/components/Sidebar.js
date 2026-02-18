'use client';

import { Shield, LayoutDashboard, Bell, User, Activity, X, Globe } from 'lucide-react';

export default function Sidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Regular Monitoring', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'domains', label: 'Domain Monitor', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Activity },
  ];

  const handleMenuClick = (id) => {
    setActiveSection(id);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Rakshak AI</h1>
                <p className="text-xs text-gray-400">Threat Intelligence</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                      ? 'bg-cyan-500 text-gray-900 font-medium'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">Operational</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
