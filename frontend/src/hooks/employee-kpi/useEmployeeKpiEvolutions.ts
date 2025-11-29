import { useState } from "react";
import { api } from "@/lib/api";

export enum EmployeeKpiEvolutionStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
}

export type EmployeeKpiEvolution = {
  id: string;
  employeeId?: string;
  employeeKpiId: string;
  achievedValueEvolution: string;
  raterEmployeeId?: string;
  status: EmployeeKpiEvolutionStatus;
  submittedBy?: string;
  submittedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  companyId?: string;
};

export function useEmployeeKpiEvolutions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listEmployeeKpiEvolutions(params: any): Promise<EmployeeKpiEvolution[]> {
    const { data } = await api.get(`kpi/employee-kpi-evolutions?companyId=${companyId}`, { params });
    return data;
  }

  async function listEmployeeKpiEvolutionsEmployee(params: any): Promise<EmployeeKpiEvolution[]> {
    const { data } = await api.get(`kpi/employee-kpi-evolutions/employee?companyId=${companyId}`, { params });
    return data;
  }

  async function createEmployeeKpiEvolution(payload: Omit<EmployeeKpiEvolution, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("kpi/employee-kpi-evolutions", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar evolução de KPI.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateEmployeeKpiEvolution(id: string, payload: Partial<EmployeeKpiEvolution>) {
    const { data } = await api.patch(
      `kpi/employee-kpi-evolutions/${id}?companyId=${companyId}`,
      payload
    );
    return data;
  }

  async function deleteEmployeeKpiEvolution(id: string) {
    await api.delete(`kpi/employee-kpi-evolutions/${id}?companyId=${companyId}`);
  }

  async function approveEmployeeKpiEvolution(id: string) {
    const { data } = await api.post(
      `kpi/employee-kpi-evolutions/${id}/approve?companyId=${companyId}`
    );
    return data;
  }

  async function rejectEmployeeKpiEvolution(id: string, reason?: string) {
    const { data } = await api.post(
      `kpi/employee-kpi-evolutions/${id}/reject?companyId=${companyId}`,
      { reason }
    );
    return data;
  }

  return {
    listEmployeeKpiEvolutions,
    listEmployeeKpiEvolutionsEmployee,
    createEmployeeKpiEvolution,
    updateEmployeeKpiEvolution,
    deleteEmployeeKpiEvolution,
    approveEmployeeKpiEvolution,
    rejectEmployeeKpiEvolution,
    loading,
    error,
  };
}
