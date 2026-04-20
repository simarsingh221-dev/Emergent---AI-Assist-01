import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vcx_user") || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vcx_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then((r) => {
      setUser(r.data);
      localStorage.setItem("vcx_user", JSON.stringify(r.data));
    }).catch(() => {
      localStorage.removeItem("vcx_token");
      localStorage.removeItem("vcx_user");
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("vcx_token", r.data.token);
    localStorage.setItem("vcx_user", JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (payload) => {
    const r = await api.post("/auth/register", payload);
    localStorage.setItem("vcx_token", r.data.token);
    localStorage.setItem("vcx_user", JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => {
    localStorage.removeItem("vcx_token");
    localStorage.removeItem("vcx_user");
    setUser(null);
  };

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
