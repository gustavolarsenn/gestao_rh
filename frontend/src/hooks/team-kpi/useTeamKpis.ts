import { useState } from "react";
import { api } from "@/lib/api";

export enum KpiStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type TeamKpi = {
  id: string;
  companyId: string;
  teamId: string;
  kpiId: string;
  evaluationTypeId: string;
  periodStart: string;
  periodEnd: string;
  goal: string;
  achievedValue?: number | string;
  raterEmployeeId?: string;
  status: KpiStatus;
  submittedBy?: string;
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;

  team?: { id: string; name: string };
  kpi?: { id: string; name: string; evaluationType?: { id: string; name: string; code: string } };
};

export function useTeamKpis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  /** 🔹 Listar todos os KPIs de times */
  async function listTeamKpis(params: any): Promise<TeamKpi[]> {
    const { data } = await api.get(`/kpi/team-kpis?companyId=${companyId}`, { params });
    return data;
  }

  /** 🔹 Criar um novo Team KPI */
  async function createTeamKpi(payload: Omit<TeamKpi, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post(`/kpi/team-kpis`, { ...payload, companyId });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar KPI de time.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  /** 🔹 Atualizar um Team KPI existente */
  async function updateTeamKpi(id: string, payload: Partial<TeamKpi>) {
    const { data } = await api.patch(`/kpi/team-kpis/${id}?companyId=${companyId}`, payload);
    return data;
  }

  /** 🔹 Excluir um Team KPI */
  async function deleteTeamKpi(id: string) {
    await api.delete(`/kpi/team-kpis/${id}?companyId=${companyId}`);
  }

  return {
    listTeamKpis,
    createTeamKpi,
    updateTeamKpi,
    deleteTeamKpi,
    loading,
    error,
  };
}
