import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/useAuth";
import { useNavigate } from "react-router-dom";
import orgkpiLogo from "@/assets/orgkpi.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/admin/companies");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Falha ao autenticar. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Lado esquerdo – branco, com borda em gradiente na direita */}
      <div className="hidden lg:flex flex-col justify-center items-center w-3/5 relative bg-white text-slate-900">
        {/* barra de borda em gradiente na direita */}
        <div
          className="absolute top-0 right-0 h-full w-[3px]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, #0369a1, #0ea5e9)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-10 text-center">
          <img
            src={orgkpiLogo}
            alt="OrgKPI"
            className="h-20 w-auto mb-6 drop-shadow-sm"
          />

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold mb-3 text-slate-900"
          >
            OrgKPI - Gestão de Performance
          </motion.h1>

          <p className="text-base text-slate-600 max-w-md">
            Centralize seus indicadores, acompanhe o desempenho em tempo real e
            fortaleça a cultura de resultados da sua organização.
          </p>
        </div>
      </div>

      {/* Lado direito – formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-2/5 p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-8 py-9 border border-slate-200"
        >
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Acesse o painel para acompanhar seus KPIs e equipes.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                className="border-slate-300 focus-visible:ring-[#0369a1] focus-visible:border-[#0369a1] text-sm"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="border-slate-300 focus-visible:ring-[#0369a1] focus-visible:border-[#0369a1] text-sm"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0369a1] hover:bg-[#03527d] text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Esqueceu sua senha?{" "}
              <a
                href="#"
                className="text-[#0369a1] font-medium hover:underline"
              >
                Recuperar acesso
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
