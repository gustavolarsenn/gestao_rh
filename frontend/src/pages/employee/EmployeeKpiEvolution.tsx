import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Typography,
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";

import {
  useEmployeeKpis,
  EmployeeKpi,
} from "@/hooks/employee-kpi/useEmployeeKpis";
import {
  useEmployeeKpiEvolutions,
  EmployeeKpiEvolutionStatus,
} from "@/hooks/employee-kpi/useEmployeeKpiEvolutions";

import { rateKPI } from "@/utils/rateKPI";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function EmployeeKpiEvolution() {
  const { listEmployeeKpis, listEmployeeKpisEmployee } = useEmployeeKpis();
  const {
    listEmployeeKpiEvolutions,
    createEmployeeKpiEvolution,
    updateEmployeeKpiEvolution,
    loading,
    error,
  } = useEmployeeKpiEvolutions();

  const employeeId = localStorage.getItem("employeeId")!;
  const [message, setMessage] = useState("");

  // ======================================================
  // STATE PRINCIPAL
  // ======================================================
  const [employeeKpis, setEmployeeKpis] = useState<EmployeeKpi[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);

  // ======================================================
  // PAGINAÇÃO + FILTROS (BACKEND)
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  const [filterPeriodStart, setFilterPeriodStart] = useState("");
  const [filterPeriodEnd, setFilterPeriodEnd] = useState("");
  const [filterKpiId, setFilterKpiId] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  // Opções de KPI para filtro (id + nome)
  const kpiOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const k of employeeKpis) {
      if (!k.kpiId) continue;
      const label = k.kpi?.name || k.kpiId;
      if (!map.has(k.kpiId)) {
        map.set(k.kpiId, label);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [employeeKpis]);

  // ======================================================
  // LOAD KPIS (BACKEND)
  // ======================================================
  async function loadEmployeeKpis() {
    setLoadingTable(true);

    const result = await listEmployeeKpis({
      page,
      limit,
      employeeId,
      kpiId: filterKpiId || undefined,
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
    });

    setEmployeeKpis(result?.data || []);
    setTotal(result?.total || 0);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadEmployeeKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKpiId, filterPeriodStart, filterPeriodEnd]);

  // ======================================================
  // LOAD EVOLUTIONS (BACKEND PAGINADO)
  // ======================================================
  async function loadEvolutions() {
    const result = await listEmployeeKpiEvolutions({
      page: 1,
      limit: 999,
      employeeId,
    });
    setEvolutions(result?.data || []);
  }

  useEffect(() => {
    loadEvolutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  // ======================================================
  // MODAL - REGISTRAR NOVA EVOLUÇÃO
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<EmployeeKpi | null>(null);
  const [achievedValueEvolution, setAchievedValueEvolution] = useState("");

  const openCreateModal = (kpi: EmployeeKpi) => {
    setSelectedKpi(kpi);
    setAchievedValueEvolution("");
    setCreateModalOpen(true);
  };

  const handleSaveEvolution = async () => {
    if (!selectedKpi) return;

    await createEmployeeKpiEvolution({
      employeeKpiId: selectedKpi.id,
      achievedValueEvolution,
      status: EmployeeKpiEvolutionStatus.SUBMITTED,
    });

    await loadEvolutions();
    setCreateModalOpen(false);
    setMessage("Evolução registrada com sucesso!");
  };

  // ======================================================
  // MODAL - EDITAR EVOLUÇÃO DO DIA
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editEvolution, setEditEvolution] = useState<any | null>(null);

  const openEditModal = (evolution: any) => {
    setEditEvolution(evolution);
    setAchievedValueEvolution(evolution.achievedValueEvolution);
    setEditModalOpen(true);
  };

  const handleSaveEditEvolution = async () => {
    if (!editEvolution) return;

    await updateEmployeeKpiEvolution(editEvolution.id, {
      achievedValueEvolution,
    });

    await loadEvolutions();
    setEditModalOpen(false);
    setMessage("Evolução atualizada com sucesso!");
  };

  // ======================================================
  // LINHA EXPANDIDA (KPI → EVOLUÇÕES)
  // ======================================================
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);

  const toggleExpand = (kpiId: string) => {
    setExpandedKpiId((prev) => (prev === kpiId ? null : kpiId));
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* TITLE */}
        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Meus KPIs
        </Typography>

        {message && (
          <Typography variant="body2" sx={{ mb: 2 }} color="success.main">
            {message}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" sx={{ mb: 2 }} color="error.main">
            {error}
          </Typography>
        )}

        {/* FILTERS */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: 4,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Filtros
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-end">
            {/* Período início */}
            <TextField
              size="small"
              label="Período início"
              type="date"
              value={filterPeriodStart}
              onChange={(e) => {
                setFilterPeriodStart(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 180px" }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Período fim */}
            <TextField
              size="small"
              label="Período fim"
              type="date"
              value={filterPeriodEnd}
              onChange={(e) => {
                setFilterPeriodEnd(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 180px" }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Tipo/KPI */}
            <FormControl size="small" sx={{ flex: "1 1 220px" }}>
              <InputLabel>Tipo de KPI</InputLabel>
              <Select
                label="Tipo de KPI"
                value={filterKpiId}
                onChange={(e) => {
                  setFilterKpiId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {kpiOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="large"
              variant="outlined"
              sx={{
                px: 4,
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: PRIMARY_COLOR,
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
              onClick={() => {
                setFilterKpiId("");
                setFilterPeriodStart("");
                setFilterPeriodEnd("");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700" />
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Colaborador
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  KPI
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Meta
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Atingido
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : employeeKpis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    Nenhum KPI encontrado neste período.
                  </td>
                </tr>
              ) : (
                employeeKpis.map((kpi) => {
                  const isExpanded = expandedKpiId === kpi.id;

                  const relatedEvolutions = evolutions.filter(
                    (e) => e.employeeKpiId === kpi.id
                  );

                  const rateOk =
                    kpi.achievedValue != null &&
                    kpi.achievedValue !== "" &&
                    rateKPI(
                      Number(kpi.achievedValue),
                      Number(kpi.goal),
                      kpi.kpi?.evaluationType?.code || ""
                    );

                  return (
                    <>
                      <tr
                        key={kpi.id}
                        className={`border-b hover:bg-gray-100 cursor-pointer transition ${
                          isExpanded ? "bg-gray-50" : ""
                        }`}
                        onClick={() => toggleExpand(kpi.id)}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block w-3 h-3 rounded-full mr-2 ${
                              kpi.achievedValue == null || kpi.achievedValue === ""
                                ? "bg-gray-300"
                                : rateOk
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-800">
                          {kpi.employee?.person?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-800">
                          {kpi.kpi?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {kpi.kpi?.evaluationType?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {kpi.goal ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {kpi.achievedValue ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: PRIMARY_COLOR,
                              color: PRIMARY_COLOR,
                              textTransform: "none",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateModal(kpi);
                            }}
                          >
                            Registrar evolução
                          </Button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${kpi.id}-details`} className="bg-gray-50 border-b">
                          <td colSpan={9} className="px-4 py-4">
                            {relatedEvolutions.length > 0 ? (
                              <table className="w-full text-xs border bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                      Valor / Observação
                                    </th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                      Status
                                    </th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                      Enviado em
                                    </th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                      Aprovado em
                                    </th>
                                    <th className="text-center px-3 py-2 font-semibold text-gray-700">
                                      Ações
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {relatedEvolutions.map((ev) => {
                                    const today = new Date()
                                      .toISOString()
                                      .split("T")[0];
                                    const submittedDateIso = ev.submittedDate
                                      ? new Date(ev.submittedDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : null;
                                    const isToday = submittedDateIso === today;

                                    return (
                                      <tr key={ev.id} className="border-t">
                                        <td className="px-3 py-2">
                                          {ev.achievedValueEvolution}
                                        </td>
                                        <td className="px-3 py-2">{ev.status}</td>
                                        <td className="px-3 py-2">
                                          {ev.submittedDate
                                            ? new Date(
                                                ev.submittedDate
                                              ).toLocaleDateString()
                                            : "—"}
                                        </td>
                                        <td className="px-3 py-2">
                                          {ev.approvedDate
                                            ? new Date(
                                                ev.approvedDate
                                              ).toLocaleDateString()
                                            : "—"}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          {isToday && (
                                            <Button
                                              variant="outlined"
                                              size="small"
                                              sx={{
                                                borderColor: "#3b82f6",
                                                color: "#1d4ed8",
                                                textTransform: "none",
                                              }}
                                              onClick={() => openEditModal(ev)}
                                            >
                                              Editar
                                            </Button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: "italic" }}
                              >
                                Nenhuma evolução registrada para esta KPI.
                              </Typography>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {employeeKpis.length > 0 && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Typography variant="body2">
                Página {page} de {pageCount}
              </Typography>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </main>

      {/* MODAL NOVA EVOLUÇÃO */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Registrar evolução - ${selectedKpi?.kpi?.name || ""}`}
        description="Insira o novo valor atingido ou observação para esta KPI."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outlined" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEvolution}
              disabled={loading || !achievedValueEvolution}
              sx={primaryButtonSx}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Typography variant="body2" color="text.secondary">
            Valor Atingido / Observação
          </Typography>

          {selectedKpi?.kpi?.evaluationType?.code === "BINARY" ? (
            <FormControl size="small" fullWidth>
              <InputLabel>Valor</InputLabel>
              <Select
                label="Valor"
                value={achievedValueEvolution}
                onChange={(e) => setAchievedValueEvolution(e.target.value)}
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="Sim">Sim</MenuItem>
                <MenuItem value="Não">Não</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              size="small"
              label="Valor / Observação"
              value={achievedValueEvolution}
              onChange={(e) => setAchievedValueEvolution(e.target.value)}
              fullWidth
            />
          )}

          {error && (
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          )}
        </div>
      </BaseModal>

      {/* MODAL EDITAR EVOLUÇÃO */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Evolução"
        description="Atualize o valor ou observação da evolução registrada hoje."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outlined" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditEvolution}
              disabled={loading || !achievedValueEvolution}
              sx={{ backgroundColor: "#1e293b", color: "white" }}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Typography variant="body2" color="text.secondary">
            Novo valor / observação
          </Typography>

          {selectedKpi?.kpi?.evaluationType?.code === "BINARY" ? (
            <FormControl size="small" fullWidth>
              <InputLabel>Valor</InputLabel>
              <Select
                label="Valor"
                value={achievedValueEvolution}
                onChange={(e) => setAchievedValueEvolution(e.target.value)}
              >
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="Sim">Sim</MenuItem>
                <MenuItem value="Não">Não</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              size="small"
              label="Valor / Observação"
              value={achievedValueEvolution}
              onChange={(e) => setAchievedValueEvolution(e.target.value)}
              fullWidth
            />
          )}

          {error && (
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
          )}
        </div>
      </BaseModal>
    </div>
  );
}
