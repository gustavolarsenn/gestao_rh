import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";

import { useKpis, Kpi } from "@/hooks/kpi/useKpis";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import {
  useEvaluationTypes,
  EvaluationType,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";

export default function Kpis() {
  const { listKpis, createKpi, updateKpi, deleteKpi, loading, error } = useKpis();
  const { listDepartments } = useDepartments();
  const { listEvaluationTypes } = useEvaluationTypes();

  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([]);

  // Campos do form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [evaluationTypeId, setEvaluationTypeId] = useState("");
  const [unit, setUnit] = useState("");
  const [message, setMessage] = useState("");

  // Modal
  const [selectedKpi, setSelectedKpi] = useState<Kpi | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editEvaluationTypeId, setEditEvaluationTypeId] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Carregar dados
  useEffect(() => {
    async function fetchAll() {
      const [k, d, e] = await Promise.all([
        listKpis(),
        listDepartments(),
        listEvaluationTypes(),
      ]);
      setKpis(k);
      setDepartments(d);
      setEvaluationTypes(e);
    }
    fetchAll();
  }, []);

  // Criar KPI
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newKpi = await createKpi({
        name,
        description,
        departmentId,
        evaluationTypeId,
        unit,
        companyId: localStorage.getItem("companyId")!,
      });
      setKpis((prev) => [...prev, newKpi]);
      setMessage("KPI criada com sucesso!");
      setName("");
      setDescription("");
      setDepartmentId("");
      setEvaluationTypeId("");
      setUnit("");
    } catch (err) {
      console.error(err);
    }
  };

  // Abrir modal
  const openEditModal = (kpi: Kpi) => {
    setSelectedKpi(kpi);
    setEditName(kpi.name);
    setEditDescription(kpi.description || "");
    setEditDepartmentId(kpi.departmentId);
    setEditEvaluationTypeId(kpi.evaluationTypeId);
    setEditUnit(kpi.unit);
    setModalOpen(true);
  };

  // Atualizar KPI
  const handleSave = async () => {
    if (!selectedKpi) return;
    const updated = await updateKpi(selectedKpi.id, {
      name: editName,
      description: editDescription,
      departmentId: editDepartmentId,
      evaluationTypeId: editEvaluationTypeId,
      unit: editUnit,
    });
    setKpis((prev) => prev.map((k) => (k.id === selectedKpi.id ? updated : k)));
    setModalOpen(false);
  };

  // Excluir KPI
  const handleDelete = async () => {
    if (!selectedKpi) return;
    await deleteKpi(selectedKpi.id);
    setKpis((prev) => prev.filter((k) => k.id !== selectedKpi.id));
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
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Criar KPI</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome da métrica (ex: Taxa de conversão)"
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

            {/* Tipo de avaliação */}
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Avaliação</label>
              <select
                value={evaluationTypeId}
                onChange={(e) => setEvaluationTypeId(e.target.value)}
                required
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="">Selecione</option>
                {evaluationTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name}{" "}
                    {et.code === EvaluationCode.HIGHER_BETTER
                      ? "(↑ melhor)"
                      : et.code === EvaluationCode.LOWER_BETTER
                      ? "(↓ melhor)"
                      : "(Binário)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Unidade */}
            <Input
              type="text"
              placeholder="Unidade de medida (ex: R$, %, horas, features)"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo desta métrica..."
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
              {loading ? "Enviando..." : "Criar KPI"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">KPIs Cadastrados</h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Departamento</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Unidade</th>
                <th className="py-2 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi) => (
                <tr
                  key={kpi.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(kpi)}
                >
                  <td className="py-2">{kpi.name}</td>
                  <td className="py-2 text-slate-700">
                    {kpi.department?.name ||
                      departments.find((d) => d.id === kpi.departmentId)?.name ||
                      "—"}
                  </td>
                  <td className="py-2 text-slate-700">
                    {kpi.evaluationType?.name ||
                      evaluationTypes.find((et) => et.id === kpi.evaluationTypeId)?.name ||
                      "—"}
                  </td>
                  <td className="py-2 text-slate-700">{kpi.unit}</td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">Editar</td>
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
        title="Editar KPI"
        description="Atualize as informações da métrica ou exclua o registro."
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
            placeholder="Nome da métrica"
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
              value={editEvaluationTypeId}
              onChange={(e) => setEditEvaluationTypeId(e.target.value)}
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
            >
              <option value="">Selecione</option>
              {evaluationTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            placeholder="Unidade de medida"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descreva o objetivo desta métrica..."
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full min-h-[80px]"
            />
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
