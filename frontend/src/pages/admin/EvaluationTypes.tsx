import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import {
  useEvaluationTypes,
  EvaluationType,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";
import { useDepartments, Department } from "@/hooks/department/useDepartments";

export default function EvaluationTypesPage() {
  const {
    listEvaluationTypes,
    createEvaluationType,
    updateEvaluationType,
    deleteEvaluationType,
    loading,
    error,
  } = useEvaluationTypes();
  const { listDepartments } = useDepartments();

  const [types, setTypes] = useState<EvaluationType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState<EvaluationCode>(EvaluationCode.HIGHER_BETTER);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // Modal
  const [selectedType, setSelectedType] = useState<EvaluationType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState<EvaluationCode>(EvaluationCode.HIGHER_BETTER);
  const [editDescription, setEditDescription] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");

  // Carregar lista
  useEffect(() => {
    async function fetchAll() {
      const [types, depts] = await Promise.all([
        listEvaluationTypes(),
        listDepartments(),
      ]);
      setTypes(types);
      setDepartments(depts);
    }
    fetchAll();
  }, []);

  // Criar tipo de métrica
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newType = await createEvaluationType({
        name,
        code,
        description,
        departmentId,
        companyId: localStorage.getItem("companyId")!,
      });
      setTypes((prev) => [...prev, newType]);
      setMessage("Tipo de métrica criado com sucesso!");
      setName("");
      setDescription("");
      setCode(EvaluationCode.HIGHER_BETTER);
      setDepartmentId("");
    } catch (err) {
      console.error(err);
    }
  };

  // Abrir modal
  const openEditModal = (type: EvaluationType) => {
    setSelectedType(type);
    setEditName(type.name);
    setEditCode(type.code);
    setEditDescription(type.description || "");
    setEditDepartmentId(type.departmentId || "");
    setModalOpen(true);
  };

  // Atualizar tipo
  const handleSave = async () => {
    if (!selectedType) return;
    const updated = await updateEvaluationType(selectedType.id, {
      name: editName,
      code: editCode,
      description: editDescription,
      departmentId: editDepartmentId,
    });
    setTypes((prev) => prev.map((t) => (t.id === selectedType.id ? updated : t)));
    setModalOpen(false);
  };

  // Excluir tipo
  const handleDelete = async () => {
    if (!selectedType) return;
    await deleteEvaluationType(selectedType.id);
    setTypes((prev) => prev.filter((t) => t.id !== selectedType.id));
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
            Criar Tipo de Métrica
          </h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome (ex: Produtividade)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Departamento */}
            <div>
              <label className="block text-sm font-medium mb-1">Departamento</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="">Selecione</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Avaliação</label>
              <select
                value={code}
                onChange={(e) => setCode(e.target.value as EvaluationCode)}
                required
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value={EvaluationCode.HIGHER_BETTER_SUM}>Quanto maior, melhor (soma)</option>
                <option value={EvaluationCode.LOWER_BETTER_SUM}>Quanto menor, melhor (soma)</option>
                <option value={EvaluationCode.HIGHER_BETTER_PCT}>Quanto maior, melhor (percentual)</option>
                <option value={EvaluationCode.LOWER_BETTER_PCT}>Quanto menor, melhor (percentual)</option>
                <option value={EvaluationCode.BINARY}>Binário (Sim/Não)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o uso dessa métrica..."
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full min-h-[80px]"
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
              {loading ? "Enviando..." : "Criar Tipo"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Tipos de Métrica
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Departamento</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Descrição</th>
                <th className="py-2 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {types.map((type) => (
                <tr
                  key={type.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(type)}
                >
                  <td className="py-2">{type.name}</td>
                  <td className="py-2 text-slate-700">
                    {type.department?.name ||
                      departments.find((d) => d.id === type.departmentId)?.name ||
                      "—"}
                  </td>
                  <td className="py-2 text-slate-700">
                    {type.code === EvaluationCode.HIGHER_BETTER_PCT || type.code === EvaluationCode.HIGHER_BETTER_SUM
                      ? "Quanto maior, melhor"
                      : type.code === EvaluationCode.LOWER_BETTER_PCT || type.code === EvaluationCode.LOWER_BETTER_SUM
                      ? "Quanto menor, melhor"
                      : "Binário"}
                  </td>
                  <td className="py-2 text-slate-700">{type.description || "—"}</td>
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
        title="Editar Tipo de Métrica"
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
            placeholder="Nome do Tipo"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select
              value={editDepartmentId}
              onChange={(e) => setEditDepartmentId(e.target.value)}
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
            >
              <option value="">Selecione</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Avaliação</label>
            <select
              value={editCode}
              onChange={(e) => setEditCode(e.target.value as EvaluationCode)}
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
            >
              <option value={EvaluationCode.HIGHER_BETTER_PCT}>Quanto maior, melhor (percentual)</option>
              <option value={EvaluationCode.HIGHER_BETTER_SUM}>Quanto maior, melhor (soma)</option>
              <option value={EvaluationCode.LOWER_BETTER_PCT}>Quanto menor, melhor (percentual)</option>
              <option value={EvaluationCode.LOWER_BETTER_SUM}>Quanto menor, melhor (soma)</option>
              <option value={EvaluationCode.BINARY}>Binário (Sim/Não)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descreva o uso dessa métrica..."
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full min-h-[80px]"
            />
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
