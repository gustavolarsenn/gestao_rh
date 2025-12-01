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
  useEmployees,
  Employee,
} from "@/hooks/employee/useEmployees";

import { 
  useEmployeeHistories, 
  EmployeeHistory 
} from "@/hooks/employee/useEmployeeHistories";
import { usePersons, Person } from "@/hooks/person/usePersons";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";
import { useRoles, Role } from "@/hooks/role/useRoles";
import { useTeams, Team } from "@/hooks/team/useTeams";
import { useBranches, Branch } from "@/hooks/branch/useBranches";
import { format } from "date-fns";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function EmployeesPage() {
  const {
    listEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    loading,
    error,
  } = useEmployees();
  const { listEmployeeHistories } = useEmployeeHistories();
  const { listPersons } = usePersons();
  const { listDistinctDepartments } = useDepartments();
  const { listDistinctRoleTypes } = useRoleTypes();
  const { listDistinctRoles } = useRoles();
  const { listDistinctTeams } = useTeams();
  const { listDistinctBranches } = useBranches();

  useEffect(() => {
    document.title = "Colaboradores";
  }, []);

  // ======================================================
  // DATA
  // ======================================================
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [message, setMessage] = useState("");

  // ======================================================
  // BACKEND PAGINATION & FILTERS
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const employeesPageCount = Math.ceil(total / limit) || 1;

  const [filterName, setFilterName] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterRoleId, setFilterRoleId] = useState("");
  const [filterBranchId, setFilterBranchId] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  async function loadEmployees() {
    setLoadingTable(true);

    const result = await listEmployees({
      page,
      limit,
      name: filterName || undefined,
      departmentId: filterDepartmentId || undefined,
      roleId: filterRoleId || undefined,
      branchId: filterBranchId || undefined,
    });

    setEmployees(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    async function loadStatic() {
      const [d, rt, r, t, b] = await Promise.all([
        listDistinctDepartments(),
        listDistinctRoleTypes(),
        listDistinctRoles(),
        listDistinctTeams(),
        listDistinctBranches(),
      ]);

      setDepartments(d || []);
      setRoleTypes(rt || []);
      setRoles(r || []);
      setTeams(t || []);
      setBranches(b || []);
    }

    loadStatic();
  }, []);

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterDepartmentId, filterRoleId, filterBranchId]);

  // ======================================================
  // PERSON SELECT MODAL
  // ======================================================
  const [selectPersonModalOpen, setSelectPersonModalOpen] = useState(false);
  const [personNameSearch, setPersonNameSearch] = useState("");
  const [personEmailSearch, setPersonEmailSearch] = useState("");
  const [personPage, setPersonPage] = useState(1);
  const [personTotal, setPersonTotal] = useState(0);
  const personLimit = 10;
  const [personsList, setPersonsList] = useState<Person[]>([]);
  const personPageCount = Math.ceil(personTotal / personLimit) || 1;

  async function loadPersonsModal() {
    const result = await listPersons({
      page: personPage,
      limit: personLimit,
      name: personNameSearch || undefined,
      email: personEmailSearch || undefined,
    });

    setPersonsList(result.data);
    setPersonTotal(result.total);
  }

  useEffect(() => {
    if (selectPersonModalOpen) {
      loadPersonsModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectPersonModalOpen, personNameSearch, personEmailSearch, personPage]);

  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState("");
  const [selectedPersonEmail, setSelectedPersonEmail] = useState("");

  const handleSelectPerson = (p: Person) => {
    setSelectedPersonId(p.id);
    setSelectedPersonName(p.name);
    setSelectedPersonEmail(p.email);
    setSelectPersonModalOpen(false);
  };

  // ======================================================
  // CREATE EMPLOYEE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [departmentId, setDepartmentId] = useState("");
  const [roleTypeId, setRoleTypeId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [hiringDate, setHiringDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [departureDate, setDepartureDate] = useState("");
  const [wage, setWage] = useState("");

  // Filtragem de tipos de cargo e cargos conforme departamento (criação)
  const filteredRoleTypesCreate: RoleType[] = departmentId
    ? roleTypes.filter((rt) => rt.departmentId === departmentId)
    : [];
  const filteredRolesCreate: Role[] = departmentId
    ? roles.filter((r) => r.departmentId === departmentId)
    : [];

  // Preencher salário ao selecionar cargo (criação)
  useEffect(() => {
    const selectedRole = roles.find((r) => r.id === roleId);
    if (selectedRole?.defaultWage != null) {
      setWage(String(selectedRole.defaultWage));
    }
  }, [roleId, roles]);

  const handleCreateEmployee = async () => {
    setMessage("");

    const payload = {
      personId: selectedPersonId,
      departmentId,
      roleTypeId,
      roleId,
      teamId: teamId || undefined,
      branchId,
      hiringDate,
      departureDate: departureDate || undefined,
      wage: wage ? String(wage) : undefined,
    };

    const newEmployee = await createEmployee(payload as any);

    setPage(1);
    loadEmployees();

    setMessage(
      `Colaborador "${newEmployee.person?.name || ""}" criado com sucesso!`
    );

    // reset
    setSelectedPersonId("");
    setSelectedPersonName("");
    setSelectedPersonEmail("");
    setDepartmentId("");
    setRoleTypeId("");
    setRoleId("");
    setTeamId("");
    setBranchId("");
    setHiringDate(new Date().toISOString().split("T")[0]);
    setDepartureDate("");
    setWage("");
    setCreateModalOpen(false);
  };

  // ======================================================
  // EDIT EMPLOYEE MODAL + HISTÓRICO
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [editData, setEditData] = useState<
    Partial<Employee & { departureDate?: string; wage?: any }>
  >({});

  // Histórico
  const [employeeHistories, setEmployeeHistories] = useState<EmployeeHistory[]>(
    []
  );
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyLimit = 5;
  const historyPageCount = Math.ceil(historyTotal / historyLimit) || 1;
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadEmployeeHistories(employeeId: string, page: number) {
    setHistoryLoading(true);
    const result = await listEmployeeHistories({
      employeeId,
      page,
      limit: historyLimit,
    });
    setEmployeeHistories(result.data);
    setHistoryTotal(result.total);
    setHistoryLoading(false);
  }

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditData({
      personId: employee.personId,
      departmentId: employee.departmentId,
      roleTypeId: employee.roleTypeId,
      roleId: employee.roleId,
      teamId: employee.teamId,
      branchId: employee.branchId,
      hiringDate: employee.hiringDate,
      departureDate: employee.departureDate || "",
      wage: employee.wage,
    });
    setHistoryPage(1);
    setEditModalOpen(true);
  };

  useEffect(() => {
    if (editModalOpen && selectedEmployee) {
      loadEmployeeHistories(selectedEmployee.id, historyPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModalOpen, selectedEmployee, historyPage]);

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;

    const updated = await updateEmployee(selectedEmployee.id, {
      ...editData,
      wage: String(editData.wage ?? ""),
      departureDate: editData.departureDate || undefined,
    });

    setEmployees((prev) =>
      prev.map((e) => (e.id === selectedEmployee.id ? updated : e))
    );
    setEditModalOpen(false);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    await deleteEmployee(selectedEmployee.id);
    setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
    setEditModalOpen(false);
    loadEmployees();
  };

  // Filtragem de tipos de cargo e cargos conforme departamento (edição)
  const editDepartmentId = (editData.departmentId as string) || "";
  const filteredRoleTypesEdit: RoleType[] = editDepartmentId
    ? roleTypes.filter((rt) => rt.departmentId === editDepartmentId)
    : roleTypes;
  const filteredRolesEdit: Role[] = editDepartmentId
    ? roles.filter((r) => r.departmentId === editDepartmentId)
    : roles;

  // Helper display
  const formatWage = (value: any) => {
    const num = Number(value || 0);
    return `R$ ${num.toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
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
          Colaboradores
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

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Cargo</InputLabel>
              <Select
                label="Cargo"
                value={filterRoleId}
                onChange={(e) => {
                  setFilterRoleId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Filial</InputLabel>
              <Select
                label="Filial"
                value={filterBranchId}
                onChange={(e) => {
                  setFilterBranchId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
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
                setFilterRoleId("");
                setFilterBranchId("");
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
              Cadastrar colaborador
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
                  Cargo
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Departamento
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Filial
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Salário
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(emp)}
                  >
                    <td className="px-4 py-3">{emp.person?.name}</td>
                    <td className="px-4 py-3">{emp.role?.name}</td>
                    <td className="px-4 py-3">{emp.department?.name}</td>
                    <td className="px-4 py-3">
                      {emp.branch?.name || "—"}
                    </td>
                    <td className="px-4 py-3">{formatWage(emp.wage)}</td>
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
              Página {page} de {employeesPageCount}
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
                disabled={page >= employeesPageCount}
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

      {/* CREATE EMPLOYEE MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Cadastrar Colaborador"
        description="Selecione uma pessoa e preencha os dados do vínculo."
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
              onClick={handleCreateEmployee}
              disabled={
                !selectedPersonId ||
                !departmentId ||
                !roleTypeId ||
                !roleId ||
                !branchId ||
                !hiringDate ||
                !wage
              }
              sx={primaryButtonSx}
            >
              Cadastrar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Pessoa */}
          <div>
            <label className="block text-sm font-medium mb-1">Pessoa</label>
            <Button
              variant="outlined"
              sx={{ width: "100%" }}
              onClick={() => setSelectPersonModalOpen(true)}
            >
              {selectedPersonName
                ? `${selectedPersonName} (${selectedPersonEmail})`
                : "Selecionar Pessoa"}
            </Button>
          </div>

          {/* Departamento */}
          <FormControl size="small" fullWidth>
            <InputLabel>Departamento</InputLabel>
            <Select
              label="Departamento"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setRoleTypeId("");
                setRoleId("");
              }}
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Tipo de Cargo */}
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo de Cargo</InputLabel>
            <Select
              label="Tipo de Cargo"
              value={roleTypeId}
              onChange={(e) => setRoleTypeId(e.target.value)}
            >
              {filteredRoleTypesCreate.map((rt) => (
                <MenuItem key={rt.id} value={rt.id}>
                  {rt.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cargo */}
          <FormControl size="small" fullWidth>
            <InputLabel>Cargo</InputLabel>
            <Select
              label="Cargo"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
            >
              {filteredRolesCreate.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Time */}
          <FormControl size="small" fullWidth>
            <InputLabel>Time</InputLabel>
            <Select
              label="Time"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {teams.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Filial */}
          <FormControl size="small" fullWidth>
            <InputLabel>Filial</InputLabel>
            <Select
              label="Filial"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Data de Admissão */}
          <TextField
            size="small"
            label="Data de Admissão"
            type="date"
            value={hiringDate}
            onChange={(e) => setHiringDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* Salário */}
          <TextField
            size="small"
            label="Salário (R$)"
            type="number"
            inputProps={{ step: "0.01" }}
            value={wage}
            onChange={(e) => setWage(e.target.value)}
          />
        </div>
      </BaseModal>

      {/* EDIT EMPLOYEE MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Colaborador"
        description="Atualize as informações do colaborador."
        maxWidth="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDeleteEmployee}
            >
              Excluir
            </Button>
            <Button
              onClick={handleSaveEmployee}
              disabled={loading}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6 md:flex-row md:min-w-[980px]">
          {/* ESQUERDA: FORM */}
          <div className="flex flex-col gap-4 flex-1 md:flex-[0_0_380px] max-w-md">
            <TextField
              size="small"
              label="Pessoa"
              value={selectedEmployee?.person?.name || ""}
              disabled
            />

            <TextField
              size="small"
              label="Data de Admissão"
              type="date"
              value={(editData.hiringDate as string) ?? ""}
              disabled
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              size="small"
              label="Salário (R$)"
              type="number"
              inputProps={{ step: "0.01" }}
              value={editData.wage ?? ""}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, wage: e.target.value }))
              }
            />

            <TextField
              size="small"
              label="Data de Demissão"
              type="date"
              value={(editData.departureDate as string) ?? ""}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  departureDate: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
            />

            {/* Departamento */}
            <FormControl size="small" fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                label="Departamento"
                value={editData.departmentId ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    departmentId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tipo de Cargo */}
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de Cargo</InputLabel>
              <Select
                label="Tipo de Cargo"
                value={editData.roleTypeId ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    roleTypeId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                {filteredRoleTypesEdit.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Cargo */}
            <FormControl size="small" fullWidth>
              <InputLabel>Cargo</InputLabel>
              <Select
                label="Cargo"
                value={editData.roleId ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, roleId: e.target.value }))
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                {filteredRolesEdit.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Time */}
            <FormControl size="small" fullWidth>
              <InputLabel>Time</InputLabel>
              <Select
                label="Time"
                value={editData.teamId ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, teamId: e.target.value }))
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                {teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Filial */}
            <FormControl size="small" fullWidth>
              <InputLabel>Filial</InputLabel>
              <Select
                label="Filial"
                value={editData.branchId ?? ""}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    branchId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">Selecione</MenuItem>
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* DIREITA: HISTÓRICO */}
          <div className="flex-1">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: 1.5 }}
              color="#1e293b"
            >
              Histórico do Colaborador
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                maxHeight: 360,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Cargo
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Dep.
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Filial
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Salário
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Início
                      </th>
                      <th className="text-left px-2 py-2 font-semibold text-gray-700">
                        Fim
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-gray-500">
                          Carregando histórico...
                        </td>
                      </tr>
                    ) : employeeHistories.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-gray-500">
                          Nenhum histórico encontrado.
                        </td>
                      </tr>
                    ) : (
                      employeeHistories.map((h) => (
                        <tr key={h.id} className="border-b">
                          <td className="px-2 py-2">{h.role?.name || "—"}</td>
                          <td className="px-2 py-2">{h.roleType?.name || "—"}</td>
                          <td className="px-2 py-2">{h.department?.name || "—"}</td>
                          <td className="px-2 py-2">{h.branch?.name || "—"}</td>
                          <td className="px-2 py-2">{h.team?.name || "—"}</td>
                          <td className="px-2 py-2">{formatWage(h.wage)}</td>
                          <td className="px-2 py-2">
                            {formatDate(h.startDate)}
                          </td>
                          <td className="px-2 py-2">
                            {formatDate(h.endDate)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO HISTÓRICO */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="body2">
                  Página {historyPage} de {historyPageCount}
                </Typography>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={historyPage <= 1 || historyLoading}
                    onClick={() => setHistoryPage((p) => p - 1)}
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
                    disabled={historyPage >= historyPageCount || historyLoading}
                    onClick={() => setHistoryPage((p) => p + 1)}
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
          </div>
        </div>
      </BaseModal>

      {/* PERSON SELECTOR MODAL */}
      <BaseModal
        open={selectPersonModalOpen}
        onClose={() => setSelectPersonModalOpen(false)}
        title="Selecionar Pessoa"
        description="Busque pelo nome ou email."
        footer={null}
      >
        <div className="flex flex-col gap-4">
          <Box display="flex" gap={2}>
            <TextField
              size="small"
              sx={{ flex: 1 }}
              label="Nome"
              value={personNameSearch}
              onChange={(e) => {
                setPersonNameSearch(e.target.value);
                setPersonPage(1);
              }}
            />
            <TextField
              size="small"
              sx={{ flex: 1 }}
              label="Email"
              value={personEmailSearch}
              onChange={(e) => {
                setPersonEmailSearch(e.target.value);
                setPersonPage(1);
              }}
            />
          </Box>

          <Paper sx={{ maxHeight: 300, overflowY: "auto" }}>
            {personsList.map((p) => (
              <div
                key={p.id}
                className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectPerson(p)}
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">{p.email}</div>
              </div>
            ))}
          </Paper>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              Página {personPage} de {personPageCount}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                size="small"
                variant="outlined"
                disabled={personPage <= 1}
                onClick={() => setPersonPage((p) => p - 1)}
              >
                Anterior
              </Button>

              <Button
                size="small"
                variant="outlined"
                disabled={personPage >= personPageCount}
                onClick={() => setPersonPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </Box>
          </Box>
        </div>
      </BaseModal>
    </div>
  );
}
