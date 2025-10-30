import { useState } from "react";
import { api } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  userRoleId: string;
  companyId: string;
  role?: { id: string; name: string };
};

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const companyId = localStorage.getItem("companyId");

  async function listUsers(): Promise<User[]> {
    const { data } = await api.get(`/users?companyId=${companyId}`);
    return data;
  }

  async function createUser(user: Omit<User, "id">) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/users", { ...user, companyId });
      return data;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar usuário.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(id: string, user: Partial<User>) {
    const { data } = await api.patch(`/users/${id}?companyId=${companyId}`, user);
    return data;
  }

  async function deleteUser(id: string) {
    await api.delete(`/users/${id}?companyId=${companyId}`);
  }

  return { listUsers, createUser, updateUser, deleteUser, loading, error };
}
