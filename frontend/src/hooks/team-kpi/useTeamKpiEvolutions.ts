import { useState } from "react";
import { api } from "@/lib/api";

export enum TeamKpiEvolutionStatus {
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type TeamKpiEvolution = {
  id: string;
  companyId: string;
  teamKpiId: string;
  achievedValueEvolution: string;
  raterEmployeeId?: string;
  status: TeamKpiEvolutionStatus;
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
};

export function useTeamKpiEvolutions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listTeamKpiEvolutions(params: any): Promise<TeamKpiEvolution[]> {
    const { data } = await api.get(`/kpi/team-kpi-evolutions?companyId=${companyId}`, { params });
    return data;
  }

  async function updateTeamKpiEvolution(id: string, payload: Partial<TeamKpiEvolution>) {
    const { data } = await api.patch(`/kpi/team-kpi-evolutions/${id}?companyId=${companyId}`, payload);
    return data;
  }

  return { listTeamKpiEvolutions, updateTeamKpiEvolution, loading, error };
}
