import axios from "axios";

// Cria instância principal do Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Adiciona interceptor para anexar o token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros globais (ex: expiração de token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sessão expirada. Redirecionando para login...");
      localStorage.removeItem("token");
      // Você pode redirecionar manualmente se quiser, por exemplo:
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
