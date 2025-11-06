// src/hooks/employee/useEmployees.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type Employee = {
  id: string;
  personId: string;
  departmentId: string;
  roleTypeId: string;
  roleId: string;
  teamId?: string;
  branchId: string;
  hiringDate: string;
  departureDate?: string;
  wage: number;

  person?: { name: string; email: string };
  role?: { name: string };
  roleType?: { name: string };
  team?: { name: string };
  department?: { name: string };
  branch?: { name: string };
};

export function useEmployees() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listEmployees(): Promise<Employee[]> {
    const { data } = await api.get(`/employees?companyId=${companyId}`);
    return data;
  }

  async function createEmployee(payload: Omit<Employee, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/employees", {...payload, companyId});
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar funcionário.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateEmployee(id: string, payload: Partial<Employee>) {
    const { data } = await api.patch(`/employees/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deleteEmployee(id: string) {
    await api.delete(`/employees/${id}?companyId=${companyId}`);
  }

  return { listEmployees, createEmployee, updateEmployee, deleteEmployee, loading, error };
}
