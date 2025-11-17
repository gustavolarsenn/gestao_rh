import { useState } from "react";
import { api } from "@/lib/api";

export type Company = {
  id: string;
  name: string;
  cnpj: string;
  zipCode: string;
  address: string;
  addressNumber: string;
  cityId: string;
  createdAt?: string;
};

export type PaginatedCompaniesResponse = {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
};

export function useCompanies() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCompany(data: Omit<Company, "id" | "createdAt">) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<Company>("/companies", data);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar a empresa.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function listCompanies(queryString?: string): Promise<PaginatedCompaniesResponse> {
    const url = queryString ? `/companies?${queryString}` : "/companies";

    const { data } = await api.get<PaginatedCompaniesResponse>(url);
    return data;
  }

  async function updateCompany(id: string, data: Partial<Company>) {
    const { data: updated } = await api.patch<Company>(`/companies/${id}`, data);
    return updated;
  }

  async function deleteCompany(id: string) {
    await api.delete(`/companies/${id}`);
  }

  return {
    loading,
    error,
    createCompany,
    listCompanies,
    updateCompany,
    deleteCompany,
  };
}
