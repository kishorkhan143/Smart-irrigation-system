import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check, 
  X, 
  RotateCcw, 
  Sprout, 
  Layers, 
  Compass,
  AlertCircle,
  Satellite,
  Tag,
  Map as MapIcon
} from 'lucide-react';

interface FarmMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (location: { lat: number; lon: number; locationName: string }) => void;
  initialLat?: number;
  initialLon?: number;
  currentLocationName?: string;
  isLocationSet?: boolean;
  onResetFarmland?: () => void;
}

export const FarmMapModal: React.FC<FarmMapModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat,
  initialLon,
  currentLocationName,
  isLocationSet,
  onResetFarmland,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Tile layer references
  const streetTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteBaseLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLabelsLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLon, setSelectedLon] = useState<number | null>(null);
  const [farmNameInput, setFarmNameInput] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite'>('street');

  // Manual coordinate input states
  const [manualLatInput, setManualLatInput] = useState<string>('');
  const [manualLonInput, setManualLonInput] = useState<string>('');

  // Custom emerald farm pin icon
  const createFarmIcon = () => {
    return L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="position: relative; transform: translate(-50%, -100%); width: 44px; height: 50px;">
          <div style="
            width: 40px; 
            height: 40px; 
            background: linear-gradient(135deg, #10b981 0%, #047857 100%); 
            border: 3px solid #ffffff; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            box-shadow: 0 4px 15px rgba(0,0,0,0.7), 0 0 14px rgba(16,185,129,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
          ">
            <span style="transform: rotate(45deg); font-size: 20px; line-height: 1;">🌱</span>
          </div>
          <div style="
            width: 16px; 
            height: 6px; 
            background: rgba(0,0,0,0.5); 
            border-radius: 50%; 
            margin: 3px auto 0;
            filter: blur(1.5px);
          "></div>
        </div>
      `,
      iconSize: [44, 50],
      iconAnchor: [22, 50],
    });
  };

  // Helper to update marker's attached name tooltip
  const updateMarkerTooltip = (name: string, lat: number, lon: number) => {
    if (markerRef.current) {
      const tooltipHtml = `
        <div style="font-weight: 700; font-size: 12px; color: #34d399; display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 14px;">🌱</span>
          <span style="color: #ffffff;">${name || 'Farm Land Location'}</span>
        </div>
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 2px;">
          Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°
        </div>
      `;
      markerRef.current.unbindTooltip();
      markerRef.current.bindTooltip(tooltipHtml, {
        permanent: true,
        direction: 'top',
        offset: [0, -46],
        className: 'custom-farm-tooltip',
      }).openTooltip();
    }
  };

  // Synchronize state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLon && initialLat !== 0 && initialLon !== 0) {
        setSelectedLat(initialLat);
        setSelectedLon(initialLon);
        setManualLatInput(initialLat.toFixed(5));
        setManualLonInput(initialLon.toFixed(5));
        const initialName = currentLocationName && currentLocationName !== 'Farmland Location Not Set' && currentLocationName !== 'Farmland Location Not Set (0 Standby)'
          ? currentLocationName 
          : `Farmland Lat ${initialLat.toFixed(4)}°, Lon ${initialLon.toFixed(4)}°`;
        setFarmNameInput(initialName);
      } else {
        setSelectedLat(null);
        setSelectedLon(null);
        setManualLatInput('');
        setManualLonInput('');
        setFarmNameInput('');
      }
      setErrorMessage(null);
    }
  }, [isOpen, initialLat, initialLon, currentLocationName]);

  // Reverse geocode lat/lon to friendly locality name with full detail
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'SmartFarmIoT-MapPicker/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const town = a.city || a.town || a.village || a.suburb || a.county || a.district;
        const region = a.state || a.region || a.province;
        const country = a.country;
        let formattedName = '';
        if (town) {
          formattedName = `${town}${region ? ', ' + region : ''}${country ? ' (' + country + ')' : ''}`;
        } else if (region) {
          formattedName = `${region}${country ? ' (' + country + ')' : ''}`;
        } else if (data.name) {
          formattedName = `${data.name}${country ? ' (' + country + ')' : ''}`;
        } else {
          formattedName = `Farmland Lat ${lat.toFixed(4)}°, Lon ${lon.toFixed(4)}°`;
        }
        setFarmNameInput(formattedName);
        updateMarkerTooltip(formattedName, lat, lon);
      } else {
        const fallbackName = `Farmland Lat ${lat.toFixed(4)}°, Lon ${lon.toFixed(4)}°`;
        setFarmNameInput(fallbackName);
        updateMarkerTooltip(fallbackName, lat, lon);
      }
    } catch (e) {
      const fallbackName = `Farmland Lat ${lat.toFixed(4)}°, Lon ${lon.toFixed(4)}°`;
      setFarmNameInput(fallbackName);
      updateMarkerTooltip(fallbackName, lat, lon);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Update marker position on map
  const updateMarkerPosition = useCallback((lat: number, lon: number, doReverseGeocode = true, explicitName?: string) => {
    setSelectedLat(lat);
    setSelectedLon(lon);
    setManualLatInput(lat.toFixed(5));
    setManualLonInput(lon.toFixed(5));
    setErrorMessage(null);

    const nameToDisplay = explicitName || farmNameInput || `Farmland Lat ${lat.toFixed(4)}°, Lon ${lon.toFixed(4)}°`;
    if (explicitName) {
      setFarmNameInput(explicitName);
    }

    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon], {
          icon: createFarmIcon(),
          draggable: true,
        }).addTo(mapInstanceRef.current);

        markerRef.current.on('dragend', (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          updateMarkerPosition(pos.lat, pos.lng, true);
        });
      }
      updateMarkerTooltip(nameToDisplay, lat, lon);
    }

    if (doReverseGeocode) {
      reverseGeocode(lat, lon);
    }
  }, [farmNameInput, reverseGeocode]);

  // Switch between Street map (with full labels) and Satellite Hybrid (imagery + labels)
  const switchLayer = (type: 'street' | 'satellite') => {
    setMapLayer(type);
    if (!mapInstanceRef.current) return;

    if (type === 'street') {
      // Remove satellite base + labels
      if (satelliteBaseLayerRef.current) {
        mapInstanceRef.current.removeLayer(satelliteBaseLayerRef.current);
      }
      if (satelliteLabelsLayerRef.current) {
        mapInstanceRef.current.removeLayer(satelliteLabelsLayerRef.current);
      }
      // Add Street Map with crystal-clear names & roads
      if (streetTileLayerRef.current) {
        streetTileLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      // Remove street layer
      if (streetTileLayerRef.current) {
        mapInstanceRef.current.removeLayer(streetTileLayerRef.current);
      }
      // Add Satellite Imagery + World Boundaries & Place Names overlay
      if (satelliteBaseLayerRef.current) {
        satelliteBaseLayerRef.current.addTo(mapInstanceRef.current);
      }
      if (satelliteLabelsLayerRef.current) {
        satelliteLabelsLayerRef.current.addTo(mapInstanceRef.current);
      }
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const startLat = (initialLat && initialLat !== 0) ? initialLat : 20.5937;
    const startLon = (initialLon && initialLon !== 0) ? initialLon : 78.9629;
    const startZoom = (initialLat && initialLat !== 0) ? 14 : 5;

    // Destroy existing instance cleanly if re-mounting
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      streetTileLayerRef.current = null;
      satelliteBaseLayerRef.current = null;
      satelliteLabelsLayerRef.current = null;
    }

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLon],
      zoom: startZoom,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // 1. Street Map with COMPLETE place names, cities, towns, villages, roads
    const streetLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors (with full names & labels)',
      }
    );

    // 2. Satellite Base Imagery (Esri World Imagery)
    const satBaseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri Earthstar Geographics',
      }
    );

    // 3. Satellite Place Names & Boundaries Overlay (Labels on top of Satellite!)
    const satLabelsLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Labels &copy; Esri Reference',
      }
    );

    streetTileLayerRef.current = streetLayer;
    satelliteBaseLayerRef.current = satBaseLayer;
    satelliteLabelsLayerRef.current = satLabelsLayer;

    // DEFAULT TO STREET MAP WITH RICH NAMES!
    streetLayer.addTo(map);

    // Click handler to drop or move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarkerPosition(lat, lng, true);
    });

    mapInstanceRef.current = map;

    // If coordinates already exist, place initial marker with name tooltip
    if (initialLat && initialLon && initialLat !== 0 && initialLon !== 0) {
      markerRef.current = L.marker([initialLat, initialLon], {
        icon: createFarmIcon(),
        draggable: true,
      }).addTo(map);

      const nameToDisplay = currentLocationName && currentLocationName !== 'Farmland Location Not Set'
        ? currentLocationName
        : `Farmland Lat ${initialLat.toFixed(4)}°, Lon ${initialLon.toFixed(4)}°`;

      updateMarkerTooltip(nameToDisplay, initialLat, initialLon);

      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const pos = marker.getLatLng();
        updateMarkerPosition(pos.lat, pos.lng, true);
      });
    }

    // Multi-pass size invalidation to guarantee full container rendering
    const timer1 = setTimeout(() => map.invalidateSize(), 50);
    const timer2 = setTimeout(() => map.invalidateSize(), 250);
    const timer3 = setTimeout(() => map.invalidateSize(), 600);

    // ResizeObserver for dynamic dialog resizes
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      ro = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (ro) ro.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        streetTileLayerRef.current = null;
        satelliteBaseLayerRef.current = null;
        satelliteLabelsLayerRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Device GPS auto locate
  const handleUseDeviceGps = () => {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
        }
        updateMarkerPosition(lat, lon, true);
      },
      (err) => {
        setErrorMessage(
          err.code === 1
            ? 'Location permission denied. Please click on the map directly or search a city name.'
            : 'Could not acquire GPS fix. Please click on the map.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search by city/village/town
  const handleSearchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput.trim())}&count=1&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const loc = data.results[0];
          const lat = loc.latitude;
          const lon = loc.longitude;
          const name = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}${loc.country ? ', ' + loc.country : ''}`;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
          }
          setFarmNameInput(name);
          updateMarkerPosition(lat, lon, false, name);
        } else {
          setErrorMessage(`No matching location found for "${searchInput}". You can click directly on the map.`);
        }
      }
    } catch (e) {
      setErrorMessage('Search request failed. Please click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Apply manual coordinates from text inputs
  const handleApplyManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLatInput);
    const lon = parseFloat(manualLonInput);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setErrorMessage('Please enter valid coordinates: Latitude (-90 to 90), Longitude (-180 to 180).');
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 1.0 });
    }
    updateMarkerPosition(lat, lon, true);
  };

  // Quick preset farm zones with clear names
  const setPreset = (name: string, lat: number, lon: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.0 });
    }
    setFarmNameInput(name);
    updateMarkerPosition(lat, lon, false, name);
  };

  const handleConfirm = () => {
    if (selectedLat === null || selectedLon === null) {
      setErrorMessage('Please click on the map, use GPS, or enter coordinates to pin your farm land.');
      return;
    }

    const finalName = farmNameInput.trim() || `Farmland Lat ${selectedLat.toFixed(4)}°, Lon ${selectedLon.toFixed(4)}°`;

    onConfirmLocation({
      lat: selectedLat,
      lon: selectedLon,
      locationName: finalName,
    });
    onClose();
  };

  const handleReset = () => {
    if (onResetFarmland) {
      onResetFarmland();
    }
    setSelectedLat(null);
    setSelectedLon(null);
    setManualLatInput('');
    setManualLonInput('');
    setFarmNameInput('');
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-[#091e1a] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-emerald-950/80 bg-[#061613] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Set Farm Land on Map (With Full Names & Labels)</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-numbers border border-emerald-500/30">
                  Interactive Pin
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                All city, district, village, and road names are labeled directly on the map
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, GPS, & Satellite/Street Toggle */}
        <div className="p-3 sm:px-5 bg-black/30 border-b border-emerald-950/60 flex flex-wrap items-center justify-between gap-2.5">
          {/* City / District Search */}
          <form onSubmit={handleSearchCity} className="flex-1 min-w-[200px] flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search village, city, district name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-black/60 border border-emerald-900/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSearching ? 'Finding...' : 'Find Name'}
            </button>
          </form>

          {/* GPS Auto Pin Button */}
          <button
            onClick={handleUseDeviceGps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            title="Auto-pin your device GPS position"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Auto-Pin My GPS</span>
          </button>

          {/* Map Layer Switcher: Street with Names vs Satellite with Names */}
          <div className="flex items-center bg-black/50 border border-emerald-900/80 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => switchLayer('street')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapLayer === 'street'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Standard map with prominent city, town, village and street names"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map with Names</span>
            </button>
            <button
              type="button"
              onClick={() => switchLayer('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Satellite imagery overlayed with city & road names"
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite + Names</span>
            </button>
          </div>
        </div>

        {/* Quick Regional Presets Bar */}
        <div className="px-3 sm:px-5 py-2 bg-[#061714] border-b border-emerald-950/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0">Quick Presets:</span>
            <button
              type="button"
              onClick={() => setPreset('Bengaluru, Karnataka (India)', 12.9716, 77.5946)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-slate-200 border border-emerald-900/60 text-[11px] font-medium transition-colors flex-shrink-0"
            >
              🌱 Bengaluru, Karnataka
            </button>
            <button
              type="button"
              onClick={() => setPreset('Ludhiana, Punjab (India)', 30.9010, 75.8573)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-slate-200 border border-emerald-900/60 text-[11px] font-medium transition-colors flex-shrink-0"
            >
              🌾 Punjab Wheat Zone
            </button>
            <button
              type="button"
              onClick={() => setPreset('Aurangabad, Maharashtra (India)', 19.7515, 75.7139)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-slate-200 border border-emerald-900/60 text-[11px] font-medium transition-colors flex-shrink-0"
            >
              🌱 Maharashtra
            </button>
            <button
              type="button"
              onClick={() => setPreset('Champaign County, Illinois (Midwest USA)', 40.4637, -88.2434)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-slate-200 border border-emerald-900/60 text-[11px] font-medium transition-colors flex-shrink-0"
            >
              🌽 Midwest USA
            </button>
          </div>

          {/* Coordinate manual input toggle / form */}
          <form onSubmit={handleApplyManualCoords} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Lat (e.g. 12.97)"
              value={manualLatInput}
              onChange={(e) => setManualLatInput(e.target.value)}
              className="w-24 bg-black/60 border border-emerald-900/80 rounded-lg px-2 py-1 text-[11px] text-white font-mono-numbers focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Lon (e.g. 77.59)"
              value={manualLonInput}
              onChange={(e) => setManualLonInput(e.target.value)}
              className="w-24 bg-black/60 border border-emerald-900/80 rounded-lg px-2 py-1 text-[11px] text-white font-mono-numbers focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold border border-emerald-500/30"
              title="Apply coordinates to map"
            >
              Apply Pin
            </button>
          </form>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="px-5 py-2 bg-rose-950/70 border-b border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Map Container Viewport */}
        <div 
          className="relative w-full bg-slate-950 overflow-hidden" 
          style={{ height: '420px', minHeight: '360px' }}
        >
          <div 
            ref={mapContainerRef} 
            className="w-full h-full"
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
          />

          {/* Instructions banner on map */}
          <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-200 flex items-center gap-1.5 shadow-xl">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click any city, village or road to place your farm pin with its name</span>
          </div>
        </div>

        {/* Bottom Coordinates, Editable Farm Name & Confirmation Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#061613] border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Editable Farm Land Name & Coordinates */}
          <div className="flex-1 w-full sm:w-auto">
            {selectedLat !== null && selectedLon !== null ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-emerald-300">Farm Location Name:</span>
                  <input
                    type="text"
                    value={farmNameInput}
                    onChange={(e) => {
                      setFarmNameInput(e.target.value);
                      if (selectedLat && selectedLon) {
                        updateMarkerTooltip(e.target.value, selectedLat, selectedLon);
                      }
                    }}
                    placeholder="Enter farm land name (e.g. Bengaluru Farm, Karnataka)..."
                    className="flex-1 bg-black/60 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-xs text-white font-bold placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  {isGeocoding && (
                    <span className="text-[10px] text-emerald-400 animate-pulse flex-shrink-0">Detecting...</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 font-mono-numbers pl-6">
                  Latitude: <strong className="text-emerald-300">{selectedLat.toFixed(5)}°</strong> · Longitude: <strong className="text-emerald-300">{selectedLon.toFixed(5)}°</strong>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>No farm land pinned yet. Click on any city, village, or field on the map to drop your pin with its name.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isLocationSet && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Reset farm land to initial 0 baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to 0 Standby</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedLat === null || selectedLon === null}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Measure Live Weather</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
