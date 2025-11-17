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

import { usePersons, Person } from "@/hooks/person/usePersons";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";

export default function Persons() {
  const { listPersons, createPerson, updatePerson, deletePerson } = usePersons();
  const { listStates } = useStates();
  const { listCities } = useCities();

  const [persons, setPersons] = useState<Person[]>([]);
  const [states, setStates] = useState<{ id: string; name: string; uf: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; stateId: string }[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  // ================================
  // PAGINATION
  // ================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  // ================================
  // FILTERS
  // ================================
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterCpf, setFilterCpf] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const filteredCities = filterState
    ? cities.filter((c) => c.stateId === filterState)
    : cities;

  // ================================
  // LOAD STATES & CITIES (once)
  // ================================
  useEffect(() => {
    async function loadGeo() {
      const [s, c] = await Promise.all([listStates(), listCities()]);
      setStates(s);
      setCities(c);
    }
    loadGeo();
  }, []);

  // ================================
  // LOAD PERSONS (backend pagination)
  // ================================
  async function loadPersons() {
    setLoadingTable(true);

    const params = {
      page,
      limit,
      name: filterName || undefined,
      email: filterEmail || undefined,
      cpf: filterCpf || undefined,
      cityId: filterCity || undefined,
    };

    const result = await listPersons(params);

    setTotal(result.total);
    setPersons(result.data);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadPersons();
  }, [page, filterName, filterEmail, filterCpf, filterState, filterCity]);

  // ================================
  // CREATE MODAL
  // ================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

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

  const newCities = stateId
    ? cities.filter((c) => c.stateId === stateId)
    : [];

  const handleCreate = async () => {
    await createPerson({
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

    setCreateModalOpen(false);

    // reload page 1
    setPage(1);
    loadPersons();
  };

  // ================================
  // EDIT MODAL
  // ================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const [editData, setEditData] = useState<Partial<Person>>({});
  const [editStateId, setEditStateId] = useState("");
  const [editCities, setEditCities] = useState<{ id: string; name: string; stateId: string }[]>([]);

  const openEditModal = async (p: Person) => {
    setSelectedPerson(p);

    setEditData({
      name: p.name,
      email: p.email,
      cpf: p.cpf,
      birthDate: p.birthDate || "",
      phone: p.phone || "",
      address: p.address || "",
      addressNumber: p.addressNumber || "",
      zipCode: p.zipCode || "",
      cityId: p.cityId,
    });

    const related = cities.find((c) => c.id === p.cityId);
    const state = related?.stateId || "";

    setEditStateId(state);
    setEditCities(cities.filter((c) => c.stateId === state));

    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedPerson) return;

    await updatePerson(selectedPerson.id, editData);

    setEditModalOpen(false);
    loadPersons();
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;

    await deletePerson(selectedPerson.id);

    setEditModalOpen(false);

    // reload
    loadPersons();
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">

        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Pessoas
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
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 220px" }}
            />

            <TextField
              size="small"
              label="Email"
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 220px" }}
            />

            <TextField
              size="small"
              label="CPF"
              value={filterCpf}
              onChange={(e) => {
                setFilterCpf(e.target.value);
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
                  setPage(1);
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
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setPage(1);
                }}
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
              variant="outlined"
              sx={{
                px: 4,
                borderColor: "#1e293b",
                color: "#1e293b",
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => {
                setFilterName("");
                setFilterEmail("");
                setFilterCpf("");
                setFilterState("");
                setFilterCity("");
                setPage(1);
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
              Cadastrar Pessoa
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">E-mail</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">CPF</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nascimento</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Telefone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Endereço</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nº</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">CEP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Cidade</th>
              </tr>
            </thead>

            <tbody>
              {loadingTable && (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loadingTable &&
                persons.map((p) => {
                  const city = cities.find((c) => c.id === p.cityId);
                  const state = states.find((s) => s.id === city?.stateId);

                  return (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(p)}
                    >
                      <td className="px-4 py-3">{p.name}</td>
                      <td className="px-4 py-3">{p.email}</td>
                      <td className="px-4 py-3">{p.cpf}</td>
                      <td className="px-4 py-3">{p.birthDate ? p.birthDate : "-"}</td>
                      <td className="px-4 py-3">{p.phone || "-"}</td>
                      <td className="px-4 py-3">{p.address || "-"}</td>
                      <td className="px-4 py-3">{p.addressNumber || "-"}</td>
                      <td className="px-4 py-3">{p.zipCode || "-"}</td>
                      <td className="px-4 py-3">{state?.name || "-"}</td>
                      <td className="px-4 py-3">{city?.name || "-"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          {/* PAGINATION */}
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
          title="Cadastrar Pessoa"
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
                }}
                onClick={() => setCreateModalOpen(false)}
              >
                Cancelar
              </Button>

              <Button sx={{ backgroundColor: "#1e293b", color: "white" }} onClick={handleCreate}>
                Criar
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField size="small" label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField size="small" label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField size="small" label="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
            <TextField size="small" type="date" label="Nascimento" InputLabelProps={{ shrink: true }}
              value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <TextField size="small" label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextField size="small" label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
            <TextField size="small" label="Número" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            <TextField size="small" label="CEP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />

            <Box display="flex" gap={3}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={stateId}
                  onChange={(e) => {
                    setStateId(e.target.value);
                    setCityId("");
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
                  value={cityId}
                  disabled={!stateId}
                  onChange={(e) => setCityId(e.target.value)}
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
          title="Editar Pessoa"
          description="Atualize ou remova o registro."
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
            <TextField
              size="small"
              label="Nome"
              value={editData.name || ""}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            <TextField
              size="small"
              label="E-mail"
              value={editData.email || ""}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <TextField
              size="small"
              label="CPF"
              value={editData.cpf || ""}
              onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
            />

            <TextField
              size="small"
              type="date"
              label="Nascimento"
              InputLabelProps={{ shrink: true }}
              value={editData.birthDate || ""}
              onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
            />

            <TextField
              size="small"
              label="Telefone"
              value={editData.phone || ""}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <TextField
              size="small"
              label="Endereço"
              value={editData.address || ""}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            />

            <TextField
              size="small"
              label="Número"
              value={editData.addressNumber || ""}
              onChange={(e) => setEditData({ ...editData, addressNumber: e.target.value })}
            />

            <TextField
              size="small"
              label="CEP"
              value={editData.zipCode || ""}
              onChange={(e) => setEditData({ ...editData, zipCode: e.target.value })}
            />

            <Box display="flex" gap={3}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={editStateId}
                  onChange={(e) => {
                    setEditStateId(e.target.value);
                    setEditCities(cities.filter((c) => c.stateId === e.target.value));
                    setEditData({ ...editData, cityId: "" });
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
                  value={editData.cityId || ""}
                  disabled={!editStateId}
                  onChange={(e) => setEditData({ ...editData, cityId: e.target.value })}
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
