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
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ⚙️ Configura o header Authorization sempre que o token muda
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 🔹 Revalida sessão ao carregar a aplicação
  useEffect(() => {
    async function loadUser() {
      try {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          setLoading(false);
          return;
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const { data } = await api.get("/auth/me"); // ⬅️ rota que retorna o usuário logado
        setUser(data);
      } catch (err) {
        console.warn("Sessão expirada ou inválida:", err);
        logout(); // limpa caso o token seja inválido
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });

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
    delete api.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
}
