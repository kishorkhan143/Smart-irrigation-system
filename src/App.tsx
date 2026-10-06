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
import { FarmMapModal } from './components/FarmMapModal';
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
  Power,
  Navigation,
  MapPin
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

  // Live Weather is the active measurement - INITIAL 0 BASELINE (Farmland Not Set Standby)
  const [weather, setWeather] = useState<WeatherData & { locationName?: string; isLocationSet?: boolean }>({
    temperature: 0,
    condition: 'Standby (Farmland Not Set)',
    humidity: 0,
    windSpeed: 0,
    rainChance: 0,
    latitude: 0,
    longitude: 0,
    locationName: 'Farmland Location Not Set (0 Standby)',
    isLocationSet: false,
  });

  const [farmMapOpen, setFarmMapOpen] = useState(false);

  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: '1', type: 'info', title: 'Hardware components are currently OFF (Standby).', timestamp: 'Initial', read: false },
    { id: '2', type: 'info', title: 'Farm land is currently at initial 0 standby. Set farm land on map to activate live weather.', timestamp: 'Standby', read: false },
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

  // Fetch weather with optional location/GPS/city parameters and preserved farm name
  const fetchWeather = async (params?: { lat?: number; lon?: number; city?: string; locationName?: string }) => {
    setWeatherLoading(true);
    try {
      let url = '/api/weather';
      if (params) {
        const q = new URLSearchParams();
        if (params.lat !== undefined) q.set('lat', String(params.lat));
        if (params.lon !== undefined) q.set('lon', String(params.lon));
        if (params.city !== undefined) q.set('city', params.city);
        if (params.locationName) q.set('location', params.locationName);
        url += `?${q.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeather({
          ...data,
          locationName: params?.locationName || data.locationName,
          isLocationSet: true,
        });
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

  const [gpsPermissionStatus, setGpsPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'locating'>('prompt');

  // Trigger GPS location and fetch weather
  const requestGpsAndFetchWeather = () => {
    setGpsPermissionStatus('locating');
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setGpsPermissionStatus('granted');
          fetchWeather({ lat, lon });
          try {
            localStorage.setItem('smart_farm_farmland', JSON.stringify({ lat, lon }));
          } catch (e) {}
        },
        (err) => {
          console.warn('Geolocation permission not granted or error:', err.message);
          setGpsPermissionStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      setGpsPermissionStatus('denied');
    }
  };

  // Handle Farmland map confirmation
  const handleConfirmFarmland = (loc: { lat: number; lon: number; locationName: string }) => {
    try {
      localStorage.setItem('smart_farm_farmland', JSON.stringify({ ...loc, confirmedByFarmer: true }));
    } catch (e) {}
    setWeather(prev => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lon,
      locationName: loc.locationName,
      isLocationSet: true,
      condition: 'Updating Live Weather...',
    }));
    fetchWeather({ lat: loc.lat, lon: loc.lon, locationName: loc.locationName });
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        type: 'success',
        title: `Farmland pinned on map: ${loc.locationName}. Live weather measurement activated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);
  };

  // Handle Farmland reset to 0 standby
  const handleResetFarmland = () => {
    try {
      localStorage.removeItem('smart_farm_farmland');
    } catch (e) {}
    setWeather({
      temperature: 0,
      condition: 'Standby (Farmland Not Set)',
      humidity: 0,
      windSpeed: 0,
      rainChance: 0,
      latitude: 0,
      longitude: 0,
      locationName: 'Farmland Location Not Set (0 Standby)',
      isLocationSet: false,
    });
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        type: 'info',
        title: 'Farmland location cleared. All weather metrics returned to initial 0 standby.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
      ...prev,
    ]);
  };

  useEffect(() => {
    // Only fetch weather if farmer previously explicitly confirmed farmland location on map
    try {
      const saved = localStorage.getItem('smart_farm_farmland');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.confirmedByFarmer && parsed.lat && parsed.lon) {
          fetchWeather({ lat: parsed.lat, lon: parsed.lon, locationName: parsed.locationName });
        }
      }
    } catch (e) {}

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
          weatherCoordinates={
            weather.latitude !== undefined && weather.longitude !== undefined
              ? `${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°`
              : undefined
          }
          onRequestLocation={requestGpsAndFetchWeather}
          onOpenMapPicker={() => setFarmMapOpen(true)}
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
                {/* 1. Live Weather Snapshot with 0 Baseline until Farmland is set */}
                <div className="glow-card rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${
                          weather.isLocationSet 
                            ? 'bg-amber-950/60 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}>
                          <CloudSun className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white">Live Farm Weather</h3>
                            {weather.isLocationSet ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Weather Active" />
                            ) : (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                Initial 0 Standby
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-300 font-semibold block truncate max-w-[190px]">
                            {weather.locationName || 'Farmland Location Not Set'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white font-mono-numbers">
                          {weather.isLocationSet ? `${weather.temperature}°C` : '0°C'}
                        </span>
                        <div className="text-[10px] font-semibold text-emerald-400">
                          {weather.isLocationSet ? weather.condition : '0 Standby (Farmland Not Set)'}
                        </div>
                      </div>
                    </div>

                    {/* Coordinates Pill */}
                    <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/40 border border-emerald-900/60 text-[11px] mb-2 font-mono-numbers text-slate-300">
                      <span className="text-emerald-400 font-medium">GPS Location:</span>
                      <span>
                        Lat: <strong className="text-white">{weather.isLocationSet && weather.latitude ? weather.latitude.toFixed(4) : '0.0000'}°</strong>, Lon: <strong className="text-white">{weather.isLocationSet && weather.longitude ? weather.longitude.toFixed(4) : '0.0000'}°</strong>
                      </span>
                    </div>

                    {/* Rain / Humidity / Wind Stats - ALL 0 until set */}
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5 bg-black/40 px-3 py-2 rounded-xl border border-emerald-950/70 font-mono-numbers">
                      <span>Rain Chance: <strong className="text-white">{weather.isLocationSet ? weather.rainChance : 0}%</strong></span>
                      <span className="text-slate-600">·</span>
                      <span>Humidity: <strong className="text-white">{weather.isLocationSet ? weather.humidity : 0}%</strong></span>
                      <span className="text-slate-600">·</span>
                      <span>Wind: <strong className="text-white">{weather.isLocationSet ? weather.windSpeed : 0} km/h</strong></span>
                    </div>

                    {!weather.isLocationSet ? (
                      <div className="text-[11px] text-emerald-300 mb-3 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Farmland not set (0 standby). Set your farm land through the map below:</span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                          Option Ready
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-300 mb-3 bg-emerald-950/20 p-2 rounded-xl border border-emerald-950/50 flex items-center gap-1.5 truncate">
                        <span className="text-emerald-400 font-bold">Active Farmland:</span>
                        <span className="text-white font-medium truncate">{weather.locationName}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Set Farm Land on Map */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFarmMapOpen(true)}
                      className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        !weather.isLocationSet
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ring-2 ring-emerald-400/40'
                          : 'bg-emerald-950 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{weather.isLocationSet ? 'Change Farm Land' : 'Set Farm Land on Map'}</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('weather')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      title="Open dedicated Weather Station"
                    >
                      <span>Weather</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                onOpenMapPicker={() => setFarmMapOpen(true)}
                onResetFarmland={handleResetFarmland}
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

      {/* Farm Land Map Modal */}
      <FarmMapModal
        isOpen={farmMapOpen}
        onClose={() => setFarmMapOpen(false)}
        onConfirmLocation={handleConfirmFarmland}
        initialLat={weather.latitude}
        initialLon={weather.longitude}
        currentLocationName={weather.locationName}
        isLocationSet={weather.isLocationSet}
        onResetFarmland={handleResetFarmland}
      />
    </div>
  );
}
