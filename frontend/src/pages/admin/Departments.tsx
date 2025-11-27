// src/pages/admin/Department.tsx
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Typography, Paper, Box, TextField, Button } from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

export default function DepartmentPage() {
  const {
    listDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  // PAGINAÇÃO
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit);

  // FILTRO
  const [filterName, setFilterName] = useState("");

  // LOAD DEPARTMENTS
  async function loadDepartments() {
    setLoadingTable(true);

    const result = await listDepartments({
      page,
      limit,
      name: filterName || undefined,
    });

    setDepartments(result.data);
    setTotal(result.total);
    setLoadingTable(false);
  }

  useEffect(() => {
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterName]);

  // CREATE MODAL
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    await createDepartment({
      name,
      companyId: localStorage.getItem("companyId")!,
    });

    setCreateModalOpen(false);
    setName("");
    setPage(1);
    loadDepartments();
  };

  // EDIT MODAL
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [editName, setEditName] = useState("");

  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setEditName(dept.name);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDept) return;

    await updateDepartment(selectedDept.id, { name: editName });
    setEditModalOpen(false);
    loadDepartments();
  };

  const handleDelete = async () => {
    if (!selectedDept) return;

    await deleteDepartment(selectedDept.id);
    setEditModalOpen(false);
    loadDepartments();
  };

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          sx={{ mb: 4 }}
        >
          Departamentos
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

          <Box display="flex" gap={3} alignItems="flex-end">
            <TextField
              label="Nome"
              size="small"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              sx={{ flex: "1 1 200px" }}
              inputProps={{ "data-testid": "filter-name-input" }}
            />

            <Button
              size="large"
              variant="outlined"
              onClick={() => {
                setFilterName("");
                setPage(1);
              }}
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
              data-testid="clear-filter-btn"
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
              data-testid="open-create-modal-btn"
            >
              Criar Departamento
            </Button>
          </Box>
        </Paper>

        {/* TABELA */}
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">
                  Nome
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingTable && (
                <tr data-testid="loading-row">
                  <td colSpan={1} className="py-6 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              )}

              {!loadingTable && departments.length === 0 && (
                <tr data-testid="empty-row">
                  <td colSpan={1} className="py-6 text-center text-gray-500">
                    Nenhum departamento encontrado.
                  </td>
                </tr>
              )}

              {!loadingTable &&
                departments.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b hover:bg-gray-100 cursor-pointer transition"
                    onClick={() => openEditModal(d)}
                    data-testid="department-row"
                  >
                    <td className="px-4 py-3">{d.name}</td>
                  </tr>
                ))}
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
              Página {page} de {pageCount || 1}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                data-testid="prev-page-btn"
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
              >
                Anterior
              </Button>

              <Button
                variant="outlined"
                size="small"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => p + 1)}
                data-testid="next-page-btn"
                sx={{
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
              >
                Próxima
              </Button>
            </Box>
          </Box>
        </Paper>
      </main>

      {/* CREATE MODAL */}
      <BaseModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar Departamento"
        description="Preencha os dados para cadastrar."
        data-testid="create-department-modal"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
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
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              sx={primaryButtonSx}
              data-testid="save-create-btn"
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
            inputProps={{ "data-testid": "department-name-input" }}
          />
        </div>
      </BaseModal>

      {/* EDIT MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Departamento"
        description="Atualize ou remova."
        data-testid="edit-department-modal"
        footer={
          <div className="flex justify-between w-full">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDelete}
            >
              Excluir
            </Button>
            <Button
              onClick={handleSave}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT,
                },
              }}
              data-testid="save-edit-btn"
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
            inputProps={{ "data-testid": "department-edit-name-input" }}
          />
        </div>
      </BaseModal>
    </div>
  );
}
