export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = (req.query.q as string || req.query.name as string || '').trim();
  if (!query) {
    return res.status(200).json({ results: [] });
  }

  try {
    const searchRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );
    if (searchRes.ok) {
      const data: any = await searchRes.json();
      const results = (data.results || []).map((loc: any) => ({
        name: `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}${loc.country ? ' (' + loc.country + ')' : ''}`,
        locality: loc.name,
        region: loc.admin1 || '',
        country: loc.country || '',
        lat: loc.latitude,
        lon: loc.longitude,
      }));
      return res.status(200).json({ success: true, results });
    }
  } catch (e) {}

  return res.status(200).json({ success: true, results: [] });
}
