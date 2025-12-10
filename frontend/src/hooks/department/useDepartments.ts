// src/hooks/org/useDepartments.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type Department = {
  id: string;
  name: string;
  companyId: string;
};

export function useDepartments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listDepartments(params: any): Promise<Department[]> {
    const { data } = await api.get(`/departments?companyId=${companyId}`, { params });
    return data;
  }

  async function listDistinctDepartments(): Promise<Department[]> {
    const { data } = await api.get(`/departments/distinct?companyId=${companyId}`);
    return data;
  }

  async function createDepartment(dept: Omit<Department, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/departments", { ...dept, companyId });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar departamento.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateDepartment(companyId: string, id: string, dept: Partial<Department>) {
    const { data } = await api.patch(`/departments/${id}?companyId=${companyId}`, dept);
    return data;
  }

  async function deleteDepartment(companyId: string, id: string) {
    await api.delete(`/departments/${id}?companyId=${companyId}`);
  }

  return { listDepartments, listDistinctDepartments, createDepartment, updateDepartment, deleteDepartment, loading, error };
}
