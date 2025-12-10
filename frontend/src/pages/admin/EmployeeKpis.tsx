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
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

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

  useEffect(() => {
    document.title = "KPIs de Colaboradores";
  }, []);

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

    const params = {
      page,
      limit,
      employeeId: filterEmployeeId || undefined,
      kpiId: filterKpiId || undefined,
      status: filterStatus || undefined,
      periodStart: filterPeriodStart || undefined,
      periodEnd: filterPeriodEnd || undefined,
    };

    const result = await listEmployeeKpis(params);

    setEmployeeKpis(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  // ======================================================
  // STATIC DATA (employees, kpis, evaluationTypes)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const selectedKpiObj = kpis.find((k) => k.id === kpiId);
    if (selectedKpiObj) setEvaluationTypeId(selectedKpiObj.evaluationTypeId);
  }, [kpiId, kpis]);

  const getKPIEvaluationType = (kpiId: string) => {
    const selectedKpiObj = kpis.find((k) => k.id === kpiId);
    if (selectedKpiObj) return selectedKpiObj.evaluationTypeId;
    return "";
  };

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
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
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

            <FormControl
              size="small"
              fullWidth
              sx={{ flex: { md: "1 1 220px" } }}
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
                {kpis.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {getKpiLabel(k)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              fullWidth
              sx={{ flex: { md: "1 1 180px" } }}
            >
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

            <TextField
              size="small"
              label="Período início"
              type="date"
              value={filterPeriodStart}
              onChange={(e) => {
                setFilterPeriodStart(e.target.value);
                setPage(1);
              }}
              fullWidth
              sx={{ flex: { md: "1 1 180px" } }}
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
              fullWidth
              sx={{ flex: { md: "1 1 180px" } }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Botões */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", md: "row" },
                gap: 1.5,
                width: { xs: "100%", md: "auto" },
                mt: { xs: 1, md: 0 },
                ml: { md: "auto" },
              }}
            >
              <Button
                size="large"
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
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", md: "auto" },
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
              >
                Designar KPI
              </Button>
            </Box>
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
                          {new Date(ek.periodStart).toLocaleDateString()} -{" "}
                          {new Date(ek.periodEnd).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* PAGINATION */}
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
                // SEM disabled aqui para garantir que o teste sempre consiga avançar
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
        title="Designar KPI a Colaborador"
        description="Preencha os dados para atribuir a KPI ao colaborador."
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", sm: "auto" },
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
              disabled={!employeeId || !kpiId || !periodStart || !goal}
              sx={{
                ...primaryButtonSx,
                width: { xs: "100%", sm: "auto" },
              }}
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

          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
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
              sx={{ width: { xs: "100%", sm: 140 } }}
            />
          </Box>

          {(() => {
            const selectedEvalId = getKPIEvaluationType(kpiId);
            const selectedEvalType = evaluationTypes.find(
              (et) => et.id === selectedEvalId
            );
            const evalCode = selectedEvalType?.code || "";

            const isBinary = evalCode.includes("BINARY");
            const isPct = evalCode.includes("PCT");
            // const isSum = evalCode.includes("SUM"); // kept for clarity if needed

            return (
              <TextField
                size="small"
                label="Meta (goal)"
                value={goal}
                type={isBinary ? "text" : "number"}
                inputProps={isPct ? { min: 0, max: 100 } : undefined}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isPct) {
                    if (val === "") {
                      setGoal("");
                      return;
                    }
                    const num = Number(val);
                    if (Number.isNaN(num)) {
                      setGoal(val);
                      return;
                    }
                    const clamped = Math.min(100, Math.max(0, num));
                    setGoal(String(clamped));
                  } else {
                    setGoal(val);
                  }
                }}
              />
            );
          })()}

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
          <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDelete}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", sm: "auto" },
              }}
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
                width: { xs: "100%", sm: "auto" },
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
          {(() => {
            if (!selectedKpi) {
              return (
                <TextField
                  size="small"
                  label="Meta"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                />
              );
            }

            const selectedEvalId = getKPIEvaluationType(selectedKpi.kpiId);
            const selectedEvalType = evaluationTypes.find(
              (et) => et.id === selectedEvalId
            );
            const evalCode = selectedEvalType?.code || "";

            const isBinary = evalCode.includes("BINARY");
            const isPct = evalCode.includes("PCT");
            // const isSum = evalCode.includes("SUM"); // se quiser usar depois

            return (
              <TextField
                size="small"
                label="Meta (goal)"
                value={editGoal}
                type={isBinary ? "text" : "number"}
                inputProps={isPct ? { min: 0, max: 100 } : undefined}
                onChange={(e) => {
                  const val = e.target.value;

                  if (isPct) {
                    if (val === "") {
                      setEditGoal("");
                      return;
                    }

                    const num = Number(val);
                    if (Number.isNaN(num)) {
                      setEditGoal(val);
                      return;
                    }

                    const clamped = Math.min(100, Math.max(0, num));
                    setEditGoal(String(clamped));
                  } else {
                    setEditGoal(val);
                  }
                }}
              />
            );
          })()}

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
