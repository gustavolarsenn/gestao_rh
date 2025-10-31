import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useUsers, User } from "@/hooks/user/useUsers";
import { useUserRoles, UserRole } from "@/hooks/user/useUserRoles";
import { usePersons, Person } from "@/hooks/person/usePersons";

export default function Users() {
  const { listUsers, createUser, updateUser, deleteUser, loading, error } = useUsers();
  const { listUserRoles } = useUserRoles();
  const { listPersons } = usePersons();

  const [users, setUsers] = useState<User[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Campos de criação
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [userRoleId, setUserRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Modal de edição
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUserRoleId, setEditUserRoleId] = useState("");
  const [editPersonName, setEditPersonName] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    async function fetchData() {
      const [u, p, r] = await Promise.all([
        listUsers(),
        listPersons(),
        listUserRoles(),
      ]);
      setUsers(u);
      setPersons(p);
      setUserRoles(r);
    }
    fetchData();
  }, []);

  // Criar usuário a partir de pessoa existente
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const person = persons.find((p) => p.id === selectedPersonId);
      if (!person) throw new Error("Selecione uma pessoa válida");

      const newUser = await createUser({
        name: person.name,
        email: person.email,
        password,
        userRoleId,
        personId: selectedPersonId,
        companyId: localStorage.getItem("companyId")!,
      });

      setUsers((prev) => [...prev, newUser]);
      setMessage(`Usuário "${person.name}" criado com sucesso!`);
      setSelectedPersonId("");
      setUserRoleId("");
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  // Abrir modal de edição
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUserRoleId(user.userRoleId);
    setEditPersonName(user.name);
    setModalOpen(true);
  };

  // Atualizar usuário (perfil)
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    const updated = await updateUser(selectedUser.id, {
      userRoleId: editUserRoleId,
      companyId: selectedUser.companyId,
    });
    setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
    setModalOpen(false);
  };

  // Excluir usuário
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.id);
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    setModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULÁRIO DE CRIAÇÃO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5"
        >
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">
            Criar novo usuário
          </h1>

          <form onSubmit={handleCreateUser} className="flex flex-col gap-5">
            {/* Pessoa existente */}
            <div>
              <label className="block text-sm font-medium mb-1">Pessoa</label>
              <select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                required
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
              >
                <option value="">Selecione uma pessoa</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Perfil */}
            <div>
              <label className="block text-sm font-medium mb-1">Perfil</label>
              <select
                value={userRoleId}
                onChange={(e) => setUserRoleId(e.target.value)}
                required
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
              >
                <option value="">Selecione</option>
                {userRoles.map((ur) => (
                  <option key={ur.id} value={ur.id}>
                    {ur.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Senha */}
            <Input
              type="password"
              placeholder="Defina uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && (
              <p className="text-emerald-700 text-sm font-medium">{message}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Criando..." : "Criar Usuário"}
            </Button>
          </form>
        </motion.div>

        {/* TABELA DE USUÁRIOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Usuários cadastrados
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Pessoa</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">Perfil</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(user)}
                >
                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.role?.name || "—"}</td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">
                    Editar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL UNIVERSAL */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Editar Usuário: ${editPersonName}`}
        description="Atualize o perfil ou exclua o registro."
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Perfil</label>
            <select
              value={editUserRoleId}
              onChange={(e) => setEditUserRoleId(e.target.value)}
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
            >
              <option value="">Selecione</option>
              {userRoles.map((ur) => (
                <option key={ur.id} value={ur.id}>
                  {ur.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
