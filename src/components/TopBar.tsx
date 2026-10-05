import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Menu, 
  MapPin, 
  User,
  Power
} from 'lucide-react';
import { CurrentTelemetry } from '../types/farm';

interface TopBarProps {
  telemetry: CurrentTelemetry;
  onToggleMobileMenu: () => void;
  weatherLocation?: string;
  weatherCoordinates?: string;
  onRequestLocation?: () => void;
  onOpenMapPicker?: () => void;
  onNavigateTab: (tab: any) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  telemetry,
  onToggleMobileMenu,
  weatherLocation,
  weatherCoordinates,
  onRequestLocation,
  onOpenMapPicker,
  onNavigateTab,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = days[now.getDay()];
      const dayNum = String(now.getDate()).padStart(2, '0');
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');

      setCurrentDateTime(`${dayName}, ${dayNum} ${monthName} ${year}  ${strHours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLocationSet = weatherLocation && weatherLocation !== 'Farmland Location Not Set' && weatherLocation !== 'Detecting Location...';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#071714]/90 backdrop-blur-md border-b border-emerald-950/60 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50"
            aria-label="Open navigation"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <Sprout className="w-6 h-6 text-emerald-400 fill-emerald-500/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Smart Farm Dashboard</span>
              </h1>
              {isLocationSet ? (
                <div 
                  onClick={onOpenMapPicker || onRequestLocation}
                  className="text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium cursor-pointer hover:text-emerald-300 transition-colors"
                  title="Click to change farm land location on map"
                >
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{weatherLocation}</span>
                  {weatherCoordinates && (
                    <span className="text-[10px] text-emerald-500 font-mono-numbers hidden sm:inline">
                      [{weatherCoordinates}]
                    </span>
                  )}
                </div>
              ) : (
                <div 
                  onClick={onOpenMapPicker}
                  className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold cursor-pointer hover:underline animate-pulse"
                  title="Click to set farm land on the interactive map"
                >
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>Set Farm Land on Map (0 Standby)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Clean Status & Time */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Hardware Status: Standby OFF */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 text-slate-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Hardware: Standby (OFF)</span>
          </div>

          {/* Live Date and Time */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold tracking-wider text-slate-200 font-mono-numbers">
              {currentDateTime || 'Live Clock'}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-medium">
              Live Weather Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
