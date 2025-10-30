import { useState } from "react";
import { api } from "@/lib/api";
import { State } from "./useStates";

export type City = {
  id: string;
  name: string;
  stateId: string;
  createdAt?: string;
};

export function useCities() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCity(data: Omit<City, "id" | "createdAt">) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<City>("/cities", data);
      return response.data;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Erro ao criar a cidade."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function listCities(): Promise<City[]> {
    const { data } = await api.get<City[]>("/cities");
    return data;
  }

  return {
    loading,
    error,
    createCity,
    listCities,
  };
}
