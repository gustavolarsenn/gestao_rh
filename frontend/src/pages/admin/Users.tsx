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

export default function Users() {
  const { listUsers, createUser, updateUser, deleteUser } = useUsers();
  const { listUserRoles } = useUserRoles();
  const { listPersons } = usePersons();

  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // ============== PERSON MODAL SELECT ==============
  const [selectPersonModalOpen, setSelectPersonModalOpen] = useState(false);
  const [personNameSearch, setPersonNameSearch] = useState("");
  const [personEmailSearch, setPersonEmailSearch] = useState("");
  const [personPage, setPersonPage] = useState(1);
  const [personTotal, setPersonTotal] = useState(0);
  const personLimit = 10;

  const [personsList, setPersonsList] = useState<Person[]>([]);

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
    if (selectPersonModalOpen) loadPersonsModal();
  }, [selectPersonModalOpen, personNameSearch, personEmailSearch, personPage]);

  const personPageCount = Math.ceil(personTotal / personLimit);

  // ============== USERS PAGINATION ==============
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const usersPageCount = Math.ceil(total / limit);

  // ============== FILTERS ==============
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // ============== LOAD USERS (backend pagination) ==============
  async function loadUsers() {
    const result = await listUsers({
      page,
      limit,
      name: filterName || undefined,
      email: filterEmail || undefined,
      userRoleId: filterRole || undefined,
    });

    setUsers(result.data);
    setTotal(result.total);
  }

  useEffect(() => {
    async function loadInitial() {
      const roles = await listUserRoles();
      setUserRoles(roles);
    }
    loadInitial();
  }, []);

  useEffect(() => {
    loadUsers();
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
    await createUser({
      name: selectedPersonName,
      email: selectedPersonEmail,
      password,
      userRoleId,
      personId: selectedPersonId,
      companyId: localStorage.getItem("companyId")!,
    });

    setCreateModalOpen(false);
    setPage(1);
    loadUsers();
  };

  // ============== EDIT MODAL ==============
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserRoleId, setEditUserRoleId] = useState("");

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setEditUserRoleId(u.userRoleId);
    setEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    await updateUser(selectedUser.id, {
      userRoleId: editUserRoleId,
      companyId: selectedUser.companyId,
    });

    setEditModalOpen(false);
    loadUsers();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    await deleteUser(selectedUser.id);
    setEditModalOpen(false);
    loadUsers();
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">

        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Usuários
        </Typography>

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

            <TextField
              size="small"
              label="Email"
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 200px" }}
            />

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
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
                ml: "auto",
                backgroundColor: "#1e293b",
                color: "white",
              }}
            >
              Criar Usuário
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Perfil</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => openEditModal(u)}
                >
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Typography variant="body2">
              Página {page} de {usersPageCount || 1}
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
                disabled={page >= usersPageCount}
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
          <div className="flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={!selectedPersonId || !userRoleId || !password}>
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
        description="Atualize o perfil ou remova."
        footer={
          <div className="flex justify-between w-full">
            <Button color="error" variant="outlined" onClick={handleDeleteUser}>
              Excluir
            </Button>
            <Button onClick={handleSaveUser}>Salvar</Button>
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
              Página {personPage} de {personPageCount || 1}
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
