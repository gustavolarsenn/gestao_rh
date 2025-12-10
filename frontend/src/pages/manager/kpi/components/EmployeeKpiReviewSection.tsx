import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/modals/BaseModal";
import { useEmployeeKpis } from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployeeKpiEvolutions } from "@/hooks/employee-kpi/useEmployeeKpiEvolutions";
import { useEmployees, Employee } from "@/hooks/employee/useEmployees";
import { rateKPI } from "@/utils/rateKPI";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useAuth } from "@/auth/useAuth";

// Paleta unificada
const PRIMARY_COLOR = "#0369a1";
const PRIMARY_LIGHT = "#0ea5e9";
const PRIMARY_LIGHT_BG = "#e0f2ff";
const SECTION_BORDER_COLOR = "#e2e8f0";

export default function EmployeeKpiReviewSection() {
  const { listEmployeeKpis } = useEmployeeKpis();
  const {
    listEmployeeKpiEvolutions,
    approveEmployeeKpiEvolution,
    rejectEmployeeKpiEvolution,
  } = useEmployeeKpiEvolutions();
  const { listEmployees } = useEmployees();
  const { user } = useAuth();

  const [employeeKpis, setEmployeeKpis] = useState<any[]>([]);
  const [employeeEvols, setEmployeeEvols] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
    null
  );
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // ========================
  // Paginação + Filtros
  // ========================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.max(1, Math.ceil(total / limit) || 1);

  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("all");
  const [filterKpiType, setFilterKpiType] = useState<string>("all");
  const [loadingTable, setLoadingTable] = useState(false);

  // Helper para identificar tipo de KPI
  const getKpiTypeKey = (k: any) => {
    const type = k.kpi?.evaluationType;
    return type?.id || type?.code || type?.name || "";
  };

  const getKpiTypeLabel = (k: any) => {
    const type = k.kpi?.evaluationType;
    return type?.name || type?.description || type?.code || "Sem tipo";
  };

  // Lista de tipos de KPI (para o filtro)
  const kpiTypes = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    employeeKpis.forEach((k) => {
      const key = getKpiTypeKey(k);
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { key, label: getKpiTypeLabel(k) });
      }
    });
    return Array.from(map.values());
  }, [employeeKpis]);

  // ========================
  // Carregar dados estáticos (colaboradores + evoluções)
  // ========================
  useEffect(() => {
    async function loadStatic() {
      const [empResult, evolResult] = await Promise.all([
        listEmployees({ page: 1, limit: 999 }),
        listEmployeeKpiEvolutions({ page: "1", limit: "200" }),
      ]);

      setAllEmployees(empResult.data || empResult || []);
      setEmployeeEvols((evolResult as any)?.data || evolResult || []);
    }

    loadStatic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // Carregar Employee KPIs (paginação + filtro de colaborador no backend)
  // ========================
  async function loadEmployeeKpis() {
    setLoadingTable(true);

    const params: any = {
      page,
      limit,
    };

    if (filterEmployeeId !== "all") {
      params.employeeId = filterEmployeeId;
    }

    const result: any = await listEmployeeKpis(params);

    let data = result?.data || result || [];
    let totalItems = result?.total ?? data.length;

    // Remover o próprio colaborador (gestor não avalia a si mesmo)
    if (user?.employeeId) {
      data = data.filter((k: any) => k.employeeId !== user.employeeId);
      totalItems = data.length;
    }

    setEmployeeKpis(data);
    setTotal(totalItems);

    setLoadingTable(false);
  }

  useEffect(() => {
    loadEmployeeKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterEmployeeId]);

  // ========================
  // Employees agregados (após filtro de tipo de KPI)
  // ========================
  const employees = useMemo(() => {
    const filteredKpis = employeeKpis.filter((k) => {
      if (filterKpiType === "all") return true;
      return getKpiTypeKey(k) === filterKpiType;
    });

    return Array.from(
      new Map(filteredKpis.map((k) => [k.employeeId, k.employee])).values()
    );
  }, [employeeKpis, filterKpiType]);

  async function handleApprove(ev: any) {
    await approveEmployeeKpiEvolution(ev.id);
    const updated = await listEmployeeKpiEvolutions({ page: "1", limit: "200" });
    setEmployeeEvols((updated as any)?.data || updated || []);
  }

  async function handleReject(ev: any) {
    setSelectedEvolution(ev);
    setModalOpen(true);
  }

  async function handleConfirmRejection() {
    if (!selectedEvolution) return;
    await rejectEmployeeKpiEvolution(selectedEvolution.id, rejectionReason);
    const updated = await listEmployeeKpiEvolutions({ page: "1", limit: "200" });
    setEmployeeEvols((updated as any)?.data || updated || []);
    setModalOpen(false);
    setRejectionReason("");
  }

  const handleClearFilters = () => {
    setFilterEmployeeId("all");
    setFilterKpiType("all");
    setPage(1);
    setExpandedEmployeeId(null);
    setExpandedKpiId(null);
  };

  return (
    <>
      {/* CARD DE FILTROS */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          p: { xs: 2, md: 4 },
          mb: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          border: `1px solid ${SECTION_BORDER_COLOR}`,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{ mb: 3, fontSize: { xs: "1rem", md: "1.25rem" } }}
        >
          Filtros
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { xs: "stretch", md: "flex-end" },
          }}
        >
          {/* Filtro Colaborador */}
          <FormControl
            size="small"
            fullWidth
            sx={{ flex: { md: "1 1 220px" } }}
          >
            <InputLabel>Colaborador</InputLabel>
            <Select
              label="Colaborador"
              value={filterEmployeeId}
              onChange={(e) => {
                setFilterEmployeeId(e.target.value as string);
                setPage(1);
                setExpandedEmployeeId(null);
                setExpandedKpiId(null);
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {allEmployees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.person?.name || "—"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filtro Tipo de KPI */}
          <FormControl
            size="small"
            fullWidth
            sx={{ flex: { md: "1 1 220px" } }}
          >
            <InputLabel>Tipo de KPI</InputLabel>
            <Select
              label="Tipo de KPI"
              value={filterKpiType}
              onChange={(e) => {
                setFilterKpiType(e.target.value as string);
                setExpandedEmployeeId(null);
                setExpandedKpiId(null);
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              {kpiTypes.map((t) => (
                <MenuItem key={t.key} value={t.key}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Botão Limpar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              width: { xs: "100%", md: "auto" },
            }}
          >
            <Button
              variant="outline"
              onClick={handleClearFilters}
              size={'lg'}
              className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff] w-full md:w-auto"
            >
              Limpar filtros
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* CARD PRINCIPAL (TABELA + PAGINAÇÃO) */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          border: `1px solid ${SECTION_BORDER_COLOR}`,
          width: "100%",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="#1e293b"
          sx={{
            mb: 3,
            fontSize: { xs: "1rem", md: "1.25rem" },
          }}
        >
          KPIs de Funcionários
        </Typography>

        {/* WRAPPER PARA SCROLL HORIZONTAL NO MOBILE */}
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-2 md:px-3 py-2 text-slate-700">
                  Funcionário
                </th>
                <th className="px-2 md:px-3 py-2 text-center text-slate-700">
                  Qtde. KPIs
                </th>
                <th className="px-2 md:px-3 py-2 text-center text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                employees.map((emp: any) => {
                  const empKpis = employeeKpis.filter((k) => {
                    if (k.employeeId !== emp.id) return false;
                    if (filterKpiType !== "all") {
                      return getKpiTypeKey(k) === filterKpiType;
                    }
                    return true;
                  });

                  const isExpanded = expandedEmployeeId === emp.id;

                  return (
                    <React.Fragment key={emp.id}>
                      <tr className="border-b hover:bg-slate-50 transition">
                        <td className="px-2 md:px-3 py-2">
                          {emp.person?.name || "—"}
                        </td>
                        <td className="px-2 md:px-3 py-2 text-center">
                          {empKpis.length}
                        </td>
                        <td className="px-2 md:px-3 py-2 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedEmployeeId(
                                isExpanded ? null : emp.id
                              )
                            }
                            className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff]"
                          >
                            {isExpanded ? "Recolher" : "Ver KPIs"}
                          </Button>
                        </td>
                      </tr>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-slate-50"
                          >
                            <td colSpan={3} className="p-2 md:p-3">
                              {empKpis.length > 0 ? (
                                <Box sx={{ width: "100%", overflowX: "auto" }}>
                                  <table className="min-w-full text-xs border-collapse bg-white rounded-md shadow-sm border border-slate-200">
                                    <thead>
                                      <tr className="bg-slate-100">
                                        <th className="px-2 py-2 w-10"></th>
                                        <th className="px-2 py-2 text-left text-slate-700">
                                          KPI
                                        </th>
                                        <th className="px-2 py-2 text-left text-slate-700">
                                          Meta
                                        </th>
                                        <th className="px-2 py-2 text-left text-slate-700">
                                          Atingido
                                        </th>
                                        <th className="px-2 py-2 text-center text-slate-700">
                                          Ações
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {empKpis.map((kpi) => {
                                        const evols = employeeEvols.filter(
                                          (e) => e.employeeKpiId === kpi.id
                                        );
                                        const expanded =
                                          expandedKpiId === kpi.id;

                                        return (
                                          <React.Fragment key={kpi.id}>
                                            <tr className="border-b last:border-b-0">
                                              <td className="py-2 px-2 md:px-3">
                                                <span
                                                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                                    !kpi.achievedValue
                                                      ? "bg-slate-300"
                                                      : rateKPI(
                                                          Number(
                                                            kpi.achievedValue
                                                          ),
                                                          Number(kpi.goal),
                                                          kpi.kpi
                                                            ?.evaluationType
                                                            ?.code || ""
                                                        )
                                                      ? "bg-emerald-500"
                                                      : "bg-rose-500"
                                                  }`}
                                                />
                                              </td>
                                              <td className="px-2 md:px-3 py-2 text-slate-800">
                                                {kpi.kpi?.name}
                                              </td>
                                              <td className="px-2 md:px-3 py-2 text-slate-700">
                                                {kpi.goal}
                                              </td>
                                              <td className="px-2 md:px-3 py-2 text-slate-700">
                                                {kpi.achievedValue ?? "—"}
                                              </td>
                                              <td className="px-2 md:px-3 py-2 text-center">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() =>
                                                    setExpandedKpiId(
                                                      expanded
                                                        ? null
                                                        : kpi.id
                                                    )
                                                  }
                                                  className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff]"
                                                >
                                                  {expanded
                                                    ? "Ocultar"
                                                    : "Evoluções"}
                                                </Button>
                                              </td>
                                            </tr>

                                            {expanded && (
                                              <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                              >
                                                <td
                                                  colSpan={5}
                                                  className="px-2 md:px-4 py-2 bg-slate-50"
                                                >
                                                  {evols.length > 0 ? (
                                                    <Box
                                                      sx={{
                                                        width: "100%",
                                                        overflowX: "auto",
                                                      }}
                                                    >
                                                      <table className="min-w-full text-xs bg-white rounded shadow-sm border border-slate-200">
                                                        <thead>
                                                          <tr className="bg-slate-100 text-left">
                                                            <th className="px-2 py-2 text-slate-700">
                                                              Valor /
                                                              Observação
                                                            </th>
                                                            <th className="px-2 py-2 text-slate-700">
                                                              Status
                                                            </th>
                                                            <th className="px-2 py-2 text-slate-700">
                                                              Data
                                                            </th>
                                                            <th className="px-2 py-2 text-center text-slate-700">
                                                              Ações
                                                            </th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {evols.map((ev) => (
                                                            <tr
                                                              key={ev.id}
                                                              className="border-t"
                                                            >
                                                              <td className="px-2 py-2 text-slate-800">
                                                                {
                                                                  ev.achievedValueEvolution
                                                                }
                                                              </td>
                                                              <td className="px-2 py-2 text-slate-700">
                                                                {ev.status}
                                                              </td>
                                                              <td className="px-2 py-2 text-slate-700">
                                                                {ev.submittedDate
                                                                  ? new Date(
                                                                      ev.submittedDate
                                                                    ).toLocaleDateString()
                                                                  : "—"}
                                                              </td>
                                                              <td className="px-2 py-2 text-center">
                                                                {ev.status ===
                                                                  "SUBMITTED" && (
                                                                  <div className="flex gap-2 justify-center">
                                                                    <Button
                                                                      size="sm"
                                                                      onClick={() =>
                                                                        handleApprove(
                                                                          ev
                                                                        )
                                                                      }
                                                                      className="bg-[#0369a1] hover:bg-[#0ea5e9] text-white"
                                                                    >
                                                                      Aprovar
                                                                    </Button>
                                                                    <Button
                                                                      size="sm"
                                                                      variant="outline"
                                                                      className="border-rose-500 text-rose-600 hover:bg-rose-50"
                                                                      onClick={() =>
                                                                        handleReject(
                                                                          ev
                                                                        )
                                                                      }
                                                                    >
                                                                      Rejeitar
                                                                    </Button>
                                                                  </div>
                                                                )}
                                                              </td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                    </Box>
                                                  ) : (
                                                    <p className="text-slate-500 text-sm italic">
                                                      Nenhuma evolução
                                                      registrada.
                                                    </p>
                                                  )}
                                                </td>
                                              </motion.tr>
                                            )}
                                          </React.Fragment>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </Box>
                              ) : (
                                <p className="text-slate-500 text-sm italic">
                                  Nenhum KPI atribuído.
                                </p>
                              )}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </Box>

        {/* Paginação */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Página {page} de {pageCount} — {total} registro(s)
          </Typography>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage((prev) => Math.max(1, prev - 1));
                setExpandedEmployeeId(null);
                setExpandedKpiId(null);
              }}
              className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff]"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => {
                setPage((prev) => prev + 1);
                setExpandedEmployeeId(null);
                setExpandedKpiId(null);
              }}
              className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff]"
            >
              Próxima
            </Button>
          </div>
        </Box>
      </Paper>

      {/* Modal de rejeição */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Motivo da Rejeição"
        description="Explique o motivo da rejeição desta evolução."
        footer={
          <div className="flex justify-end w-full gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="border-[#0369a1] text-[#0369a1] hover:bg-[#e0f2ff]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmRejection}
              className="bg-[#0369a1] hover:bg-[#0ea5e9] text-white"
            >
              Confirmar
            </Button>
          </div>
        }
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Descreva o motivo..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
        />
      </BaseModal>
    </>
  );
}
