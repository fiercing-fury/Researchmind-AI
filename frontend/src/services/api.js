import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "https://researchmind-ai-la3s.onrender.com"
).replace(/\/$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;