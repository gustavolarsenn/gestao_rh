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

import { useUsers, User } from "@/hooks/user/useUsers";
import { useUserRoles, UserRole } from "@/hooks/user/useUserRoles";
import { usePersons, Person } from "@/hooks/person/usePersons";
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

import { useCompanies, type Company } from "@/hooks/company/useCompanies";
import { useAuth } from "@/auth/useAuth";

export default function Users() {
  const { listUsers, createUser, updateUser, deleteUser } = useUsers();
  const { listUserRoles } = useUserRoles();
  const { listPersons } = usePersons();
  const { listCompanies } = useCompanies();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Usuários";
  }, []);

  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [editCompanyId, setEditCompanyId] = useState("");

  // ============== PERSON MODAL SELECT ==============
  const [selectPersonModalOpen, setSelectPersonModalOpen] = useState(false);
  const [personNameSearch, setPersonNameSearch] = useState("");
  const [personEmailSearch, setPersonEmailSearch] = useState("");
  const [personPage, setPersonPage] = useState(1);
  const [personTotal, setPersonTotal] = useState(0);
  const personLimit = 10;
  const [loadingPersonsModal, setLoadingPersonsModal] = useState(false);

  const [personsList, setPersonsList] = useState<Person[]>([]);

  async function loadPersonsModal() {
    setLoadingPersonsModal(true);
    const result = await listPersons({
      page: personPage,
      limit: personLimit,
      name: personNameSearch || undefined,
      email: personEmailSearch || undefined,
    });

    setPersonsList(result.data);
    setPersonTotal(result.total);
    setLoadingPersonsModal(false);
  }

  useEffect(() => {
    if (selectPersonModalOpen) {
      loadPersonsModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectPersonModalOpen, personNameSearch, personEmailSearch, personPage]);

  const personPageCount = Math.ceil(personTotal / personLimit) || 1;

  // ============== USERS PAGINATION ==============
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const usersPageCount = Math.ceil(total / limit) || 1;

  // ============== FILTERS ==============
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // ============== LOAD USERS (backend pagination) ==============
  async function loadUsers() {
    setLoadingUsers(true);
    const result = await listUsers({
      page,
      limit,
      name: filterName || undefined,
      email: filterEmail || undefined,
      userRoleId: filterRole || undefined,
    });

    setUsers(result.data);
    setTotal(result.total);
    setLoadingUsers(false);
  }

  useEffect(() => {
    async function loadInitial() {
      const roles = await listUserRoles();
      setUserRoles(roles);
    }
    loadInitial();
  }, [listUserRoles]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterEmail, filterRole]);

  // ============== CREATE MODAL ==============
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState("");
  const [selectedPersonEmail, setSelectedPersonEmail] = useState("");

  const [userRoleId, setUserRoleId] = useState("");
  const [password, setPassword] = useState("");

  const handleSelectPerson = (p: Person) => {
    setSelectedPersonId(p.id);
    setSelectedPersonName(p.name);
    setSelectedPersonEmail(p.email);
    setSelectPersonModalOpen(false);
  };

  const handleCreateUser = async () => {
    if (!selectedCompanyId) return;

    await createUser({
      name: selectedPersonName,
      email: selectedPersonEmail,
      password,
      userRoleId,
      personId: selectedPersonId,
      companyId: selectedCompanyId,
    });

    setSelectedPersonId("");
    setSelectedPersonName("");
    setSelectedPersonEmail("");
    setUserRoleId("");
    setPassword("");
    setSelectedCompanyId("");

    setCreateModalOpen(false);
    setPage(1);
    loadUsers();
  };

  // ============== EDIT MODAL ==============
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserRoleId, setEditUserRoleId] = useState("");
  const [editPassword, setEditPassword] = useState(""); // NOVO

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setEditUserRoleId(u.userRoleId);
    setEditCompanyId(u.companyId || "");
    setEditPassword(""); // limpa campo ao abrir
    setEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const payload: any = {
      userRoleId: editUserRoleId,
      companyId: editCompanyId || selectedUser.companyId,
    };

    if (editPassword) {
      payload.password = editPassword; // só envia se preenchida
    }

    await updateUser(selectedUser.companyId, selectedUser.id, payload);

    setEditModalOpen(false);
    loadUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    await deleteUser(selectedUser.companyId, selectedUser.id);
    setEditModalOpen(false);
    loadUsers();
  };

  // ============== LOAD COMPANIES (para criação e edição) ==============
  useEffect(() => {
    async function loadCompaniesData() {
      const res = await listCompanies();
      const list = (res as any)?.data ?? res ?? [];
      setCompanies(list);
    }

    if (createModalOpen || editModalOpen) {
      loadCompaniesData();
    }
  }, [createModalOpen, editModalOpen, listCompanies, user?.level]);

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
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
          Usuários
        </Typography>

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
            <TextField
              size="small"
              label="Nome"
              fullWidth
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              sx={{ flex: { md: "1 1 200px" } }}
            />

            <TextField
              size="small"
              label="Email"
              fullWidth
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setPage(1);
              }}
              sx={{ flex: { md: "1 1 200px" } }}
            />

            <FormControl
              size="small"
              fullWidth
              sx={{ flex: { md: "1 1 200px" } }}
            >
              <InputLabel>Perfil</InputLabel>
              <Select
                label="Perfil"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {userRoles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                  setFilterName("");
                  setFilterEmail("");
                  setFilterRole("");
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
                Criar Usuário
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
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Perfil
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-gray-500"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-gray-500"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(u)}
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3">{u.name}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3">{u.email}</td>
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        {u.role?.name || "-"}
                      </td>
                    </tr>
                  ))
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
              Página {page} de {usersPageCount}
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
                disabled={page >= usersPageCount}
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
        </Paper>
      </main>

      {/* CREATE USER MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Usuário"
        description="Selecione uma pessoa e defina o perfil."
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outlined"
              sx={{
                px: 4,
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
              onClick={() => setCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !selectedPersonId ||
                !userRoleId ||
                !password ||
                !selectedCompanyId
              }
              sx={{ ...primaryButtonSx, width: { xs: "100%", sm: "auto" } }}
            >
              Criar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Person selector */}
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

          <FormControl size="small">
            <InputLabel>Perfil</InputLabel>
            <Select
              label="Perfil"
              value={userRoleId}
              onChange={(e) => setUserRoleId(e.target.value)}
            >
              {userRoles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Empresa</InputLabel>
            <Select
              label="Empresa"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </BaseModal>

      {/* EDIT USER MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Editar Usuário`}
        description="Atualize o perfil, empresa, senha ou remova."
        footer={
          <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDeleteUser}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Excluir
            </Button>
            <Button
              onClick={handleSaveUser}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              Salvar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <FormControl size="small">
            <InputLabel>Perfil</InputLabel>
            <Select
              label="Perfil"
              value={editUserRoleId}
              onChange={(e) => setEditUserRoleId(e.target.value)}
            >
              {userRoles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Empresa</InputLabel>
            <Select
              label="Empresa"
              value={editCompanyId}
              onChange={(e) => setEditCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Nova senha"
            type="password"
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
            helperText="Deixe em branco para manter a senha atual"
          />
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
          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
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

          <Paper
            sx={{
              maxHeight: 300,
              overflowY: "auto",
              borderRadius: 2,
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
              border: `1px solid ${SECTION_BORDER_COLOR}`,
            }}
          >
            {loadingPersonsModal ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Carregando pessoas...
              </div>
            ) : personsList.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Nenhuma pessoa encontrada.
              </div>
            ) : (
              personsList.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-3 border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectPerson(p)}
                >
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.email}</div>
                </div>
              ))
            )}
          </Paper>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}
          >
            <Typography variant="body2">
              Página {personPage} de {personPageCount}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                size="small"
                variant="outlined"
                disabled={personPage <= 1}
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
                onClick={() => setPersonPage((p) => p - 1)}
              >
                Anterior
              </Button>

              <Button
                size="small"
                variant="outlined"
                disabled={personPage >= personPageCount}
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
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
