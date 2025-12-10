import { useState, useEffect, useMemo } from "react";
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
import { useCompanies, type Company } from "@/hooks/company/useCompanies";

// utils de formatação
import {
  onlyDigits,
  formatCpf,
  formatCep,
  formatPhone,
} from "@/utils/format";
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

export default function Persons() {
  const { listPersons, createPerson, updatePerson, deletePerson } =
    usePersons();
  const { listStates } = useStates();
  const { listCities } = useCities();
  const { listCompanies } = useCompanies();

  useEffect(() => {
    document.title = "Pessoas";
  }, []);

  const [persons, setPersons] = useState<Person[]>([]);
  const [states, setStates] = useState<
    { id: string; name: string; uf: string }[]
  >([]);
  const [cities, setCities] = useState<
    { id: string; name: string; stateId: string }[]
  >([]);
  const [loadingTable, setLoadingTable] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [editCompanyId, setEditCompanyId] = useState("");
  // ================================
  // PAGINATION
  // ================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  // ================================
  // FILTERS
  // ================================
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterCpf, setFilterCpf] = useState(""); // só dígitos
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const filteredCities = filterState
    ? cities.filter((c) => c.stateId === filterState)
    : cities;

  // filtros que realmente vão para o backend (com debounce)
  const [debouncedFilters, setDebouncedFilters] = useState({
    name: "",
    email: "",
    cpf: "",
    cityId: "",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        name: filterName,
        email: filterEmail,
        cpf: filterCpf,
        cityId: filterCity,
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [filterName, filterEmail, filterCpf, filterCity]);

  // ================================
  // LOAD STATES, CITIES, COMPANIES (once)
  // ================================
  useEffect(() => {
    async function loadStaticData() {
      const [s, c, compRes] = await Promise.all([
        listStates(),
        listCities(),
        listCompanies(),
      ]);

      setStates(s);
      setCities(c);

      const list = (compRes as any)?.data ?? compRes ?? [];
      setCompanies(list);
    }

    loadStaticData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================
  // MAPAS DE CIDADE / ESTADO (para evitar vários finds)
  // ================================
  const cityMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; stateId: string }> =
      {};
    cities.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [cities]);

  const stateMap = useMemo(() => {
    const map: Record<string, { id: string; name: string; uf: string }> = {};
    states.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [states]);

  // ================================
  // LOAD PERSONS (backend pagination)
  // ================================
  async function loadPersons() {
    setLoadingTable(true);

    const params = {
      page,
      limit,
      name: debouncedFilters.name || undefined,
      email: debouncedFilters.email || undefined,
      cpf: debouncedFilters.cpf || undefined, // já limpo
      cityId: debouncedFilters.cityId || undefined,
    };

    const result = await listPersons(params);

    setTotal(result.total);
    setPersons(result.data);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadPersons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedFilters]);

  // ================================
  // CREATE MODAL
  // ================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState(""); // só dígitos
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [zipCode, setZipCode] = useState(""); // só dígitos
  const [cpf, setCpf] = useState(""); // só dígitos
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");

  const newCities = stateId
    ? cities.filter((c) => c.stateId === stateId)
    : [];

  const handleCreate = async () => {
    if (!selectedCompanyId) return;

    await createPerson({
      name,
      email,
      birthDate,
      phone, // limpo
      address,
      addressNumber,
      zipCode, // limpo
      cpf, // limpo
      cityId,
      companyId: selectedCompanyId,
    } as any);

    setCreateModalOpen(false);

    // limpa formulário
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
    setSelectedCompanyId("");

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
  const [editCities, setEditCities] = useState<
    { id: string; name: string; stateId: string }[]
  >([]);

  const openEditModal = async (p: Person) => {
    setSelectedPerson(p);

    setEditData({
      name: p.name,
      email: p.email,
      cpf: onlyDigits(p.cpf || ""),
      birthDate: p.birthDate || "",
      phone: onlyDigits(p.phone || ""),
      address: p.address || "",
      addressNumber: p.addressNumber || "",
      zipCode: onlyDigits(p.zipCode || ""),
      cityId: p.cityId,
      companyId: (p as any).companyId,
    });

    const related = cityMap[p.cityId];
    const state = related?.stateId || "";

    setEditStateId(state);
    setEditCities(cities.filter((c) => c.stateId === state));
    setEditCompanyId(((p as any).companyId as string) || "");

    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedPerson) return;

    await updatePerson(selectedPerson.companyId, selectedPerson.id, {
      ...editData,
      cpf: (editData.cpf as string) || "",
      zipCode: (editData.zipCode as string) || "",
      phone: (editData.phone as string) || "",
      companyId: editCompanyId || (editData as any).companyId,
    } as any);

    setEditModalOpen(false);
    loadPersons();
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;

    await deletePerson(selectedPerson.companyId, selectedPerson.id);

    setEditModalOpen(false);
    loadPersons();
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          align="center"
          sx={{
            mb: 4,
            mt: { xs: 2, md: 0 },
            fontSize: { xs: "1.5rem", md: "2.125rem" },
          }}
        >
          Pessoas
        </Typography>

        {/* FILTERS */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            mb={3}
            sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            Filtros
          </Typography>

          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            sx={{
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "flex-end" },
            }}
          >
            <TextField
              size="small"
              fullWidth
              label="Nome"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              sx={{
                flex: {
                  md: "1 1 220px",
                },
              }}
            />

            <TextField
              size="small"
              fullWidth
              label="Email"
              value={filterEmail}
              onChange={(e) => {
                setFilterEmail(e.target.value);
                setPage(1);
              }}
              sx={{
                flex: {
                  md: "1 1 220px",
                },
              }}
            />

            <TextField
              size="small"
              fullWidth
              label="CPF"
              value={formatCpf(filterCpf)}
              onChange={(e) => {
                setFilterCpf(onlyDigits(e.target.value));
                setPage(1);
              }}
              sx={{
                flex: {
                  md: "1 1 200px",
                },
              }}
            />

            <FormControl
              size="small"
              fullWidth
              sx={{
                flex: {
                  md: "1 1 200px",
                },
              }}
            >
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

            <FormControl
              size="small"
              fullWidth
              sx={{
                flex: {
                  md: "1 1 200px",
                },
              }}
              disabled={!filterState}
            >
              <InputLabel>Cidade</InputLabel>
              <Select
                label="Cidade"
                value={filterCity}
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

            {/* Botões */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", md: "row" },
                gap: 1.5,
                width: { xs: "100%", md: "auto" },
                mt: { xs: 1, md: 0 },
                ml: { md: "auto" },
              }}
            >
              <Button
                size="large"
                variant="outlined"
                sx={{
                  px: 4,
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", md: "auto" },
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
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
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", md: "auto" },
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
              >
                Cadastrar Pessoa
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    E-mail
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    CPF
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Nascimento
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Telefone
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Endereço
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Nº
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    CEP
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Cidade
                  </th>
                </tr>
              </thead>

              <tbody>
                {loadingTable ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-6 text-center text-gray-500"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : persons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-6 text-center text-gray-500"
                    >
                      Nenhuma pessoa encontrada.
                    </td>
                  </tr>
                ) : (
                  persons.map((p) => {
                    const city = cityMap[p.cityId];
                    const state = city ? stateMap[city.stateId] : undefined;

                    return (
                      <tr
                        key={p.id}
                        className="border-b hover:bg-gray-100 cursor-pointer transition"
                        onClick={() => openEditModal(p)}
                      >
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.name}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.email}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {formatCpf(p.cpf || "")}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.birthDate ? p.birthDate : "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.phone ? formatPhone(p.phone) : "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.address || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.addressNumber || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {p.zipCode ? formatCep(p.zipCode) : "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {state?.name || "-"}
                        </td>
                        <td className="px-3 md:px-4 py-2 md:py-3">
                          {city?.name || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>

          {/* PAGINATION */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mt={3}
            sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}
          >
            <Typography variant="body2">
              Página {page} de {pageCount}
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
          title="Cadastrar Pessoa"
          description="Preencha os dados para cadastrar."
          footer={
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
              <Button
                variant="outlined"
                sx={{
                  px: 4,
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  textTransform: "none",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
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
                  ...primaryButtonSx,
                  width: { xs: "100%", sm: "auto" },
                }}
                disabled={
                  !name ||
                  !email ||
                  !cpf ||
                  !cityId ||
                  !birthDate ||
                  !selectedCompanyId
                }
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              size="small"
              label="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              size="small"
              label="CPF"
              value={formatCpf(cpf)}
              onChange={(e) => setCpf(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              type="date"
              label="Nascimento"
              InputLabelProps={{ shrink: true }}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <TextField
              size="small"
              label="Telefone"
              value={formatPhone(phone)}
              onChange={(e) => setPhone(onlyDigits(e.target.value))}
            />
            <TextField
              size="small"
              label="Endereço"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
              size="small"
              label="Número"
              value={addressNumber}
              onChange={(e) => setAddressNumber(e.target.value)}
            />
            <TextField
              size="small"
              label="CEP"
              value={formatCep(zipCode)}
              onChange={(e) => setZipCode(onlyDigits(e.target.value))}
            />

            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
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

              <FormControl
                size="small"
                sx={{ flex: 1 }}
                disabled={!stateId}
              >
                <InputLabel>Cidade</InputLabel>
                <Select
                  label="Cidade"
                  value={cityId}
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

            <FormControl size="small">
              <InputLabel>Empresa</InputLabel>
              <Select
                label="Empresa"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </BaseModal>

        {/* EDIT MODAL */}
        <BaseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Pessoa"
          description="Atualize ou remova o registro."
          footer={
            <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Excluir
              </Button>
              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  width: { xs: "100%", sm: "auto" },
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
              value={editData.name || ""}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
            />
            <TextField
              size="small"
              label="E-mail"
              value={editData.email || ""}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
            />
            <TextField
              size="small"
              label="CPF"
              value={formatCpf((editData.cpf as string) || "")}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  cpf: onlyDigits(e.target.value),
                })
              }
            />

            <TextField
              size="small"
              type="date"
              label="Nascimento"
              InputLabelProps={{ shrink: true }}
              value={editData.birthDate || ""}
              onChange={(e) =>
                setEditData({ ...editData, birthDate: e.target.value })
              }
            />

            <TextField
              size="small"
              label="Telefone"
              value={formatPhone((editData.phone as string) || "")}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  phone: onlyDigits(e.target.value),
                })
              }
            />

            <TextField
              size="small"
              label="Endereço"
              value={editData.address || ""}
              onChange={(e) =>
                setEditData({ ...editData, address: e.target.value })
              }
            />

            <TextField
              size="small"
              label="Número"
              value={editData.addressNumber || ""}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  addressNumber: e.target.value,
                })
              }
            />

            <TextField
              size="small"
              label="CEP"
              value={formatCep((editData.zipCode as string) || "")}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  zipCode: onlyDigits(e.target.value),
                })
              }
            />

            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
            >
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={editStateId}
                  onChange={(e) => {
                    const newStateId = e.target.value;
                    setEditStateId(newStateId);
                    setEditCities(
                      cities.filter((c) => c.stateId === newStateId)
                    );
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

              <FormControl
                size="small"
                sx={{ flex: 1 }}
                disabled={!editStateId}
              >
                <InputLabel>Cidade</InputLabel>
                <Select
                  label="Cidade"
                  value={(editData.cityId as string) || ""}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      cityId: e.target.value,
                    })
                  }
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

            <FormControl size="small">
              <InputLabel>Empresa</InputLabel>
              <Select
                label="Empresa"
                value={editCompanyId}
                onChange={(e) => setEditCompanyId(e.target.value)}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
