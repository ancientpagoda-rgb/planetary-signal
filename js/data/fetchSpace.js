export async function fetchSpaceWeather() {
  const res = await fetch('public/data/spaceweather.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch space weather');
  return res.json();
}
