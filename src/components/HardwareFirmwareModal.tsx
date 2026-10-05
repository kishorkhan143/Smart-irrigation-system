import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Sliders, 
  Zap, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { CurrentTelemetry } from '../types/farm';

interface HardwareFirmwareProps {
  telemetry: CurrentTelemetry;
  pumpIsOn: boolean;
}

export const HardwareFirmwareView: React.FC<HardwareFirmwareProps> = ({
  telemetry,
  pumpIsOn,
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'wiring' | 'calibration'>('code');
  const [wifiSsid, setWifiSsid] = useState('MyFarm_WiFi_2.4G');
  const [wifiPass, setWifiPass] = useState('PrecisionAgri2026');
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:3000');
  const [copied, setCopied] = useState(false);
  const [firmwareCode, setFirmwareCode] = useState('');

  useEffect(() => {
    fetch(`/api/firmware/code?ssid=${encodeURIComponent(wifiSsid)}&pass=${encodeURIComponent(wifiPass)}&host=${encodeURIComponent(serverUrl)}`)
      .then(res => res.json())
      .then(data => {
        setFirmwareCode(data.inoSketch || '// ESP32 Sketch');
      })
      .catch(() => {});
  }, [wifiSsid, wifiPass, serverUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadIno = () => {
    const blob = new Blob([firmwareCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart_farm_esp32.ino';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          ESP32 IoT Node Firmware & Hardware Lab
        </h2>
        <p className="text-xs text-slate-400">
          Ready-to-flash C++ Arduino / PlatformIO code for your physical ESP32, soil moisture probe, DHT sensor, and relay water pump.
        </p>
      </div>

      <div className="glow-card rounded-2xl overflow-hidden border border-emerald-500/30">
        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-emerald-950/60 bg-[#061411] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'code'
                ? 'bg-[#0b2420] text-emerald-300 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>C++ Source Code (.ino)</span>
          </button>

          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'wiring'
                ? 'bg-[#0b2420] text-emerald-300 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Wiring & Pinout Schematic</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
              activeTab === 'calibration'
                ? 'bg-[#0b2420] text-emerald-300 border-t-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Soil Sensor Calibration</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 bg-[#071613]">
          {activeTab === 'code' && (
            <div className="space-y-4">
              {/* Quick Config Bar */}
              <div className="p-4 rounded-xl bg-[#09221d] border border-emerald-500/25 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Your WiFi SSID
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-900/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Your WiFi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-900/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Dashboard Server URL
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-900/80 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to flash to ESP32 using Arduino IDE or PlatformIO
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-900"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy C++ Code'}</span>
                  </button>
                  <button
                    onClick={handleDownloadIno}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ino Sketch</span>
                  </button>
                </div>
              </div>

              {/* Code Display Area */}
              <div className="relative rounded-xl border border-emerald-950/80 bg-[#050f0d] p-4 overflow-x-auto max-h-[460px]">
                <pre className="text-xs font-mono-numbers text-emerald-200/90 leading-relaxed">
                  <code>{firmwareCode || `// Loading smart_farm_esp32.ino ...`}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'wiring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#09221d] border border-emerald-500/30 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    ESP32 Pinout Connections
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-emerald-950/60">
                      <span className="text-slate-300">Soil Moisture Sensor (AOUT)</span>
                      <span className="font-mono-numbers text-emerald-400 font-bold">GPIO 34 (ADC1)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-950/60">
                      <span className="text-slate-300">Water Pump Relay (IN)</span>
                      <span className="font-mono-numbers text-cyan-400 font-bold">GPIO 23 (Active LOW)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-950/60">
                      <span className="text-slate-300">DHT11 / DHT22 Sensor</span>
                      <span className="font-mono-numbers text-amber-400 font-bold">GPIO 4</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-emerald-950/60">
                      <span className="text-slate-300">LDR Photoresistor (Lux)</span>
                      <span className="font-mono-numbers text-yellow-400 font-bold">GPIO 35 (ADC1)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#09221d] border border-emerald-500/30 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Pump Power & Safety
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong className="text-white">External Power:</strong> Power the water pump using a dedicated 5V/12V power supply, never directly from the ESP32.</li>
                    <li><strong className="text-white">Common Ground:</strong> Connect the pump power supply GND to the ESP32 GND.</li>
                    <li><strong className="text-white">Watchdog:</strong> The firmware automatically turns off the pump if run longer than 35 seconds.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="p-4 rounded-xl bg-[#09221d] border border-emerald-500/30 text-xs text-slate-300 space-y-3">
              <h3 className="text-sm font-bold text-white">How to Calibrate Your Soil Sensor</h3>
              <p>1. Hold the sensor probe in dry air: raw reading is ~3200 (0% moisture).</p>
              <p>2. Dip sensor blade in water: raw reading is ~1350 (100% moisture).</p>
              <p>Values are calibrated in <code>config.h</code> in the firmware.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
