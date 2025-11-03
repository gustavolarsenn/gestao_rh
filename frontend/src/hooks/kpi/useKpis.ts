import { useState } from "react";
import { api } from "@/lib/api";

export type Kpi = {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  departmentId: string;
  evaluationTypeId: string;
  unit: string;

  department?: { id: string; name: string };
  evaluationType?: { id: string; name: string };
};

export function useKpis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listKpis(): Promise<Kpi[]> {
    const { data } = await api.get(`kpi/kpis?companyId=${companyId}`);
    return data;
  }

  async function createKpi(payload: Omit<Kpi, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("kpi/kpis", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar KPI.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateKpi(id: string, payload: Partial<Kpi>) {
    const { data } = await api.patch(`kpi/kpis/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deleteKpi(id: string) {
    await api.delete(`kpi/kpis/${id}?companyId=${companyId}`);
  }

  return { listKpis, createKpi, updateKpi, deleteKpi, loading, error };
}
