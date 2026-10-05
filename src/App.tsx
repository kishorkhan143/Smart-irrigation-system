import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MetricCards } from './components/MetricCards';
import { WeatherCard } from './components/WeatherCard';
import { PlantDiseaseScanner } from './components/PlantDiseaseScanner';
import { IrrigationCard } from './components/IrrigationCard';
import { CropHealthCard } from './components/CropHealthCard';
import { SoilDataChart } from './components/SoilDataChart';
import { AlertsCard } from './components/AlertsCard';
import { HardwareFirmwareView } from './components/HardwareFirmwareModal';
import { ReportsView } from './components/ExtraViews';
import { SettingsView } from './components/AiInsightsAndSettings';
import { 
  CurrentTelemetry, 
  PumpState, 
  WeatherData, 
  AlertItem, 
  TelemetryPoint, 
  NavTab 
} from './types/farm';
import { 
  CloudSun, 
  Droplet, 
  Sparkles, 
  Leaf, 
  BarChart2, 
  Bell, 
  Cpu, 
  ArrowRight, 
  ShieldCheck,
  Power
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Core Farm Telemetry State - INITIAL 0 (All hardware off in standby)
  const [telemetry, setTelemetry] = useState<CurrentTelemetry>({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    lightLux: 0,
    cropHealthScore: 0,
    leafCondition: 0,
    diseaseRisk: 0,
    growthRate: 0,
    nutrientLevel: 0,
    lastUpdated: new Date().toISOString(),
    rssi: 0,
    mac: 'ESP32-Standby',
    isHardwareConnected: false,
  });

  // Pump & Hardware State - ALL OFF
  const [pumpState, setPumpState] = useState<PumpState>({
    isOn: false,
    mode: 'manual',
    autoThreshold: 45,
    wetTarget: 75,
    nextIrrigationFormatted: 'Standby (Pump Off)',
    totalLitersToday: 0.0,
    lastSwitched: new Date().toISOString(),
  });

  // Live Weather is the active measurement
  const [weather, setWeather] = useState<WeatherData & { locationName?: string }>({
    temperature: 0,
    condition: 'Detecting Location...',
    humidity: 0,
    windSpeed: 0,
    rainChance: 0,
    locationName: '',
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: '1', type: 'info', title: 'Hardware components are currently OFF (Standby).', timestamp: 'Initial', read: false },
    { id: '2', type: 'success', title: 'Live Weather API active with farm location detection.', timestamp: 'Live', read: true },
  ]);

  const [history, setHistory] = useState<TelemetryPoint[]>([
    { time: '12 AM', hour: 0, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '4 AM', hour: 4, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '8 AM', hour: 8, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '12 PM', hour: 12, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '4 PM', hour: 16, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '8 PM', hour: 20, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
  ]);

  // Fetch telemetry
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.current) setTelemetry(data.current);
        if (data.history && data.history.length > 0) setHistory(data.history);
      }
    } catch (e) {}
  };

  // Fetch pump state
  const fetchPumpState = async () => {
    try {
      const res = await fetch('/api/pump');
      if (res.ok) {
        const data = await res.json();
        setPumpState(data);
      }
    } catch (e) {}
  };

  // Fetch weather with optional location/GPS/city parameters
  const fetchWeather = async (params?: { lat?: number; lon?: number; city?: string }) => {
    setWeatherLoading(true);
    try {
      let url = '/api/weather';
      if (params) {
        const q = new URLSearchParams();
        if (params.lat !== undefined) q.set('lat', String(params.lat));
        if (params.lon !== undefined) q.set('lon', String(params.lon));
        if (params.city !== undefined) q.set('city', params.city);
        url += `?${q.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setTimeout(() => setWeatherLoading(false), 400);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setAlerts(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchWeather();
    fetchTelemetry();
    fetchPumpState();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchTelemetry();
      fetchPumpState();
      fetchAlerts();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Handle Water Pump Toggle
  const handleTogglePump = async (turnOn?: boolean) => {
    const newState = turnOn !== undefined ? turnOn : !pumpState.isOn;
    setPumpState(prev => ({
      ...prev,
      isOn: newState,
      lastSwitched: new Date().toISOString(),
    }));

    try {
      const res = await fetch('/api/pump/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnOn: newState }),
      });
      if (res.ok) {
        const data = await res.json();
        setPumpState(prev => ({ ...prev, isOn: data.isOn }));
        fetchAlerts();
      }
    } catch (e) {
      console.error('Failed to toggle pump:', e);
    }
  };

  // Handle Mode Change
  const handleChangeMode = async (mode: 'auto' | 'manual') => {
    setPumpState(prev => ({ ...prev, mode }));
    try {
      await fetch('/api/pump/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      fetchAlerts();
    } catch (e) {
      console.error('Failed to change mode:', e);
    }
  };

  // Handle Threshold Update
  const handleUpdateThreshold = async (threshold: number) => {
    setPumpState(prev => ({ ...prev, autoThreshold: threshold }));
    try {
      await fetch('/api/pump/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold }),
      });
    } catch (e) {
      console.error('Failed to update threshold:', e);
    }
  };

  const handleClearAlerts = async () => {
    setAlerts([]);
    try {
      await fetch('/api/alerts/clear', { method: 'POST' });
    } catch (e) {}
  };

  const unreadAlertCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-[#071613] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        unreadAlertCount={unreadAlertCount}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <TopBar
          telemetry={telemetry}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          weatherLocation={weather.locationName}
          onNavigateTab={setCurrentTab}
        />

        {/* Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1500px] w-full mx-auto">
          {/* ========================================================================= */}
          {/* MENU 1: CLEAN OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              {/* TOP ROW: 4 Clean Metric Cards (Initial 0 baseline) */}
              <section aria-label="Soil & Climate Metrics">
                <MetricCards telemetry={telemetry} />
              </section>

              {/* QUICK STATUS OVERVIEW: 2 Clean Cards for Farmer Glance */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Live Weather Snapshot */}
                <div className="glow-card rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400">
                        <CloudSun className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Live Farm Weather</h3>
                        <span className="text-[11px] text-slate-400">
                          {weather.locationName || 'Detecting Location...'}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white font-mono-numbers">
                      {weather.temperature > 0 ? `${weather.temperature}°C` : '--'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-900/40">
                    {weather.condition} · Rain Chance: <strong className="text-white">{weather.rainChance}%</strong> · Wind: <strong className="text-white">{weather.windSpeed} km/h</strong>
                  </p>

                  <button
                    onClick={() => setCurrentTab('weather')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold transition-all"
                  >
                    <span>Open Full Weather Station</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Water Pump Snapshot */}
                <div className="glow-card rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${
                        pumpState.isOn ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Water Pump Relay</h3>
                        <span className="text-[11px] text-slate-400">GPIO 23 Controller</span>
                      </div>
                    </div>
                    <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
                      pumpState.isOn ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {pumpState.isOn ? 'PUMP RUNNING' : 'PUMP OFF (SAFE)'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-4 flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-emerald-950">
                    <span>Mode: <strong className="text-white uppercase">{pumpState.mode}</strong></span>
                    <span>Used Today: <strong className="text-cyan-300 font-mono-numbers">{pumpState.totalLitersToday} L</strong></span>
                  </div>

                  <button
                    onClick={() => setCurrentTab('irrigation')}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <span>Manage Water Pump & Schedule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 2: DEDICATED LIVE WEATHER STATION */}
          {/* ========================================================================= */}
          {currentTab === 'weather' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <WeatherCard 
                weather={weather} 
                onRefreshWeather={fetchWeather}
                isLoading={weatherLoading}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 3: DEDICATED PLANT DISEASE DOCTOR */}
          {/* ========================================================================= */}
          {currentTab === 'disease-doctor' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <PlantDiseaseScanner onDiagnosisComplete={(diag, upd) => {
                if (upd) setTelemetry(prev => ({ ...prev, ...upd }));
                fetchAlerts();
              }} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 4: DEDICATED WATER PUMP & IRRIGATION */}
          {/* ========================================================================= */}
          {currentTab === 'irrigation' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <IrrigationCard
                pumpState={pumpState}
                onTogglePump={handleTogglePump}
                onChangeMode={handleChangeMode}
                onUpdateThreshold={handleUpdateThreshold}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 5: DEDICATED CROP HEALTH */}
          {/* ========================================================================= */}
          {currentTab === 'crop-health' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <CropHealthCard telemetry={telemetry} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 6: DEDICATED SOIL DATA (24 HOURS) */}
          {/* ========================================================================= */}
          {currentTab === 'soil-data' && (
            <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
              <SoilDataChart history={history} />
              <ReportsView history={history} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 7: DEDICATED ALERTS & NOTIFICATIONS */}
          {/* ========================================================================= */}
          {currentTab === 'alerts' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <AlertsCard
                alerts={alerts}
                onClearAlerts={handleClearAlerts}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 8: DEDICATED ESP32 HARDWARE & C++ CODE */}
          {/* ========================================================================= */}
          {currentTab === 'hardware' && (
            <div className="space-y-5 animate-in fade-in max-w-5xl mx-auto">
              <HardwareFirmwareView 
                telemetry={telemetry}
                pumpIsOn={pumpState.isOn}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MENU 9: DEDICATED SETTINGS & THRESHOLDS */}
          {/* ========================================================================= */}
          {currentTab === 'settings' && (
            <div className="space-y-5 animate-in fade-in max-w-4xl mx-auto">
              <SettingsView
                pumpState={pumpState}
                onUpdateThreshold={handleUpdateThreshold}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
