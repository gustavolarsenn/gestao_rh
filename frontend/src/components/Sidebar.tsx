import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiBarChart2,
  FiDatabase,
  FiChevronDown,
  FiHome,
  FiList,
  FiMessageCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/auth/useAuth";
import orgkpiLogo from "@/assets/orgkpi.png";

// cores inspiradas nas barras do gráfico da logo
const ORGKPI_BLUE_DARK = "#0369a1";   // azul mais escuro (principal)
const ORGKPI_BLUE_LIGHT = "#0ea5e9";  // azul mais claro

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userLevel = user?.level || 1; // 1 = user comum, 2 = manager, 3+ = admin
  const sidebarWidth = collapsed ? "80px" : "260px";

  // Links principais, fixos (não colapsáveis)
  const primaryLinks = [
    {
      to: "/employee/dashboard",
      label: "Meu Dashboard",
      icon: FiHome,
      level: 1,
    },
    {
      to: "/manager/team-dashboard",
      label: "Dashboard do Time",
      icon: FiBarChart2,
      level: 2,
    },
    {
      to: "/employee/employee-kpis",
      label: "Meus KPIs",
      icon: FiList,
      level: 1,
    },
    {
      to: "/employee/feedback",
      label: "Feedback ao Gestor",
      icon: FiMessageCircle,
      level: 1,
    },
  ];

  const menuStructure = [
    {
      label: "Ambiente",
      icon: FiDatabase,
      level: 4,
      items: [{ to: "/admin/companies", label: "Empresas", level: 4 }],
    },
    {
      label: "Sistema",
      icon: FiSettings,
      level: 3,
      items: [
        { to: "/admin/persons", label: "Pessoas", level: 3 },
        { to: "/admin/users", label: "Usuários", level: 3 },
        { to: "/admin/branches", label: "Filiais", level: 3 },
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
        { to: "/admin/career-paths", label: "Trilhas de Carreira", level: 3 },
        { to: "/admin/org-chart", label: "Organograma", level: 3 },
      ],
    },
    {
      label: "KPIs",
      icon: FiBarChart2,
      level: 2,
      items: [
        { to: "/manager/evaluation-types", label: "Tipos de Avaliação", level: 2 },
        { to: "/manager/kpis", label: "KPIs", level: 2 },
        {
          to: "/manager/employee-kpis",
          label: "Designar KPIs de Funcionários",
          level: 2,
        },
        { to: "/manager/kpi-review", label: "Revisão de KPIs", level: 2 },
        { to: "/manager/team-kpis", label: "Designar KPIs de Time", level: 2 },
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
      className="
        fixed inset-y-0 left-0
        bg-white text-slate-800
        flex flex-col shadow-md z-50
        transition-[width] duration-200 ease-in-out
        relative
      "
      style={{ width: sidebarWidth }}
    >
      {/* FAIXA COM GRADIENTE NA BORDA DIREITA */}
      <div
        className="absolute top-0 right-0 h-full w-[2.5px]"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${ORGKPI_BLUE_LIGHT}, ${ORGKPI_BLUE_DARK})`,
        }}
      />

      {/* Cabeçalho: logo + botão de collapse */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <img
            src={orgkpiLogo}
            alt="OrgKPI"
            className="h-9 w-auto object-contain"
          />
          {!collapsed && (
            <span className="text-sm font-semibold text-slate-800">
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="ml-2 flex h-7 w-7 items-center justify-center rounded-full border text-xs
                     border-[#dbeafe] text-[#64748b] hover:bg-[#eff6ff] hover:text-[#0f172a]
                     transition-colors bg-white"
        >
          {collapsed ? (
            <FiChevronRight className="text-[14px]" />
          ) : (
            <FiChevronLeft className="text-[14px]" />
          )}
        </button>
      </div>

      {/* Divisor */}
      {!collapsed && <div className="mx-4 mb-3 h-px bg-slate-100" />}

      {/* Título MENU PRINCIPAL */}
      {!collapsed && (
        <p className="px-4 mb-2 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
          MENU PRINCIPAL
        </p>
      )}

      {/* Wrapper que controla o scroll + posicionamento do logout */}
      <div className="mt-1 flex-1 flex flex-col overflow-hidden">
        {/* Menus (scroll próprio) */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-[#bae6fd] scrollbar-track-transparent pb-4">
          {/* LINKS PRINCIPAIS NO TOPO */}
          {primaryLinks
            .filter((item) => userLevel >= item.level)
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-4 py-2 text-[13px] transition-colors",
                    collapsed ? "justify-center" : "justify-start",
                    isActive
                      ? "bg-[#e0f2ff] text-[#0369a1] font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon className="text-[18px] text-[#0369a1]" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}

          {/* pequeno separador entre principais e colapsáveis */}
          {!collapsed && <div className="mx-4 my-3 h-px bg-slate-100" />}

          {/* MENUS COLAPSÁVEIS */}
          {menuStructure
            .filter((menu) => userLevel >= menu.level)
            .map((menu) => {
              const isOpen = openMenus.includes(menu.label);
              const Icon = menu.icon;
              return (
                <div key={menu.label} className="mb-1">
                  <button
                    onClick={() => toggleMenu(menu.label)}
                    className={`
                      flex items-center w-full px-4 py-2 gap-3 text-left
                      text-[13px] font-medium
                      text-slate-600 hover:bg-slate-50 hover:text-slate-900
                      transition-colors
                      ${collapsed ? "justify-center" : "justify-between"}
                    `}
                  >
                    <Icon className="text-[18px] text-[#64748b]" />
                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="whitespace-nowrap">{menu.label}</span>
                        <FiChevronDown
                          className={`text-[14px] text-slate-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {!collapsed && isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="mt-1 space-y-1"
                      >
                        {menu.items
                          .filter((item) => userLevel >= item.level)
                          .map(({ to, label }) => (
                            <NavLink
                              key={to}
                              to={to}
                              className={({ isActive }) =>
                                [
                                  "flex items-center rounded-full mx-3 px-4 py-2 text-[13px] transition-colors",
                                  isActive
                                    ? "bg-[#e0f2ff] text-[#0369a1] font-medium"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                                ].join(" ")
                              }
                            >
                              <span className="truncate">{label}</span>
                            </NavLink>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </nav>

        {/* Logout sempre no rodapé da sidebar (altura da tela) */}
        <div
          className="mt-auto border-t border-slate-100 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors bg-white"
          onClick={handleLogout}
        >
          <div
            className={`flex items-center gap-3 text-slate-500 hover:text-slate-800 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <FiLogOut className="text-[18px]" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </div>
        </div>
      </div>
    </aside>
  );
}
