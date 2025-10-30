// src/pages/admin/Teams.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useTeams, Team } from "@/hooks/team/useTeams";

export default function TeamsPage() {
  const { listTeams, createTeam, updateTeam, deleteTeam, loading, error } = useTeams();

  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // Modal de edição
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Carregar times
  useEffect(() => {
    listTeams().then(setTeams);
  }, []);

  // Criar time
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newTeam = await createTeam({ name, description });
      setTeams((prev) => [...prev, newTeam]);
      setMessage(`Time "${name}" criado com sucesso!`);
      setName("");
      setDescription("");
    } catch {}
  };

  // Abrir modal
  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setEditName(team.name);
    setEditDescription(team.description || "");
    setModalOpen(true);
  };

  // Atualizar
  const handleSave = async () => {
    if (!selectedTeam) return;
    const updated = await updateTeam(selectedTeam.id, {
      name: editName,
      description: editDescription,
    });
    setTeams((prev) => prev.map((t) => (t.id === selectedTeam.id ? updated : t)));
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedTeam) return;
    await deleteTeam(selectedTeam.id);
    setTeams((prev) => prev.filter((t) => t.id !== selectedTeam.id));
    setModalOpen(false);
  };

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
              <label className="block text-sm font-medium mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva brevemente o propósito do time..."
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70] min-h-[80px]"
              />
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
                  <td className="py-2 text-slate-700">
                    {team.description || "—"}
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
        description="Atualize as informações ou exclua o registro."
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
        </div>
      </BaseModal>
    </div>
  );
}
