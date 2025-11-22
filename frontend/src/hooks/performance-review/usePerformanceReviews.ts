// src/hooks/person/usePersons.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type PerformanceReview = {
  id: string;
  observation?: string;
  employeeId: string;
  leaderId?: string;
  date: string;
  companyId: string;
};

export function usePerformanceReviews() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listPerformanceReviews(params: any): Promise<PerformanceReview[]> {
    const { data } = await api.get(`/performance-reviews?companyId=${companyId}`, { params });
    return data;
  }

  async function createPerformanceReview(payload: Omit<PerformanceReview, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/performance-reviews", {...payload, companyId});
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar Performance Review.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updatePerformanceReview(id: string, payload: Partial<PerformanceReview>) {
    const { data } = await api.patch(`/performance-reviews/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deletePerformanceReview(id: string) {
    await api.delete(`/performance-reviews/${id}?companyId=${companyId}`);
  }

  return { listPerformanceReviews, createPerformanceReview, updatePerformanceReview, deletePerformanceReview, loading, error };
}
