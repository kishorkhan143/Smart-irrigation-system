import React from 'react';
import { 
  Home, 
  CloudSun, 
  Sparkles, 
  Droplet, 
  Leaf, 
  BarChart2, 
  Bell, 
  Cpu, 
  Settings, 
  X 
} from 'lucide-react';
import { NavTab } from '../types/farm';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  mobileOpen,
  onCloseMobile,
  unreadAlertCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'weather', label: 'Live Weather (API)', icon: <CloudSun className="w-5 h-5 text-amber-400" /> },
    { id: 'disease-doctor', label: 'Plant Disease Doctor', icon: <Sparkles className="w-5 h-5 text-emerald-400" /> },
    { id: 'irrigation', label: 'Water Pump & Irrigation', icon: <Droplet className="w-5 h-5 text-cyan-400" /> },
    { id: 'crop-health', label: 'Crop Health', icon: <Leaf className="w-5 h-5 text-emerald-400" /> },
    { id: 'soil-data', label: 'Soil Data (24 Hours)', icon: <BarChart2 className="w-5 h-5 text-emerald-300" /> },
    { id: 'alerts', label: 'Alerts & Notifications', icon: <Bell className="w-5 h-5 text-rose-400" />, badge: unreadAlertCount },
    { id: 'hardware', label: 'ESP32 Hardware & Code', icon: <Cpu className="w-5 h-5 text-cyan-300" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5 text-slate-400" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#061513] border-r border-emerald-950/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onTabChange('dashboard'); onCloseMobile(); }}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-900/40 via-emerald-950/80 to-[#04120f] border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Leaf className="w-6 h-6 text-emerald-400 fill-emerald-500/40" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">Smart Farm</div>
              <div className="text-[11px] text-emerald-400">Precision Station</div>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-emerald-950/50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links - Every Feature In Its Own Menu Item */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-600/15 to-transparent text-emerald-300 border-l-4 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'text-slate-400 hover:text-emerald-200 hover:bg-emerald-950/30'
                }`}
              >
                <span className={`transition-colors duration-200 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 text-[9px] font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Clean, quiet status at bottom */}
        <div className="p-4 border-t border-emerald-950/60 text-center text-[11px] text-slate-500">
          Precision Agriculture Node · Standby
        </div>
      </aside>
    </>
  );
};
