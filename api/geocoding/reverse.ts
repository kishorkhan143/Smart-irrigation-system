export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const lat = req.query.lat as string;
  const lon = req.query.lon as string;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'User-Agent': 'SmartFarmIoT-Vercel/1.0' } }
    );

    if (geoRes.ok) {
      const data: any = await geoRes.json();
      const a = data.address || {};
      const town = a.city || a.town || a.village || a.suburb || a.county || a.district;
      const region = a.state || a.region;
      const country = a.country;
      let name = '';
      if (town) {
        name = `${town}${region ? ', ' + region : ''}${country ? ' (' + country + ')' : ''}`;
      } else if (region) {
        name = `${region}${country ? ' (' + country + ')' : ''}`;
      } else if (data.name) {
        name = `${data.name}${country ? ' (' + country + ')' : ''}`;
      } else {
        name = `Farmland Lat ${parseFloat(lat).toFixed(4)}°, Lon ${parseFloat(lon).toFixed(4)}°`;
      }

      return res.status(200).json({
        success: true,
        name,
        locality: town || region || 'Farmland Area',
        region: region || '',
        country: country || '',
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });
    }
  } catch (e) {}

  return res.status(200).json({
    success: true,
    name: `Farmland Lat ${parseFloat(lat).toFixed(4)}°, Lon ${parseFloat(lon).toFixed(4)}°`,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
  });
}
