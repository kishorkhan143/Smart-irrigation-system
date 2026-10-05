export interface TelemetryPoint {
  time: string;
  hour: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLux: number;
  pumpState: boolean;
}

export interface CurrentTelemetry {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLux: number;
  cropHealthScore: number;
  leafCondition: number;
  diseaseRisk: number;
  growthRate: number;
  nutrientLevel: number;
  lastUpdated: string;
  rssi: number;
  mac: string;
  isHardwareConnected: boolean;
  pumpState?: boolean;
  mode?: 'auto' | 'manual';
}

export interface PumpState {
  isOn: boolean;
  mode: 'auto' | 'manual';
  autoThreshold: number;
  wetTarget: number;
  nextIrrigationFormatted: string;
  totalLitersToday: number;
  lastSwitched: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
}

export interface AlertItem {
  id: string;
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  timestamp: string;
  read: boolean;
}

export type NavTab = 
  | 'dashboard'
  | 'weather'
  | 'disease-doctor'
  | 'irrigation'
  | 'crop-health'
  | 'soil-data'
  | 'alerts'
  | 'hardware'
  | 'settings';
