import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { useBranches, type Branch } from "@/hooks/branch/useBranches";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";
import { BaseModal } from "@/components/modals/BaseModal";

export default function Branch() {
  // Campos de criação
  const [branchName, setBranchName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [message, setMessage] = useState("");

  const { createBranch, listBranches, updateBranch, deleteBranch, loading, error } =
    useBranches();
  const { listStates } = useStates();
  const { listCities } = useCities();

  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modal
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCnpj, setEditCnpj] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAddressNumber, setEditAddressNumber] = useState("");
  const [editStateId, setEditStateId] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [editCities, setEditCities] = useState<{ id: string; name: string }[]>([]);

  // Carregar estados e filiais
  useEffect(() => {
    async function fetchData() {
      const [st, br] = await Promise.all([listStates(), listBranches()]);
      setStates(st);
      setBranches(br);
    }
    fetchData();
  }, []);

  // Carregar cidades no formulário
  useEffect(() => {
    if (!stateId) return;
    async function fetchCities() {
      const data = await listCities();
      setCities(data.filter((c) => c.stateId === stateId));
    }
    fetchCities();
  }, [stateId]);

  // Criar filial
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const newBranch = await createBranch({
        name: branchName,
        cnpj,
        zipCode,
        address,
        addressNumber,
        cityId,
      });
      setBranches((prev) => [...prev, newBranch]);
      setMessage(`Filial "${branchName}" criada com sucesso!`);
      setBranchName("");
      setCnpj("");
      setZipCode("");
      setAddress("");
      setAddressNumber("");
      setStateId("");
      setCityId("");
    } catch {}
  };

  // Abrir modal de edição
  const openEditModal = async (branch: Branch) => {
    setSelectedBranch(branch);
    setEditName(branch.name);
    setEditCnpj(branch.cnpj);
    setEditZipCode(branch.zipCode);
    setEditAddress(branch.address);
    setEditAddressNumber(branch.addressNumber);

    const data = await listCities();
    const branchStateId = data.find((c) => c.id === branch.cityId)?.stateId || "";
    setEditStateId(branchStateId);
    setEditCities(data.filter((c) => c.stateId === branchStateId));
    setEditCityId(branch.cityId);
    setModalOpen(true);
  };

  // Salvar edição
  const handleSaveBranch = async () => {
    if (!selectedBranch) return;
    const updated = await updateBranch(selectedBranch.id, {
      name: editName,
      cnpj: editCnpj,
      zipCode: editZipCode,
      address: editAddress,
      addressNumber: editAddressNumber,
      cityId: editCityId,
    });
    setBranches((prev) =>
      prev.map((b) => (b.id === selectedBranch.id ? updated : b))
    );
    setModalOpen(false);
  };

  // Excluir
  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    await deleteBranch(selectedBranch.id);
    setBranches((prev) => prev.filter((b) => b.id !== selectedBranch.id));
    setModalOpen(false);
  };

  // Atualizar cidades no modal
  useEffect(() => {
    if (!editStateId || !modalOpen) return;
    async function fetchCities() {
      const data = await listCities();
      setEditCities(data.filter((c) => c.stateId === editStateId));
    }
    fetchCities();
  }, [editStateId, modalOpen]);

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
            Criar nova filial
          </h1>

          <form onSubmit={handleCreateBranch} className="flex flex-col gap-5">
            <Input
              type="text"
              placeholder="Nome da Filial"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="CEP"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Endereço"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Número"
              value={addressNumber}
              onChange={(e) => setAddressNumber(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#151E3F]/80 mb-1">
                  Estado
                </label>
                <select
                  value={stateId}
                  onChange={(e) => setStateId(e.target.value)}
                  className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
                  required
                >
                  <option value="">Selecione</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#151E3F]/80 mb-1">
                  Cidade
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  disabled={!stateId}
                  className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
                  required
                >
                  <option value="">Selecione</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
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
              {loading ? "Enviando..." : "Criar Filial"}
            </Button>
          </form>
        </motion.div>

        {/* TABELA DE FILIAIS */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-[#151E3F]">
            Filiais cadastradas
          </h2>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Nome</th>
                <th className="py-2">CNPJ</th>
                <th className="py-2 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEditModal(branch)}
                >
                  <td className="py-2">{branch.name}</td>
                  <td className="py-2">{branch.cnpj}</td>
                  <td className="py-2 text-center text-[#C16E70] font-medium">
                    Editar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL UNIVERSAL (BaseModal) */}
      <BaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Editar Filial"
        description="Atualize as informações da filial ou exclua o registro."
        footer={
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={handleDeleteBranch}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
            <Button onClick={handleSaveBranch} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nome da Filial" />
          <Input value={editCnpj} onChange={(e) => setEditCnpj(e.target.value)} placeholder="CNPJ" />
          <Input value={editZipCode} onChange={(e) => setEditZipCode(e.target.value)} placeholder="CEP" />
          <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Endereço" />
          <Input value={editAddressNumber} onChange={(e) => setEditAddressNumber(e.target.value)} placeholder="Número" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                value={editStateId}
                onChange={(e) => setEditStateId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
              >
                <option value="">Selecione</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <select
                value={editCityId}
                onChange={(e) => setEditCityId(e.target.value)}
                className="w-full border border-[#232c33] rounded-md px-3 py-2 text-sm focus:ring-[#C16E70]"
              >
                <option value="">Selecione</option>
                {editCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
