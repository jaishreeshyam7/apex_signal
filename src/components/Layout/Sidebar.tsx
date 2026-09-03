import React from 'react';
import { useBilling } from '../../context/BillingContext';
import {
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Package,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, user, logout } = useBilling();

  const navItems = [
    {
      group: 'BILLING',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'new-invoice', label: 'New Invoice', icon: FilePlus },
        { id: 'invoices', label: 'Invoice History', icon: History },
      ],
    },
    {
      group: 'MASTERS',
      items: [
        { id: 'parties', label: 'Party Master', icon: Users },
        { id: 'items', label: 'Item Master', icon: Package },
        { id: 'settings', label: 'Company Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0a152e] text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800/60 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight leading-tight">Yash Polymers</h2>
            <p className="text-xs text-slate-400 font-medium">Invoice Management</p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070e20]">
        <div className="text-xs text-slate-400 truncate mb-2 font-medium" title={user?.email}>
          {user?.email || 'ygbillion17@gmail.com'}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
