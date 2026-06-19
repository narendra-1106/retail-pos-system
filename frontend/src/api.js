import axios from "axios";

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, ""); // Remove trailing slash
    return `${baseUrl}/api`;
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
