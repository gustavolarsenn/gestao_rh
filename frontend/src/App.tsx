import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/useAuth";
import Login from "@/pages/login/Login";
import Company from "@/pages/super-admin/Company";
import Branch from "@/pages/admin/Branches";
import Users from "@/pages/admin/Users";
import Departments from "@/pages/admin/Departments";
import RoleTypes from "@/pages/admin/RoleTypes";
import Roles from "@/pages/admin/Roles";
import Teams from "./pages/admin/Teams";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/companies" element={<Company />} />
          <Route path="/admin/branches" element={<Branch />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/role-types" element={<RoleTypes />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/teams" element={<Teams />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
