// // API Configuration for different environments

// export const getApiBaseUrl = (): string => {
//   // Production URLs
//   if (window.location.hostname === 'sportify-vercel.vercel.app') {
//     return 'https://sportify-backend-railway.up.railway.app'; // Thay bằng URL backend Vercel/Railway của bạn
//   }
  
//   if (window.location.hostname === 'sportify-railway.up.railway.app') {
//     return 'https://sportify-backend-railway.up.railway.app'; // Thay bằng URL backend Railway của bạn
//   }

//   // Development (localhost)
//   return 'http://localhost:8081';
// };

// export const API_BASE_URL = getApiBaseUrl();

// // Export API endpoints
// export const API_ENDPOINTS = {
//   SPORTIFY: `${API_BASE_URL}/api/sportify`,
//   SPORTIFY_EVENT: `${API_BASE_URL}/api/sportify/event`,
//   FIELD: `${API_BASE_URL}/api/field`,
//   PRODUCT: `${API_BASE_URL}/api/product`,
//   BOOKING: `${API_BASE_URL}/api/booking`,
//   USER: `${API_BASE_URL}/api/user`,
//   ADMIN: `${API_BASE_URL}/api/admin`,
//   AUTH: `${API_BASE_URL}/api/auth`,
// };

// console.log(`🚀 API Base URL: ${API_BASE_URL}`);
