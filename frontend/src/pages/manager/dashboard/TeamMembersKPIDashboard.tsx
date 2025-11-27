import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
} from "@mui/material";

import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";

import { BaseModal } from "@/components/modals/BaseModal";

import { useTeamMembers } from "@/hooks/team-member/useTeamMembers";
import { useEmployeeKpis } from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployeeKpiEvolutions } from "@/hooks/employee-kpi/useEmployeeKpiEvolutions";
import {
  usePerformanceReviews,
  PerformanceReview,
} from "@/hooks/performance-review/usePerformanceReviews";

import {
  eachDayOfInterval,
  format,
  subMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addDays,
  startOfWeek,
  isSameMonth,
  parseISO,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// =====================================
// 🎨 FUNÇÕES DE COR
// =====================================
function colorByProgress(achieved: number, goal: number): string {
  if (!goal) return "#BDBDBD";
  const pct = (achieved / goal) * 100;
  if (pct < 50) return "#FF6B6B";
  if (pct < 90) return "#FFC260";
  return "#6FCF97";
}

function getHeatColor(count: number): string {
  if (count === 0) return "#e5e7eb";
  if (count === 1) return "#FFCC80";
  if (count === 2) return "#81C784";
  if (count >= 3) return "#388E3C";
  return "#e0e0e0";
}

export default function TeamMembersKpiDashboard() {
  const { listTeamMembers } = useTeamMembers();
  const { listEmployeeKpis } = useEmployeeKpis();
  const { listEmployeeKpiEvolutions } = useEmployeeKpiEvolutions();
  const {
    listPerformanceReviews,
    createPerformanceReview,
  } = usePerformanceReviews();

  // =====================================
  // 🔥 STATE
  // =====================================
  const [members, setMembers] = useState<any[]>([]);
  const [employeeKpis, setEmployeeKpis] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // performance reviews (paginadas)
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize] = useState(5);
  const [reviewTotal, setReviewTotal] = useState(0);

  // modal de nova review
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState("");
  const [reviewObservation, setReviewObservation] = useState("");

  // =====================================
  // 🔍 FILTROS
  // =====================================
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterKpi, setFilterKpi] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [selectedEmployeeKpiId, setSelectedEmployeeKpiId] =
    useState<string | null>(null);

  // =====================================
  // 🔥 LOAD INITIAL DATA (considerando paginação)
  // =====================================
  useEffect(() => {
    async function load() {
      setLoading(true);

      // Team members (paginado)
      const mResult = await listTeamMembers();
      const m = (mResult as any)?.data ?? mResult ?? [];
      setMembers(m);

      const memberEmployeeIds = new Set(
        m.map((tm: any) => tm.employeeId).filter(Boolean)
      );

      // Employee KPIs (paginado) -> só dos membros do time
      const ekResult = await listEmployeeKpis({ page: 1, limit: 999 });
      const ekAll = (ekResult as any)?.data ?? ekResult ?? [];
      const ek = ekAll.filter((k: any) => memberEmployeeIds.has(k.employeeId));
      setEmployeeKpis(ek);

      // Evoluções (paginado) -> só das KPIs acima
      const evResult = await listEmployeeKpiEvolutions({
        page: 1,
        limit: 999,
      });
      const evAll = (evResult as any)?.data ?? evResult ?? [];
      const employeeKpiIds = new Set(ek.map((k: any) => k.id));
      const ev = evAll.filter((e: any) => employeeKpiIds.has(e.employeeKpiId));
      setEvolutions(ev);

      if (ek.length) setSelectedEmployeeKpiId(ek[0].id);

      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================
  // 📌 CARREGAR PERFORMANCE REVIEWS PAGINADAS
  // =====================================
  async function fetchPerformanceReviews(employeeId: string, page: number) {
    try {
      setLoadingReviews(true);
      const res = await listPerformanceReviews({
        employeeId,
        page,
        limit: reviewPageSize,
      });

      const data = ((res as any)?.data ?? res ?? []) as PerformanceReview[];

      // tenta achar total em formatos comuns (total, meta.total, meta.totalItems...)
      const total =
        (res as any)?.total ??
        (res as any)?.meta?.total ??
        (res as any)?.meta?.totalItems ??
        data.length;

      // garante ordenação decrescente por data, caso o backend não faça
      const ordered = data.slice().sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPerformanceReviews(ordered);
      setReviewTotal(total);
    } finally {
      setLoadingReviews(false);
    }
  }

  // sempre que mudar funcionário, resetar para página 1
  useEffect(() => {
    if (!filterEmployee) {
      setPerformanceReviews([]);
      setReviewTotal(0);
      setReviewPage(1);
      return;
    }
    setReviewPage(1);
  }, [filterEmployee]);

  // busca a página atual quando mudar funcionário OU página
  useEffect(() => {
    if (!filterEmployee) return;
    fetchPerformanceReviews(filterEmployee, reviewPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmployee, reviewPage]);

  const totalReviewPages = Math.max(
    1,
    Math.ceil(reviewTotal / reviewPageSize || 1)
  );

  // =====================================
  // 📌 FILTRAR EMPLOYEE KPIS
  // =====================================
  const filteredEmployeeKpis = useMemo(() => {
    return employeeKpis.filter((k) => {
      if (filterEmployee && k.employeeId !== filterEmployee) return false;
      if (filterType && k.kpi?.evaluationType?.code !== filterType) return false;
      if (filterKpi && k.id !== filterKpi) return false;

      if (filterStart && k.periodEnd) {
        const end = parseISO(k.periodEnd);
        const start = parseISO(filterStart);
        if (isBefore(end, start)) return false;
      }
      if (filterEnd && k.periodStart) {
        const start = parseISO(k.periodStart);
        const end = parseISO(filterEnd);
        if (isAfter(start, end)) return false;
      }

      return true;
    });
  }, [employeeKpis, filterEmployee, filterType, filterKpi, filterStart, filterEnd]);

  // Atualiza KPI selecionada automaticamente
  useEffect(() => {
    if (filterKpi) {
      setSelectedEmployeeKpiId(filterKpi);
    } else if (!filteredEmployeeKpis.some((k) => k.id === selectedEmployeeKpiId)) {
      setSelectedEmployeeKpiId(filteredEmployeeKpis[0]?.id || null);
    }
  }, [filterKpi, filteredEmployeeKpis, selectedEmployeeKpiId]);

  const selectedKpi = filteredEmployeeKpis.find(
    (k) => k.id === selectedEmployeeKpiId
  );

  // =====================================
  // 🔥 FILTRAR EVOLUÇÕES
  // =====================================
  const selectedEvols = useMemo(() => {
    if (!selectedEmployeeKpiId) return [];

    let evs = evolutions.filter(
      (ev) => ev.employeeKpiId === selectedEmployeeKpiId
    );

    if (filterStart) {
      const start = parseISO(filterStart);
      evs = evs.filter((e) => {
        const d = parseISO(e.submittedDate ?? e.submittedAt);
        return isAfter(d, start) || isEqual(d, start);
      });
    }

    if (filterEnd) {
      const end = parseISO(filterEnd);
      evs = evs.filter((e) => {
        const d = parseISO(e.submittedDate ?? e.submittedAt);
        return isBefore(d, end) || isEqual(d, end);
      });
    }

    return evs;
  }, [evolutions, selectedEmployeeKpiId, filterStart, filterEnd]);

  // =====================================
  // 📈 AGGREGATED EVOLUTIONS
  // =====================================
  const aggregatedEvolutions = useMemo(() => {
    if (!selectedKpi || !selectedEvols.length) return [];

    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const grouped: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const date = (ev.submittedDate || ev.submittedAt).split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(ev);
    }

    return Object.entries(grouped).map(([date, list]) => {
      if (type.endsWith("_SUM")) {
        return {
          date,
          value: list.reduce(
            (a, x) => a + Number(x.achievedValueEvolution || 0),
            0
          ),
        };
      }

      const latest = list.sort(
        (a, b) =>
          new Date(b.submittedDate ?? b.submittedAt).getTime() -
          new Date(a.submittedDate ?? a.submittedAt).getTime()
      )[0];

      return { date, value: Number(latest.achievedValueEvolution) };
    });
  }, [selectedEvols, selectedKpi]);

  const xAxisDates = aggregatedEvolutions.map((d) => d.date);

  // =====================================
  // 📊 PIE NUMBERS
  // =====================================
  const total = filteredEmployeeKpis.length;
  const counts = {
    DRAFT: filteredEmployeeKpis.filter((k) => k.status === "DRAFT").length,
    SUBMITTED: filteredEmployeeKpis.filter((k) => k.status === "SUBMITTED").length,
    APPROVED: filteredEmployeeKpis.filter((k) => k.status === "APPROVED").length,
  };

  // =====================================
  // 🔥 HEATMAP
  // =====================================
  const start = startOfMonth(subMonths(new Date(), 2));
  const end = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start, end });

  const heatmap = allDays.map((day) => ({
    day,
    count: evolutions.filter((e) =>
      isSameDay(parseISO(e.submittedDate ?? e.submittedAt), day)
    ).length,
  }));

  const firstWeek = startOfWeek(start);
  const weeks: any[][] = [];
  let cur = firstWeek;

  while (cur <= end) {
    const week = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(cur, i);
      const m = heatmap.find((h) => isSameDay(h.day, d));
      return { day: d, count: m?.count || 0 };
    });
    weeks.push(week);
    cur = addWeeks(cur, 1);
  }

  const monthsLabels = Array.from(
    new Set(
      allDays
        .filter((_, i) => i % 14 === 0)
        .map((d) => format(d, "MMM", { locale: ptBR }))
    )
  );

  // =====================================
  // 📌 HANDLERS PERFORMANCE REVIEW
  // =====================================
  function handleOpenReviewModal() {
    if (!filterEmployee) return;
    setReviewDate(format(new Date(), "yyyy-MM-dd"));
    setReviewObservation("");
    setReviewModalOpen(true);
  }

  async function handleCreateReview() {
    if (!filterEmployee || !reviewDate) return;

    const leaderId = localStorage.getItem("employeeId") || "";

    await createPerformanceReview({
      employeeId: filterEmployee,
      date: reviewDate,
      observation: reviewObservation,
    } as any);

    setReviewModalOpen(false);
    // depois de criar, volta para página 1 e recarrega
    setReviewPage(1);
    await fetchPerformanceReviews(filterEmployee, 1);
  }

  // =====================================
  // JSX
  // =====================================

  return (
    <Box>
      {/* ========================= FILTROS ========================= */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Filtros
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>
          <TextField
            size="small"
            sx={{ flex: "1 1 200px" }}
            label="Data inicial"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
          />

          <TextField
            size="small"
            sx={{ flex: "1 1 200px" }}
            label="Data final"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
          />

          <FormControl sx={{ flex: "1 1 200px" }} size="small">
            <InputLabel>Funcionário</InputLabel>
            <Select
              size="small"
              value={filterEmployee}
              label="Funcionário"
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {members.map((m) => (
                <MenuItem key={m.id} value={m.employeeId}>
                  {m.employee?.person?.name ?? m.employeeId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: "1 1 200px" }} size="small">
            <InputLabel>Tipo de KPI</InputLabel>
            <Select
              size="small"
              value={filterType}
              label="Tipo de KPI"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="HIGHER_BETTER_SUM">Maior melhor (Soma)</MenuItem>
              <MenuItem value="LOWER_BETTER_SUM">Menor melhor (Soma)</MenuItem>
              <MenuItem value="HIGHER_BETTER_PCT">Maior melhor (Pct)</MenuItem>
              <MenuItem value="LOWER_BETTER_PCT">Menor melhor (Pct)</MenuItem>
              <MenuItem value="BINARY">Binário</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ flex: "1 1 200px" }} size="small">
            <InputLabel>KPI</InputLabel>
            <Select
              size="small"
              value={filterKpi}
              label="KPI"
              onChange={(e) => setFilterKpi(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {filteredEmployeeKpis.map((k) => (
                <MenuItem key={k.id} value={k.id}>
                  {k.kpi?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="outlined"
            sx={{
              px: 3,
              borderRadius: 2,
              borderColor: "#1e293b",
              color: "#1e293b",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
            }}
            onClick={() => {
              setFilterStart("");
              setFilterEnd("");
              setFilterKpi("");
              setFilterType("");
              setFilterEmployee("");
            }}
          >
            Limpar
          </Button>
        </Box>
      </Paper>

      {/* ========================= LINHA 1 ========================= */}
      <Box display="flex" gap={3} mb={4}>
        {/* PIE */}
        <Paper sx={{ flexBasis: "30%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Status das KPIs
          </Typography>

          <Box sx={{ position: "relative", width: 300, height: 300 }}>
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: counts.DRAFT,
                      label: "Rascunho",
                      color: "#FF6B6B",
                    },
                    {
                      id: 1,
                      value: counts.SUBMITTED,
                      label: "Enviado",
                      color: "#FFC260",
                    },
                    {
                      id: 2,
                      value: counts.APPROVED,
                      label: "Aprovado",
                      color: "#6FCF97",
                    },
                  ],
                  innerRadius: 80,
                  outerRadius: 100,
                },
              ]}
              width={300}
              height={300}
            />

            <Box
              sx={{
                position: "absolute",
                top: "52%",
                left: "50%",
                transform: "translate(-50%, -60%)",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {total}
              </Typography>
              <Typography variant="caption">KPIs</Typography>
            </Box>
          </Box>
        </Paper>

        {/* PROGRESS */}
        <Paper sx={{ flexBasis: "40%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Progresso
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            {filteredEmployeeKpis.map((k) => {
              const achieved = Number(k.achievedValue) || 0;
              const goal = Number(k.goal) || 0;
              const pct = goal ? Math.min((achieved / goal) * 100, 100) : 0;

              return (
                <Box key={k.id}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={600}>
                      {k.employee?.person?.name ?? "Funcionário"}
                    </Typography>
                    <Typography>
                      {achieved} / {goal} ({pct.toFixed(0)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: colorByProgress(achieved, goal),
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* HEATMAP */}
        <Paper sx={{ flexBasis: "30%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={5}>
            Atividade (3 meses)
          </Typography>

          <Box display="flex" justifyContent="center" gap={4} mb={2}>
            {monthsLabels.map((m, i) => (
              <Typography key={i} variant="caption">
                {m}
              </Typography>
            ))}
          </Box>

          <Box display="flex" gap={0.5}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              mr={1}
            >
              {["D", "S", "T", "Qa", "Qi", "Sx", "Sa"].map((d, i) => (
                <Typography key={i} variant="caption">
                  {d}
                </Typography>
              ))}
            </Box>

            <Box display="flex" gap={0.5}>
              {weeks.map((week, wi) => (
                <Box key={wi} display="flex" flexDirection="column" gap={0.5}>
                  {week.map((d, di) => (
                    <Tooltip
                      key={di}
                      title={`${format(d.day, "dd/MM")}: ${d.count} evolução(es)`}                    
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          backgroundColor: getHeatColor(d.count),
                          opacity: isSameMonth(d.day, new Date()) ? 1 : 0.4,
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ========================= GRÁFICO (ESQ) + TABELA (DIR) ========================= */}
      <Box display="flex" gap={3}>
        {/* ESQUERDA: GRÁFICO EM UM PAPER (60%) */}
        <Paper sx={{ flex: "0 0 60%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Evolução das KPIs
          </Typography>

          <Box display="flex" gap={1} mb={3} flexWrap="wrap">
            {filteredEmployeeKpis.map((k) => (
              <Button
                key={k.id}
                variant={selectedEmployeeKpiId === k.id ? "contained" : "outlined"}
                onClick={() => setSelectedEmployeeKpiId(k.id)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                  backgroundColor:
                    selectedEmployeeKpiId === k.id ? "#1e293b" : "transparent",
                  color:
                    selectedEmployeeKpiId === k.id ? "#fff" : "#1e293b",
                  borderColor: "#1e293b",
                }}
              >
                {k.employee?.person?.name} — {k.kpi?.name}
              </Button>
            ))}
          </Box>

          {aggregatedEvolutions.length ? (
            <Box sx={{ height: 350 }}>
              <LineChart
                xAxis={[
                  {
                    data: xAxisDates,
                    scaleType: "point",
                    label: "Data",
                  },
                ]}
                series={[
                  {
                    label: selectedKpi?.kpi?.name || "KPI",
                    data: aggregatedEvolutions.map((d) => d.value),
                    // 🔹 COR ALTERADA AQUI
                    color: "#1e293b",
                  },
                ]}
                height={330}
                margin={{ left: 30, top: 20, bottom: 40, right: 20 }}
              />
            </Box>
          ) : (
            <Typography textAlign="center" color="text.secondary">
              Nenhuma evolução registrada no período filtrado.
            </Typography>
          )}
        </Paper>

        {/* DIREITA: PERFORMANCE REVIEWS EM OUTRO PAPER (40%) */}
        <Paper sx={{ flex: "0 0 40%", p: 4, borderRadius: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Feedbacks
            </Typography>

            <Button
              size="small"
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 2,
                backgroundColor: "#1e293b",
              }}
              disabled={!filterEmployee}
              onClick={handleOpenReviewModal}
            >
              Nova avaliação
            </Button>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7eb",
              maxHeight: 320,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">
                      Observação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!filterEmployee ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        Selecione um funcionário nos filtros para visualizar as
                        avaliações.
                      </td>
                    </tr>
                  ) : loadingReviews ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        Carregando avaliações...
                      </td>
                    </tr>
                  ) : performanceReviews.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-4 text-center text-gray-500"
                      >
                        Nenhuma performance review registrada.
                      </td>
                    </tr>
                  ) : (
                    performanceReviews.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2">
                          {format(parseISO(r.date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-3 py-2">{r.observation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* paginação da tabela */}
            <Box
              sx={{
                borderTop: "1px solid #e5e7eb",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Página {reviewPage} de {totalReviewPages} — {reviewTotal} registro(s)
              </Typography>

              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={reviewPage <= 1}
                  onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                  sx={{ textTransform: "none" }}
                >
                  Anterior
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={reviewPage >= totalReviewPages}
                  onClick={() =>
                    setReviewPage((p) => Math.min(totalReviewPages, p + 1))
                  }
                  sx={{ textTransform: "none" }}
                >
                  Próxima
                </Button>
              </Box>
            </Box>
          </Paper>
        </Paper>
      </Box>

      {/* MODAL NOVA PERFORMANCE REVIEW */}
      <BaseModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Nova Performance Review"
        description="Registre uma avaliação para o funcionário selecionado."
        footer={
          <Box display="flex" justifyContent="flex-end" gap={1} width="100%">
            <Button variant="outlined" onClick={() => setReviewModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#1e293b" }}
              onClick={handleCreateReview}
              disabled={!reviewDate || !filterEmployee}
            >
              Salvar
            </Button>
          </Box>
        }
      >
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Data"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
          />
          <TextField
            label="Observação"
            size="small"
            multiline
            minRows={3}
            value={reviewObservation}
            onChange={(e) => setReviewObservation(e.target.value)}
          />
        </Box>
      </BaseModal>
    </Box>
  );
}
