// src/pages/admin/Teams.tsx
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

import { useTeams, Team } from "@/hooks/team/useTeams";
import { useTeamMembers, TeamMember } from "@/hooks/team-member/useTeamMembers";
import { format } from "date-fns";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function TeamsPage() {
  const {
    listTeams,
    listDistinctTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    loading,
    error,
  } = useTeams();
  const { listTeamMembers, updateTeamMember } = useTeamMembers();

  // ======================================================
  // STATES
  // ======================================================
  const [teams, setTeams] = useState<Team[]>([]);
  const [allTeamsOptions, setAllTeamsOptions] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ativos" | "inativos" | "todos">("ativos");

  // pagination (backend)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  // filters (backend)
  const [filterName, setFilterName] = useState("");
  const [filterParentTeamId, setFilterParentTeamId] = useState("");

  const [loadingTable, setLoadingTable] = useState(false);
  const [message, setMessage] = useState("");

  // CREATE MODAL
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentTeamId, setParentTeamId] = useState("");

  // EDIT MODAL
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editParentTeamId, setEditParentTeamId] = useState("");

  // ======================================================
  // LOAD STATIC DATA (distinct teams, members)
  // ======================================================
  useEffect(() => {
    async function loadStatic() {
      const [distinct, members] = await Promise.all([
        listDistinctTeams(),
        listTeamMembers(),
      ]);

      setAllTeamsOptions(distinct || []);
      setTeamMembers(members || []);
    }
    loadStatic();
  }, []);

  // ======================================================
  // LOAD TEAMS (pagination + backend filters)
  // ======================================================
  async function loadTeams() {
    setLoadingTable(true);

    const result = await listTeams({
      page,
      limit,
      name: filterName || undefined,
      parentTeamId: filterParentTeamId || undefined,
    });

    setTeams(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterParentTeamId]);

  // ======================================================
  // FILTER MEMBERS BY STATUS (frontend, só dentro do time selecionado)
  // ======================================================
  useEffect(() => {
    if (!selectedTeam) return;

    const members = teamMembers.filter((m) => m.teamId === selectedTeam.id);
    const now = new Date();
    let filtered = members;

    if (filterStatus === "ativos") {
      filtered = members.filter((m) => !m.endDate || new Date(m.endDate) > now);
    } else if (filterStatus === "inativos") {
      filtered = members.filter((m) => m.endDate && new Date(m.endDate) <= now);
    }

    setFilteredMembers(filtered);
  }, [filterStatus, selectedTeam, teamMembers]);

  // ======================================================
  // CREATE TEAM
  // ======================================================
  const handleCreate = async () => {
    setMessage("");
    try {
      const newTeam = await createTeam({
        name,
        description,
        parentTeamId: parentTeamId || null,
      });

      setPage(1);
      loadTeams();

      setAllTeamsOptions((prev) => {
        if (prev.some((t) => t.id === newTeam.id)) return prev;
        return [...prev, newTeam];
      });

      setMessage(`Time "${name}" criado com sucesso!`);
      setName("");
      setDescription("");
      setParentTeamId("");
      setCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================
  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setEditName(team.name);
    setEditDescription(team.description || "");
    setEditParentTeamId(team.parentTeamId || "");

    const members = teamMembers.filter((m) => m.teamId === team.id);
    setFilteredMembers(members);
    setFilterStatus("ativos");
    setEditModalOpen(true);
  };

  // ======================================================
  // UPDATE TEAM
  // ======================================================
  const handleSave = async () => {
    if (!selectedTeam) return;
    const updated = await updateTeam(selectedTeam.id, {
      name: editName,
      description: editDescription,
      parentTeamId: editParentTeamId || null,
    });

    setTeams((prev) => prev.map((t) => (t.id === selectedTeam.id ? updated : t)));

    setAllTeamsOptions((prev) => {
      const exists = prev.some((t) => t.id === updated.id);
      if (!exists) return [...prev, updated];
      return prev.map((t) => (t.id === updated.id ? updated : t));
    });

    setEditModalOpen(false);
  };

  // ======================================================
  // DELETE TEAM
  // ======================================================
  const handleDelete = async () => {
    if (!selectedTeam) return;
    await deleteTeam(selectedTeam.id);
    setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
    setEditModalOpen(false);
    loadTeams();
  };

  // ======================================================
  // MAKE LEADER
  // ======================================================
  const handleMakeLeader = async (member: TeamMember) => {
    if (!member) return;
    try {
      await updateTeamMember(member.id, { isLeader: true });
      const updatedMembers = await listTeamMembers(selectedTeam?.id);
      setTeamMembers(updatedMembers || []);
    } catch (err) {
      console.error("Erro ao definir líder:", err);
    }
  };

  // Helper para pegar nome do time pai
  const getParentTeamName = (parentId?: string | null) => {
    if (!parentId) return "—";
    return allTeamsOptions.find((t) => t.id === parentId)?.name || "—";
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
          Times
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
              <InputLabel>Time Pai</InputLabel>
              <Select
                label="Time Pai"
                value={filterParentTeamId}
                onChange={(e) => {
                  setFilterParentTeamId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {allTeamsOptions.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
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
                setFilterParentTeamId("");
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
              Criar Time
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
                  Descrição
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Time Pai
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    Nenhum time encontrado.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr
                    key={team.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(team)}
                  >
                    <td className="px-4 py-3">{team.name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {team.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {getParentTeamName(team.parentTeamId)}
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
                onClick={() => setPage((prev) => prev - 1)}
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
                onClick={() => setPage((prev) => prev + 1)}
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
          title="Criar Time"
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
                disabled={!name}
              >
                Criar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome do Time"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              size="small"
              label="Descrição"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Time Pai</InputLabel>
              <Select
                label="Time Pai"
                value={parentTeamId}
                onChange={(e) => setParentTeamId(e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {allTeamsOptions.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
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
          title="Editar Time"
          description="Atualize informações ou veja os membros vinculados."
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
                disabled={!editName}
              >
                Salvar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome do Time"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <TextField
              size="small"
              label="Descrição"
              multiline
              minRows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <FormControl size="small" fullWidth>
              <InputLabel>Time Pai</InputLabel>
              <Select
                label="Time Pai"
                value={editParentTeamId}
                onChange={(e) => setEditParentTeamId(e.target.value)}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {allTeamsOptions
                  .filter((t) => t.id !== selectedTeam?.id)
                  .map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Filtro de membros */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Membros do Time
              </Typography>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as "ativos" | "inativos" | "todos")
                  }
                >
                  <MenuItem value="ativos">Ativos</MenuItem>
                  <MenuItem value="inativos">Inativos</MenuItem>
                  <MenuItem value="todos">Todos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {filteredMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Nenhum membro encontrado.
              </Typography>
            ) : (
              <table className="w-full border-collapse text-sm mt-2">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">Nome</th>
                    <th className="py-2 px-2">Entrada</th>
                    <th className="py-2 px-2">Saída</th>
                    <th className="py-2 px-2 text-center">Líder</th>
                    <th className="py-2 px-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="border-b">
                      <td className="py-2 px-2">
                        {m.employee?.person?.name || "—"}
                      </td>
                      <td className="py-2 px-2">
                        {m.startDate
                          ? format(new Date(m.startDate), "dd/MM/yyyy")
                          : "—"}
                      </td>
                      <td className="py-2 px-2">
                        {m.endDate
                          ? format(new Date(m.endDate), "dd/MM/yyyy")
                          : "—"}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {m.isLeader ? (
                          <span className="text-emerald-600 font-semibold">Sim</span>
                        ) : (
                          "Não"
                        )}
                      </td>
                      <td className="py-2 px-2 text-center">
                        {!m.isLeader && (
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              textTransform: "none",
                              borderColor: PRIMARY_COLOR,
                              color: PRIMARY_COLOR,
                              "&:hover": {
                                borderColor: PRIMARY_COLOR,
                                backgroundColor: PRIMARY_LIGHT_BG,
                              },
                            }}
                            onClick={() => handleMakeLeader(m)}
                          >
                            Tornar Líder
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
