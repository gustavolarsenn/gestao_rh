import { useState, useEffect, useMemo, Fragment } from "react";
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
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

export default function EmployeeKpiEvolution() {
  const { listEmployeeKpis } = useEmployeeKpis();
  const {
    listEmployeeKpiEvolutions,
    createEmployeeKpiEvolution,
    updateEmployeeKpiEvolution,
    loading,
    error,
  } = useEmployeeKpiEvolutions();

  useEffect(() => {
    document.title = "Meus KPIs";
  }, []);

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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
        {/* TITLE */}
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          align="center"
          sx={{
            mb: 4,
            mt: { xs: 2, md: 0 },
            fontSize: { xs: "1.5rem", md: "2.125rem" },
          }}
        >
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
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            mb={3}
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Filtros
          </Typography>

          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            sx={{
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "flex-end" },
            }}
          >
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
              sx={{ flex: { md: "1 1 180px" } }}
              fullWidth
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
              sx={{ flex: { md: "1 1 180px" } }}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* KPI */}
            <FormControl
              size="small"
              sx={{ flex: { md: "1 1 220px" } }}
              fullWidth
            >
              <InputLabel>KPI</InputLabel>
              <Select
                label="KPI"
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
              size="small"
              variant="outlined"
              sx={{
                px: 4,
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", md: "auto" },
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
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700" />
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Colaborador
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Time
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    KPI
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Tipo
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Meta
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Atingido
                  </th>
                  <th className="text-center px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingTable ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
                      Carregando...
                    </td>
                  </tr>
                ) : employeeKpis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-gray-500">
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
                      <Fragment key={kpi.id}>
                        <tr
                          className={`border-b hover:bg-gray-100 cursor-pointer transition ${
                            isExpanded ? "bg-gray-50" : ""
                          }`}
                          onClick={() => toggleExpand(kpi.id)}
                        >
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <span
                              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                kpi.achievedValue == null ||
                                kpi.achievedValue === ""
                                  ? "bg-gray-300"
                                  : rateOk
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-800">
                            {kpi.employee?.person?.name || "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-800">
                            {kpi.employee?.team?.name || "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-800">
                            {kpi.kpi?.name || "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-700">
                            {kpi.kpi?.evaluationType?.name || "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-700">
                            {kpi.goal ?? "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-slate-700">
                            {kpi.achievedValue ?? "—"}
                          </td>
                          <td className="px-3 md:px-4 py-2 md:py-3 text-center">
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
                          <tr className="bg-gray-50 border-b">
                            <td colSpan={8} className="px-3 md:px-4 py-3 md:py-4">
                              {relatedEvolutions.length > 0 ? (
                                <Box sx={{ width: "100%", overflowX: "auto" }}>
                                  <table className="min-w-full text-xs border bg-white rounded-lg overflow-hidden">
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
                                      {relatedEvolutions.map((ev: any) => {
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
                                            <td className="px-3 py-2">
                                              {ev.status}
                                            </td>
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
                                                  onClick={() =>
                                                    openEditModal(ev)
                                                  }
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
                                </Box>
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
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* PAGINATION */}
          {employeeKpis.length > 0 && (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              mt={3}
              sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}
            >
              <Typography variant="body2">
                Página {page} de {pageCount}
              </Typography>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page <= 1}
                  sx={{
                    borderColor: PRIMARY_COLOR,
                    color: PRIMARY_COLOR,
                    "&:hover": {
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: PRIMARY_LIGHT_BG,
                    },
                  }}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={page >= pageCount}
                  sx={{
                    borderColor: PRIMARY_COLOR,
                    color: PRIMARY_COLOR,
                    "&:hover": {
                      borderColor: PRIMARY_COLOR,
                      backgroundColor: PRIMARY_LIGHT_BG,
                    },
                  }}
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEvolution}
              disabled={loading || !achievedValueEvolution}
              sx={{
                ...primaryButtonSx,
                width: { xs: "100%", sm: "auto" },
              }}
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

          {(() => {
            const evalCode = selectedKpi?.kpi?.evaluationType?.code || "";
            const isBinary = evalCode.includes("BINARY");
            const isPct = evalCode.includes("PCT");

            if (isBinary) {
              return (
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
              );
            }

            return (
              <TextField
                size="small"
                label={isPct ? "Valor (%)" : "Valor / Observação"}
                type="number"
                value={achievedValueEvolution}
                inputProps={isPct ? { min: 0, max: 100 } : undefined}
                onChange={(e) => {
                  const val = e.target.value;

                  if (isPct) {
                    if (val === "") {
                      setAchievedValueEvolution("");
                      return;
                    }

                    const num = Number(val);
                    if (Number.isNaN(num)) {
                      setAchievedValueEvolution(val);
                      return;
                    }

                    const clamped = Math.min(100, Math.max(0, num));
                    setAchievedValueEvolution(String(clamped));
                  } else {
                    setAchievedValueEvolution(val);
                  }
                }}
                fullWidth
              />
            );
          })()}

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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outlined"
              onClick={() => setEditModalOpen(false)}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditEvolution}
              disabled={loading || !achievedValueEvolution}
              sx={{
                ...primaryButtonSx,
                width: { xs: "100%", sm: "auto" },
              }}
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

          {(() => {
            let evalCode = "";
            if (editEvolution) {
              const ek = employeeKpis.find(
                (k) => k.id === editEvolution.employeeKpiId
              );
              evalCode = ek?.kpi?.evaluationType?.code || "";
            }

            const isBinary = evalCode.includes("BINARY");
            const isPct = evalCode.includes("PCT");

            if (isBinary) {
              return (
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
              );
            }

            return (
              <TextField
                size="small"
                label={isPct ? "Valor (%)" : "Valor / Observação"}
                type="number"
                value={achievedValueEvolution}
                inputProps={isPct ? { min: 0, max: 100 } : undefined}
                onChange={(e) => {
                  const val = e.target.value;

                  if (isPct) {
                    if (val === "") {
                      setAchievedValueEvolution("");
                      return;
                    }

                    const num = Number(val);
                    if (Number.isNaN(num)) {
                      setAchievedValueEvolution(val);
                      return;
                    }

                    const clamped = Math.min(100, Math.max(0, num));
                    setAchievedValueEvolution(String(clamped));
                  } else {
                    setAchievedValueEvolution(val);
                  }
                }}
                fullWidth
              />
            );
          })()}

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
