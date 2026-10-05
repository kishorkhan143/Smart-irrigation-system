# 🌾 Smart Farm IoT Hardware Wiring & Setup Guide

This guide details the complete hardware circuit, wiring pinout, sensor calibration, and upload instructions for the ESP32 Smart Agriculture node.

---

## 🛠️ Required Components

1. **ESP32 DevKit V1** (30-pin or 38-pin version)
2. **Capacitive Soil Moisture Sensor v1.2 / v2.0** (Corrosion-resistant analog probe)
3. **DHT11 / DHT22** (Digital Temperature & Humidity Sensor)
4. **LDR (Light Dependent Resistor) Module** (or 5mm LDR with 10kΩ resistor divider)
5. **1-Channel 5V/12V Optocoupler Relay Module** (Active LOW)
6. **Submersible 5V/12V DC Micro Water Pump**
7. **External 5V/12V DC Power Supply** (Dedicated for pump to avoid ESP32 brownout)
8. **Flyback Diode** (1N4007 across pump terminals to suppress inductive voltage spikes)
9. **Jumper Wires & Breadboard**

---

## 🔌 Pin Connection Table

| Component | Pin / Terminal | ESP32 GPIO Pin | Wire Color (Rec.) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Soil Moisture Sensor** | VCC | 3.3V | Red | Use 3.3V for linear ADC output |
| | GND | GND | Black | Common Ground |
| | AOUT | **GPIO 34** | Yellow | Analog input (ADC1_CH6) |
| **DHT11 / DHT22 Sensor**| VCC | 3.3V | Red | 3.3V Power |
| | GND | GND | Black | Common Ground |
| | DATA | **GPIO 4** | Blue | 10kΩ pull-up to 3.3V if bare sensor |
| **LDR Photoresistor** | VCC | 3.3V | Red | 3.3V Power |
| | GND | GND | Black | Common Ground |
| | AOUT | **GPIO 35** | Orange | Analog input (ADC1_CH7) |
| **Relay Module (Pump)** | VCC | 5V (VIN) | Red | 5V supply from USB / external |
| | GND | GND | Black | Common Ground with ESP32 |
| | IN | **GPIO 23** | Green | Active LOW control signal |
| **Status LED (Built-in)**| - | **GPIO 2** | Internal | Blue LED flashes on heartbeat/WiFi |
| **Emergency Button** | BOOT button | **GPIO 0** | Internal | Hold to toggle pump manually |

---

## ⚡ Water Pump & Relay Circuit Schematic

```
          [ + External 5V/12V Power ] ───────────────────┐
                                                         │
                                                  [COM] Relay
                                                         │
                                                  [NO]  Relay
                                                         │
                                                    ( + ) Pump
                                                         │
                                                    [ M ] Motor
                                                         │
                                                    ( - ) Pump
                                                         │
          [ - External Power GND ] ──────────────────────┴─────── (Common with ESP32 GND)
          
  * Note: Install a 1N4007 Diode in reverse parallel across the pump terminals:
    Cathode (banded end) -> Pump (+), Anode -> Pump (-) to absorb inductive kickback.
```

---

## 🧪 Calibration Steps for Capacitive Soil Moisture Sensor

1. **Dry Air Reading**:
   - Hold sensor in dry air. Check the Serial Monitor (115200 baud).
   - Note the raw ADC value (typically ~3200 to 3500).
   - Update `SOIL_ADC_AIR_DRY` in `config.h`.

2. **Water Saturated Reading**:
   - Dip the sensor probe up to the white guideline into a glass of tap water (do NOT submerge circuit components).
   - Note the raw ADC value (typically ~1200 to 1400).
   - Update `SOIL_ADC_WATER_WET` in `config.h`.

3. **Moisture Percentage Formula**:
   $$\text{Moisture \%} = \frac{\text{AIR\_DRY} - \text{Raw ADC}}{\text{AIR\_DRY} - \text{WATER\_WET}} \times 100$$

---

## 🚀 How to Flash the ESP32

### Option 1: Arduino IDE
1. Open **Arduino IDE**.
2. Go to **File -> Preferences**, add ESP32 board URL:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Install **esp32** by Espressif Systems in Boards Manager.
4. Install libraries via Library Manager:
   - `ArduinoJson` (v6.x)
   - `DHT sensor library` by Adafruit
   - `Adafruit Unified Sensor`
5. Open `smart_farm_esp32.ino`. Update your `WIFI_SSID`, `WIFI_PASSWORD`, and `DASHBOARD_SERVER_URL` in `config.h`.
6. Select board **ESP32 Dev Module**, select the COM port, and click **Upload**.

### Option 2: PlatformIO (VS Code)
1. Open the `backend/esp32_firmware/` folder in VS Code with the PlatformIO extension.
2. Click **Build** and **Upload**.
