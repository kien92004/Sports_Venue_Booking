// import { API_ENDPOINTS } from '../../../config/api.config';

// API functions for HomePage
const URL_BACKEND = import.meta.env.VITE_BACKEND_URL;
export async function fetchHomeData(username?: string) {
  // Tạo URL với query parameter nếu có username
  const mainUrl = username
    ? `${URL_BACKEND}/api/sportify?username=${encodeURIComponent(username)}`
    : `${URL_BACKEND}/api/sportify`;

  const [mainResponse, eventResponse] = await Promise.all([
    fetch(mainUrl),
    fetch(`${URL_BACKEND}/api/sportify/event`)
  ]);
  if (!mainResponse.ok) throw new Error(`Main API error: ${mainResponse.status}`);
  if (!eventResponse.ok) throw new Error(`Event API error: ${eventResponse.status}`);
  const mainData = await mainResponse.json();
  const eventData = await eventResponse.json();
  return { mainData, eventData };
}
