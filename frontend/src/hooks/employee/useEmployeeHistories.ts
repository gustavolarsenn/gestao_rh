// src/hooks/employee/useEmployees.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type EmployeeHistory = {
  id: string;
  departmentId: string;
  roleTypeId: string;
  roleId: string;
  teamId?: string;
  branchId: string;
  hiringDate: string;
  departureDate?: string;
  startDate: string;
  endDate?: string;
  wage: number;

  role?: { name: string };
  roleType?: { name: string };
  team?: { name: string };
  department?: { name: string };
  branch?: { name: string };
};

export function useEmployeeHistories() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listEmployeeHistories(params: any): Promise<EmployeeHistory[]> {
    const { data } = await api.get(`/employee-histories?companyId=${companyId}`, { params });
    return data;
  }

  return { listEmployeeHistories, loading, error };
}
