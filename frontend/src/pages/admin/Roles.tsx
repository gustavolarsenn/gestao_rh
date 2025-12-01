// src/pages/admin/Roles.tsx
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

import { useRoles, Role } from "@/hooks/role/useRoles";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function RolesPage() {
  const { listRoles, createRole, updateRole, deleteRole } = useRoles();
  const { listDistinctDepartments } = useDepartments();
  const { listDistinctRoleTypes } = useRoleTypes();

  useEffect(() => {
    document.title = "Cargos";
  }, []);

  // ======================================================
  // STATES
  // ======================================================
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  // filters
  const [filterName, setFilterName] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterType, setFilterType] = useState("");

  const [loadingTable, setLoadingTable] = useState(false);

  // ======================================================
  // LOAD STATIC DATA (distinct departments & role types)
  // ======================================================
  useEffect(() => {
    async function loadStatic() {
      const deps = await listDistinctDepartments();
      const rtypes = await listDistinctRoleTypes();

      setDepartments(deps || []);
      setRoleTypes(rtypes || []);
    }
    loadStatic();
  }, []);

  // ======================================================
  // LOAD ROLES (pagination backend)
  // ======================================================
  async function loadRoles() {
    setLoadingTable(true);

    const result = await listRoles({
      page,
      limit,
      name: filterName || undefined,
      departmentId: filterDept || undefined,
      roleTypeId: filterType || undefined,
    });

    setRoles(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterDept, filterType]);

  // ======================================================
  // CREATE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleTypeId, setRoleTypeId] = useState("");
  const [defaultWage, setDefaultWage] = useState("");

  const handleCreate = async () => {
    await createRole({
      name,
      departmentId,
      roleTypeId,
      defaultWage: Number(defaultWage),
    });

    setCreateModalOpen(false);
    setName("");
    setDepartmentId("");
    setRoleTypeId("");
    setDefaultWage("");
    setPage(1);
    loadRoles();
  };

  // ======================================================
  // EDIT MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setName(role.name);
    setDepartmentId(role.departmentId);
    setRoleTypeId(role.roleTypeId);
    setDefaultWage(String(role.defaultWage));
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    await updateRole(selectedRole.id, {
      name,
      departmentId,
      roleTypeId,
      defaultWage: Number(defaultWage),
    });

    setEditModalOpen(false);
    loadRoles();
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    await deleteRole(selectedRole.id);
    setEditModalOpen(false);
    loadRoles();
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
          Cargos
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

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Tipo de Função</InputLabel>
              <Select
                label="Tipo de Função"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roleTypes.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
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
                setFilterType("");
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
              Criar Cargo
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
                  Salário
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
              ) : (
                roles.map((r) => {
                  const deptName =
                    departments.find((d) => d.id === r.departmentId)?.name ||
                    "—";

                  const typeName =
                    roleTypes.find((t) => t.id === r.roleTypeId)?.name || "—";

                  return (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(r)}
                    >
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3">{deptName}</td>
                      <td className="px-4 py-3">{typeName}</td>
                      <td className="px-4 py-3">
                        R$ {Number(r.defaultWage).toFixed(2).replace(".", ",")}
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
              Página {page} de {pageCount || 1}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
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
                onClick={() => setPage(page + 1)}
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
          title="Criar Cargo"
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
                disabled={!name || !departmentId || !roleTypeId}
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

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={roleTypeId}
                onChange={(e) => setRoleTypeId(e.target.value)}
              >
                {roleTypes
                  .filter((rt) => rt.departmentId === departmentId)
                  .map((rt) => (
                    <MenuItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Salário Padrão"
              type="number"
              value={defaultWage}
              onChange={(e) => setDefaultWage(e.target.value)}
            />
          </div>
        </BaseModal>

        {/* ===================== EDIT MODAL ===================== */}
        <BaseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Cargo"
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
                disabled={!name || !departmentId || !roleTypeId}
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

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={roleTypeId}
                onChange={(e) => setRoleTypeId(e.target.value)}
              >
                {roleTypes
                  .filter((rt) => rt.departmentId === departmentId)
                  .map((rt) => (
                    <MenuItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Salário Padrão"
              type="number"
              value={defaultWage}
              onChange={(e) => setDefaultWage(e.target.value)}
            />
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
