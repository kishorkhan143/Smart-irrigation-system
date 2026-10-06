export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const current = {
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
  };

  const history = [
    { time: '12 AM', hour: 0, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '4 AM', hour: 4, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '8 AM', hour: 8, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '12 PM', hour: 12, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '4 PM', hour: 16, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
    { time: '8 PM', hour: 20, soilMoisture: 0, temperature: 0, humidity: 0, lightLux: 0, pumpState: false },
  ];

  return res.status(200).json({ current, history });
}
