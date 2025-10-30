// src/pages/admin/RoleType.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";
import { useDepartments, Department } from "@/hooks/department/useDepartments";

export default function RoleTypePage() {
  const { listRoleTypes, createRoleType, updateRoleType, deleteRoleType, loading, error } =
    useRoleTypes();
  const { listDepartments } = useDepartments();

  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [message, setMessage] = useState("");

  console.log(departments)

  const [selectedRoleType, setSelectedRoleType] = useState<RoleType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");

  // Carregar roleTypes e departamentos
  useEffect(() => {
    async function fetchData() {
      const [roles, deps] = await Promise.all([listRoleTypes(), listDepartments()]);
      setRoleTypes(roles);
      setDepartments(deps);
    }
    fetchData();
  }, []);

  // Criar tipo de cargo
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const newRoleType = await createRoleType({ name, departmentId });
      setRoleTypes((prev) => [...prev, newRoleType]);
      setMessage(`Tipo de cargo "${name}" criado com sucesso!`);
      setName("");
      setDepartmentId("");
    } catch {}
  };

  // Abrir modal
  const openEditModal = (role: RoleType) => {
    setSelectedRoleType(role);
    setEditName(role.name);
    setEditDepartmentId(role.departmentId);
    setModalOpen(true);
  };

  // Atualizar
  const handleSave = async () => {
    if (!selectedRoleType) return;
    const updated = await updateRoleType(selectedRoleType.id, {
      name: editName,
      departmentId: editDepartmentId,
    });
    setRoleTypes((prev) =>
      prev.map((r) => (r.id === selectedRoleType.id ? updated : r))
    );
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedRoleType) return;
    await deleteRoleType(selectedRoleType.id);
    setRoleTypes((prev) => prev.filter((r) => r.id !== selectedRoleType.id));
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
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">
            Criar Tipo de Cargo
          </h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Ex: Engenheiro, Analista, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1">Departamento</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
                required
              >
                <option value="">Selecione</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
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
              {loading ? "Enviando..." : "Criar Tipo de Cargo"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Tipos de Cargo
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Departamento</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {roleTypes.map((role) => (
                <tr
                  key={role.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(role)}
                >
                  <td className="py-2">{role.name}</td>
                  <td className="py-2">{role.department?.name || "—"}</td>
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
        title="Editar Tipo de Cargo"
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
            placeholder="Nome do Tipo de Cargo"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select
              value={editDepartmentId}
              onChange={(e) => setEditDepartmentId(e.target.value)}
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
            >
              <option value="">Selecione</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
