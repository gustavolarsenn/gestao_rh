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

// IMPORTA FORMATAÇÕES
import { onlyDigits, formatCnpj, formatCep } from "@/utils/format";

// mesmas cores usadas na tela de Filiais / sidebar
const PRIMARY_COLOR = "#0369a1";    // azul mais escuro
const PRIMARY_LIGHT = "#0ea5e9";    // azul claro
const PRIMARY_LIGHT_BG = "#e0f2ff"; // azul clarinho para hover
// borda igual aos cards/sidebar (border-slate-200)
const SECTION_BORDER_COLOR = "#e2e8f0";

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<
    { id: string; name: string; stateId: string }[]
  >([]);
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => {
    document.title = "Empresas";
  }, []);

  const { listCompanies, createCompany, updateCompany, deleteCompany } =
    useCompanies();
  const { listStates } = useStates();
  const { listCities } = useCities();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  const [filterName, setFilterName] = useState("");
  const [filterCnpj, setFilterCnpj] = useState(""); // só dígitos
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
      cnpj: filterCnpj, // já está apenas com dígitos
      cityId: filterCity,
    }).toString();

    const result = await listCompanies(params);
    setCompanies(result.data);
    setTotal(result.total);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterCnpj, filterCity]);

  // ------------------- CREATE MODAL ------------------
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState(""); // só dígitos
  const [newZipCode, setNewZipCode] = useState(""); // só dígitos
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
      cnpj: newCnpj, // limpo
      zipCode: newZipCode, // limpo
      address: newAddress,
      addressNumber: newAddressNumber,
      cityId: newCityId,
    });

    setCreateModalOpen(false);
    setNewName("");
    setNewCnpj("");
    setNewZipCode("");
    setNewAddress("");
    setNewAddressNumber("");
    setNewStateId("");
    setNewCityId("");
    loadCompanies();
  };

  // ------------------- EDIT MODAL ------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [editName, setEditName] = useState("");
  const [editCnpj, setEditCnpj] = useState(""); // só dígitos
  const [editZipCode, setEditZipCode] = useState(""); // só dígitos
  const [editAddress, setEditAddress] = useState("");
  const [editAddressNumber, setEditAddressNumber] = useState("");

  const [editStateId, setEditStateId] = useState("");
  const [editCityId, setEditCityId] = useState("");
  const [editCities, setEditCities] = useState<
    { id: string; name: string; stateId: string }[]
  >([]);

  const openEditModal = async (company: Company) => {
    setSelectedCompany(company);

    setEditName(company.name);
    setEditCnpj(onlyDigits(company.cnpj || "")); // guarda limpo
    setEditZipCode(onlyDigits(company.zipCode || "")); // guarda limpo
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
      cnpj: editCnpj, // limpo
      zipCode: editZipCode, // limpo
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

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Empresas
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
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
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
              value={formatCnpj(filterCnpj)}
              onChange={(e) => {
                const digits = onlyDigits(e.target.value);
                setFilterCnpj(digits);
                setPage(1);
              }}
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
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: PRIMARY_COLOR,
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
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
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              Adicionar Empresa
            </Button>
          </Box>
        </Paper>

        {/* TABELA */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`, // mesma borda
          }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/5">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/5">
                  CNPJ
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/6">
                  CEP
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-2/5">
                  Endereço
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-1/12">
                  Nº
                </th>
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
                    <td className="px-4 py-3">
                      {formatCnpj(company.cnpj || "")}
                    </td>
                    <td className="px-4 py-3">
                      {formatCep(company.zipCode || "")}
                    </td>
                    <td className="px-4 py-3">{company.address}</td>
                    <td className="px-4 py-3">{company.addressNumber}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* PAGINAÇÃO */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
          >
            <Typography variant="body2">
              Página {page} de {pageCount || 1}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>

              <Button
                variant="outlined"
                size="small"
                disabled={page >= pageCount}
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
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
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
                onClick={() => setCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
                onClick={handleCreate}
              >
                Criar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              size="small"
              label="CNPJ"
              value={formatCnpj(newCnpj)}
              onChange={(e) => setNewCnpj(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              label="CEP"
              value={formatCep(newZipCode)}
              onChange={(e) => setNewZipCode(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              label="Endereço"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <TextField
              size="small"
              label="Número"
              value={newAddressNumber}
              onChange={(e) => setNewAddressNumber(e.target.value)}
            />

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
              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              size="small"
              label="CNPJ"
              value={formatCnpj(editCnpj)}
              onChange={(e) => setEditCnpj(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              label="CEP"
              value={formatCep(editZipCode)}
              onChange={(e) => setEditZipCode(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              label="Endereço"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
            />
            <TextField
              size="small"
              label="Número"
              value={editAddressNumber}
              onChange={(e) => setEditAddressNumber(e.target.value)}
            />

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
