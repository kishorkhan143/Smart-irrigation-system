export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const lat = req.query.lat as string || '';
  const lon = req.query.lon as string || '';
  const locationLabel = req.query.location as string || '';
  const city = req.query.city as string || '';

  if (req.query.reset === 'true' || (!lat && !lon && !city)) {
    return res.status(200).json({
      temperature: 0,
      condition: 'Standby (Farmland Not Set)',
      humidity: 0,
      windSpeed: 0,
      rainChance: 0,
      locationName: 'Farmland Location Not Set (0 Standby)',
      latitude: 0,
      longitude: 0,
      isLocationSet: false,
    });
  }

  let finalLat = lat;
  let finalLon = lon;
  let finalName = locationLabel;

  if (city) {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`
      );
      if (geoRes.ok) {
        const geoData: any = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          finalLat = String(geoData.results[0].latitude);
          finalLon = String(geoData.results[0].longitude);
          finalName = `${geoData.results[0].name}${geoData.results[0].country ? ' (' + geoData.results[0].country + ')' : ''}`;
        }
      }
    } catch (e) {}
  }

  if (finalLat && finalLon && !finalName) {
    try {
      const revRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${finalLat}&lon=${finalLon}&format=json`,
        { headers: { 'User-Agent': 'SmartFarmIoT-Vercel/1.0' } }
      );
      if (revRes.ok) {
        const revData: any = await revRes.json();
        const a = revData.address || {};
        const town = a.city || a.town || a.village || a.district;
        const region = a.state;
        const country = a.country;
        if (town) {
          finalName = `${town}${region ? ', ' + region : ''}${country ? ' (' + country + ')' : ''}`;
        }
      }
    } catch (e) {}
  }

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data: any = await response.json();
      const current = data.current || {};
      const hourly = data.hourly || {};
      const code = current.weather_code ?? 1;

      let cond = 'Clear Sky';
      if (code === 0) cond = 'Clear Sky';
      else if (code <= 3) cond = 'Partly Cloudy';
      else if (code <= 48) cond = 'Foggy / Hazy';
      else if (code <= 67) cond = 'Rain Showers';
      else if (code <= 77) cond = 'Snow Flurries';
      else if (code <= 82) cond = 'Heavy Rain';
      else cond = 'Thunderstorm';

      return res.status(200).json({
        temperature: Math.round(current.temperature_2m ?? 24),
        condition: cond,
        humidity: Math.round(current.relative_humidity_2m ?? 65),
        windSpeed: Math.round(current.wind_speed_10m ?? 8),
        rainChance: (hourly.precipitation_probability && hourly.precipitation_probability[0]) ? hourly.precipitation_probability[0] : 15,
        latitude: parseFloat(finalLat),
        longitude: parseFloat(finalLon),
        locationName: finalName || `Farmland Lat ${parseFloat(finalLat).toFixed(4)}°, Lon ${parseFloat(finalLon).toFixed(4)}°`,
        isLocationSet: true,
      });
    }
  } catch (e) {}

  return res.status(200).json({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    rainChance: 15,
    latitude: parseFloat(finalLat || '0'),
    longitude: parseFloat(finalLon || '0'),
    locationName: finalName || 'Farmland Location Set',
    isLocationSet: true,
  });
}
