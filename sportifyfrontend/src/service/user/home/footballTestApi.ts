// API for FootballTestPage
export async function fetchFootballTest() {
  const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
  const res = await fetch(`${URL_BACKEND}/api/sportify/football-test`);
  if (!res.ok) throw new Error('Failed to fetch football test');
  return res.json();
}
