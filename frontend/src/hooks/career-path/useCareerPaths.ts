// src/hooks/career-path/useCareerPaths.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type CareerPath = {
  id: string;
  companyId: string;
  departmentId: string;
  currentRoleId: string;
  nextRoleId: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isEntryPoint: boolean;

  department?: { id: string; name: string };
  currentRole?: { id: string; name: string };
  nextRole?: { id: string; name: string };
};

export function useCareerPaths() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listCareerPaths(params?: {
    departmentId?: string;
    currentRoleId?: string;
  }): Promise<CareerPath[]> {
    const { data } = await api.get(
      `/career-paths?companyId=${companyId}`,
      { params }
    );
    return data;
  }

  async function createCareerPath(payload: Omit<CareerPath, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/career-paths", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Erro ao criar career path."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateCareerPath(
    id: string,
    payload: Partial<CareerPath>
  ) {
    const { data } = await api.patch(
      `/career-paths/${id}?companyId=${companyId}`,
      payload
    );
    return data;
  }

  async function deleteCareerPath(id: string) {
    await api.delete(`/career-paths/${id}?companyId=${companyId}`);
  }

  return {
    listCareerPaths,
    createCareerPath,
    updateCareerPath,
    deleteCareerPath,
    loading,
    error,
  };
}
