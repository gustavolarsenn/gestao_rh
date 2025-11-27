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
  useEvaluationTypes,
  EvaluationType,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function EvaluationTypesPage() {
  const {
    listEvaluationTypes,
    createEvaluationType,
    updateEvaluationType,
    deleteEvaluationType,
    loading,
    error,
  } = useEvaluationTypes();
  const { listDepartments } = useDepartments();

  // ======================================================
  // DATA
  // ======================================================
  const [types, setTypes] = useState<EvaluationType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
  const [filterCode, setFilterCode] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  async function loadEvaluationTypes() {
    setLoadingTable(true);

    const result = await listEvaluationTypes({
      page,
      limit,
      name: filterName || undefined,
      departmentId: filterDepartmentId || undefined,
      code: filterCode || undefined,
    });

    setTypes(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    async function loadStatic() {
      const deptResult = await listDepartments({ page: 1, limit: 999 });
      setDepartments(deptResult.data || []);
    }
    loadStatic();
  }, [listDepartments]);

  useEffect(() => {
    loadEvaluationTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterDepartmentId, filterCode]);

  // ======================================================
  // CREATE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [code, setCode] = useState<EvaluationCode>(
    EvaluationCode.HIGHER_BETTER_SUM
  );
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    setMessage("");

    await createEvaluationType({
      name,
      code,
      description,
      departmentId,
      companyId: localStorage.getItem("companyId")!,
    });

    setCreateModalOpen(false);
    setPage(1);
    loadEvaluationTypes();

    setMessage("Tipo de métrica criado com sucesso!");
    setName("");
    setDepartmentId("");
    setCode(EvaluationCode.HIGHER_BETTER_SUM);
    setDescription("");
  };

  // ======================================================
  // EDIT MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EvaluationType | null>(null);
  const [editName, setEditName] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editCode, setEditCode] = useState<EvaluationCode>(
    EvaluationCode.HIGHER_BETTER_SUM
  );
  const [editDescription, setEditDescription] = useState("");

  const openEditModal = (type: EvaluationType) => {
    setSelectedType(type);
    setEditName(type.name);
    setEditDepartmentId(type.departmentId || "");
    setEditCode(type.code);
    setEditDescription(type.description || "");
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedType) return;

    await updateEvaluationType(selectedType.id, {
      name: editName,
      code: editCode,
      description: editDescription,
      departmentId: editDepartmentId,
    });

    setEditModalOpen(false);
    loadEvaluationTypes();
  };

  const handleDelete = async () => {
    if (!selectedType) return;

    await deleteEvaluationType(selectedType.id);
    setEditModalOpen(false);
    loadEvaluationTypes();
  };

  // helper para exibir o tipo em texto
  const getCodeLabel = (c: EvaluationCode) => {
    if (
      c === EvaluationCode.HIGHER_BETTER_SUM ||
      c === EvaluationCode.HIGHER_BETTER_PCT
    ) {
      return "Quanto maior, melhor";
    }
    if (
      c === EvaluationCode.LOWER_BETTER_SUM ||
      c === EvaluationCode.LOWER_BETTER_PCT
    ) {
      return "Quanto menor, melhor";
    }
    return "Binário";
  };

  // lista de códigos para usar em filtros/selects
  const codeOptions: { value: EvaluationCode; label: string }[] = [
    {
      value: EvaluationCode.HIGHER_BETTER_SUM,
      label: "Quanto maior, melhor (soma)",
    },
    {
      value: EvaluationCode.LOWER_BETTER_SUM,
      label: "Quanto menor, melhor (soma)",
    },
    {
      value: EvaluationCode.HIGHER_BETTER_PCT,
      label: "Quanto maior, melhor (percentual)",
    },
    {
      value: EvaluationCode.LOWER_BETTER_PCT,
      label: "Quanto menor, melhor (percentual)",
    },
    { value: EvaluationCode.BINARY, label: "Binário (Sim/Não)" },
  ];

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* TITLE */}
        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Tipos de Métrica
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
                value={filterCode}
                onChange={(e) => {
                  setFilterCode(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {codeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
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
                setFilterCode("");
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
              Criar Tipo de Métrica
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
                  Tipo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Descrição
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
              ) : types.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Nenhum tipo de métrica encontrado.
                  </td>
                </tr>
              ) : (
                types.map((type) => (
                  <tr
                    key={type.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(type)}
                  >
                    <td className="px-4 py-3">{type.name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {type.department?.name ||
                        departments.find((d) => d.id === type.departmentId)
                          ?.name ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {getCodeLabel(type.code)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {type.description || "—"}
                    </td>
                  </tr>
                ))
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
        title="Criar Tipo de Métrica"
        description="Preencha os dados do tipo de métrica."
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
              disabled={!name || !departmentId || !code}
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
            label="Nome (ex: Produtividade)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Departamento</InputLabel>
            <Select
              label="Departamento"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
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
              value={code}
              onChange={(e) => setCode(e.target.value as EvaluationCode)}
            >
              {codeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
        title="Editar Tipo de Métrica"
        description="Atualize as informações ou exclua o registro."
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
            label="Nome do Tipo"
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
              value={editCode}
              onChange={(e) => setEditCode(e.target.value as EvaluationCode)}
            >
              {codeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
