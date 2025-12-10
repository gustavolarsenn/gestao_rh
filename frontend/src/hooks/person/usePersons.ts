// src/hooks/person/usePersons.ts
import { useState } from "react";
import { api } from "@/lib/api";

export type Person = {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  address?: string;
  addressNumber?: string;
  zipCode?: string;
  cpf: string;
  cityId: string;
  companyId: string;
  city?: { id: string; name: string; state?: { name: string; uf: string } };
};

export function usePersons() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listPersons(params: any): Promise<Person[]> {
    const { data } = await api.get(`/persons?companyId=${companyId}`, { params });
    return data;
  }

  async function createPerson(payload: Omit<Person, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/persons", {...payload });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar pessoa.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updatePerson(companyId: string, id: string, payload: Partial<Person>) {
    const { data } = await api.patch(`/persons/${id}?companyId=${companyId}`, payload);
    return data;
  }

  async function deletePerson(companyId: string, id: string) {
    await api.delete(`/persons/${id}?companyId=${companyId}`);
  }

  return { listPersons, createPerson, updatePerson, deletePerson, loading, error };
}
