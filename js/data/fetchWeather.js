export async function fetchWeather() {
  const res = await fetch('public/data/weather.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch weather');
  return res.json();
}
