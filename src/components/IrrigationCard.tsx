import React, { useState } from 'react';
import { Droplet, Hand, Sprout, Clock, Power, Sliders, Check, ShieldAlert } from 'lucide-react';
import { PumpState } from '../types/farm';

interface IrrigationCardProps {
  pumpState: PumpState;
  onTogglePump: (turnOn?: boolean) => void;
  onChangeMode: (mode: 'auto' | 'manual') => void;
  onUpdateThreshold: (threshold: number) => void;
  isUpdating?: boolean;
}

export const IrrigationCard: React.FC<IrrigationCardProps> = ({
  pumpState,
  onTogglePump,
  onChangeMode,
  onUpdateThreshold,
  isUpdating = false,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(pumpState.autoThreshold);

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full relative">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg border text-cyan-400 ${
              pumpState.isOn ? 'bg-cyan-950/80 border-cyan-500/50' : 'bg-emerald-950/70 border-emerald-500/30'
            }`}>
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Water Pump & Irrigation
              </h2>
              <span className="text-[11px] text-slate-400">
                Relay Module (GPIO 23)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-emerald-300 transition-colors"
            title="Configure Moisture Thresholds"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Threshold Config Drawer */}
        {showSettings && (
          <div className="mb-3 p-3 rounded-xl bg-[#09221d] border border-emerald-500/30 text-xs animate-in fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white">Auto Watering Trigger</span>
              <span className="font-mono-numbers text-emerald-400 font-bold">{thresholdInput}%</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">
              Pump turns on automatically if soil moisture drops below this value.
            </p>
            <input
              type="range"
              min="20"
              max="70"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mb-2"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Dry (20%)</span>
              <button
                onClick={() => {
                  onUpdateThreshold(thresholdInput);
                  setShowSettings(false);
                }}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save Limit
              </button>
              <span>Wet (70%)</span>
            </div>
          </div>
        )}

        {/* Mode Selectors (Auto Mode vs Manual Mode) */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            onClick={() => onChangeMode('auto')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              pumpState.mode === 'auto'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] border border-emerald-400/60'
                : 'bg-emerald-950/40 text-slate-400 hover:text-white border border-emerald-900/40'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Auto Mode</span>
          </button>

          <button
            onClick={() => onChangeMode('manual')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              pumpState.mode === 'manual'
                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)] border border-cyan-400/60'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700/40'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Manual Mode</span>
          </button>
        </div>
      </div>

      {/* Main Pump Relay Switch Control - Clean & Intuitive for Farmers */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-950/80 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            pumpState.isOn 
              ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse'
              : 'bg-slate-800 text-slate-400'
          }`}>
            <Power className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-bold text-white">
              Water Pump: {pumpState.isOn ? <span className="text-emerald-400">RUNNING</span> : <span className="text-slate-400">STOPPED (OFF)</span>}
            </div>
            <div className="text-[11px] text-slate-400">
              {pumpState.isOn ? 'Relay Energized · Water Flowing' : 'Hardware Safe · Relay Open'}
            </div>
          </div>
        </div>

        {/* Large One-Click Farmer Toggle Button */}
        <button
          onClick={() => onTogglePump()}
          disabled={isUpdating}
          className={`px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all shadow-md active:scale-95 ${
            pumpState.isOn
              ? 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40'
          }`}
        >
          {pumpState.isOn ? 'STOP PUMP' : 'START PUMP'}
        </button>
      </div>

      {/* Next Irrigation & Water Usage */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-emerald-950/70">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next Irrigation:</span>
          <span className="font-bold text-white font-mono-numbers">
            {pumpState.mode === 'auto' && pumpState.nextIrrigationFormatted ? pumpState.nextIrrigationFormatted : 'Standby (Manual)'}
          </span>
        </div>
        <div className="font-mono-numbers text-slate-300">
          Used: <strong className="text-cyan-300 font-bold">{pumpState.totalLitersToday} L</strong>
        </div>
      </div>
    </div>
  );
};
