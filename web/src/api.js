import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({ baseURL: BASE_URL });

// attach/remove token on the axios instance
export function setToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

// Load token from storage on app boot
export function initTokenFromStorage() {
  const t = localStorage.getItem("token");
  if (t) api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  return t;
}
