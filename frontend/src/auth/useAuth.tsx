import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  companyId: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });

    // 👇 salva informações seguras e úteis
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("companyId", data.user.companyId);
    localStorage.setItem("userId", data.user.id);

    setToken(data.accessToken);
    setUser(data.user);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
