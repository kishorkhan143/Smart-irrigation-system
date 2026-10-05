#pragma once

// ==============================================================================
// SMART FARM IOT - ESP32 FIRMWARE CONFIGURATION
// ==============================================================================

// WiFi Credentials (replace with your 2.4GHz WiFi network)
#define WIFI_SSID           "MyFarm_WiFi_2.4G"
#define WIFI_PASSWORD       "PrecisionAgri2026"

// Smart Farm Backend Dashboard Server URL
// e.g., "http://192.168.1.100:3000" or your hosted AI Studio App URL
#define DASHBOARD_SERVER_URL "http://192.168.1.100:3000"

// Hardware Pin Assignments (ESP32 DevKit V1 30-pin / 38-pin)
#define PIN_SOIL_ADC        34      // ADC1_CH6 - Analog Soil Moisture (Capacitive v1.2 / v2.0)
#define PIN_DHT_DATA        4       // GPIO 4   - DHT11 / DHT22 Digital Data
#define PIN_LDR_ADC         35      // ADC1_CH7 - Light Dependent Resistor (LDR) divider
#define PIN_RELAY_PUMP      23      // GPIO 23  - Relay Control IN (Submersible DC Water Pump)
#define PIN_STATUS_LED      2       // GPIO 2   - ESP32 Onboard LED (WiFi / Activity status)
#define PIN_MANUAL_BUTTON   0       // GPIO 0   - Onboard BOOT Button for manual pump toggle

// Relay Configuration
// Most relay modules are Active LOW (LOW = Relay ON/Energized, HIGH = Relay OFF/De-energized)
#define RELAY_ACTIVE_LEVEL  LOW
#define RELAY_INACTIVE_LEVEL HIGH

// Sensor Calibration Constants
// For Capacitive Soil Sensor v1.2:
// Reading in dry air ~ 3200-3500 (ADC 12-bit, 0-4095)
// Reading in pure water ~ 1200-1500
#define SOIL_ADC_AIR_DRY    3200    // Raw reading when sensor is completely dry (0%)
#define SOIL_ADC_WATER_WET  1350    // Raw reading in saturated wet soil / water (100%)

// Irrigation Thresholds (Percentages)
#define DEFAULT_DRY_THRESHOLD 45    // Start pump if soil moisture drops below this % (Auto mode)
#define DEFAULT_WET_TARGET    75    // Stop pump once moisture reaches this target %

// Safety Limits
#define MAX_PUMP_RUN_SECONDS  35    // Max continuous pump run time (prevents water reservoir depletion & dry run)
#define PUMP_COOLDOWN_SECONDS 90    // Minimum cooldown time between watering cycles to allow soil water diffusion

// Telemetry & Polling Intervals (milliseconds)
#define TELEMETRY_INTERVAL_MS 5000  // Send sensor readings to dashboard every 5 seconds
#define PUMP_POLL_INTERVAL_MS 2000  // Poll pump override commands from server every 2 seconds
#define WEATHER_SYNC_INTERVAL_MS 600000 // Refresh weather forecast every 10 minutes (600,000 ms)

// Geolocation for Open-Meteo Weather API
#define FARM_LATITUDE       "12.9716"   // Latitude (e.g. 12.9716 N)
#define FARM_LONGITUDE      "77.5946"   // Longitude (e.g. 77.5946 E)
