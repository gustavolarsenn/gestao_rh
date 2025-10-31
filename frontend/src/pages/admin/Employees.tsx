// src/pages/admin/Employees.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";

import { useEmployees, Employee } from "@/hooks/employee/useEmployees";
import { usePersons } from "@/hooks/person/usePersons";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useRoleTypes } from "@/hooks/role-type/useRoleTypes";
import { useRoles } from "@/hooks/role/useRoles";
import { useTeams } from "@/hooks/team/useTeams";
import { useBranches } from "@/hooks/branch/useBranches";

export default function EmployeesPage() {
  const { listEmployees, createEmployee, updateEmployee, deleteEmployee, loading, error } = useEmployees();
  const { listPersons } = usePersons();
  const { listDepartments } = useDepartments();
  const { listRoleTypes } = useRoleTypes();
  const { listRoles } = useRoles();
  const { listTeams } = useTeams();
  const { listBranches } = useBranches();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [filteredRoles, setFilteredRoles] = useState<any[]>([]);
  const [filteredRoleTypes, setFilteredRoleTypes] = useState<any[]>([]);

  // Campos do form
  const [personId, setPersonId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [roleTypeId, setRoleTypeId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [hiringDate, setHiringDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [wage, setWage] = useState("");
  const [message, setMessage] = useState("");

  // Modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  // Carregar dados iniciais
  useEffect(() => {
    async function fetchData() {
      const [e, p, d, rt, r, t, b] = await Promise.all([
        listEmployees(),
        listPersons(),
        listDepartments(),
        listRoleTypes(),
        listRoles(),
        listTeams(),
        listBranches(),
      ]);
      setEmployees(e);
      setPersons(p);
      setDepartments(d);
      setRoleTypes(rt);
      setRoles(r);
      setTeams(t);
      setBranches(b);
    }
    fetchData();
  }, []);

  // Filtrar roleTypes e roles conforme departamento
  useEffect(() => {
    if (!departmentId) {
      setFilteredRoleTypes([]);
      setFilteredRoles([]);
      return;
    }
    setFilteredRoleTypes(roleTypes.filter((rt) => rt.departmentId === departmentId));
    setFilteredRoles(roles.filter((r) => r.departmentId === departmentId));
  }, [departmentId, roleTypes, roles]);

  // Criar funcionário
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newEmployee = await createEmployee({
        personId,
        departmentId,
        roleTypeId,
        roleId,
        teamId: teamId || undefined,
        branchId,
        hiringDate,
        departureDate: departureDate || "",
        wage: parseFloat(wage),
      });
      setEmployees((prev) => [...prev, newEmployee]);
      setMessage("Funcionário criado com sucesso!");
      setPersonId("");
      setDepartmentId("");
      setRoleTypeId("");
      setRoleId("");
      setTeamId("");
      setBranchId("");
      setHiringDate("");
      setDepartureDate("");
      setWage("");
    } catch {}
  };

  // Abrir modal
  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditData(employee);
    setModalOpen(true);
  };

  // Atualizar
  const handleSave = async () => {
    if (!selectedEmployee) return;
    const updated = await updateEmployee(selectedEmployee.id, editData);
    setEmployees((prev) =>
      prev.map((e) => (e.id === selectedEmployee.id ? updated : e))
    );
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedEmployee) return;
    await deleteEmployee(selectedEmployee.id);
    setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee.id));
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
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Cadastrar Funcionário</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <label className="text-sm font-medium">Pessoa</label>
            <select value={personId} onChange={(e) => setPersonId(e.target.value)} required
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <label className="text-sm font-medium">Departamento</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <label className="text-sm font-medium">Tipo de Cargo</label>
            <select value={roleTypeId} onChange={(e) => setRoleTypeId(e.target.value)} required
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {filteredRoleTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>

            <label className="text-sm font-medium">Cargo</label>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {filteredRoles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <label className="text-sm font-medium">Time</label>
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)}
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>

            <label className="text-sm font-medium">Filial</label>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required
              className="border border-[#232c33] rounded-md px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <Input type="date" value={hiringDate} onChange={(e) => setHiringDate(e.target.value)} required />
            <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            <Input type="number" step="0.01" value={wage} onChange={(e) => setWage(e.target.value)} placeholder="Salário (R$)" required />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}

            <Button type="submit" disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition">
              {loading ? "Enviando..." : "Cadastrar Funcionário"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">Funcionários Cadastrados</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">Cargo</th>
                <th className="py-2">Departamento</th>
                <th className="py-2">Salário</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(emp)}>
                  <td className="py-2">{emp.person?.name}</td>
                  <td className="py-2">{emp.role?.name}</td>
                  <td className="py-2">{emp.department?.name}</td>
                  <td className="py-2">R$ {Number(emp.wage).toFixed(2).replace(".", ",")}</td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">Editar</td>
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
        title="Editar Funcionário"
        description="Atualize as informações ou exclua o registro."
        footer={
          <div className="flex justify-between w-full">
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
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
            type="number"
            step="0.01"
            value={editData.wage ?? ""}
            onChange={(e) => setEditData({ ...editData, wage: parseFloat(e.target.value) })}
            placeholder="Salário"
          />
          <Input
            type="date"
            value={editData.departureDate ?? ""}
            onChange={(e) => setEditData({ ...editData, departureDate: e.target.value })}
            placeholder="Data de demissão"
          />
        </div>
      </BaseModal>
    </div>
  );
}
