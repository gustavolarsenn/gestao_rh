// src/pages/auth/ResetPasswordPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import orgkpiLogo from "@/assets/orgkpi.png";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token || !email) {
      setError("Link de redefinição inválido ou expirado.");
      return;
    }

    if (!password || !passwordConfirm) {
      setError("Preencha os dois campos de senha.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("As senhas não conferem.");
      return;
    }

    if (password.length < 8) {
      setError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
      });

      setSuccess("Senha redefinida com sucesso! Você já pode acessar o sistema.");
      setTimeout(() => {
        navigate("/"); // ajuste se sua rota de login for outra
      }, 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Não foi possível redefinir a senha. O link pode estar expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Lado esquerdo – mesmo da tela de login */}
      <div className="hidden lg:flex flex-col justify-center items-center w-3/5 relative bg-white text-slate-900">
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
            Redefina sua senha com segurança e volte a acompanhar o desempenho
            da sua organização.
          </p>
        </div>
      </div>

      {/* Lado direito – formulário de redefinição */}
      <div className="flex flex-col justify-center items-center w-full lg:w-2/5 p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] px-8 py-9 border border-slate-200"
        >
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              Redefinir senha
            </h2>
            <p className="text-sm text-slate-500 mt-1 text-center">
              Defina uma nova senha para continuar acessando o OrgKPI.
            </p>
          </div>

          {(!token || !email) && (
            <p className="text-sm text-red-600 text-center mb-4">
              Link de redefinição inválido ou ausente. Tente solicitar um novo
              e-mail de recuperação.
            </p>
          )}

          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nova senha
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

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar nova senha
              </label>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="********"
                className="border-slate-300 focus-visible:ring-[#0369a1] focus-visible:border-[#0369a1] text-sm"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            {success && (
              <p className="text-sm text-emerald-600 text-center">{success}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !token || !email}
              className="w-full bg-[#0369a1] hover:bg-[#03527d] text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </Button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Lembrou a senha?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-[#0369a1] font-medium hover:underline"
              >
                Voltar para o login
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
