import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useUsers, User } from "@/hooks/user/useUsers";
import { useUserRoles, UserRole } from "@/hooks/user/useUserRoles";


export default function Users() {
  const { listUsers, createUser, updateUser, deleteUser, loading, error } = useUsers();
  const { listUserRoles } = useUserRoles();

  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userRoleId, setUserRoleId] = useState("");

  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("usuario");
  const [message, setMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editUserRoleId, setEditUserRoleId] = useState("");

  // Carregar user roles
  useEffect(() => {
    listUserRoles().then(setUserRoles);
  }, []);

  // Carregar usuários
  useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  // Criar usuário
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newUser = await createUser({
        name,
        email,
        password,
        userRoleId: userRoleId,
        companyId: localStorage.getItem("companyId")!,
      });
      setUsers((prev) => [...prev, newUser]);
      setMessage(`Usuário "${name}" criado com sucesso!`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("usuario");
    } catch {}
  };

  // Abrir modal de edição
  const openEditModal = (user: User) => {
    console.log("Editing user:", user);
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role?.name || "usuario");
    setEditUserRoleId(user.userRoleId);
    setModalOpen(true);
  };

  // Atualizar usuário
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    const updated = await updateUser(selectedUser.id, {
      name: editName,
      email: editEmail,
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

  console.log(users)

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
            <Input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1">Perfil</label>
              <select
                value={userRoleId}
                onChange={(e) => setUserRoleId(e.target.value)}
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

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && (
              <p className="text-emerald-700 text-sm font-medium">{message}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Enviando..." : "Criar Usuário"}
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
                <th className="py-2">Nome</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">Função</th>
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
        title="Editar Usuário"
        description="Atualize as informações do usuário ou exclua o registro."
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
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nome"
          />
          <Input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            placeholder="E-mail"
          />
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
