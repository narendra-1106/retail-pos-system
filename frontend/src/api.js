import axios from "axios";

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    return `${baseUrl}/api`;
  }
  
  // If running locally or on a local network (e.g. 192.168.x.x)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.") || window.location.hostname.startsWith("10.")) {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return "https://retail-pos-system-4o7s.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
