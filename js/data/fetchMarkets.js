export async function fetchMarkets() {
  const res = await fetch('public/data/markets.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch markets');
  return res.json();
}
