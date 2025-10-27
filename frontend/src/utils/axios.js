import axios from "axios";

// Create instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header from localStorage if present
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("bfm-token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Handle error
  }
  return config;
});

export default axiosInstance;
