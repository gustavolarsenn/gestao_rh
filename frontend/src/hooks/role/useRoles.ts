// src/hooks/role/useRoles.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type Role = {
  id: string;
  name: string;
  defaultWage: number;
  departmentId: string;
  roleTypeId: string;
  department?: { id: string; name: string };
  roleType?: { id: string; name: string };
};

export function useRoles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listRoles(params: any): Promise<Role[]> {
    const { data } = await api.get(`/roles?companyId=${companyId}`, { params });
    return data;
  }

  async function listDistinctRoles(): Promise<Role[]> {
    const { data } = await api.get(`/roles/distinct?companyId=${companyId}`);
    return data;
  }

  async function createRole(payload: Omit<Role, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/roles", {...payload, companyId});
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar cargo.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(id: string, payload: Partial<Role>) {
    const { data } = await api.patch(`/roles/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deleteRole(id: string) {
    await api.delete(`/roles/${id}?companyId=${companyId}`);
  }

  return { listRoles, listDistinctRoles, createRole, updateRole, deleteRole, loading, error };
}
