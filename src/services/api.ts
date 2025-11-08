import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

api.interceptors.request.use((config) => {
  // Try access_token first (for local auth), then firebase_token (for Google auth)
  const accessToken = localStorage.getItem("access_token");
  const firebaseToken = localStorage.getItem("firebase_token");
  const token = accessToken || firebaseToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add cache-busting for debugging
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  
  console.log('🔑 [API] Token for request:', {
    endpoint: config.url,
    hasAccessToken: !!accessToken,
    hasFirebaseToken: !!firebaseToken,
    usingToken: token ? 'Available' : 'Missing'
  });
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`✅ [API] Success ${res.config?.method?.toUpperCase()} ${res.config?.url}:`, {
      status: res.status,
      dataKeys: Object.keys(res.data || {})
    });
    return res;
  },
  (err) => {
    console.error(`❌ [API] Error ${err.config?.method?.toUpperCase()} ${err.config?.url}:`, {
      status: err.response?.status,
      statusText: err.response?.statusText,
      errorData: err.response?.data,
      message: err.message
    });
    
    // Optionally normalize error
    return Promise.reject(
      err.response?.data || { message: err.message || "Request error" }
    );
  }
);

export default api;
