// src/pages/admin/Roles.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { useRoles, Role } from "@/hooks/role/useRoles";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";

export default function RolesPage() {
  const { listRoles, createRole, updateRole, deleteRole, loading, error } = useRoles();
  const { listDepartments } = useDepartments();
  const { listRoleTypes } = useRoleTypes();

  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [filteredRoleTypes, setFilteredRoleTypes] = useState<RoleType[]>([]);

  // Campos do form
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleTypeId, setRoleTypeId] = useState("");
  const [baseSalary, setBaseSalary] = useState(0);
  const [message, setMessage] = useState("");

  // Modal de edição
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editRoleTypeId, setEditRoleTypeId] = useState("");
  const [editDefaultWage, setEditDefaultWage] = useState(0);

  // Carregar dados iniciais
  useEffect(() => {
    async function fetchData() {
      const [r, d, rt] = await Promise.all([
        listRoles(),
        listDepartments(),
        listRoleTypes(),
      ]);
      setRoles(r);
      setDepartments(d);
      setRoleTypes(rt);
    }
    fetchData();
  }, []);

  // Filtrar tipos de cargo conforme o departamento
  useEffect(() => {
    if (!departmentId) return setFilteredRoleTypes([]);
    setFilteredRoleTypes(roleTypes.filter((rt) => rt.departmentId === departmentId));
  }, [departmentId, roleTypes]);

  // Criar cargo
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newRole = await createRole({
        name,
        departmentId,
        roleTypeId,
        defaultWage: baseSalary,
      });
      setRoles((prev) => [...prev, newRole]);
      setMessage(`Cargo "${name}" criado com sucesso!`);
      setName("");
      setDepartmentId("");
      setRoleTypeId("");
      setBaseSalary(0);
    } catch {}
  };

  // Abrir modal
  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setEditName(role.name);
    setEditDepartmentId(role.departmentId);
    setEditRoleTypeId(role.roleTypeId);
    setEditDefaultWage(role.defaultWage);
    setModalOpen(true);
  };

  // Atualizar
  const handleSave = async () => {
    if (!selectedRole) return;
    const updated = await updateRole(selectedRole.id, {
      name: editName,
      departmentId: editDepartmentId,
      roleTypeId: editRoleTypeId,
      defaultWage: editDefaultWage,
    });
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? updated : r))
    );
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedRole) return;
    await deleteRole(selectedRole.id);
    setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    setModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FORMULÁRIO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5"
        >
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Criar Cargo</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome do Cargo (ex: Engenheiro Sênior)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-1">Departamento</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
                required
              >
                <option value="">Selecione</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Cargo</label>
              <select
                value={roleTypeId}
                onChange={(e) => setRoleTypeId(e.target.value)}
                disabled={!departmentId}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
                required
              >
                <option value="">Selecione</option>
                {filteredRoleTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              type="number"
              step="0.01"
              placeholder="Salário padrão (R$)"
              value={baseSalary}
              onChange={(e) => setBaseSalary(parseFloat(e.target.value))}
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
              {loading ? "Enviando..." : "Criar Cargo"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Cargos Cadastrados
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Departamento</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Salário</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(role)}
                >
                  <td className="py-2">{role.name}</td>
                  <td className="py-2">{role.department?.name || "—"}</td>
                  <td className="py-2">{role.roleType?.name || "—"}</td>
                  <td className="py-2">
                    R$ {Number(role.defaultWage).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">
                    Editar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Cargo"
        description="Atualize as informações ou exclua o registro."
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Nome do Cargo"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <select
              value={editDepartmentId}
              onChange={(e) => setEditDepartmentId(e.target.value)}
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
            >
              <option value="">Selecione</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Cargo</label>
            <select
              value={editRoleTypeId}
              onChange={(e) => setEditRoleTypeId(e.target.value)}
              className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
            >
              <option value="">Selecione</option>
              {roleTypes
                .filter((rt) => rt.departmentId === editDepartmentId)
                .map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            type="number"
            step="0.01"
            value={editDefaultWage}
            onChange={(e) => setEditDefaultWage(parseFloat(e.target.value))}
            placeholder="Salário padrão (R$)"
          />
        </div>
      </BaseModal>
    </div>
  );
}
