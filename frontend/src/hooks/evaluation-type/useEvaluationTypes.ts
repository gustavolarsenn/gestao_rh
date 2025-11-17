import { useState } from "react";
import { api } from "@/lib/api";

export enum EvaluationCode {
  HIGHER_BETTER_SUM = 'HIGHER_BETTER_SUM',
  LOWER_BETTER_SUM = 'LOWER_BETTER_SUM',
  HIGHER_BETTER_PCT = 'HIGHER_BETTER_PCT',
  LOWER_BETTER_PCT = 'LOWER_BETTER_PCT',
  BINARY = 'BINARY',
}

export type EvaluationType = {
  id: string;
  companyId: string;
  departmentId: string;
  name: string;
  code: EvaluationCode;
  description?: string;

  department?: { id: string; name: string };
};

export function useEvaluationTypes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listEvaluationTypes(params: any): Promise<EvaluationType[]> {
    const { data } = await api.get(`kpi/evaluation-types?companyId=${companyId}`, { params });
    return data;
  }

  async function listDistinctEvaluationTypes(): Promise<EvaluationType[]> {
    const { data } = await api.get(`kpi/evaluation-types/distinct?companyId=${companyId}`);
    return data;
  }

  async function createEvaluationType(payload: Omit<EvaluationType, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("kpi/evaluation-types", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar tipo de métrica.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateEvaluationType(id: string, payload: Partial<EvaluationType>) {
    const { data } = await api.patch(
      `kpi/evaluation-types/${id}?companyId=${companyId}`,
      payload
    );
    return data;
  }

  async function deleteEvaluationType(id: string) {
    await api.delete(`kpi/evaluation-types/${id}?companyId=${companyId}`);
  }

  return {
    listEvaluationTypes,
    listDistinctEvaluationTypes,
    createEvaluationType,
    updateEvaluationType,
    deleteEvaluationType,
    loading,
    error,
  };
}
