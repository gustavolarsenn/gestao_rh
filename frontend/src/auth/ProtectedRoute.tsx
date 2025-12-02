import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

interface ProtectedRouteProps {
  requiredLevel: number;
  redirectTo?: string;
}

export function ProtectedRoute({
  requiredLevel,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-sm text-slate-500">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}
      />
    );
  }

  if ((user.level || 1) < requiredLevel) {
    if (user.level === 1) return <Navigate to="/employee/dashboard" replace />;
    if (user.level === 2) return <Navigate to="/employee/dashboard" replace />;
    if (user.level >= 3) return <Navigate to="/employee/dashboard" replace />;

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
