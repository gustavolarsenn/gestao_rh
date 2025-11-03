import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";

import { useTeams, Team } from "@/hooks/team/useTeams";
import { useTeamMembers, TeamMember } from "@/hooks/team-member/useTeamMembers";
import { format } from "date-fns";

export default function TeamsPage() {
  const { listTeams, createTeam, updateTeam, deleteTeam, loading, error } = useTeams();
  const { listTeamMembers, updateTeamMember } = useTeamMembers();

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ativos" | "inativos" | "todos">("ativos");

  // Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentTeamId, setParentTeamId] = useState("");
  const [message, setMessage] = useState("");

  // Modal
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editParentTeamId, setEditParentTeamId] = useState("");

  // 🔹 Carregar dados
  useEffect(() => {
    async function fetchData() {
      const [t, tm] = await Promise.all([listTeams(), listTeamMembers()]);
      setTeams(t);
      setTeamMembers(tm);
    }
    fetchData();
  }, []);

  // 🔹 Filtrar membros conforme status
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

  // 🔹 Criar time
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newTeam = await createTeam({
        name,
        description,
        parentTeamId: parentTeamId || null,
      });
      setTeams((prev) => [...prev, newTeam]);
      setMessage(`Time "${name}" criado com sucesso!`);
      setName("");
      setDescription("");
      setParentTeamId("");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Abrir modal + carregar membros do time
  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setEditName(team.name);
    setEditDescription(team.description || "");
    setEditParentTeamId(team.parentTeamId || "");
    const members = teamMembers.filter((m) => m.teamId === team.id);
    setFilteredMembers(members);
    setFilterStatus("ativos");
    setModalOpen(true);
  };

  // 🔹 Atualizar
  const handleSave = async () => {
    if (!selectedTeam) return;
    const updated = await updateTeam(selectedTeam.id, {
      name: editName,
      description: editDescription,
      parentTeamId: editParentTeamId || null,
    });
    setTeams((prev) => prev.map((t) => (t.id === selectedTeam.id ? updated : t)));
    setModalOpen(false);
  };

  // 🔹 Excluir
  const handleDelete = async () => {
    if (!selectedTeam) return;
    await deleteTeam(selectedTeam.id);
    setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
    setModalOpen(false);
  };

  // 🔹 Designar líder
  const handleMakeLeader = async (member: TeamMember) => {
    if (!member) return;
    try {
      await updateTeamMember(member.id, { isLeader: true });
      const updatedMembers = await listTeamMembers(selectedTeam?.id);
      setTeamMembers(updatedMembers);
    } catch (err) {
      console.error("Erro ao definir líder:", err);
    }
  };
  console.log(teams)
  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULÁRIO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5"
        >
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Criar Time</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome do Time (ex: Equipe de TI)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente o propósito do time..."
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70] min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Time Pai</label>
              <select
                value={parentTeamId}
                onChange={(e) => setParentTeamId(e.target.value)}
                required
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
              >
                <option value="">Selecione</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && (
              <p className="text-emerald-700 text-sm font-medium">{message}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Enviando..." : "Criar Time"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Times Cadastrados
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Descrição</th>
                <th className="py-2">Time Pai</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(team)}
                >
                  <td className="py-2">{team.name}</td>
                  <td className="py-2 text-slate-700">{team.description || "—"}</td>
                  <td className="py-2 text-slate-700">
                    {teams.find((t) => t.id === team.parentTeamId)?.name || "—"}
                  </td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">
                    Editar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Time"
        description="Atualize informações ou veja os membros vinculados."
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nome do Time"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descreva brevemente o propósito do time..."
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70] min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time Pai</label>
            <select
              value={editParentTeamId}
              onChange={(e) => setEditParentTeamId(e.target.value)}
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
            >
              <option value="">Selecione</option>
              {teams
                .filter((t) => t.id !== selectedTeam?.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          {/* 🔹 Filtro de membros */}
          <div className="flex items-center justify-between mt-4">
            <h3 className="font-semibold text-sm text-[#151E3F]">Membros do Time</h3>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border border-[#232c33] rounded-md px-2 py-1 text-sm"
            >
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {/* Lista de membros */}
          {filteredMembers.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum membro encontrado.</p>
          ) : (
            <table className="w-full border-collapse text-sm mt-2">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Nome</th>
                  <th className="py-2">Entrada</th>
                  <th className="py-2">Saída</th>
                  <th className="py-2 text-center">Líder</th>
                  <th className="py-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2">{m.employee?.person?.name || "—"}</td>
                    <td className="py-2">
                      {m.startDate
                        ? format(new Date(m.startDate), "dd/MM/yyyy")
                        : "—"}
                    </td>
                    <td className="py-2">
                      {m.endDate ? format(new Date(m.endDate), "dd/MM/yyyy") : "—"}
                    </td>
                    <td className="py-2 text-center">
                      {m.isLeader ? (
                        <span className="text-emerald-600 font-semibold">Sim</span>
                      ) : (
                        "Não"
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {!m.isLeader && (
                        <Button
                          size="sm"
                          className="bg-[#232c33] hover:bg-[#3f4755] text-white"
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
    </div>
  );
}
