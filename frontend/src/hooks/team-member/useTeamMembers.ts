import { useState } from "react";
import { api } from "@/lib/api";

export type TeamMember = {
  id: string;
  companyId: string;
  teamId: string;
  employeeId: string;
  parentTeamId?: string;
  isLeader: boolean;
  startDate: string;
  endDate?: string | null;

  employee?: { id: string; person?: { name: string } };
  team?: { id: string; name: string };
  parentTeam?: { id: string; name: string };
};

export function useTeamMembers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listTeamMembers(teamId?: string): Promise<TeamMember[]> {
    const url = teamId
      ? `/team-members?companyId=${companyId}&teamId=${teamId}`
      : `/team-members?companyId=${companyId}`;
    const { data } = await api.get(url);
    return data;
  }

  async function createTeamMember(payload: Omit<TeamMember, "id">) {
    setLoading(true);
    setError(null);
    try {
      console.log("Criando TeamMember:", payload);
      const { data } = await api.post("/team-members", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar membro do time.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTeamMember(id: string, payload: Partial<TeamMember>) {
    const { data } = await api.patch(
      `/team-members/${id}?companyId=${companyId}`,
      payload
    );
    return data;
  }

  async function deleteTeamMember(id: string) {
    await api.delete(`/team-members/${id}?companyId=${companyId}`);
  }

  return {
    listTeamMembers,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    loading,
    error,
  };
}
