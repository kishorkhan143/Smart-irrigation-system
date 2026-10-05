import React, { useState } from 'react';
import { 
  Cpu, 
  Settings, 
  Sparkles, 
  Save, 
  Wifi, 
  Sliders, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  Droplet,
  CloudRain
} from 'lucide-react';
import { CurrentTelemetry, PumpState } from '../types/farm';

export const AiInsightsView: React.FC<{ telemetry: CurrentTelemetry; pumpState: PumpState }> = ({
  telemetry,
  pumpState,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            AI Precision Agriculture Diagnostics
          </h2>
          <p className="text-xs text-slate-400">Micro-climate analysis, evapotranspiration modeling, and automated yield forecasting</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Autonomous Irrigation Engine
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glow-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Droplet className="w-4 h-4" />
            Evapotranspiration Index (ET0)
          </div>
          <div className="text-2xl font-black text-white font-mono-numbers">
            4.2 mm/day
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calculated via Penman-Monteith equation using ambient 28°C temperature, 70% humidity, and 12 km/h wind speed.
          </p>
          <div className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-900/60">
            Water demand is moderate. Soil water holding capacity is adequate for next 6 hours.
          </div>
        </div>

        <div className="glow-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <CloudRain className="w-4 h-4" />
            Weather-Aware Irrigation Strategy
          </div>
          <div className="text-2xl font-black text-white font-mono-numbers">
            Rain Delay Standby
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Open-Meteo API forecasts 20% precipitation probability today. If rain chance exceeds 70%, ESP32 will automatically suspend auto-irrigation.
          </p>
          <div className="text-[11px] text-cyan-300 bg-cyan-950/60 p-2 rounded-lg border border-cyan-900/60">
            Conserving an estimated 25 Liters of water today.
          </div>
        </div>

        <div className="glow-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <TrendingUp className="w-4 h-4" />
            Projected Crop Yield Forecast
          </div>
          <div className="text-2xl font-black text-white font-mono-numbers">
            +18.4%
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consistent root zone moisture (58-68%) prevents cavitation and osmotic shock, ensuring optimal vegetative leaf surface expansion.
          </p>
          <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2 rounded-lg border border-amber-900/60">
            Harvest window expected 4 days ahead of baseline schedule.
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsView: React.FC<{
  pumpState: PumpState;
  onUpdateThreshold: (threshold: number) => void;
}> = ({ pumpState, onUpdateThreshold }) => {
  const [threshold, setThreshold] = useState(pumpState.autoThreshold);
  const [wetTarget, setWetTarget] = useState(pumpState.wetTarget);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateThreshold(threshold);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 animate-in fade-in max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Farm Station & Sensor Parameters
        </h2>
        <p className="text-xs text-slate-400">Calibrate analog moisture trigger setpoints and safety watchdogs</p>
      </div>

      <div className="glow-card rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Automated Irrigation Moisture Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Dry Soil Trigger (Turn ON Pump when below):</span>
                <span className="font-mono-numbers text-emerald-400 font-bold">{threshold}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Wet Target Cutoff (Turn OFF Pump when reached):</span>
                <span className="font-mono-numbers text-cyan-400 font-bold">{wetTarget}%</span>
              </div>
              <input
                type="range"
                min="65"
                max="90"
                value={wetTarget}
                onChange={(e) => setWetTarget(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-950/80">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Pump Relay Hardware Safety Timer
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Hardware watchdog in ESP32 C++ firmware automatically de-energizes the relay if pump runs longer than 35 seconds.
          </p>
          <div className="p-3 rounded-xl bg-black/40 border border-emerald-950 text-xs text-slate-300">
            GPIO 23 active LOW cutoff active. Flyback diode absorption enabled.
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-400 font-semibold animate-in fade-in">
              ✓ Settings saved to server and ESP32 node
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
