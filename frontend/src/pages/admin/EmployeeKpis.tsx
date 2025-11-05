import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";

import {
  useEmployeeKpis,
  EmployeeKpi,
  KpiStatus,
} from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployees, Employee } from "@/hooks/employee/useEmployees";
import { useKpis, Kpi } from "@/hooks/kpi/useKpis";
import { useEvaluationTypes, EvaluationType } from "@/hooks/evaluation-type/useEvaluationTypes";

export default function EmployeeKpis() {
  const { listEmployeeKpis, createEmployeeKpi, updateEmployeeKpi, deleteEmployeeKpi, loading, error } =
    useEmployeeKpis();
  const { listEmployees } = useEmployees();
  const { listKpis } = useKpis();
  const { listEvaluationTypes } = useEvaluationTypes();

  const [employeeKpis, setEmployeeKpis] = useState<EmployeeKpi[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [evaluationTypes, setEvaluationTypes] = useState<EvaluationType[]>([]);

  // Campos
  const [employeeId, setEmployeeId] = useState("");
  const [kpiId, setKpiId] = useState("");
  const [evaluationTypeId, setEvaluationTypeId] = useState("");
  const [periodStart, setPeriodStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [deltaMonths, setDeltaMonths] = useState(3);
  const [goal, setGoal] = useState<string>("");
  const [status, setStatus] = useState<KpiStatus>(KpiStatus.DRAFT);
  const [submittedBy, setSubmittedBy] = useState(localStorage.getItem("userId") || "");
  const [message, setMessage] = useState("");

  // Modal
  const [selectedKpi, setSelectedKpi] = useState<EmployeeKpi | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<string>("");
  const [editStatus, setEditStatus] = useState<KpiStatus>(KpiStatus.DRAFT);

  // Carregar dados
  useEffect(() => {
    async function fetchAll() {
      const [ek, e, k, et] = await Promise.all([
        listEmployeeKpis(),
        listEmployees(),
        listKpis(),
        listEvaluationTypes(),
      ]);
      setEmployeeKpis(ek);
      setEmployees(e);
      setKpis(k);
      setEvaluationTypes(et);
    }
    fetchAll();
  }, []);

  // Atualiza evaluationTypeId automaticamente
  useEffect(() => {
    const selectedKpiObj = kpis.find((k) => k.id === kpiId);
    if (selectedKpiObj) setEvaluationTypeId(selectedKpiObj.evaluationTypeId);
  }, [kpiId]);

  // Criar Employee KPI
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const periodEnd = format(addMonths(new Date(periodStart), deltaMonths), "yyyy-MM-dd");

    try {
      const newKpi = await createEmployeeKpi({
        companyId: localStorage.getItem("companyId")!,
        employeeId,
        teamId: employees.find((emp) => emp.id === employeeId)?.teamId || "",
        kpiId,
        evaluationTypeId,
        periodStart,
        periodEnd,
        goal,
        status,
        submittedBy,
        submittedDate: new Date().toISOString(),
      });
      setEmployeeKpis((prev) => [...prev, newKpi]);
      setMessage("KPI designada com sucesso!");
      setEmployeeId("");
      setKpiId("");
      setGoal("");
      setStatus(KpiStatus.DRAFT);
    } catch (err) {
      console.error(err);
    }
  };

  // Abrir modal
  const openEditModal = (kpi: EmployeeKpi) => {
    setSelectedKpi(kpi);
    setEditGoal(kpi.goal);
    setEditStatus(kpi.status);
    setModalOpen(true);
  };

  // Atualizar KPI
  const handleSave = async () => {
    if (!selectedKpi) return;
    const updated = await updateEmployeeKpi(selectedKpi.id, {
      goal: editGoal,
      status: editStatus,
    });
    setEmployeeKpis((prev) => prev.map((k) => (k.id === selectedKpi.id ? updated : k)));
    setModalOpen(false);
  };

  // Excluir KPI
  const handleDelete = async () => {
    if (!selectedKpi) return;
    await deleteEmployeeKpi(selectedKpi.id);
    setEmployeeKpis((prev) => prev.filter((k) => k.id !== selectedKpi.id));
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
            Designar KPI a Colaborador
          </h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium mb-1">Colaborador</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="">Selecione</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.person?.name || emp.id}
                  </option>
                ))}
              </select>
            </div>

            {/* KPI */}
            <div>
              <label className="block text-sm font-medium mb-1">KPI</label>
              <select
                value={kpiId}
                onChange={(e) => setKpiId(e.target.value)}
                required
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="">Selecione</option>
                {kpis.map((kpi) => (
                  <option key={kpi.id} value={kpi.id}>
                    {kpi.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Início do Período
                </label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Duração (meses)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={deltaMonths}
                  onChange={(e) => setDeltaMonths(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Meta */}
            <Input
              // type="number"
              // step="0.01"
              placeholder="Meta (goal)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KpiStatus)}
                className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
              >
                <option value={KpiStatus.DRAFT}>Rascunho</option>
                <option value={KpiStatus.SUBMITTED}>Enviado</option>
                <option value={KpiStatus.APPROVED}>Aprovado</option>
                <option value={KpiStatus.REJECTED}>Rejeitado</option>
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
              {loading ? "Enviando..." : "Designar KPI"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            KPIs de Colaboradores
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Colaborador</th>
                <th className="py-2">KPI</th>
                <th className="py-2">Meta</th>
                <th className="py-2">Status</th>
                <th className="py-2">Período</th>
                <th className="py-2 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {employeeKpis.map((ek) => (
                <tr
                  key={ek.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(ek)}
                >
                  <td className="py-2">{ek.employee?.person?.name || ek.employeeId}</td>
                  <td className="py-2">{ek.kpi?.name || ek.kpiId}</td>
                  <td className="py-2">{ek.goal}</td>
                  <td className="py-2 text-slate-700">{ek.status}</td>
                  <td className="py-2 text-slate-700">
                    {format(new Date(ek.periodStart), "dd/MM/yyyy")} -{" "}
                    {format(new Date(ek.periodEnd), "dd/MM/yyyy")}
                  </td>
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
        title="Editar KPI Designada"
        description="Atualize a meta ou status da KPI."
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
            type="number"
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
            placeholder="Meta"
          />

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as KpiStatus)}
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm w-full"
            >
              <option value={KpiStatus.DRAFT}>Rascunho</option>
              <option value={KpiStatus.SUBMITTED}>Enviado</option>
              <option value={KpiStatus.APPROVED}>Aprovado</option>
              <option value={KpiStatus.REJECTED}>Rejeitado</option>
            </select>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
