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

import { useKpis, Kpi } from "@/hooks/kpi/useKpis";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
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

export default function Kpis() {
  const { listKpis, createKpi, updateKpi, deleteKpi, loading, error } =
    useKpis();
  const { listDistinctDepartments } = useDepartments();
  const { listDistinctEvaluationTypes } = useEvaluationTypes();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([]);
  const [message, setMessage] = useState("");

  // ======================================================
  // PAGINATION + FILTERS (backend)
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  const [filterName, setFilterName] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterEvaluationTypeId, setFilterEvaluationTypeId] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  async function loadKpis() {
    setLoadingTable(true);

    const result = await listKpis({
      page,
      limit,
      name: filterName || undefined,
      departmentId: filterDepartmentId || undefined,
      evaluationTypeId: filterEvaluationTypeId || undefined,
    });

    setKpis(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    async function loadStatic() {
      const [deps, evalTypes] = await Promise.all([
        listDistinctDepartments(),
        listDistinctEvaluationTypes(),
      ]);

      setDepartments(deps || []);
      setEvaluationTypes(evalTypes || []);
    }

    loadStatic();
  }, [listDistinctDepartments, listDistinctEvaluationTypes]);

  useEffect(() => {
    loadKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterDepartmentId, filterEvaluationTypeId]);

  // helper para sufixo no select de tipo de avaliação
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

  // ======================================================
  // CREATE KPI MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createDepartmentId, setCreateDepartmentId] = useState("");
  const [createEvaluationTypeId, setCreateEvaluationTypeId] = useState("");
  const [unit, setUnit] = useState("");

  const handleCreate = async () => {
    setMessage("");

    await createKpi({
      name,
      description,
      departmentId: createDepartmentId,
      evaluationTypeId: createEvaluationTypeId,
      unit,
      companyId: localStorage.getItem("companyId")!,
    });

    setCreateModalOpen(false);
    setPage(1);
    loadKpis();

    setMessage("KPI criada com sucesso!");
    setName("");
    setDescription("");
    setCreateDepartmentId("");
    setCreateEvaluationTypeId("");
    setUnit("");
  };

  // ======================================================
  // EDIT KPI MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editEvaluationTypeId, setEditEvaluationTypeId] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const openEditModal = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setEditName(kpi.name);
    setEditDescription(kpi.description || "");
    setEditDepartmentId(kpi.departmentId);
    setEditEvaluationTypeId(kpi.evaluationTypeId);
    setEditUnit(kpi.unit);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedKpi) return;

    await updateKpi(selectedKpi.id, {
      name: editName,
      description: editDescription,
      departmentId: editDepartmentId,
      evaluationTypeId: editEvaluationTypeId,
      unit: editUnit,
    });

    setEditModalOpen(false);
    loadKpis();
  };

  const handleDelete = async () => {
    if (!selectedKpi) return;

    await deleteKpi(selectedKpi.id);
    setEditModalOpen(false);
    loadKpis();
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
          KPIs
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
            <TextField
              size="small"
              label="Nome"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 200px" }}
            />

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                label="Departamento"
                value={filterDepartmentId}
                onChange={(e) => {
                  setFilterDepartmentId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 220px" }}>
              <InputLabel>Tipo de Avaliação</InputLabel>
              <Select
                label="Tipo de Avaliação"
                value={filterEvaluationTypeId}
                onChange={(e) => {
                  setFilterEvaluationTypeId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {evaluationTypes.map((et) => (
                  <MenuItem key={et.id} value={et.id}>
                    {et.name} {getEvalSuffix(et.code)}
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
                setFilterName("");
                setFilterDepartmentId("");
                setFilterEvaluationTypeId("");
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
              Criar KPI
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
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Departamento
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Tipo de Avaliação
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Unidade
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : kpis.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Nenhuma KPI encontrada.
                  </td>
                </tr>
              ) : (
                kpis.map((kpi) => {
                  const deptName =
                    kpi.department?.name ||
                    departments.find((d) => d.id === kpi.departmentId)?.name ||
                    "—";

                  const evalType =
                    kpi.evaluationType ||
                    evaluationTypes.find(
                      (et) => et.id === kpi.evaluationTypeId
                    );

                  return (
                    <tr
                      key={kpi.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(kpi)}
                    >
                      <td className="px-4 py-3">{kpi.name}</td>
                      <td className="px-4 py-3 text-slate-700">{deptName}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {evalType
                          ? `${evalType.name} ${getEvalSuffix(evalType.code)}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{kpi.unit}</td>
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
                // não desabilita para a "Próxima" para garantir que o clique
                // sempre dispare setPage e o teste veja page: 2
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
        title="Criar KPI"
        description="Preencha os dados da métrica."
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
              disabled={
                !name || !createDepartmentId || !createEvaluationTypeId || !unit
              }
              sx={primaryButtonSx}
            >
              Criar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            size="small"
            label="Nome da métrica (ex: Taxa de conversão)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Departamento</InputLabel>
            <Select
              label="Departamento"
              value={createDepartmentId}
              onChange={(e) => setCreateDepartmentId(e.target.value)}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de Avaliação</InputLabel>
            <Select
              label="Tipo de Avaliação"
              value={createEvaluationTypeId}
              onChange={(e) => setCreateEvaluationTypeId(e.target.value)}
            >
              {evaluationTypes.map((et) => (
                <MenuItem key={et.id} value={et.id}>
                  {et.name} {getEvalSuffix(et.code)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Unidade de medida (ex: R$, %, horas, features)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />

          <TextField
            size="small"
            label="Descrição"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </BaseModal>

      {/* EDIT MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar KPI"
        description="Atualize as informações da métrica ou exclua o registro."
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
            label="Nome da métrica"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Departamento</InputLabel>
            <Select
              label="Departamento"
              value={editDepartmentId}
              onChange={(e) => setEditDepartmentId(e.target.value)}
            >
              <MenuItem value="">Selecione</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de Avaliação</InputLabel>
            <Select
              label="Tipo de Avaliação"
              value={editEvaluationTypeId}
              onChange={(e) => setEditEvaluationTypeId(e.target.value)}
            >
              <MenuItem value="">Selecione</MenuItem>
              {evaluationTypes.map((et) => (
                <MenuItem key={et.id} value={et.id}>
                  {et.name} {getEvalSuffix(et.code)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Unidade de medida"
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
          />

          <TextField
            size="small"
            label="Descrição"
            multiline
            minRows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </div>
      </BaseModal>
    </div>
  );
}
