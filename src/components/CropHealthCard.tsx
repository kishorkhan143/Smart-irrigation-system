import React from 'react';
import { Leaf, Info } from 'lucide-react';
import { CurrentTelemetry } from '../types/farm';

interface CropHealthCardProps {
  telemetry: CurrentTelemetry;
}

export const CropHealthCard: React.FC<CropHealthCardProps> = ({ telemetry }) => {
  const healthPercent = telemetry.cropHealthScore || 0;
  const leafCondition = telemetry.leafCondition || 0;
  const diseaseRisk = telemetry.diseaseRisk || 0;
  const growthRate = telemetry.growthRate || 0;
  const nutrientLevel = telemetry.nutrientLevel || 0;

  // SVG Circular Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthPercent / 100) * circumference;

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Crop Health
            </h2>
            <span className="text-[11px] text-slate-400">
              {healthPercent === 0 ? 'Hardware Standby (Initial 0)' : 'Live Field Scan'}
            </span>
          </div>
        </div>

        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60 text-slate-400">
          {healthPercent === 0 ? 'Sensors Off' : 'Active'}
        </span>
      </div>

      {/* Main Gauge & Sub-metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center flex-1">
        {/* Left: Circular Radial Progress Ring */}
        <div className="sm:col-span-5 flex items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              {/* Background track circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-emerald-950/70"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={healthPercent === 0 ? '#334155' : 'url(#cropGlowGradient)'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />

              <defs>
                <linearGradient id="cropGlowGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Leaf className={`w-6 h-6 mb-0.5 ${healthPercent === 0 ? 'text-slate-500' : 'text-emerald-400'}`} />
              <span className="text-xs font-semibold text-slate-400">
                {healthPercent === 0 ? 'Standby' : 'Healthy'}
              </span>
              <span className="text-2xl font-black text-white font-mono-numbers tracking-tight">
                {healthPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sub-indicators List */}
        <div className="sm:col-span-7 space-y-2.5">
          {/* 1. Leaf Condition */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Leaf Condition</span>
              <span className="font-mono-numbers font-bold text-white">{leafCondition}%</span>
            </div>
            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${leafCondition}%` }}
              />
            </div>
          </div>

          {/* 2. Disease Risk */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Disease Risk</span>
              <span className="font-mono-numbers font-bold text-rose-400">{diseaseRisk}%</span>
            </div>
            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${diseaseRisk}%` }}
              />
            </div>
          </div>

          {/* 3. Growth Rate */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Growth Rate</span>
              <span className="font-mono-numbers font-bold text-white">{growthRate}%</span>
            </div>
            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${growthRate}%` }}
              />
            </div>
          </div>

          {/* 4. Nutrient Level */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Nutrient Level</span>
              <span className="font-mono-numbers font-bold text-cyan-300">{nutrientLevel}%</span>
            </div>
            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${nutrientLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
