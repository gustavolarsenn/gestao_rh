import { useState } from "react";
import { api } from "@/lib/api";

export type State = {
  id: string;
  name: string;
  uf: string;
  createdAt?: string;
};

export function useStates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createState(data: Omit<State, "id" | "createdAt">) {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<State>("/states", data);
      return response.data;
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Erro ao criar o estado."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function listStates(): Promise<State[]> {
    const { data } = await api.get<State[]>("/states");
    return data;
  }

  return {
    loading,
    error,
    createState,
    listStates,
  };
}
