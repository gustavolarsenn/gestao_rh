import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBarChart2,
  FiDatabase,
  FiLayers,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/auth/useAuth";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userLevel = user?.level || 1; // 1 = user comum, 2 = manager, 3+ = admin

  // Estrutura de menus com níveis de acesso
  const menuStructure = [
    {
      label: "Ambiente",
      icon: FiDatabase,
      level: 4,
      items: [
        { to: "/admin/companies", label: "Empresas", level: 4 },
      ],
    },
    {
      label: "Sistema",
      icon: FiSettings,
      level: 3,
      items: [
        { to: "/admin/persons", label: "Pessoas", level: 3 },
        { to: "/admin/users", label: "Usuários", level: 3 },
      ],
    },
    {
      label: "Organização",
      icon: FiUsers,
      level: 3,
      items: [
        { to: "/admin/departments", label: "Departamentos", level: 3 },
        { to: "/admin/role-types", label: "Tipos de Cargo", level: 3 },
        { to: "/admin/roles", label: "Cargos", level: 3 },
        { to: "/admin/teams", label: "Times", level: 3 },
        { to: "/admin/employees", label: "Funcionários", level: 3 },
        { to: "/admin/org-chart", label: "Organograma", level: 3 },
      ],
    },
    {
      label: "KPIs",
      icon: FiBarChart2,
      level: 1,
      items: [
        { to: "/admin/evaluation-types", label: "Tipos de Avaliação", level: 2 },
        { to: "/admin/kpis", label: "KPIs", level: 2 },
        { to: "/admin/employee-kpis", label: "Designar KPIs de Funcionários", level: 2 },
        { to: "/manager/kpi-review", label: "Revisão de KPIs", level: 2 },
        { to: "/manager/team-kpis", label: "Designar KPIs de Time", level: 2 },
        { to: "/employee/employee-kpis", label: "KPIs de Funcionários", level: 1 },
      ],
    },
  ];

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside
      className={`h-screen bg-[#232C33] text-[#F2F3D9] transition-all duration-300 flex flex-col ${
        collapsed ? "w-[80px]" : "w-[240px]"
      }`}
    >
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#3f4755]">
        {!collapsed && (
          <h2 className="text-lg font-bold text-[#F2F3D9]">OrgKPI</h2>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-[#F2F3D9] hover:text-[#3f4755]"
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Menus */}
      <nav className="flex-1 mt-4 overflow-y-auto">
        {menuStructure
          .filter((menu) => userLevel >= menu.level)
          .map((menu) => {
            const isOpen = openMenus.includes(menu.label);
            return (
              <div key={menu.label}>
                <button
                  onClick={() => toggleMenu(menu.label)}
                  className={`flex items-center w-full px-4 py-2 gap-3 text-left transition hover:bg-[#3f4755] ${
                    collapsed ? "justify-center" : ""
                  }`}
                >
                  <menu.icon className="text-[18px]" />
                  {!collapsed && (
                    <span className="text-sm font-semibold text-[#F2F3D9]">
                      {menu.label}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {!collapsed && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="ml-4 mt-1 space-y-1"
                    >
                      {menu.items
                        .filter((item) => userLevel >= item.level)
                        .map(({ to, label }) => (
                          <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                              [
                                "block text-sm px-6 py-1.5 rounded-md mx-2 transition-all",
                                isActive
                                  ? "bg-white text-[#151E3F]"
                                  : "text-[#F2F3D9]/80 hover:bg-[#3f4755] hover:text-white",
                              ].join(" ")
                            }
                          >
                            {label}
                          </NavLink>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </nav>

      {/* Logout */}
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
