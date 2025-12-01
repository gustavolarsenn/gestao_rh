import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";

import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function RoleTypePage() {
  const { listRoleTypes, createRoleType, updateRoleType, deleteRoleType } =
    useRoleTypes();

  useEffect(() => {
    document.title = "Tipos de Cargo";
  }, []);

  const { listDistinctDepartments } = useDepartments();

  // ===================== DATA ======================
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  // filters
  const [filterName, setFilterName] = useState("");
  const [filterDept, setFilterDept] = useState("");

  const [loadingTable, setLoadingTable] = useState(false);

  // Load distinct departments
  useEffect(() => {
    async function loadDeps() {
      const res = await listDistinctDepartments();
      setDepartments(res || []);
    }
    loadDeps();
  }, []);

  // ================== LOAD ROLE TYPES ==================
  async function loadRoleTypes() {
    setLoadingTable(true);

    const result = await listRoleTypes({
      page,
      limit,
      name: filterName || undefined,
      departmentId: filterDept || undefined,
    });

    setRoleTypes(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    loadRoleTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterDept]);

  // ================================================================
  // CREATE MODAL
  // ================================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const handleCreate = async () => {
    await createRoleType({
      name,
      departmentId,
      companyId: localStorage.getItem("companyId")!,
    });

    setCreateModalOpen(false);
    setName("");
    setDepartmentId("");
    setPage(1);
    loadRoleTypes();
  };

  // ================================================================
  // EDIT MODAL
  // ================================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoleType, setSelectedRoleType] = useState<RoleType | null>(
    null
  );

  const openEditModal = (rt: RoleType) => {
    setSelectedRoleType(rt);
    setName(rt.name);
    setDepartmentId(rt.departmentId);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRoleType) return;

    await updateRoleType(selectedRoleType.id, {
      name,
      departmentId,
    });

    setEditModalOpen(false);
    loadRoleTypes();
  };

  const handleDelete = async () => {
    if (!selectedRoleType) return;

    await deleteRoleType(selectedRoleType.id);
    setEditModalOpen(false);
    loadRoleTypes();
  };

  // ================================================================
  // UI
  // ================================================================
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
          Tipos de Função
        </Typography>

        {/* FILTER PANEL */}
        <Paper
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
                value={filterDept}
                onChange={(e) => {
                  setFilterDept(e.target.value);
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
                setFilterDept("");
                setPage(1);
              }}
            >
              Limpar
            </Button>

            <Button
              size="large"
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
              onClick={() => setCreateModalOpen(true)}
            >
              Criar Função
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
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : (
                roleTypes.map((rt) => {
                  const deptName =
                    rt.department?.name ||
                    departments.find((d) => d.id === rt.departmentId)?.name ||
                    "—";

                  return (
                    <tr
                      key={rt.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(rt)}
                    >
                      <td className="px-4 py-3">{rt.name}</td>
                      <td className="px-4 py-3">{deptName}</td>
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
              Página {page} de {pageCount || 1}
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

        {/* ===================== CREATE MODAL ===================== */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Criar Função"
          description="Preencha os dados."
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outlined"
                onClick={() => setCreateModalOpen(false)}
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
              >
                Cancelar
              </Button>
              <Button
                sx={primaryButtonSx}
                onClick={handleCreate}
                disabled={!name || !departmentId}
              >
                Criar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome"
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
          </div>
        </BaseModal>

        {/* ===================== EDIT MODAL ===================== */}
        <BaseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Função"
          description="Atualize ou remova o registro."
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                Excluir
              </Button>

              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
                onClick={handleSave}
                disabled={!name || !departmentId}
              >
                Salvar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome"
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
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
