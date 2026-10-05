import React, { useState } from 'react';
import { 
  CloudSun, 
  Droplet, 
  Wind, 
  CloudRain, 
  RefreshCw, 
  MapPin, 
  Navigation, 
  Search,
  CheckCircle2,
  AlertCircle,
  Sprout,
  RotateCcw
} from 'lucide-react';
import { WeatherData } from '../types/farm';

interface WeatherCardProps {
  weather: WeatherData & { locationName?: string; isLocationSet?: boolean };
  onRefreshWeather: (params?: { lat?: number; lon?: number; city?: string }) => void;
  onOpenMapPicker?: () => void;
  onResetFarmland?: () => void;
  isLoading?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ 
  weather, 
  onRefreshWeather,
  onOpenMapPicker,
  onResetFarmland,
  isLoading = false 
}) => {
  const [cityInput, setCityInput] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGpsDetect = () => {
    setIsSearchingLocation(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      setIsSearchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsSearchingLocation(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocationSuccess(`Location Found: Lat ${lat.toFixed(4)}°, Lon ${lon.toFixed(4)}°`);
        onRefreshWeather({ lat, lon });
        setTimeout(() => setLocationSuccess(null), 4000);
      },
      (err) => {
        setIsSearchingLocation(false);
        console.warn('GPS Permission or Error:', err);
        setGpsError(err.code === 1 ? 'Location permission was denied. Please allow location access or choose on map.' : 'Location request timed out. Retrying...');
        setTimeout(() => setGpsError(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    onRefreshWeather({ city: cityInput.trim() });
    setLocationSuccess(`Set to ${cityInput.trim()}`);
    setCityInput('');
    setTimeout(() => setLocationSuccess(null), 3000);
  };

  // Farmer guidance based on live weather
  const getFarmingAdvice = () => {
    if (!weather.isLocationSet) {
      return {
        text: 'Farm land is currently at initial 0 standby. Set your farm land location on the interactive map to activate live weather measurement.',
        color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30',
      };
    }
    if (weather.rainChance >= 50) {
      return {
        text: 'Rain forecasted today. Keep water pump OFF to save water & electricity.',
        color: 'text-blue-300 bg-blue-950/40 border-blue-800/40',
      };
    }
    if (weather.temperature >= 32) {
      return {
        text: 'High heat today. Soil will dry faster; irrigate in early morning or evening.',
        color: 'text-amber-300 bg-amber-950/40 border-amber-800/40',
      };
    }
    if (weather.temperature > 0) {
      return {
        text: 'Ideal farming weather. Check soil moisture before starting pump.',
        color: 'text-emerald-300 bg-emerald-950/40 border-emerald-800/40',
      };
    }
    return {
      text: 'Measuring live weather from your farm location...',
      color: 'text-slate-300 bg-slate-900/40 border-slate-800/40',
    };
  };

  const advice = getFarmingAdvice();

  return (
    <div className="glow-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 h-full relative">
      {/* Top Section: Title & Location Tag */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-amber-400">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Live Farm Weather
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live API Active" />
              </div>
              <span className="text-[11px] text-slate-300 font-semibold block truncate max-w-[220px]">
                {weather.isLocationSet ? (weather.locationName || 'Farm Location Set') : 'Farmland Location Not Set (0 Standby)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* GPS Auto-Detect Button with permission request */}
            <button
              onClick={handleGpsDetect}
              disabled={isSearchingLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              title="Use browser location permission to get real-time GPS weather"
            >
              <Navigation className={`w-3.5 h-3.5 ${isSearchingLocation ? 'animate-spin' : ''}`} />
              <span>{isSearchingLocation ? 'Locating...' : 'Use My GPS'}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => onRefreshWeather({ lat: weather.latitude, lon: weather.longitude })}
              className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors ${
                isLoading ? 'animate-spin text-emerald-400' : ''
              }`}
              title="Refresh Live Weather"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Farmland Map Status & Set Land Action */}
        {!weather.isLocationSet ? (
          <div className="mb-3 p-3.5 rounded-xl bg-black/40 border-2 border-dashed border-emerald-500/40 text-center animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-300 mb-1">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Initial 0 Standby: Farm Land Not Set</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-3">
              Pinpoint your crop parcel on the interactive map or GPS to start measuring real-time weather.
            </p>
            <button
              type="button"
              onClick={onOpenMapPicker}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Set Farm Land on Map</span>
            </button>
          </div>
        ) : (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <Sprout className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Farm Land Active</span>
                <span className="text-xs font-bold text-white truncate block">{weather.locationName}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={onOpenMapPicker}
                className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-colors"
              >
                Change Map Pin
              </button>
              <button
                type="button"
                onClick={onResetFarmland}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-300 text-[11px] font-semibold transition-colors"
                title="Reset farm land to 0 standby"
              >
                Reset 0
              </button>
            </div>
          </div>
        )}

        {/* Real-time Latitude & Longitude Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-900/60 text-xs mb-3 font-mono-numbers">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-[11px]">GPS Location:</span>
          </div>
          <div className="text-slate-200 flex items-center gap-2 text-[11px]">
            <span>
              Lat: <strong className="text-white font-bold">{weather.isLocationSet && weather.latitude ? weather.latitude.toFixed(4) : '0.0000'}°</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Lon: <strong className="text-white font-bold">{weather.isLocationSet && weather.longitude ? weather.longitude.toFixed(4) : '0.0000'}°</strong>
            </span>
          </div>
        </div>

        {/* Location Search Bar for Farmers */}
        <form onSubmit={handleCitySearch} className="mb-2.5 flex items-center gap-1.5">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Or search city, village, district..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full bg-black/50 border border-emerald-900/70 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {locationSuccess && (
          <div className="mb-2 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 p-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{locationSuccess}</span>
          </div>
        )}

        {gpsError && (
          <div className="mb-2 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/30 p-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Middle: Weather Main Display (Real Temperature & Condition) */}
      <div className="flex items-center justify-between py-2 sm:py-3 bg-emerald-950/20 px-3 rounded-xl border border-emerald-950/60 my-1">
        {/* Sun & Cloud Vector Graphic */}
        <div className="w-16 h-16 flex-shrink-0 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
            <circle cx="68" cy="38" r="16" fill="url(#weatherSun)" />
            <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
              <line x1="68" y1="14" x2="68" y2="19" />
              <line x1="68" y1="57" x2="68" y2="62" />
              <line x1="44" y1="38" x2="49" y2="38" />
              <line x1="87" y1="38" x2="92" y2="38" />
              <line x1="51" y1="21" x2="55" y2="25" />
              <line x1="81" y1="51" x2="85" y2="55" />
            </g>
            <path
              d="M25 68 C20 68 15 64 15 58 C15 52 20 48 26 48 C28 41 35 36 43 36 C52 36 60 42 62 50 C66 50 72 53 72 59 C72 65 67 68 61 68 Z"
              fill="url(#cloudGrad)"
            />
            <defs>
              <linearGradient id="weatherSun" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Temperature & Condition Label */}
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-black text-white font-mono-numbers tracking-tight">
            {weather.isLocationSet ? `${weather.temperature}°C` : '0°C'}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-emerald-300 mt-0.5">
            {weather.isLocationSet ? weather.condition : '0 Standby (Farmland Not Set)'}
          </div>
        </div>
      </div>

      {/* Practical Farmer Advisory Note */}
      <div className={`p-2 rounded-lg border text-[11px] font-medium my-2 ${advice.color}`}>
        {advice.text}
      </div>

      {/* Bottom Sub-stats Row (Humidity, Wind, Rain Chance) - ALL 0 until set */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-950/70 text-center">
        {/* 1. Air Humidity */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Droplet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Air Humidity</span>
          </div>
          <span className="text-xs font-bold text-white font-mono-numbers">
            {weather.isLocationSet ? `${weather.humidity}%` : '0%'}
          </span>
        </div>

        {/* 2. Wind */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Wind className="w-3.5 h-3.5 text-slate-300" />
            <span>Wind Speed</span>
          </div>
          <span className="text-xs font-bold text-white font-mono-numbers">
            {weather.isLocationSet ? `${weather.windSpeed} km/h` : '0 km/h'}
          </span>
        </div>

        {/* 3. Rain Chance */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>Rain Chance</span>
          </div>
          <span className="text-xs font-bold text-white font-mono-numbers">
            {weather.isLocationSet ? `${weather.rainChance}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
