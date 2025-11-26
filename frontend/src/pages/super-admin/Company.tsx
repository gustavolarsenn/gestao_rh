import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Typography,
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";

import { useCompanies, type Company } from "@/hooks/company/useCompanies";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; stateId: string }[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const { listCompanies, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { listStates } = useStates();
  const { listCities } = useCities();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  const [filterName, setFilterName] = useState("");
  const [filterCnpj, setFilterCnpj] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  useEffect(() => {
    async function load() {
      const all = await listCities();
      setCities(all);
    }
    load();
  }, []);

  const filteredCities = filterState
    ? cities.filter((c) => c.stateId === filterState)
    : cities;

  useEffect(() => {
    async function load() {
      const data = await listStates();
      setStates(data);
    }
    load();
  }, []);

  async function loadCompanies() {
    setLoadingTable(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      name: filterName,
      cnpj: filterCnpj,
      cityId: filterCity,
    }).toString();

    const result = await listCompanies(params);
    setCompanies(result.data);
    setTotal(result.total);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadCompanies();
  }, [page, filterName, filterCnpj, filterCity]);

  // ------------------- CREATE MODAL ------------------
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newZipCode, setNewZipCode] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newAddressNumber, setNewAddressNumber] = useState("");
  const [newStateId, setNewStateId] = useState("");
  const [newCityId, setNewCityId] = useState("");

  const newCities = newStateId
    ? cities.filter((c) => c.stateId === newStateId)
    : [];

  const handleCreate = async () => {
    await createCompany({
      name: newName,
      cnpj: newCnpj,
      zipCode: newZipCode,
      address: newAddress,
      addressNumber: newAddressNumber,
      cityId: newCityId,
    });

    setCreateModalOpen(false);
    loadCompanies();
  };

  // ------------------- EDIT MODAL ------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [editName, setEditName] = useState("");
  const [editCnpj, setEditCnpj] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAddressNumber, setEditAddressNumber] = useState("");

  const [editStateId, setEditStateId] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [editCities, setEditCities] = useState<{ id: string; name: string; stateId: string }[]>([]);

  const openEditModal = async (company: Company) => {
    setSelectedCompany(company);

    setEditName(company.name);
    setEditCnpj(company.cnpj);
    setEditZipCode(company.zipCode);
    setEditAddress(company.address);
    setEditAddressNumber(company.addressNumber);

    const all = await listCities();
    const relatedCity = all.find((c) => c.id === company.cityId);
    const relatedState = relatedCity?.stateId || "";

    setEditStateId(relatedState);
    setEditCities(all.filter((c) => c.stateId === relatedState));
    setEditCityId(company.cityId);

    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    await updateCompany(selectedCompany.id, {
      name: editName,
      cnpj: editCnpj,
      zipCode: editZipCode,
      address: editAddress,
      addressNumber: editAddressNumber,
      cityId: editCityId,
    });

    setEditModalOpen(false);
    loadCompanies();
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    await deleteCompany(selectedCompany.id);
    setEditModalOpen(false);
    loadCompanies();
  };

  useEffect(() => {
    if (!editStateId) return;
    setEditCities(cities.filter((c) => c.stateId === editStateId));
  }, [editStateId, cities]);

  // ------------------- UI ------------------
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Empresas (NOVOTESTE DEPLOY)
        </Typography>

        {/* FILTERS */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: 4,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Filtros
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-end">
            <TextField
              size="small"
              label="Nome"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              sx={{ flex: "1 1 220px" }}
            />

            <TextField
              size="small"
              label="CNPJ"
              value={filterCnpj}
              onChange={(e) => setFilterCnpj(e.target.value)}
              sx={{ flex: "1 1 200px" }}
            />

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterCity("");
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {states.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ flex: "1 1 200px" }}>
              <InputLabel>Cidade</InputLabel>
              <Select
                label="Cidade"
                value={filterCity}
                disabled={!filterState}
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {filteredCities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="large"
              sx={{
                px: 4,
                borderColor: "#1e293b",
                color: "#1e293b",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
              variant="outlined"
              onClick={() => {
                setFilterName("");
                setFilterCnpj("");
                setFilterState("");
                setFilterCity("");
              }}
            >
              Limpar
            </Button>

            <Button
              size="large"
              onClick={() => setCreateModalOpen(true)}
              sx={{
                px: 4,
                ml: "auto",
                backgroundColor: "#1e293b",
                color: "white",
              }}
            >
              Adicionar Empresa
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/5">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/5">CNPJ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/6">CEP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-2/5">Endereço</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/12">Nº</th>
              </tr>
            </thead>

            <tbody>
              {loadingTable && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loadingTable &&
                companies.map((company) => (
                  <tr
                    key={company.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(company)}
                  >
                    <td className="px-4 py-3">{company.name}</td>
                    <td className="px-4 py-3">{company.cnpj}</td>
                    <td className="px-4 py-3">{company.zipCode}</td>
                    <td className="px-4 py-3">{company.address}</td>
                    <td className="px-4 py-3">{company.addressNumber}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* PAGINAÇÃO */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Typography variant="body2">
              Página {page} de {pageCount || 1}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>

              <Button
                variant="outlined"
                size="small"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* CREATE MODAL */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Cadastrar Empresa"
          description="Preencha os dados para cadastrar."
          footer={
            <div className="flex justify-end gap-2">
              <Button 
              variant="outlined" 
              sx={{
                px: 4,
                borderColor: "#1e293b",
                color: "#1e293b",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              }}
              onClick={() => setCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button sx={{ backgroundColor: "#1e293b", color: "white" }} onClick={handleCreate}>
                Criar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField size="small" label="Nome" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <TextField size="small" label="CNPJ" value={newCnpj} onChange={(e) => setNewCnpj(e.target.value)} />
            <TextField size="small" label="CEP" value={newZipCode} onChange={(e) => setNewZipCode(e.target.value)} />
            <TextField size="small" label="Endereço" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
            <TextField size="small" label="Número" value={newAddressNumber} onChange={(e) => setNewAddressNumber(e.target.value)} />

            <Box display="flex" gap={3}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={newStateId}
                  onChange={(e) => {
                    setNewStateId(e.target.value);
                    setNewCityId("");
                  }}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Cidade</InputLabel>
                <Select
                  label="Cidade"
                  value={newCityId}
                  disabled={!newStateId}
                  onChange={(e) => setNewCityId(e.target.value)}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {newCities.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
        </BaseModal>

        {/* EDIT MODAL */}
        <BaseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Empresa"
          description="Atualize os dados."
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outlined" color="error" onClick={handleDelete}>
                Excluir
              </Button>
              <Button sx={{ backgroundColor: "#1e293b", color: "white" }} onClick={handleSave}>
                Salvar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField size="small" label="Nome" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <TextField size="small" label="CNPJ" value={editCnpj} onChange={(e) => setEditCnpj(e.target.value)} />
            <TextField size="small" label="CEP" value={editZipCode} onChange={(e) => setEditZipCode(e.target.value)} />
            <TextField size="small" label="Endereço" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            <TextField size="small" label="Número" value={editAddressNumber} onChange={(e) => setEditAddressNumber(e.target.value)} />

            <Box display="flex" gap={3}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={editStateId}
                  onChange={(e) => {
                    setEditStateId(e.target.value);
                    setEditCityId("");
                  }}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {states.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Cidade</InputLabel>
                <Select
                  label="Cidade"
                  value={editCityId}
                  disabled={!editStateId}
                  onChange={(e) => setEditCityId(e.target.value)}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  {editCities.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
