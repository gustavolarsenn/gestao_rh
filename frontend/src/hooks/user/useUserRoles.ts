import { useState } from "react";
import { api } from "@/lib/api";

export type UserRole = {
  id: string;
  name: string;
  description: string;
  level: number;
};

export function useUserRoles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function listUserRoles(): Promise<UserRole[]> {
    const { data } = await api.get(`/user-roles`);
    return data;
  }

  return { listUserRoles, loading, error };
}
