// src/pages/admin/Persons.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { BaseModal } from "@/components/modals/BaseModal";
import { usePersons, Person } from "@/hooks/person/usePersons";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";

export default function Persons() {
  const { listPersons, createPerson, updatePerson, deletePerson, loading, error } =
    usePersons();
  const { listStates } = useStates();
  const { listCities } = useCities();

  const [persons, setPersons] = useState<Person[]>([]);
  const [states, setStates] = useState<{ id: string; name: string; uf: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; stateId: string }[]>([]);
  const [filteredCities, setFilteredCities] = useState<{ id: string; name: string }[]>([]);

  // Campos do form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cpf, setCpf] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [message, setMessage] = useState("");

  // Modal de edição
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<Person>>({});

  // Carregar dados iniciais
  useEffect(() => {
    async function fetchData() {
      const [p, s, c] = await Promise.all([listPersons(), listStates(), listCities()]);
      setPersons(p);
      setStates(s);
      setCities(c);
    }
    fetchData();
  }, []);

  // Filtrar cidades conforme estado
  useEffect(() => {
    if (!stateId) return setFilteredCities([]);
    setFilteredCities(cities.filter((c) => c.stateId === stateId));
  }, [stateId, cities]);

  // Criar pessoa
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const newPerson = await createPerson({
        name,
        email,
        birthDate,
        phone,
        address,
        addressNumber,
        zipCode,
        cpf,
        cityId,
      });
      setPersons((prev) => [...prev, newPerson]);
      setMessage(`Pessoa "${name}" criada com sucesso!`);
      setName("");
      setEmail("");
      setBirthDate("");
      setPhone("");
      setAddress("");
      setAddressNumber("");
      setZipCode("");
      setCpf("");
      setStateId("");
      setCityId("");
    } catch {}
  };

  // Abrir modal
  const openEditModal = (person: Person) => {
    setSelectedPerson(person);
    setEditData({
      name: person.name,
      email: person.email,
      birthDate: person.birthDate || "",
      phone: person.phone || "",
      address: person.address || "",
      addressNumber: person.addressNumber || "",
      zipCode: person.zipCode || "",
      cpf: person.cpf,
      cityId: person.cityId,
    });
    setModalOpen(true);
  };

  // Atualizar
  const handleSave = async () => {
    if (!selectedPerson) return;
    const updated = await updatePerson(selectedPerson.id, editData);
    setPersons((prev) =>
      prev.map((p) => (p.id === selectedPerson.id ? updated : p))
    );
    setModalOpen(false);
  };

  // Excluir
  const handleDelete = async () => {
    if (!selectedPerson) return;
    await deletePerson(selectedPerson.id);
    setPersons((prev) => prev.filter((p) => p.id !== selectedPerson.id));
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
          <h1 className="text-3xl font-bold text-[#151E3F] mb-4">Cadastrar Pessoa</h1>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <Input placeholder="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input placeholder="Número" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            <Input placeholder="CEP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            <Input placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />

            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecione</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.uf})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm"
                disabled={!stateId}
              >
                <option value="">Selecione</option>
                {filteredCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#232c33] hover:bg-[#3f4755] text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Enviando..." : "Cadastrar Pessoa"}
            </Button>
          </form>
        </motion.div>

        {/* LISTAGEM */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">Pessoas Cadastradas</h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">E-mail</th>
                <th className="py-2">CPF</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr
                  key={p.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(p)}
                >
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{p.email}</td>
                  <td className="py-2">{p.cpf}</td>
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
        title="Editar Pessoa"
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
            value={editData.name || ""}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Nome"
          />
          <Input
            value={editData.email || ""}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            placeholder="E-mail"
          />
          <Input
            value={editData.cpf || ""}
            onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
            placeholder="CPF"
          />
          <Input
            type="date"
            value={editData.birthDate || ""}
            onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
          />
          <Input
            value={editData.phone || ""}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            placeholder="Telefone"
          />
          <Input
            value={editData.address || ""}
            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            placeholder="Endereço"
          />
          <Input
            value={editData.addressNumber || ""}
            onChange={(e) => setEditData({ ...editData, addressNumber: e.target.value })}
            placeholder="Número"
          />
          <Input
            value={editData.zipCode || ""}
            onChange={(e) => setEditData({ ...editData, zipCode: e.target.value })}
            placeholder="CEP"
          />
        </div>
      </BaseModal>
    </div>
  );
}
