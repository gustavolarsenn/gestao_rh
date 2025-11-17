import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/modals/BaseModal";
import { useTeamKpis } from "@/hooks/team-kpi/useTeamKpis";
import { useTeamKpiEvolutions } from "@/hooks/team-kpi/useTeamKpiEvolutions";
import { rateKPI } from "@/utils/rateKPI";
import { Paper, Typography } from "@mui/material";

export default function TeamKpiReviewSection() {
  const { listTeamKpis } = useTeamKpis();
  const { listTeamKpiEvolutions, updateTeamKpiEvolution } =
    useTeamKpiEvolutions();

  const [teamKpis, setTeamKpis] = useState<any[]>([]);
  const [teamEvols, setTeamEvols] = useState<any[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [expandedKpiId, setExpandedKpiId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [kpis, evols] = await Promise.all([
        listTeamKpis(),
        listTeamKpiEvolutions(),
      ]);

      setTeamKpis((kpis as any)?.data || kpis || []);
      setTeamEvols((evols as any)?.data || evols || []);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teams = Array.from(
    new Map(teamKpis.map((k) => [k.teamId, k.team])).values()
  );

  async function handleApprove(ev: any) {
    await updateTeamKpiEvolution(ev.id, { status: "APPROVED" });
    const updated = await listTeamKpiEvolutions();
    setTeamEvols((updated as any)?.data || updated || []);
  }

  async function handleReject(ev: any) {
    setSelectedEvolution(ev);
    setModalOpen(true);
  }

  async function handleConfirmRejection() {
    if (!selectedEvolution) return;
    await updateTeamKpiEvolution(selectedEvolution.id, {
      status: "REJECTED",
      rejectionReason,
    });
    const updated = await listTeamKpiEvolutions();
    setTeamEvols((updated as any)?.data || updated || []);
    setModalOpen(false);
    setRejectionReason("");
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 3,
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        variant="h6"
        fontWeight={600}
        color="#151E3F"
        sx={{ mb: 3 }}
      >
        KPIs de Times
      </Typography>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Time</th>
            <th className="p-2 text-center">Qtde. KPIs</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const tKpis = teamKpis.filter((k) => k.teamId === team.id);
            const isExpanded = expandedTeamId === team.id;

            return (
              <React.Fragment key={team.id}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-2">{team.name}</td>
                  <td className="p-2 text-center">{tKpis.length}</td>
                  <td className="p-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedTeamId(isExpanded ? null : team.id)
                      }
                    >
                      {isExpanded ? "Recolher" : "Ver KPIs"}
                    </Button>
                  </td>
                </tr>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-gray-50"
                    >
                      <td colSpan={3} className="p-3">
                        {tKpis.length > 0 ? (
                          <table className="w-full text-xs border-collapse bg-white rounded-md shadow-sm">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="p-2"></th>
                                <th className="p-2 text-left">KPI</th>
                                <th className="p-2 text-left">Meta</th>
                                <th className="p-2 text-left">Atingido</th>
                                <th className="p-2 text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tKpis.map((kpi) => {
                                const evols = teamEvols.filter(
                                  (e) => e.teamKpiId === kpi.id
                                );
                                const expanded = expandedKpiId === kpi.id;

                                return (
                                  <React.Fragment key={kpi.id}>
                                    <tr className="border-b">
                                      <td className="py-2 px-3">
                                        <span
                                          className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                            !kpi.achievedValue
                                              ? "bg-gray-300"
                                              : rateKPI(
                                                  Number(kpi.achievedValue),
                                                  Number(kpi.goal),
                                                  kpi.kpi?.evaluationType?.code || ""
                                                )
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                          }`}
                                        />
                                      </td>
                                      <td className="p-2">
                                        {kpi.kpi?.name ?? "—"}
                                      </td>
                                      <td className="p-2">{kpi.goal}</td>
                                      <td className="p-2">
                                        {kpi.achievedValue ?? "—"}
                                      </td>
                                      <td className="p-2 text-center">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            setExpandedKpiId(
                                              expanded ? null : kpi.id
                                            )
                                          }
                                        >
                                          {expanded ? "Ocultar" : "Evoluções"}
                                        </Button>
                                      </td>
                                    </tr>

                                    {expanded && (
                                      <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                      >
                                        <td
                                          colSpan={5}
                                          className="p-2 px-4 bg-gray-100"
                                        >
                                          {evols.length > 0 ? (
                                            <table className="w-full text-xs bg-white rounded shadow-sm">
                                              <thead>
                                                <tr className="bg-gray-100 text-left">
                                                  <th className="p-2">
                                                    Valor / Observação
                                                  </th>
                                                  <th className="p-2">Status</th>
                                                  <th className="p-2">Data</th>
                                                  <th className="p-2 text-center">
                                                    Ações
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {evols.map((ev) => (
                                                  <tr
                                                    key={ev.id}
                                                    className="border-t"
                                                  >
                                                    <td className="p-2">
                                                      {
                                                        ev.achievedValueEvolution
                                                      }
                                                    </td>
                                                    <td className="p-2">
                                                      {ev.status}
                                                    </td>
                                                    <td className="p-2">
                                                      {ev.submittedDate
                                                        ? new Date(
                                                            ev.submittedDate
                                                          ).toLocaleDateString()
                                                        : "—"}
                                                    </td>
                                                    <td className="p-2 text-center">
                                                      {ev.status ===
                                                        "SUBMITTED" && (
                                                        <div className="flex gap-2 justify-center">
                                                          <Button
                                                            size="sm"
                                                            onClick={() =>
                                                              handleApprove(ev)
                                                            }
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                          >
                                                            Aprovar
                                                          </Button>
                                                          <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                              handleReject(ev)
                                                            }
                                                          >
                                                            Rejeitar
                                                          </Button>
                                                        </div>
                                                      )}
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
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            Nenhum KPI atribuída.
                          </p>
                        )}
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Modal de rejeição */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Motivo da Rejeição"
        description="Explique o motivo da rejeição desta evolução."
        footer={
          <div className="flex justify-end w-full gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmRejection}>Confirmar</Button>
          </div>
        }
      >
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Descreva o motivo..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[100px]"
        />
      </BaseModal>
    </Paper>
  );
}
