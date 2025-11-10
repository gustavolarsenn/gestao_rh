import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/useAuth";
import { ProtectedRoute } from "@/auth/ProtectedRoute";

import Login from "@/pages/login/Login";
import Company from "@/pages/super-admin/Company";
import Branch from "@/pages/admin/Branches";
import Users from "@/pages/admin/Users";
import Departments from "@/pages/admin/Departments";
import RoleTypes from "@/pages/admin/RoleTypes";
import Roles from "@/pages/admin/Roles";
import Teams from "./pages/admin/Teams";
import Persons from "./pages/admin/Persons";
import Employees from "./pages/admin/Employees";
import EvaluationTypes from "./pages/admin/EvaluationTypes";
import Kpis from "./pages/admin/Kpis";
import EmployeeKpis from "./pages/admin/EmployeeKpis";
import EmployeeKpisEvolution from "./pages/employee/EmployeeKpiEvolution";
import KpiReview from "./pages/manager/kpi/KpiReview";
import TeamKpis from "./pages/manager/TeamKpis";
import OrgChart from "./pages/admin/OrgChart";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute requiredLevel={4} redirectTo="/admin/companies"/>}>
            <Route path="/admin/companies" element={<Company />} />
          </Route>

          <Route element={<ProtectedRoute requiredLevel={3} redirectTo="/admin/persons"/>}>
            <Route path="/admin/branches" element={<Branch />} />
            <Route path="/admin/persons" element={<Persons />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/role-types" element={<RoleTypes />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/teams" element={<Teams />} />
            <Route path="/admin/employees" element={<Employees />} />
            <Route path="/admin/org-chart" element={<OrgChart />} />
          </Route>
          
          <Route element={<ProtectedRoute requiredLevel={2} redirectTo="/manager/kpis"/>}>
            <Route path="/manager/evaluation-types" element={<EvaluationTypes />} />
            <Route path="/manager/kpis" element={<Kpis />} />
            <Route path="/manager/employee-kpis" element={<EmployeeKpis />} />
            <Route path="/manager/team-kpis" element={<TeamKpis />} />
            <Route path="/manager/kpi-review" element={<KpiReview />} />
          </Route>
          
          <Route element={<ProtectedRoute requiredLevel={1} redirectTo="/employee/employee-kpis"/>}>
            <Route path="/employee/employee-kpis" element={<EmployeeKpisEvolution />} />
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
