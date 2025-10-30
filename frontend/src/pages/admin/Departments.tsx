// src/pages/admin/Department.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useDepartments, Department } from "@/hooks/department/useDepartments";

export default function DepartmentPage() {
  const { listDepartments, createDepartment, updateDepartment, deleteDepartment, loading, error } =
    useDepartments();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Carregar departamentos
  useEffect(() => {
    listDepartments().then(setDepartments);
  }, []);

  // Criar departamento
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const newDept = await createDepartment({
        name,
        companyId: localStorage.getItem("companyId")!,
      });
      setDepartments((prev) => [...prev, newDept]);
      setMessage(`Departamento "${name}" criado com sucesso!`);
      setName("");
      setDescription("");
    } catch {}
  };

  // Abrir modal
  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setEditName(dept.name);
    setModalOpen(true);
  };

  // Salvar alterações
  const handleSave = async () => {
    if (!selectedDept) return;
    const updated = await updateDepartment(selectedDept.id, {
      name: editName,
    });
    setDepartments((prev) => prev.map((d) => (d.id === selectedDept.id ? updated : d)));
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedDept) return;
    await deleteDepartment(selectedDept.id);
    setDepartments((prev) => prev.filter((d) => d.id !== selectedDept.id));
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
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Criar novo departamento</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome do Departamento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Enviando..." : "Criar Departamento"}
            </Button>
          </form>
        </motion.div>

        {/* TABELA */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">Departamentos cadastrados</h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(dept)}
                >
                  <td className="py-2">{dept.name}</td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">Editar</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL UNIVERSAL */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Departamento"
        description="Atualize as informações do departamento ou exclua o registro."
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
            placeholder="Nome"
          />
        </div>
      </BaseModal>
    </div>
  );
}
