const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
// API for FootballPredictionPage
export async function fetchFootballPrediction() {
  const res = await fetch(`${URL_BACKEND}/api/sportify/football-prediction`);
  if (!res.ok) throw new Error('Failed to fetch football prediction');
  return res.json();
}
