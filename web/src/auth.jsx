import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, initTokenFromStorage } from "./api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(null);
  const [loading, setLoading] = useState(true);

  // on boot, try to restore token and user
  useEffect(() => {
    const t = initTokenFromStorage();
    async function hydrate() {
      try {
        if (t) {
          const { data } = await api.get("/auth/me");
          setUser(data);
          setTok(t);
        }
      } catch (e) {
        setToken(null);
        setUser(null);
        setTok(null);
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setTok(data.token);
    setUser(data.user);
  }

  async function registerUser({ name, email, password, role }) {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    setToken(data.token);
    setTok(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
    setTok(null);
  }

  const value = { user, token, login, registerUser, logout, loading };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
