import { useState, useEffect } from "react";
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
  useTeamKpis,
  TeamKpi,
  KpiStatus,
} from "@/hooks/team-kpi/useTeamKpis";
import { useTeams, Team } from "@/hooks/team/useTeams";
import { useKpis, Kpi } from "@/hooks/kpi/useKpis";
import {
  useEvaluationTypes,
  EvaluationType,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function TeamKpis() {
  const {
    listTeamKpis,
    createTeamKpi,
    updateTeamKpi,
    deleteTeamKpi,
    loading,
    error,
  } = useTeamKpis();

  useEffect(() => {
    document.title = "KPIs de Times";
  }, []);

  const { listDistinctTeams } = useTeams();
  const { listDistinctKpis } = useKpis();
  const { listDistinctEvaluationTypes } = useEvaluationTypes();

  const [teamKpis, setTeamKpis] = useState<TeamKpi[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([]);
  const [message, setMessage] = useState("");

  // ======================================================
  // PAGINATION + FILTERS (backend)
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  const [filterTeamId, setFilterTeamId] = useState("");
  const [filterKpiId, setFilterKpiId] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | KpiStatus>("");
  const [filterPeriodStart, setFilterPeriodStart] = useState("");
  const [filterPeriodEnd, setFilterPeriodEnd] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  const statusOptions: { value: KpiStatus; label: string }[] = [
    { value: KpiStatus.DRAFT, label: "Rascunho" },
    { value: KpiStatus.SUBMITTED, label: "Enviado" },
    { value: KpiStatus.APPROVED, label: "Aprovado" },
    { value: KpiStatus.REJECTED, label: "Rejeitado" },
  ];

  const statusLabelMap: Record<KpiStatus, string> = {
    [KpiStatus.DRAFT]: "Rascunho",
    [KpiStatus.SUBMITTED]: "Enviado",
    [KpiStatus.APPROVED]: "Aprovado",
    [KpiStatus.REJECTED]: "Rejeitado",
  };

  const getEvalSuffix = (code: EvaluationCode) => {
    if (
      code === EvaluationCode.HIGHER_BETTER_PCT ||
      code === EvaluationCode.HIGHER_BETTER_SUM
    )
      return "(↑ melhor)";
    if (
      code === EvaluationCode.LOWER_BETTER_PCT ||
      code === EvaluationCode.LOWER_BETTER_SUM
    )
      return "(↓ melhor)";
    return "(Binário)";
  };

  const getKpiLabel = (k: Kpi) => {
    const evalType = evaluationTypes.find((et) => et.id === k.evaluationTypeId);
    if (!evalType) return k.name;
    return `${k.name} ${getEvalSuffix(evalType.code)}`;
  };

  // ======================================================
  // LOAD TEAM KPIS (backend filters + paginação)
  // ======================================================
  async function loadTeamKpis() {
    setLoadingTable(true);

    const result = await listTeamKpis({
      page,
      limit,
      teamId: filterTeamId || undefined,
      kpiId: filterKpiId || undefined,
      status: filterStatus || undefined,
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
      showExpired: false,
    });

    setTeamKpis(result?.data || []);
    setTotal(result?.total || 0);

    setLoadingTable(false);
  }

  // ======================================================
  // STATIC DATA (teams, kpis, evaluationTypes) - RODA UMA VEZ
  // ======================================================
  useEffect(() => {
    async function loadStatic() {
      const [teamsRes, kpisRes, evalTypesRes] = await Promise.all([
        listDistinctTeams(),
        listDistinctKpis(),
        listDistinctEvaluationTypes(),
      ]);

      setTeams(teamsRes || []);
      setKpis(kpisRes || []);
      setEvaluationTypes(evalTypesRes || []);
    }
    loadStatic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPIs filtradas/paginadas
  useEffect(() => {
    loadTeamKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    filterTeamId,
    filterKpiId,
    filterStatus,
    filterPeriodStart,
    filterPeriodEnd,
  ]);

  // ======================================================
  // CREATE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [teamId, setTeamId] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [evaluationTypeId, setEvaluationTypeId] = useState("");
  const [periodStart, setPeriodStart] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [deltaMonths, setDeltaMonths] = useState(3);
  const [goal, setGoal] = useState<string>("");
  const [status, setStatus] = useState<KpiStatus>(KpiStatus.DRAFT);
  const [submittedBy] = useState(localStorage.getItem("userId") || "");

  // Atualiza evaluationTypeId automaticamente com base na KPI selecionada
  useEffect(() => {
    const selectedKpiObj = kpis.find((k) => k.id === kpiId);
    if (selectedKpiObj) setEvaluationTypeId(selectedKpiObj.evaluationTypeId);
  }, [kpiId, kpis]);

  const handleCreate = async () => {
    setMessage("");

    const startDate = new Date(periodStart);
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + Number(deltaMonths || 0));
    const periodEnd = end.toISOString().slice(0, 10);

    await createTeamKpi({
      companyId: localStorage.getItem("companyId")!,
      teamId,
      kpiId,
      evaluationTypeId,
      periodStart,
      periodEnd,
      goal,
      status,
      submittedBy,
      submittedDate: new Date().toISOString(),
    });

    setCreateModalOpen(false);
    setPage(1);
    loadTeamKpis();

    setMessage("KPI designada ao time com sucesso!");
    setTeamId("");
    setKpiId("");
    setEvaluationTypeId("");
    setPeriodStart(new Date().toISOString().slice(0, 10));
    setDeltaMonths(3);
    setGoal("");
    setStatus(KpiStatus.DRAFT);
  };

  // ======================================================
  // EDIT MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<TeamKpi | null>(null);
  const [editGoal, setEditGoal] = useState<string>("");
  const [editStatus, setEditStatus] = useState<KpiStatus>(KpiStatus.DRAFT);

  const openEditModal = (kpi: TeamKpi) => {
    setSelectedKpi(kpi);
    setEditGoal(kpi.goal);
    setEditStatus(kpi.status);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedKpi) return;

    await updateTeamKpi(selectedKpi.id, {
      goal: editGoal,
      status: editStatus,
    });

    setEditModalOpen(false);
    loadTeamKpis();
  };

  const handleDelete = async () => {
    if (!selectedKpi) return;

    await deleteTeamKpi(selectedKpi.id);
    setEditModalOpen(false);
    loadTeamKpis();
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* TITLE */}
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          sx={{ mb: 4 }}
        >
          KPIs de Times
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
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Filtros
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="small" sx={{ flex: "1 1 220px" }}>
              <InputLabel>Time</InputLabel>
              <Select
                label="Time"
                value={filterTeamId}
                onChange={(e) => {
                  setFilterTeamId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 220px" }}>
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
                {kpis.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {getKpiLabel(k)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 180px" }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as KpiStatus | "");
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filtros de Período */}
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
                setFilterTeamId("");
                setFilterKpiId("");
                setFilterStatus("");
                setFilterPeriodStart("");
                setFilterPeriodEnd("");
                setPage(1);
              }}
            >
              Limpar
            </Button>

            <Button
              size="large"
              onClick={() => setCreateModalOpen(true)}
              sx={{
                px: 4,
                ml: "auto",
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              Designar KPI
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  KPI
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Meta
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Período
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : teamKpis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Nenhuma KPI de time encontrada.
                  </td>
                </tr>
              ) : (
                teamKpis.map((tk) => {
                  const teamName =
                    tk.team?.name ||
                    teams.find((t) => t.id === tk.teamId)?.name ||
                    tk.teamId;

                  const kpiName =
                    tk.kpi?.name ||
                    kpis.find((k) => k.id === tk.kpiId)?.name ||
                    tk.kpiId;

                  return (
                    <tr
                      key={tk.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(tk)}
                    >
                      <td className="px-4 py-3">{teamName}</td>
                      <td className="px-4 py-3 text-slate-700">{kpiName}</td>
                      <td className="px-4 py-3 text-slate-700">{tk.goal}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {statusLabelMap[tk.status] || tk.status}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(tk.periodStart).toLocaleDateString()} -{" "}
                        {new Date(tk.periodEnd).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
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
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
              >
                Anterior
              </Button>

              <Button
                variant="outlined"
                size="small"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
              >
                Próxima
              </Button>
            </Box>
          </Box>
        </Paper>
      </main>

      {/* CREATE MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Designar KPI a Time"
        description="Preencha os dados para atribuir a KPI ao time."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: PRIMARY_COLOR,
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!teamId || !kpiId || !periodStart || !goal}
              sx={primaryButtonSx}
            >
              Designar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <FormControl size="small" fullWidth>
            <InputLabel>Time</InputLabel>
            <Select
              label="Time"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>KPI</InputLabel>
            <Select
              label="KPI"
              value={kpiId}
              onChange={(e) => setKpiId(e.target.value)}
            >
              {kpis.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                  {getKpiLabel(k)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" gap={2}>
            <TextField
              size="small"
              label="Início do Período"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              sx={{ flex: 1 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Duração (meses)"
              type="number"
              inputProps={{ min: 1, max: 12 }}
              value={deltaMonths}
              onChange={(e) => setDeltaMonths(Number(e.target.value))}
              sx={{ width: 140 }}
            />
          </Box>

          <TextField
            size="small"
            label="Meta (goal)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as KpiStatus)}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </BaseModal>

      {/* EDIT MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar KPI do Time"
        description="Atualize a meta ou status desta KPI."
        footer={
          <div className="flex justify-between w-full">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDelete}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Excluir
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            size="small"
            label="Meta"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as KpiStatus)}
            >
              {statusOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </BaseModal>
    </div>
  );
}
