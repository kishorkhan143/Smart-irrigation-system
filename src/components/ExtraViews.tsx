import React, { useState } from 'react';
import { 
  Camera, 
  Leaf, 
  Droplet, 
  Cpu, 
  Bell, 
  BarChart2, 
  Settings, 
  Download, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Thermometer,
  Sun,
  Shield,
  Clock
} from 'lucide-react';
import { CurrentTelemetry, PumpState, AlertItem, TelemetryPoint } from '../types/farm';

import { PlantDiseaseScanner } from './PlantDiseaseScanner';

// ============================================================================
// 1. PLANT DISEASE SCANNER FULL VIEW
// ============================================================================
export const DiseaseScannerView: React.FC<{ onDiagnosisComplete?: (diagnosis: any, updatedTelemetry?: any) => void }> = ({ onDiagnosisComplete }) => {
  return (
    <div className="space-y-5 animate-in fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-400" />
          Plant Doctor & Crop Pathology Diagnosis
        </h2>
        <p className="text-xs text-slate-400">
          Upload any plant leaf or crop image to instantly detect fungal, bacterial, or viral diseases, along with exact farmer cures and spray dosages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 min-h-[420px]">
          <PlantDiseaseScanner onDiagnosisComplete={onDiagnosisComplete} />
        </div>

        {/* Quick Treatment Guide / FAQ */}
        <div className="glow-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Top Crop Diseases We Detect
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
              <span className="font-bold text-amber-300 block">Early & Late Blight</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Common in tomato, potato. Circular dark lesions. Treat with copper fungicide.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
              <span className="font-bold text-slate-200 block">Powdery Mildew</span>
              <p className="text-[11px] text-slate-400 mt-0.5">White powder on squash, beans. Treat with 5ml/L neem oil or sulfur spray.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40">
              <span className="font-bold text-rose-300 block">Leaf Rust & Spots</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Orange/brown pustules on corn, wheat. Prune lower foliage and stop overhead watering.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. CROP HEALTH VIEW
// ============================================================================
export const CropHealthView: React.FC<{ telemetry: CurrentTelemetry }> = ({ telemetry }) => {
  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            Vegetation Index & Crop Pathology Analysis
          </h2>
          <p className="text-xs text-slate-400">Automated chlorophyll absorption and foliar disease diagnosis</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-bold font-mono-numbers">
          Overall Vitality: {telemetry.cropHealthScore}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Leaf Condition</span>
          <div className="text-2xl font-bold text-white font-mono-numbers">{telemetry.leafCondition}%</div>
          <p className="text-[11px] text-emerald-400 mt-1">Crisp green turgidity, zero chlorosis</p>
        </div>
        <div className="glow-card rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Disease Risk</span>
          <div className="text-2xl font-bold text-rose-400 font-mono-numbers">{telemetry.diseaseRisk}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Fungal spore humidity below trigger</p>
        </div>
        <div className="glow-card rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Growth Rate</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono-numbers">{telemetry.growthRate}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Optimal vegetative expansion stage</p>
        </div>
        <div className="glow-card rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Nutrient Level</span>
          <div className="text-2xl font-bold text-cyan-300 font-mono-numbers">{telemetry.nutrientLevel}%</div>
          <p className="text-[11px] text-slate-400 mt-1">NPK balance stable, soil pH: 6.5</p>
        </div>
      </div>

      <div className="glow-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Agronomic Treatment Recommendations</h3>
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Nitrogen Fixation & Moisture Retention</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Current soil moisture (62%) is ideal for rhizobium bacterial activity. No supplemental foliar spray needed.
              </div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Solar Assimilation Peak</div>
              <div className="text-xs text-slate-300 mt-0.5">
                620 lux ambient illumination permits steady photosynthetic rate. Next automated watering scheduled in 2h 35m.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. IRRIGATION FULL VIEW
// ============================================================================
export const IrrigationView: React.FC<{
  pumpState: PumpState;
  onTogglePump: (turnOn?: boolean) => void;
  onChangeMode: (mode: 'auto' | 'manual') => void;
}> = ({ pumpState, onTogglePump, onChangeMode }) => {
  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-cyan-400" />
            Precision Hydro-Distribution System
          </h2>
          <p className="text-xs text-slate-400">ESP32 Relay Switch GPIO 23 · Submersible 12V Micro-Pump</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glow-card rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Direct Relay Actuator</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-emerald-950">
            <div>
              <span className="text-xs text-slate-400 block">Pump Relay State</span>
              <span className={`text-base font-bold font-mono-numbers ${pumpState.isOn ? 'text-emerald-400' : 'text-slate-400'}`}>
                {pumpState.isOn ? 'RELAY CLOSED (PUMPING)' : 'RELAY OPEN (OFF)'}
              </span>
            </div>
            <button
              onClick={() => onTogglePump()}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                pumpState.isOn ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {pumpState.isOn ? 'Emergency Cutoff' : 'Engage Pump'}
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Mode: <strong className="text-white uppercase">{pumpState.mode}</strong>
          </div>
        </div>

        <div className="glow-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Water Consumption Log</h3>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono-numbers">
            {pumpState.totalLitersToday} L
          </div>
          <p className="text-xs text-slate-400">Dispensed today across 4 drip irrigation cycles</p>
          <div className="text-[11px] text-emerald-400">Water saved vs flood irrigation: +42%</div>
        </div>

        <div className="glow-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Hardware Protection</h3>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Max run cutoff: 35 seconds</li>
            <li>Anti-chatter cooldown: 90 seconds</li>
            <li>Rain-delay override: Active (&gt;75% rain)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. REPORTS VIEW
// ============================================================================
export const ReportsView: React.FC<{ history: TelemetryPoint[] }> = ({ history }) => {
  const exportCSV = () => {
    let csv = "Time,Hour,SoilMoisture(%),Temperature(C),Humidity(%),Light(lux),PumpState\n";
    history.forEach(h => {
      csv += `${h.time},${h.hour},${h.soilMoisture},${h.temperature},${h.humidity},${h.lightLux},${h.pumpState ? 1 : 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_farm_telemetry_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            Historical Telemetry Logs & Audit
          </h2>
          <p className="text-xs text-slate-400">Complete 24-hour sensor time-series data for precision agronomists</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV Data
        </button>
      </div>

      <div className="glow-card rounded-2xl overflow-hidden border border-emerald-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09221d] text-slate-300 font-semibold border-b border-emerald-900/60">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Soil Moisture</th>
                <th className="px-4 py-3">Temperature</th>
                <th className="px-4 py-3">Humidity</th>
                <th className="px-4 py-3">Light Intensity</th>
                <th className="px-4 py-3">Water Pump</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 text-slate-300 font-mono-numbers">
              {history.map((row, i) => (
                <tr key={i} className="hover:bg-emerald-950/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-white">{row.time}</td>
                  <td className="px-4 py-2.5 text-emerald-400 font-semibold">{row.soilMoisture}%</td>
                  <td className="px-4 py-2.5 text-amber-300">{row.temperature}°C</td>
                  <td className="px-4 py-2.5 text-cyan-300">{row.humidity}%</td>
                  <td className="px-4 py-2.5 text-yellow-300">{row.lightLux} lux</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.pumpState ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {row.pumpState ? 'ON' : 'OFF'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
