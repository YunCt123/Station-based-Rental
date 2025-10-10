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
  const access = localStorage.getItem("access_token");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  
  // Add cache-busting for debugging
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    // Optionally normalize error
    return Promise.reject(
      err.response?.data || { message: err.message || "Request error" }
    );
  }
);

export default api;
