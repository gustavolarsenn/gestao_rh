// src/hooks/role-type/useRoleTypes.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type RoleType = {
  id: string;
  name: string;
  departmentId: string;
  department?: { id: string; name: string };
};

export function useRoleTypes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listRoleTypes(): Promise<RoleType[]> {
    const { data } = await api.get(`/role-types?companyId=${companyId}`);
    return data;
  }

  async function createRoleType(payload: Omit<RoleType, "id">) {
    setLoading(true);
    setError(null);
    try {
      console.log(payload)
      const { data } = await api.post("/role-types", {...payload, companyId});
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar tipo de cargo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateRoleType(id: string, payload: Partial<RoleType>) {
    const { data } = await api.patch(`/role-types/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deleteRoleType(id: string) {
    await api.delete(`/role-types/${id}?companyId=${companyId}`);
  }

  return { listRoleTypes, createRoleType, updateRoleType, deleteRoleType, loading, error };
}