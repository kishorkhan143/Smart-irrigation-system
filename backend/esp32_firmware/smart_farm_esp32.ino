/**
 * ==============================================================================
 * SMART FARM IOT CONTROLLER FIRMWARE (ESP32)
 * ==============================================================================
 * Hardware Components:
 *   - ESP32-WROOM-32 / DevKit V1 Board
 *   - Capacitive Soil Moisture Sensor v1.2 / v2.0 (Analog on GPIO 34)
 *   - DHT11 / DHT22 Digital Temperature & Humidity Sensor (GPIO 4)
 *   - LDR Light Dependent Resistor (Analog on GPIO 35)
 *   - 1-Channel 5V/12V Optocoupler Relay Module (Active LOW on GPIO 23)
 *   - Submersible DC Water Pump (Controlled via Relay)
 *   - Status Indicator LED (GPIO 2)
 *   - Manual Emergency BOOT Button (GPIO 0)
 *
 * Capabilities:
 *   1. Real-time analog soil moisture sampling with multi-read noise filtering
 *   2. Precise environmental temperature and ambient humidity telemetry
 *   3. Ambient illuminance (lux) estimation from photoresistor voltage divider
 *   4. Weather forecast API synchronization (Open-Meteo) for rain prediction
 *   5. Intelligent Auto/Manual irrigation control with pump run timer safety
 *   6. Bidirectional REST sync with Smart Farm Dashboard (telemetry & commands)
 *   7. Offline fail-safe: local autonomous watering loop if WiFi disconnects
 * ==============================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include "config.h"

// Initialize DHT Sensor
#define DHTTYPE DHT11   // Set to DHT22 if using AM2302
DHT dht(PIN_DHT_DATA, DHTTYPE);

// System State Variables
struct FarmTelemetry {
  float soilMoisture = 62.0;    // Percentage (0 - 100%)
  float temperature  = 28.0;    // Celsius
  float humidity     = 70.0;    // Relative Humidity %
  int   lightLux     = 620;     // Illuminance in Lux
  bool  pumpIsActive = false;   // Relay state (true = pumping)
  String controlMode = "auto";  // "auto" or "manual"
  int   rssi         = -60;     // WiFi signal strength in dBm
};

FarmTelemetry farmData;

// Weather Forecast Cache
struct WeatherData {
  float temp = 32.0;
  float humidity = 68.0;
  float windSpeed = 12.0;
  int   rainChance = 20;
  String condition = "Partly Cloudy";
  unsigned long lastSync = 0;
};

WeatherData weatherData;

// Timers & State Flags
unsigned long lastTelemetryMillis = 0;
unsigned long lastPumpPollMillis = 0;
unsigned long lastWeatherSyncMillis = 0;
unsigned long pumpStartTimeMillis = 0;
unsigned long lastPumpStopTimeMillis = 0;

// Button debounce
int lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

// Forward function declarations
void connectToWiFi();
void readSoilMoisture();
void readEnvironmentalSensors();
void updateIrrigationLogic();
void setPumpState(bool turnOn, const char* reason);
void sendTelemetryToDashboard();
void pollPumpCommands();
void fetchLiveWeather();
int calculateLux(int rawAdc);

// ==============================================================================
// SETUP
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n");
  Serial.println("==================================================");
  Serial.println("     SMART PRECISION AGRICULTURE - ESP32 NODE    ");
  Serial.println("==================================================");

  // Configure Pin Modes
  pinMode(PIN_SOIL_ADC, INPUT);
  pinMode(PIN_LDR_ADC, INPUT);
  pinMode(PIN_MANUAL_BUTTON, INPUT_PULLUP);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_RELAY_PUMP, OUTPUT);

  // Set Relay to initial safe OFF state immediately
  digitalWrite(PIN_RELAY_PUMP, RELAY_INACTIVE_LEVEL);
  digitalWrite(PIN_STATUS_LED, LOW);
  farmData.pumpIsActive = false;

  // Configure ADC for 0 - 3.3V range with 12-bit resolution (0 - 4095)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Initialize DHT Sensor
  dht.begin();
  Serial.println("[SENSOR] DHT & ADC Peripherals initialized.");

  // Connect to Local WiFi Network
  connectToWiFi();

  // Perform initial sensor sampling
  readSoilMoisture();
  readEnvironmentalSensors();
  fetchLiveWeather();

  // Transmit first telemetry packet
  sendTelemetryToDashboard();

  Serial.println("[SYSTEM] Setup completed successfully. Operating loop started.");
  Serial.println("--------------------------------------------------");
}

// ==============================================================================
// MAIN LOOP
// ==============================================================================
void loop() {
  unsigned long currentMillis = millis();

  // 1. Maintain WiFi Connection
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, LOW);
    connectToWiFi();
  } else {
    // Heartbeat LED flash
    digitalWrite(PIN_STATUS_LED, (currentMillis / 1000) % 2 == 0 ? HIGH : LOW);
  }

  // 2. Hardware Button Override (Local physical emergency button on GPIO 0)
  int reading = digitalRead(PIN_MANUAL_BUTTON);
  if (reading != lastButtonState) {
    lastDebounceTime = currentMillis;
  }
  if ((currentMillis - lastDebounceTime) > debounceDelay) {
    if (reading == LOW && lastButtonState == HIGH) {
      Serial.println("[MANUAL] Physical BOOT button pressed! Toggling pump state...");
      setPumpState(!farmData.pumpIsActive, "Physical Button Pressed");
      // Set to manual mode on local hardware intervention
      farmData.controlMode = "manual";
      sendTelemetryToDashboard();
    }
  }
  lastButtonState = reading;

  // 3. Periodic Sensor Readings & Auto Irrigation Decision
  readSoilMoisture();
  readEnvironmentalSensors();
  updateIrrigationLogic();

  // 4. Poll Remote Pump Commands from Backend Server (Every 2s)
  if (currentMillis - lastPumpPollMillis >= PUMP_POLL_INTERVAL_MS) {
    lastPumpPollMillis = currentMillis;
    if (WiFi.status() == WL_CONNECTED) {
      pollPumpCommands();
    }
  }

  // 5. Send Live Telemetry to Backend Server (Every 5s)
  if (currentMillis - lastTelemetryMillis >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryMillis = currentMillis;
    if (WiFi.status() == WL_CONNECTED) {
      farmData.rssi = WiFi.RSSI();
      sendTelemetryToDashboard();
    }
  }

  // 6. Refresh Weather Forecast (Every 10 mins)
  if (currentMillis - lastWeatherSyncMillis >= WEATHER_SYNC_INTERVAL_MS || lastWeatherSyncMillis == 0) {
    lastWeatherSyncMillis = currentMillis;
    if (WiFi.status() == WL_CONNECTED) {
      fetchLiveWeather();
    }
  }

  delay(50); // Yield to FreeRTOS scheduler
}

// ==============================================================================
// WIFI CONNECTION MANAGEMENT
// ==============================================================================
void connectToWiFi() {
  static unsigned long lastAttempt = 0;
  if (millis() - lastAttempt < 8000 && lastAttempt != 0) return;
  lastAttempt = millis();

  Serial.printf("[WIFI] Connecting to SSID: %s ...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(400);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.printf("\n[WIFI] Connected! IP Address: %s | RSSI: %d dBm\n", 
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\n[WIFI] Connection failed. Operating in offline autonomous safety mode.");
  }
}

// ==============================================================================
// SENSOR READING: SOIL MOISTURE (12-bit ADC with Oversampling)
// ==============================================================================
void readSoilMoisture() {
  // Read 10 samples and average to cancel high-frequency ADC noise
  long sum = 0;
  const int SAMPLES = 10;
  for (int i = 0; i < SAMPLES; i++) {
    sum += analogRead(PIN_SOIL_ADC);
    delay(5);
  }
  int rawAdc = sum / SAMPLES;

  // Constrain within calibration bounds
  rawAdc = constrain(rawAdc, SOIL_ADC_WATER_WET, SOIL_ADC_AIR_DRY);

  // Inverted percentage mapping (lower raw ADC value = higher moisture)
  float percentage = map(rawAdc, SOIL_ADC_AIR_DRY, SOIL_ADC_WATER_WET, 0, 100);
  percentage = constrain(percentage, 0.0, 100.0);

  // Apply smooth exponential moving filter
  farmData.soilMoisture = (farmData.soilMoisture * 0.7) + (percentage * 0.3);
}

// ==============================================================================
// SENSOR READING: DHT & LIGHT INTENSITY
// ==============================================================================
void readEnvironmentalSensors() {
  // Read DHT sensor
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && t > -20.0 && t < 70.0) {
    farmData.temperature = t;
  }
  if (!isnan(h) && h >= 0.0 && h <= 100.0) {
    farmData.humidity = h;
  }

  // Read LDR Photoresistor
  int rawLdr = analogRead(PIN_LDR_ADC);
  farmData.lightLux = calculateLux(rawLdr);
}

// Approximate Lux calculation based on typical 10k LDR voltage divider
int calculateLux(int rawAdc) {
  if (rawAdc <= 50) return 10;
  // Convert 12-bit ADC to 0-3.3V
  float vOut = (rawAdc * 3.3) / 4095.0;
  if (vOut >= 3.25) return 2000;
  
  // Calculate LDR resistance (assuming 10k pull-down)
  float rLdr = (3.3 - vOut) * 10000.0 / vOut;
  // Standard power law lux approximation: Lux = (500 / R_kohm) ^ (1 / 0.7)
  float rKohm = rLdr / 1000.0;
  if (rKohm <= 0.1) rKohm = 0.1;
  float lux = pow(500.0 / rKohm, 1.4);
  return constrain((int)lux, 0, 50000);
}

// ==============================================================================
// IRRIGATION LOGIC & SAFETY WATCHDOG
// ==============================================================================
void updateIrrigationLogic() {
  unsigned long currentMillis = millis();

  // Safety Watchdog: Prevent continuous running beyond MAX_PUMP_RUN_SECONDS
  if (farmData.pumpIsActive) {
    unsigned long runDurationSec = (currentMillis - pumpStartTimeMillis) / 1000;
    if (runDurationSec >= MAX_PUMP_RUN_SECONDS) {
      Serial.println("[SAFETY] Max pump runtime reached! Automatically turning OFF pump.");
      setPumpState(false, "Safety Watchdog: Max Runtime Exceeded");
      return;
    }
  }

  // Automatic Irrigation Algorithm (only runs when mode is "auto")
  if (farmData.controlMode == "auto") {
    // Check cooldown period between watering events
    unsigned long cooldownSec = (currentMillis - lastPumpStopTimeMillis) / 1000;
    bool inCooldown = (cooldownSec < PUMP_COOLDOWN_SECONDS);

    // Weather Awareness: If high rain chance is forecasted (>75%), skip immediate watering
    bool willRainSoon = (weatherData.rainChance > 75);

    if (!farmData.pumpIsActive) {
      // Trigger condition: Soil moisture below threshold, not in cooldown, and not about to rain heavily
      if (farmData.soilMoisture < DEFAULT_DRY_THRESHOLD && !inCooldown && !willRainSoon) {
        Serial.printf("[AUTO] Soil moisture (%.1f%%) < threshold (%d%%). Starting pump!\n", 
                      farmData.soilMoisture, DEFAULT_DRY_THRESHOLD);
        setPumpState(true, "Auto Mode: Soil Moisture Low");
      }
    } else {
      // Shutoff condition: Target moisture achieved
      if (farmData.soilMoisture >= DEFAULT_WET_TARGET) {
        Serial.printf("[AUTO] Soil moisture (%.1f%%) >= target (%d%%). Stopping pump.\n", 
                      farmData.soilMoisture, DEFAULT_WET_TARGET);
        setPumpState(false, "Auto Mode: Moisture Target Reached");
      }
    }
  }
}

// ==============================================================================
// RELAY CONTROL (PUMP ON / OFF)
// ==============================================================================
void setPumpState(bool turnOn, const char* reason) {
  if (farmData.pumpIsActive == turnOn) return;

  farmData.pumpIsActive = turnOn;
  if (turnOn) {
    digitalWrite(PIN_RELAY_PUMP, RELAY_ACTIVE_LEVEL);
    pumpStartTimeMillis = millis();
    Serial.printf("[RELAY] PUMP ON! Reason: %s\n", reason);
  } else {
    digitalWrite(PIN_RELAY_PUMP, RELAY_INACTIVE_LEVEL);
    lastPumpStopTimeMillis = millis();
    Serial.printf("[RELAY] PUMP OFF! Reason: %s\n", reason);
  }
}

// ==============================================================================
// REST API: TRANSMIT TELEMETRY TO DASHBOARD
// ==============================================================================
void sendTelemetryToDashboard() {
  HTTPClient http;
  String url = String(DASHBOARD_SERVER_URL) + "/api/telemetry";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON Payload
  StaticJsonDocument<256> doc;
  doc["soilMoisture"] = round(farmData.soilMoisture * 10) / 10.0;
  doc["temperature"]  = round(farmData.temperature * 10) / 10.0;
  doc["humidity"]     = round(farmData.humidity * 10) / 10.0;
  doc["lightLux"]     = farmData.lightLux;
  doc["pumpState"]    = farmData.pumpIsActive;
  doc["mode"]         = farmData.controlMode;
  doc["rssi"]         = farmData.rssi;
  doc["mac"]          = WiFi.macAddress();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.printf("[TELEMETRY] Sent: Soil=%.1f%%, Temp=%.1fC, Hum=%.1f%%, Lux=%d, Pump=%s\n",
                    farmData.soilMoisture, farmData.temperature, farmData.humidity,
                    farmData.lightLux, farmData.pumpIsActive ? "ON" : "OFF");
    } else {
      Serial.printf("[TELEMETRY] Server returned HTTP code: %d\n", httpCode);
    }
  } else {
    Serial.printf("[TELEMETRY] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

// ==============================================================================
// REST API: POLL USER COMMANDS FROM BACKEND SERVER
// ==============================================================================
void pollPumpCommands() {
  HTTPClient http;
  String url = String(DASHBOARD_SERVER_URL) + "/api/pump";

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      // Sync pump state if manual control commanded from dashboard
      String serverMode = doc["mode"] | "auto";
      farmData.controlMode = serverMode;

      if (serverMode == "manual") {
        bool targetState = doc["isOn"] | false;
        if (targetState != farmData.pumpIsActive) {
          setPumpState(targetState, "Dashboard Manual Override Command");
        }
      }
    }
  }
  http.end();
}

// ==============================================================================
// WEATHER API INTEGRATION (Open-Meteo Direct Sync)
// ==============================================================================
void fetchLiveWeather() {
  HTTPClient http;
  // Open-Meteo Free API Endpoint (No API Key Required)
  String url = String("https://api.open-meteo.com/v1/forecast?latitude=") + 
               FARM_LATITUDE + "&longitude=" + FARM_LONGITUDE + 
               "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1";

  http.begin(url);
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, payload);

    if (!error) {
      weatherData.temp = doc["current"]["temperature_2m"] | 32.0;
      weatherData.humidity = doc["current"]["relative_humidity_2m"] | 68.0;
      weatherData.windSpeed = doc["current"]["wind_speed_10m"] | 12.0;

      // Extract precipitation probability
      if (doc["hourly"]["precipitation_probability"].is<JsonArray>()) {
        JsonArray probs = doc["hourly"]["precipitation_probability"].as<JsonArray>();
        if (probs.size() > 0) {
          weatherData.rainChance = probs[0] | 20;
        }
      }

      int weatherCode = doc["current"]["weather_code"] | 1;
      if (weatherCode == 0) weatherData.condition = "Clear Sky";
      else if (weatherCode <= 3) weatherData.condition = "Partly Cloudy";
      else if (weatherCode <= 48) weatherData.condition = "Foggy";
      else if (weatherCode <= 67) weatherData.condition = "Rain Showers";
      else weatherData.condition = "Thunderstorm";

      weatherData.lastSync = millis();
      Serial.printf("[WEATHER] Synced: %.1fC, Hum: %.1f%%, Wind: %.1f km/h, Rain: %d%% (%s)\n",
                    weatherData.temp, weatherData.humidity, weatherData.windSpeed,
                    weatherData.rainChance, weatherData.condition.c_str());
    }
  } else {
    Serial.printf("[WEATHER] Sync failed, HTTP code: %d\n", httpCode);
  }
  http.end();
}
