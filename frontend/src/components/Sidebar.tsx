import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiUser,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBox,
  FiMinus 
} from "react-icons/fi";
import { useAuth } from "@/auth/useAuth";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const items = [
    { to: "/admin/companies", label: "Empresas", Icon: FiMinus  },
    { to: "/admin/branches", label: "Filiais", Icon: FiMinus  },
    { to: "/admin/persons", label: "Pessoas", Icon: FiMinus  },
    { to: "/admin/users", label: "Usuários", Icon: FiMinus  },
    { to: "/admin/departments", label: "Departamentos", Icon: FiMinus  },
    { to: "/admin/role-types", label: "Tipos de Cargo", Icon: FiMinus  },
    { to: "/admin/roles", label: "Cargos", Icon: FiMinus  },
    { to: "/admin/teams", label: "Times", Icon: FiMinus  },
    { to: "/admin/employees", label: "Funcionários", Icon: FiMinus  },
    { to: "/admin/evaluation-types", label: "Tipos de Avaliação", Icon: FiMinus  },
    { to: "/admin/kpis", label: "KPIs", Icon: FiMinus  },
    { to: "/admin/employee-kpis", label: "KPIs de Funcionários", Icon: FiMinus  },
    { to: "/employee/employee-kpis", label: "KPIs de Funcionários", Icon: FiMinus  },
  ];

  function handleLogout() {
    logout(); // limpa storage e contexto
    navigate("/login"); // redireciona para a tela de login
  }

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

      {/* Rodapé / Logout */}
      <div
        className="mt-auto border-t border-[#3f4755] px-4 py-3 cursor-pointer hover:bg-[#3f4755] transition"
        onClick={handleLogout}
      >
        <div className="flex items-center gap-3 text-[#F2F3D9]/80 hover:text-white">
          <FiLogOut className="text-[18px]" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </div>
      </div>
    </aside>
  );
}
