import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { to: "/admin/companies", label: "Empresas", Icon: FiBriefcase },
    { to: "/admin/branches", label: "Filiais", Icon: FiBriefcase },
    { to: "/admin/users", label: "Usuários", Icon: FiUsers },
    { to: "/admin/departments", label: "Departamentos", Icon: FiUsers },
    { to: "/admin/role-types", label: "Tipos de Cargo", Icon: FiUsers },
    { to: "/admin/roles", label: "Cargos", Icon: FiUsers },
    { to: "/admin/teams", label: "Times", Icon: FiUsers },
  ];

  return (
    <aside
      className={`h-screen bg-[#232C33] text-[#F2F3D9] transition-all duration-300 flex flex-col ${
        collapsed ? "w-[80px]" : "w-[240px]"
      }`}
    >
      {/* Cabeçalho / botão colapsar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#3f4755]">
        {!collapsed && (
          <h2 className="text-lg font-bold text-[#F2F3D9]">Painel Admin</h2>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-[#F2F3D9] hover:text-[#3f4755]"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 mt-4 space-y-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-4 py-2 rounded-lg mx-2 transition-all",
                isActive
                  ? "bg-white text-[#151E3F]"
                  : "text-[#F2F3D9]/80 hover:bg-[#3f4755] hover:text-white",
              ].join(" ")
            }
          >
            <Icon className="text-[18px]" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Rodapé / Configurações */}
      <div className="mt-auto border-t border-[#3f4755] px-4 py-3">
        <div className="flex items-center gap-3 text-[#F2F3D9]/80 hover:text-white cursor-pointer">
          <FiSettings className="text-[18px]" />
          {!collapsed && <span className="text-sm font-medium">Configurações</span>}
        </div>
      </div>
    </aside>
  );
}
