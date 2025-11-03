import { useState } from "react";
import { api } from "@/lib/api";

export enum KpiStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type EmployeeKpi = {
  id: string;
  companyId: string;
  employeeId: string;
  teamId: string;
  kpiId: string;
  evaluationTypeId: string;
  periodStart: string;
  periodEnd: string;
  goal: string;
  achievedValue?: number;
  raterEmployeeId?: string;
  status: KpiStatus;
  submittedBy: string;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;

  employee?: { id: string; person?: { name: string } };
  kpi?: { id: string; name: string; unit?: string, evaluationType?: { id: string; name: string } };
};

export function useEmployeeKpis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listEmployeeKpis(): Promise<EmployeeKpi[]> {
    const { data } = await api.get(`kpi/employee-kpis?companyId=${companyId}`);
    return data;
  }

  async function createEmployeeKpi(payload: Omit<EmployeeKpi, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("kpi/employee-kpis", {
        ...payload,
        companyId,
      });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao designar KPI.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateEmployeeKpi(id: string, payload: Partial<EmployeeKpi>) {
    const { data } = await api.patch(
      `kpi/employee-kpis/${id}?companyId=${companyId}`,
      payload
    );
    return data;
  }

  async function deleteEmployeeKpi(id: string) {
    await api.delete(`kpi/employee-kpis/${id}?companyId=${companyId}`);
  }

  return {
    listEmployeeKpis,
    createEmployeeKpi,
    updateEmployeeKpi,
    deleteEmployeeKpi,
    loading,
    error,
  };
}
