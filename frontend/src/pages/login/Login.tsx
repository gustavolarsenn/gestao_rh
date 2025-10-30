import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/useAuth";
import { useNavigate } from "react-router-dom";

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
      navigate("/admin/companies"); // 👈 redireciona após login bem-sucedido
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
    <div className="min-h-screen flex bg-[#151E3F]">
      {/* Left side illustration / info */}
      <div className="hidden lg:flex flex-col justify-center items-center w-3/5 bg-[#fefefe] text-[#232c33] p-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4"
        >
          Avaliação de Performance
        </motion.h1>
        <p className="text-lg text-[#232c33]/80 text-center max-w-md">
          Monitore KPIs e desempenho de equipes de forma inteligente e
          integrada.
        </p>
      </div>

      {/* Right side form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-2/5 bg-[#232c33] border-l border-[#232c33] p-8" style={{ boxShadow: "-10px 0 20px rgba(0, 0, 0, 0.1)" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-center text-[#151E3F] mb-6">
            Bem-vindo de volta
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#151E3F]/80 mb-1">
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                className="border-[#232c33] focus:ring-[#C16E70]"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-[#151E3F]/80 mb-1">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="border-[#232c33] focus:ring-[#C16E70]"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-sm text-[#151E3F]/70 mt-4">
              Esqueceu sua senha?{" "}
              <a
                href="#"
                className="text-[#232c33] font-medium hover:underline"
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
