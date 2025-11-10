import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

interface ProtectedRouteProps {
  requiredLevel: number; // nível mínimo exigido para acessar
  redirectTo?: string; // opcional, rota para redirecionar
}

export function ProtectedRoute({
  requiredLevel,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if ((user.level || 1) < requiredLevel) {
    if (user.level === 1) return <Navigate to="/employee/employee-kpis" replace />;
    if (user.level === 2) return <Navigate to="/manager/kpi-review" replace />;
    if (user.level >= 3) return <Navigate to="/admin/employee-kpis" replace />;

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
