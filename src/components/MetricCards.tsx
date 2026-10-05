import React from 'react';
import { CurrentTelemetry } from '../types/farm';

interface MetricCardsProps {
  telemetry: CurrentTelemetry;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ telemetry }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. SOIL MOISTURE CARD */}
      <div className="glow-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40">
        <div className="flex items-center gap-4">
          {/* Sprout in Soil Illustration */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
              <ellipse cx="50" cy="80" rx="38" ry="14" fill="#5c3a21" />
              <ellipse cx="50" cy="78" rx="34" ry="12" fill="#784b28" />
              <circle cx="35" cy="78" r="2.5" fill="#3d2412" />
              <circle cx="65" cy="79" r="2" fill="#3d2412" />
              <circle cx="48" cy="82" r="2.2" fill="#3d2412" />
              <path d="M50 78 Q50 50 49 38" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M49 54 C35 52 25 38 32 30 C44 26 50 44 49 54 Z" fill="#10b981" />
              <path d="M49 46 C63 42 72 28 64 22 C53 20 48 37 49 46 Z" fill="#22c55e" />
              <path d="M49 38 C46 30 48 20 50 18 C52 20 54 30 49 38 Z" fill="#86efac" />
            </svg>
          </div>

          {/* Value & Label */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block truncate">
              Soil Moisture
            </span>
            <div className="text-3xl font-extrabold text-white font-mono-numbers mt-0.5 tracking-tight flex items-baseline">
              <span>{Math.round(telemetry.soilMoisture)}%</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {telemetry.soilMoisture === 0 ? 'Sensor Standby / Off' : 'Soil Wetness Level'}
            </span>
          </div>
        </div>

        {/* Glowing Progress Underline */}
        <div className="mt-4 w-full bg-emerald-950/60 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, telemetry.soilMoisture))}%` }}
          />
        </div>
      </div>

      {/* 2. TEMPERATURE CARD */}
      <div className="glow-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-amber-500/40">
        <div className="flex items-center gap-4">
          {/* Thermometer Graphic */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
              <rect x="42" y="16" width="16" height="52" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
              <circle cx="50" cy="74" r="15" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
              <rect x="45" y="20" width="10" height="46" rx="5" fill="#0f172a" />
              <circle cx="50" cy="74" r="11" fill={telemetry.temperature === 0 ? '#64748b' : '#ef4444'} />
              <rect 
                x="47" 
                y={telemetry.temperature === 0 ? "70" : "32"} 
                width="6" 
                height={telemetry.temperature === 0 ? "4" : "36"} 
                rx="3" 
                fill={telemetry.temperature === 0 ? '#64748b' : 'url(#tempGradient)'} 
              />
              <line x1="58" y1="28" x2="63" y2="28" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58" y1="36" x2="63" y2="36" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="58" y1="44" x2="63" y2="44" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Value & Label */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block truncate">
              Temperature
            </span>
            <div className="text-3xl font-extrabold text-white font-mono-numbers mt-0.5 tracking-tight flex items-baseline">
              <span>{Math.round(telemetry.temperature)}°C</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {telemetry.temperature === 0 ? 'Sensor Standby / Off' : 'Field Air Temp'}
            </span>
          </div>
        </div>

        {/* Progress Underline */}
        <div className="mt-4 w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, (telemetry.temperature / 50) * 100))}%` }}
          />
        </div>
      </div>

      {/* 3. HUMIDITY CARD */}
      <div className="glow-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/40">
        <div className="flex items-center gap-4">
          {/* Glossy Water Droplet */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(6,182,212,0.3)]">
              <path 
                d="M50 16 C50 16 22 52 22 68 C22 84 34 92 50 92 C66 92 78 84 78 68 C78 52 50 16 50 16 Z" 
                fill={telemetry.humidity === 0 ? '#334155' : 'url(#dropletGradient)'} 
              />
              <path 
                d="M36 62 C34 50 44 32 48 26 C46 36 38 52 38 64 C38 68 36 68 36 62 Z" 
                fill="rgba(255,255,255,0.4)" 
              />
              <defs>
                <linearGradient id="dropletGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Value & Label */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block truncate">
              Humidity
            </span>
            <div className="text-3xl font-extrabold text-white font-mono-numbers mt-0.5 tracking-tight flex items-baseline">
              <span>{Math.round(telemetry.humidity)}%</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {telemetry.humidity === 0 ? 'Sensor Standby / Off' : 'Relative Moisture'}
            </span>
          </div>
        </div>

        {/* Progress Underline */}
        <div className="mt-4 w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, telemetry.humidity))}%` }}
          />
        </div>
      </div>

      {/* 4. LIGHT INTENSITY CARD */}
      <div className="glow-card rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-yellow-500/40">
        <div className="flex items-center gap-4">
          {/* Sun Graphic */}
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">
              <g stroke={telemetry.lightLux === 0 ? '#475569' : '#facc15'} strokeWidth="3.5" strokeLinecap="round">
                <line x1="50" y1="12" x2="50" y2="22" />
                <line x1="50" y1="78" x2="50" y2="88" />
                <line x1="12" y1="50" x2="22" y2="50" />
                <line x1="78" y1="50" x2="88" y2="50" />
              </g>
              <circle cx="50" cy="50" r="19" fill={telemetry.lightLux === 0 ? '#334155' : 'url(#sunGradient)'} />
              <defs>
                <linearGradient id="sunGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Value & Label */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block truncate">
              Light Intensity
            </span>
            <div className="text-3xl font-extrabold text-white font-mono-numbers mt-0.5 tracking-tight flex items-baseline gap-1">
              <span>{telemetry.lightLux}</span>
              <span className="text-sm font-medium text-slate-400 font-sans">lux</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
              {telemetry.lightLux === 0 ? 'Sensor Standby / Off' : 'Sunlight Level'}
            </span>
          </div>
        </div>

        {/* Progress Underline */}
        <div className="mt-4 w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, (telemetry.lightLux / 1000) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
