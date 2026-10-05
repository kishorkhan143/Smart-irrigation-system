import React, { useState } from 'react';
import { Sprout, ChevronDown } from 'lucide-react';
import { TelemetryPoint } from '../types/farm';

interface SoilDataChartProps {
  history: TelemetryPoint[];
}

type MetricType = 'soilMoisture' | 'temperature' | 'humidity' | 'lightLux';

export const SoilDataChart: React.FC<SoilDataChartProps> = ({ history }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('soilMoisture');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPoint | null>(null);

  const metricOptions: { id: MetricType; label: string; unit: string; color: string; stroke: string }[] = [
    { id: 'soilMoisture', label: 'Soil Moisture', unit: '%', color: '#10b981', stroke: '#34d399' },
    { id: 'temperature', label: 'Temperature', unit: '°C', color: '#f59e0b', stroke: '#fbbf24' },
    { id: 'humidity', label: 'Humidity', unit: '%', color: '#06b6d4', stroke: '#38bdf8' },
    { id: 'lightLux', label: 'Light Intensity', unit: 'lux', color: '#eab308', stroke: '#facc15' },
  ];

  const currentConfig = metricOptions.find(m => m.id === selectedMetric) || metricOptions[0];

  const width = 500;
  const height = 140;
  const paddingX = 20;
  const paddingY = 15;

  const getMaxValue = () => {
    if (selectedMetric === 'soilMoisture' || selectedMetric === 'humidity') return 100;
    if (selectedMetric === 'temperature') return 50;
    return 1000;
  };

  const maxValue = getMaxValue();

  // Compute SVG Points
  const points = history.map((pt, idx) => {
    const val = pt[selectedMetric] as number;
    const x = paddingX + (idx / Math.max(1, history.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (val / maxValue) * (height - 2 * paddingY);
    return { x, y, val, pt };
  });

  const generatePath = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = generatePath();
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  const isAllZero = history.every(h => (h[selectedMetric] as number) === 0);

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-emerald-400">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Soil Data (Last 24 Hours)
            </h2>
            <span className="text-[11px] text-slate-400">
              {isAllZero ? 'Hardware Off (Initial 0 baseline)' : '24-Hour Trend'}
            </span>
          </div>
        </div>

        {/* Metric Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-all shadow-sm"
          >
            <span>{currentConfig.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#09221d] border border-emerald-500/30 shadow-2xl z-40 overflow-hidden py-1">
              {metricOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedMetric(opt.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedMetric === opt.id 
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold' 
                      : 'text-slate-300 hover:bg-emerald-950/50 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono-numbers">{opt.unit}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Neon Chart Area */}
      <div className="relative w-full flex-1 min-h-[140px] pt-1">
        {/* Y-Axis Labels matching screenshot (100%, 50%, 0%) */}
        <div className="absolute left-0 top-1 bottom-6 flex flex-col justify-between text-[10px] font-mono-numbers font-medium text-slate-400 pointer-events-none select-none">
          <span>{maxValue}{selectedMetric === 'lightLux' ? '' : '%'}</span>
          <span>{Math.round(maxValue / 2)}{selectedMetric === 'lightLux' ? '' : '%'}</span>
          <span>0{selectedMetric === 'lightLux' ? '' : '%'}</span>
        </div>

        {/* SVG Area Chart */}
        <div className="pl-7 pr-2 h-full">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.45" />
                <stop offset="60%" stopColor={currentConfig.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
              </linearGradient>

              <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(16, 185, 129, 0.1)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="rgba(16, 185, 129, 0.1)" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(16, 185, 129, 0.25)" />

            {/* Area Path */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Glowing Line */}
            <path 
              d={linePath} 
              fill="none" 
              stroke={currentConfig.stroke} 
              strokeWidth="2.5" 
              filter="url(#chartGlow)"
              className="transition-all duration-500 ease-out"
            />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredPoint(pt.pt)}>
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="5" 
                  fill={currentConfig.color} 
                  opacity="0" 
                  className="group-hover:opacity-60 transition-opacity" 
                />
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r="2.5" 
                  fill="#ffffff" 
                  stroke={currentConfig.color} 
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-emerald-500/40 text-xs text-white z-20 flex items-center gap-2">
            <span className="text-emerald-300 font-bold">{hoveredPoint.time}:</span>
            <span className="font-mono-numbers font-black">{hoveredPoint[selectedMetric]}{currentConfig.unit}</span>
          </div>
        )}

        {/* X-Axis Labels matching screenshot */}
        <div className="flex justify-between pl-6 pr-2 pt-1 text-[11px] font-mono-numbers text-slate-400 select-none">
          <span>12 AM</span>
          <span>4 AM</span>
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
        </div>
      </div>
    </div>
  );
};
