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

import { useBranches, type Branch } from "@/hooks/branch/useBranches";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";

// utils de formatação
import { onlyDigits, formatCnpj, formatCep } from "@/utils/format";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function Branch() {
  const { createBranch, listBranches, updateBranch, deleteBranch, loading, error } =
    useBranches();
  const { listStates } = useStates();
  const { listCities } = useCities();

  useEffect(() => {
    document.title = "Filiais";
  }, []);
  // ======================================================
  // DATA
  // ======================================================
  const [branches, setBranches] = useState<Branch[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [allCities, setAllCities] = useState<any[]>([]);

  const [message, setMessage] = useState("");

  // ======================================================
  // BACKEND PAGINATION & FILTERS
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  const [filterName, setFilterName] = useState("");
  const [filterCnpj, setFilterCnpj] = useState(""); // só dígitos
  const [filterStateId, setFilterStateId] = useState("");
  const [filterCityId, setFilterCityId] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);

  async function loadBranches() {
    setLoadingTable(true);

    const result = await listBranches({
      page,
      limit,
      name: filterName || undefined,
      cnpj: filterCnpj || undefined, // já limpo
      stateId: filterStateId || undefined,
      cityId: filterCityId || undefined,
    });

    setBranches(result.data);
    setTotal(result.total);

    setLoadingTable(false);
  }

  // cidades derivadas para filtro
  const filterCities = filterStateId
    ? allCities.filter((c) => c.stateId === filterStateId)
    : [];

  useEffect(() => {
    async function loadStatic() {
      const [st, ct] = await Promise.all([listStates(), listCities()]);
      setStates(st || []);
      setAllCities(ct || []);
    }
    loadStatic();
  }, []);

  useEffect(() => {
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName, filterCnpj, filterStateId, filterCityId]);

  // ======================================================
  // CREATE BRANCH MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [branchName, setBranchName] = useState("");
  const [cnpj, setCnpj] = useState("");       // só dígitos
  const [zipCode, setZipCode] = useState(""); // só dígitos
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [stateId, setStateId] = useState("");
  const [cityId, setCityId] = useState("");

  const createCities = stateId
    ? allCities.filter((c) => c.stateId === stateId)
    : [];

  const handleCreateBranch = async () => {
    setMessage("");

    await createBranch({
      name: branchName,
      cnpj,      // limpo
      zipCode,   // limpo
      address,
      addressNumber,
      cityId,
    });

    setPage(1);
    loadBranches();

    setMessage(`Filial "${branchName}" criada com sucesso!`);

    setBranchName("");
    setCnpj("");
    setZipCode("");
    setAddress("");
    setAddressNumber("");
    setStateId("");
    setCityId("");
    setCreateModalOpen(false);
  };

  // ======================================================
  // EDIT BRANCH MODAL
  // ======================================================
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCnpj, setEditCnpj] = useState("");       // só dígitos
  const [editZipCode, setEditZipCode] = useState(""); // só dígitos
  const [editAddress, setEditAddress] = useState("");
  const [editAddressNumber, setEditAddressNumber] = useState("");
  const [editStateId, setEditStateId] = useState("");
  const [editCityId, setEditCityId] = useState("");

  const editCities = editStateId
    ? allCities.filter((c) => c.stateId === editStateId)
    : [];

  const openEditModal = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditName(branch.name);
    setEditCnpj(onlyDigits(branch.cnpj || ""));
    setEditZipCode(onlyDigits(branch.zipCode || ""));
    setEditAddress(branch.address);
    setEditAddressNumber(branch.addressNumber);

    const city = allCities.find((c) => c.id === branch.cityId);
    const branchStateId = city?.stateId || "";
    setEditStateId(branchStateId);
    setEditCityId(branch.cityId);

    setEditModalOpen(true);
  };

  const handleSaveBranch = async () => {
    if (!selectedBranch) return;

    const updated = await updateBranch(selectedBranch.id, {
      name: editName,
      cnpj: editCnpj,          // limpo
      zipCode: editZipCode,    // limpo
      address: editAddress,
      addressNumber: editAddressNumber,
      cityId: editCityId,
    });

    setBranches((prev) =>
      prev.map((b) => (b.id === selectedBranch.id ? updated : b))
    );
    setEditModalOpen(false);
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;

    await deleteBranch(selectedBranch.id);
    setBranches((prev) => prev.filter((b) => b.id !== selectedBranch.id));
    setEditModalOpen(false);
    loadBranches();
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* TITLE */}
        <Typography variant="h4" fontWeight={700} color="#1e293b" sx={{ mb: 4 }}>
          Filiais
        </Typography>

        {message && (
          <Typography variant="body2" sx={{ mb: 2 }} color="success.main">
            {message}
          </Typography>
        )}

        {error && (
          <Typography variant="body2" sx={{ mb: 2 }} color="error.main">
            {error}
          </Typography>
        )}

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
            border: `1px solid ${SECTION_BORDER_COLOR}`, // igual aos cards/sidebar
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
              sx={{ flex: "1 1 200px" }}
            />

            <TextField
              size="small"
              label="CNPJ"
              value={formatCnpj(filterCnpj)}
              onChange={(e) => {
                setFilterCnpj(onlyDigits(e.target.value));
                setPage(1);
              }}
              sx={{ flex: "1 1 200px" }}
            />

            <FormControl size="small" sx={{ flex: "1 1 160px" }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={filterStateId}
                onChange={(e) => {
                  setFilterStateId(e.target.value);
                  setFilterCityId("");
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
              sx={{ flex: "1 1 160px" }}
              disabled={!filterStateId}
            >
              <InputLabel>Cidade</InputLabel>
              <Select
                label="Cidade"
                value={filterCityId}
                onChange={(e) => {
                  setFilterCityId(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">Todas</MenuItem>
                {filterCities.map((c) => (
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
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: PRIMARY_COLOR,
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
              onClick={() => {
                setFilterName("");
                setFilterCnpj("");
                setFilterStateId("");
                setFilterCityId("");
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
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              Criar Filial
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`, // igual aos cards/sidebar
          }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Nome
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  CNPJ
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-gray-500">
                    Nenhuma filial encontrada.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(branch)}
                  >
                    <td className="px-4 py-3">{branch.name}</td>
                    <td className="px-4 py-3">
                      {formatCnpj(branch.cnpj || "")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={3}
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
      </main>

      {/* CREATE BRANCH MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Filial"
        description="Preencha os dados da nova filial."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateBranch}
              disabled={
                !branchName ||
                !cnpj ||
                !zipCode ||
                !address ||
                !addressNumber ||
                !stateId ||
                !cityId
              }
              sx={primaryButtonSx}
            >
              Criar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            size="small"
            label="Nome da Filial"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
          />
          <TextField
            size="small"
            label="CNPJ"
            value={formatCnpj(cnpj)}
            onChange={(e) => setCnpj(onlyDigits(e.target.value))}
          />
          <TextField
            size="small"
            label="CEP"
            value={formatCep(zipCode)}
            onChange={(e) => setZipCode(onlyDigits(e.target.value))}
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

          <Box display="flex" gap={2}>
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
                {createCities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </div>
      </BaseModal>

      {/* EDIT BRANCH MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Filial"
        description="Atualize as informações da filial ou exclua o registro."
        footer={
          <div className="flex justify-between w-full">
            <Button color="error" variant="outlined" onClick={handleDeleteBranch}>
              Excluir
            </Button>
            <Button
              onClick={handleSaveBranch}
              disabled={loading}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            size="small"
            label="Nome da Filial"
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

          <Box display="flex" gap={2}>
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

            <FormControl
              size="small"
              sx={{ flex: 1 }}
              disabled={!editStateId}
            >
              <InputLabel>Cidade</InputLabel>
              <Select
                label="Cidade"
                value={editCityId}
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
    </div>
  );
}
