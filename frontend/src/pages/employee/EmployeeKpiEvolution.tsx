import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useEmployeeKpis, EmployeeKpi } from "@/hooks/employee-kpi/useEmployeeKpis";
import {
  useEmployeeKpiEvolutions,
  EmployeeKpiEvolutionStatus,
} from "@/hooks/employee-kpi/useEmployeeKpiEvolutions";
import React from "react";

export default function EmployeeKpiEvolution() {
  const { listEmployeeKpis } = useEmployeeKpis();
  const {
    listEmployeeKpiEvolutions,
    createEmployeeKpiEvolution,
    loading,
    error,
  } = useEmployeeKpiEvolutions();

  const employeeId = localStorage.getItem("employeeId")!;
  const companyId = localStorage.getItem("companyId")!;

  const [employeeKpis, setEmployeeKpis] = useState<EmployeeKpi[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [filteredKpis, setFilteredKpis] = useState<EmployeeKpi[]>([]);

  // Filtros
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<EmployeeKpi | null>(null);
  const [achievedValueEvolution, setAchievedValueEvolution] = useState("");

  // 🔹 Carregar dados
  useEffect(() => {
    async function fetchData() {
      const [kpis, evols] = await Promise.all([
        listEmployeeKpis(),
        listEmployeeKpiEvolutions(),
      ]);
      setEmployeeKpis(kpis);
      setEvolutions(evols);
    }
    fetchData();
  }, []);


  console.log(employeeKpis)
  // 🔹 Aplicar filtros
  useEffect(() => {
    let filtered = [...employeeKpis];

    if (startDate) {
      filtered = filtered.filter(
        (kpi) => new Date(kpi.periodStart) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (kpi) => new Date(kpi.periodEnd) <= new Date(endDate)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(
        (kpi) => kpi.kpi?.name === selectedType
      );
    }

    setFilteredKpis(filtered);
  }, [startDate, endDate, selectedType, employeeKpis]);

  // 🔹 Abrir modal
  const openModal = (kpi: EmployeeKpi) => {
    setSelectedKpi(kpi);
    setAchievedValueEvolution("");
    setModalOpen(true);
  };

  // 🔹 Criar evolução
  const handleSaveEvolution = async () => {
    if (!selectedKpi) return;

    await createEmployeeKpiEvolution({
      employeeKpiId: selectedKpi.id,
      achievedValueEvolution,
      status: EmployeeKpiEvolutionStatus.APPROVED,
    });

    // 🔄 Atualiza evoluções após salvar
    const updatedEvols = await listEmployeeKpiEvolutions();
    setEvolutions(updatedEvols);

    setModalOpen(false);
  };

  // 🔹 Tipos únicos de KPI
  const kpiTypes = useMemo(
    () => Array.from(new Set(employeeKpis.map((k) => k.kpi?.name))).filter(Boolean),
    [employeeKpis]
  );

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#151E3F]"
        >
          Meus KPIs
        </motion.h1>

        {/* 🔍 FILTROS */}
        <div className="bg-white shadow-md rounded-2xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de KPI</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {kpiTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 📊 TABELA DE KPIs */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">KPI</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Meta</th>
                <th className="py-2">Valor Atual</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredKpis.map((kpi) => {
                const relatedEvolutions = evolutions.filter(
                  (e) => e.employeeKpiId === kpi.id
                );
                const isExpanded = selectedKpi?.id === kpi.id;

                return (
                  <React.Fragment key={kpi.id}>
                    <tr
                      className={`border-b hover:bg-gray-50 cursor-pointer ${
                        isExpanded ? "bg-gray-50" : ""
                      }`}
                      onClick={() =>
                        setSelectedKpi((prev) => (prev?.id === kpi.id ? null : kpi))
                      }
                    >
                      <td className="py-2">{kpi.kpi?.name}</td>
                      <td className="py-2">{kpi.kpi?.evaluationType?.name}</td>
                      <td className="py-2">{kpi.goal}</td>
                      <td className="py-2">{kpi.achievedValue || "—"}</td>
                      <td className="py-2">{kpi.status}</td>
                      <td className="py-2 text-center">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation(); // evita abrir/fechar a expansão
                            openModal(kpi);
                          }}
                          className="text-[#C16E70]"
                        >
                          Registrar Evolução
                        </Button>
                      </td>
                    </tr>

                    {/* 🔽 Linhas expansíveis com evoluções + animação */}
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="bg-gray-100 border-b"
                      >
                        <td colSpan={6} className="p-4">
                          {relatedEvolutions.length > 0 ? (
                            <table className="w-full border text-xs bg-white rounded-lg shadow-sm">
                              <thead>
                                <tr className="text-left bg-gray-200">
                                  <th className="py-2 px-3">Valor / Observação</th>
                                  <th className="py-2 px-3">Status</th>
                                  <th className="py-2 px-3">Enviado em</th>
                                  <th className="py-2 px-3">Aprovado em</th>
                                </tr>
                              </thead>
                              <tbody>
                                {relatedEvolutions.map((ev) => (
                                  <tr key={ev.id} className="border-t">
                                    <td className="py-2 px-3">
                                      {ev.achievedValueEvolution}
                                    </td>
                                    <td className="py-2 px-3">{ev.status}</td>
                                    <td className="py-2 px-3">
                                      {ev.submittedDate
                                        ? new Date(ev.submittedDate).toLocaleDateString()
                                        : "—"}
                                    </td>
                                    <td className="py-2 px-3">
                                      {ev.approvedDate
                                        ? new Date(ev.approvedDate).toLocaleDateString()
                                        : "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              Nenhuma evolução registrada.
                            </p>
                          )}
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredKpis.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Nenhum KPI encontrado neste período.
            </p>
          )}
        </div>
      </main>

      {/* MODAL DE EVOLUÇÃO */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Registrar evolução - ${selectedKpi?.kpi?.name}`}
        description="Insira o novo valor atingido para este KPI."
        footer={
          <div className="flex justify-end w-full gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvolution} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Valor Atingido / Observação</label>
          <Input
            type="text"
            placeholder="Ex: 85, concluído, ou 'Atingido'"
            value={achievedValueEvolution}
            onChange={(e) => setAchievedValueEvolution(e.target.value)}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      </BaseModal>
    </div>
  );
}
