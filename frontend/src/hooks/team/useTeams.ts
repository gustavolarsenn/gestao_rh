// src/hooks/team/useTeams.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type Team = {
  id: string;
  name: string;
  description?: string;
  companyId?: string;
};

export function useTeams() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listTeams(params: any): Promise<Team[]> {
    const { data } = await api.get(`/teams?companyId=${companyId}`, { params });
    return data;
  }

  async function listDistinctTeams(): Promise<Team[]> {
    const { data } = await api.get(`/teams/distinct?companyId=${companyId}`);
    return data;
  }

  async function createTeam(payload: Omit<Team, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/teams", { ...payload, companyId });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar time.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateTeam(companyId: string, id: string, payload: Partial<Team>) {
    const { data } = await api.patch(`/teams/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deleteTeam(companyId: string, id: string) {
    await api.delete(`/teams/${id}?companyId=${companyId}`);
  }

  return { listTeams, listDistinctTeams, createTeam, updateTeam, deleteTeam, loading, error };
}
