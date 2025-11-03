import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/auth/useAuth";

export type Branch = {
  id: string;
  name: string;
  cnpj: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  cityId: string;
  createdAt?: string;
};

export function useBranches() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function createBranch(data: Omit<Branch, "id" | "createdAt">) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<Branch>("/branches", { ...data, companyId });
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar filial.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function listBranches(): Promise<Branch[]> {
    const { data } = await api.get<Branch[]>("/branches", {
      params: { companyId },
    });
    return data;
  }

  async function updateBranch(id: string, data: Partial<Branch>) {
    const { data: updated } = await api.patch<Branch>(`/branches/${id}`, data);
    return updated;
  }
  async function deleteBranch(id: string) {
    await api.delete(`/branches/${id}`);
  }

  return { createBranch, listBranches, updateBranch, deleteBranch, loading, error };
}
