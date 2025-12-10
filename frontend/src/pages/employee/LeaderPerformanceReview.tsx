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

import {
  usePerformanceReviews,
  PerformanceReview,
} from "@/hooks/performance-review/usePerformanceReviews";

import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

export default function LeaderPerformanceReview() {
  const {
    listPerformanceReviewsLeader,
    createPerformanceReviewLeader,
    updatePerformanceReview,
    deletePerformanceReview,
    loading,
    error,
  } = usePerformanceReviews();

  useEffect(() => {
    document.title = "Feedback ao Gestor";
  }, []);

  // ======================================================
  // DATA
  // ======================================================
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [message, setMessage] = useState("");

  // ======================================================
  // PAGINATION + FILTERS (backend)
  // ======================================================
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const pageCount = Math.ceil(total / limit) || 1;

  const [filterLeaderId, setFilterLeaderId] = useState("");
  const [filterEmployeeId, setFilterEmployeeId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterText, setFilterText] = useState("");

  const [loadingTable, setLoadingTable] = useState(false);

  async function loadReviews() {
    setLoadingTable(true);

    const res = await listPerformanceReviewsLeader({
      page,
      limit,
      // aqui no futuro você pode passar os filtros
    });

    const data = ((res as any)?.data ?? res ?? []) as PerformanceReview[];

    const totalItems =
      (res as any)?.total ??
      (res as any)?.meta?.total ??
      (res as any)?.meta?.totalItems ??
      data.length;

    setReviews(data);
    setTotal(totalItems);

    setLoadingTable(false);
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ======================================================
  // CREATE MODAL
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [createLeaderId, setCreateLeaderId] = useState("");
  const [createEmployeeId, setCreateEmployeeId] = useState("");
  const [createDate, setCreateDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [createObservation, setCreateObservation] = useState("");

  const handleCreate = async () => {
    setMessage("");

    const companyId = localStorage.getItem("companyId")!;

    await createPerformanceReviewLeader({
      date: createDate,
      observation: createObservation,
      companyId,
    });

    setCreateModalOpen(false);
    setPage(1);
    loadReviews();

    setMessage("Feedback ao gestor criado com sucesso!");
    setCreateLeaderId("");
    setCreateEmployeeId("");
    setCreateDate(new Date().toISOString().slice(0, 10));
    setCreateObservation("");
  };

  // ======================================================
  // EDIT MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] =
    useState<PerformanceReview | null>(null);

  const [editLeaderId, setEditLeaderId] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editObservation, setEditObservation] = useState("");

  const openEditModal = (review: PerformanceReview) => {
    setSelectedReview(review);
    setEditLeaderId(review.leaderId || "");
    setEditEmployeeId(review.employeeId || "");
    setEditDate(review.date.slice(0, 10));
    setEditObservation(review.observation || "");
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedReview) return;

    await updatePerformanceReview(selectedReview.id, {
      leaderId: editLeaderId,
      employeeId: editEmployeeId,
      date: editDate,
      observation: editObservation,
    });

    setEditModalOpen(false);
    loadReviews();
    setMessage("Feedback atualizado com sucesso!");
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    await deletePerformanceReview(selectedReview.id);
    setEditModalOpen(false);
    loadReviews();
    setMessage("Feedback removido com sucesso!");
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
        {/* TITLE */}
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
          Feedback ao Gestor
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
              label="Buscar por texto"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setPage(1);
              }}
              fullWidth
              sx={{ flex: { md: "2 1 240px" } }}
            />

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
                  setFilterText("");
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
                Novo Feedback
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
                    Data
                  </th>
                  <th className="text-left px-3 md:px-4 py-2 md:py-3 font-semibold text-gray-700">
                    Observação
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
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-gray-500">
                      Nenhum feedback encontrado.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr
                      key={review.id}
                      className="border-b hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => openEditModal(review)}
                    >
                      <td className="px-3 md:px-4 py-2 md:py-3">
                        {review.date
                          ? new Date(review.date).toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-slate-700">
                        {review.observation || "—"}
                      </td>
                    </tr>
                  ))
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
                onClick={() => setPage((p) => p - 1)}
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
        title="Novo Feedback ao Gestor"
        description="Preencha os dados do feedback ao gestor."
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 w-full">
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              sx={{
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
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              sx={{
                ...primaryButtonSx,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Criar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            size="small"
            type="date"
            label="Data"
            InputLabelProps={{ shrink: true }}
            value={createDate}
            onChange={(e) => setCreateDate(e.target.value)}
          />

          <TextField
            size="small"
            label="Observação"
            multiline
            minRows={3}
            value={createObservation}
            onChange={(e) => setCreateObservation(e.target.value)}
          />
        </div>
      </BaseModal>

      {/* EDIT MODAL */}
      <BaseModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Feedback"
        description="Atualize as informações ou exclua o registro."
        footer={
          <div className="flex flex-col sm:flex-row justify-between w-full gap-2">
            <Button
              color="error"
              variant="outlined"
              onClick={handleDelete}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Excluir
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                width: { xs: "100%", sm: "auto" },
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
            type="date"
            label="Data"
            InputLabelProps={{ shrink: true }}
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <TextField
            size="small"
            label="Observação"
            multiline
            minRows={3}
            value={editObservation}
            onChange={(e) => setEditObservation(e.target.value)}
          />
        </div>
      </BaseModal>
    </div>
  );
}
