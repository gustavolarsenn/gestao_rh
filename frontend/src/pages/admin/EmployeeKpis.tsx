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
  useEmployeeKpis,
  EmployeeKpi,
  KpiStatus,
} from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployees, Employee } from "@/hooks/employee/useEmployees";
import { useKpis, Kpi } from "@/hooks/kpi/useKpis";
import {
  useEvaluationTypes,
  EvaluationType,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";

export default function EmployeeKpis() {
  const {
    listEmployeeKpis,
    createEmployeeKpi,
    updateEmployeeKpi,
    deleteEmployeeKpi,
    loading,
    error,
  } = useEmployeeKpis();
  const { listEmployees } = useEmployees();
  const { listKpis } = useKpis();
  const { listEvaluationTypes } = useEvaluationTypes();

  const [employeeKpis, setEmployeeKpis] = useState<EmployeeKpi[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  const [filterEmployeeId, setFilterEmployeeId] = useState("");
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
  // LOAD EMPLOYEE KPIS (backend filters + paginação)
  // ======================================================
  async function loadEmployeeKpis() {
    setLoadingTable(true);

    const result = await listEmployeeKpis({
      page,
      limit,
      employeeId: filterEmployeeId || undefined,
      kpiId: filterKpiId || undefined,
      status: filterStatus || undefined,
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
    });

    setEmployeeKpis(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  // ======================================================
  // STATIC DATA (employees, kpis, evaluationTypes) - RODA UMA VEZ
  // ======================================================
  useEffect(() => {
    async function loadStatic() {
      const [empResult, kpiResult, evalResult] = await Promise.all([
        listEmployees({ page: 1, limit: 999 }),
        listKpis({ page: 1, limit: 999 }),
        listEvaluationTypes({ page: 1, limit: 999 }),
      ]);

      setEmployees(empResult.data || []);
      setKpis(kpiResult.data || []);
      setEvaluationTypes(evalResult.data || []);
    }
    loadStatic();
    // <- sem deps para não entrar em loop se os hooks não forem memoizados
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // KPIs filtradas/paginadas
  useEffect(() => {
    loadEmployeeKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    filterEmployeeId,
    filterKpiId,
    filterStatus,
    filterPeriodStart,
    filterPeriodEnd,
  ]);

  // ======================================================
  // CREATE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
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

    const employee = employees.find((emp) => emp.id === employeeId);

    await createEmployeeKpi({
      companyId: localStorage.getItem("companyId")!,
      employeeId,
      teamId: employee?.teamId || "",
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
    loadEmployeeKpis();

    setMessage("KPI designada com sucesso!");
    setEmployeeId("");
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
  const [selectedKpi, setSelectedKpi] = useState<EmployeeKpi | null>(null);
  const [editGoal, setEditGoal] = useState<string>("");
  const [editStatus, setEditStatus] = useState<KpiStatus>(KpiStatus.DRAFT);

  const openEditModal = (kpi: EmployeeKpi) => {
    setSelectedKpi(kpi);
    setEditGoal(kpi.goal);
    setEditStatus(kpi.status);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedKpi) return;

    await updateEmployeeKpi(selectedKpi.id, {
      goal: editGoal,
      status: editStatus,
    });

    setEditModalOpen(false);
    loadEmployeeKpis();
  };

  const handleDelete = async () => {
    if (!selectedKpi) return;

    await deleteEmployeeKpi(selectedKpi.id);
    setEditModalOpen(false);
    loadEmployeeKpis();
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
          KPIs de Colaboradores
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
            <FormControl size="small" sx={{ flex: "1 1 220px" }}>
              <InputLabel>Colaborador</InputLabel>
              <Select
                label="Colaborador"
                value={filterEmployeeId}
                onChange={(e) => {
                  setFilterEmployeeId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.person?.name || emp.id}
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
                borderColor: "#1e293b",
                color: "#1e293b",
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => {
                setFilterEmployeeId("");
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
                backgroundColor: "#1e293b",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Designar KPI
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Colaborador
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
              ) : employeeKpis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Nenhuma KPI atribuída encontrada.
                  </td>
                </tr>
              ) : (
                employeeKpis.map((ek) => {
                  const employeeName =
                    ek.employee?.person?.name ||
                    employees.find((e) => e.id === ek.employeeId)?.person?.name ||
                    ek.employeeId;

                  const kpiName =
                    ek.kpi?.name ||
                    kpis.find((k) => k.id === ek.kpiId)?.name ||
                    ek.kpiId;

                  return (
                    <tr
                      key={ek.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(ek)}
                    >
                      <td className="px-4 py-3">{employeeName}</td>
                      <td className="px-4 py-3 text-slate-700">{kpiName}</td>
                      <td className="px-4 py-3 text-slate-700">{ek.goal}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {statusLabelMap[ek.status] || ek.status}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(ek.periodStart).toLocaleDateString()}{" "}
                        - {new Date(ek.periodEnd).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
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
        </Paper>
      </main>

      {/* CREATE MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Designar KPI a Colaborador"
        description="Preencha os dados para atribuir a KPI ao colaborador."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!employeeId || !kpiId || !periodStart || !goal}
              sx={{ backgroundColor: "#1e293b", color: "white" }}
            >
              Designar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <FormControl size="small" fullWidth>
            <InputLabel>Colaborador</InputLabel>
            <Select
              label="Colaborador"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.person?.name || emp.id}
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
        title="Editar KPI Designada"
        description="Atualize a meta ou status da KPI."
        footer={
          <div className="flex justify-between w-full">
            <Button color="error" variant="outlined" onClick={handleDelete}>
              Excluir
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              sx={{ backgroundColor: "#1e293b", color: "white" }}
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
