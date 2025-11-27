// 🔥 DASHBOARD PREMIUM + FILTROS FUNCIONAIS

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Paper,
  Typography,
  CircularProgress,
  Button,
  LinearProgress,
  Box,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { BaseModal } from "@/components/modals/BaseModal";

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
  startOfWeek,
  addDays,
  isSameMonth,
  parseISO,
  isAfter,
  isBefore,
  isEqual,
} from "date-fns";

import { ptBR } from "date-fns/locale";
import { PRIMARY_COLOR, PRIMARY_LIGHT, PRIMARY_LIGHT_BG, SECTION_BORDER_COLOR, primaryButtonSx } from '@/utils/utils';

// 🎨 Cor por progresso
function colorByProgress(achieved: number, goal: number): string {
  if (!goal) return "#BDBDBD";
  const pct = (achieved / goal) * 100;
  if (pct < 50) return "#FF6B6B";
  if (pct < 90) return "#FFC260";
  return "#6FCF97";
}

// 🎨 Cor do heatmap
function getHeatColor(count: number): string {
  if (count === 0) return "#e5e7eb";
  if (count === 1) return "#FFCC80";
  if (count === 2) return "#81C784";
  if (count >= 3) return "#388E3C";
  return "#e0e0e0";
}

export default function EmployeeDashboard() {
  const { listEmployeeKpis } = useEmployeeKpis();
  const { listEmployeeKpiEvolutions } = useEmployeeKpiEvolutions();
  const {
    listPerformanceReviews,
    createPerformanceReview,
  } = usePerformanceReviews();

  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);

  // 🔥 FILTROS
  const [filterStart, setFilterStart] = useState<string>("");
  const [filterEnd, setFilterEnd] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterKpi, setFilterKpi] = useState<string>("");

  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  // 🔥 PERFORMANCE REVIEWS (tabela paginada)
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPageSize] = useState(5);
  const [reviewTotal, setReviewTotal] = useState(0);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDate, setReviewDate] = useState("");
  const [reviewObservation, setReviewObservation] = useState("");

  // 🔥 Carregar KPIs + Evoluções (ajustado para retorno paginado)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [ekResult, evResult] = await Promise.all([
        listEmployeeKpis({ page: 1, limit: 999 }),
        listEmployeeKpiEvolutions({ page: 1, limit: 999 }),
      ]);

      const ek = (ekResult as any)?.data ?? ekResult ?? [];
      const ev = (evResult as any)?.data ?? evResult ?? [];

      setKpis(ek);
      setEvolutions(ev);
      setSelectedKpiId(ek.length ? ek[0].id : null);

      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 CARREGAR PERFORMANCE REVIEWS PAGINADAS
  async function fetchPerformanceReviews(page: number) {
    try {
      setLoadingReviews(true);

      const res = await listPerformanceReviews({
        page,
        limit: reviewPageSize,
      });

      const data = ((res as any)?.data ?? res ?? []) as PerformanceReview[];

      const total =
        (res as any)?.total ??
        (res as any)?.meta?.total ??
        (res as any)?.meta?.totalItems ??
        data.length;

      const ordered = data
        .slice()
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      setPerformanceReviews(ordered);
      setReviewTotal(total);
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    fetchPerformanceReviews(reviewPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewPage]);

  const totalReviewPages = Math.max(
    1,
    Math.ceil((reviewTotal || 1) / reviewPageSize)
  );

  // 🔥 Agrupa evoluções por KPI
  const groupedEvolutions = useMemo(() => {
    const groups: Record<string, any[]> = {};

    evolutions.forEach((ev) => {
      if (!ev.employeeKpiId) return;
      if (!groups[ev.employeeKpiId]) groups[ev.employeeKpiId] = [];
      groups[ev.employeeKpiId].push({
        ...ev,
        date: new Date(ev.submittedDate),
      });
    });

    return groups;
  }, [evolutions]);

  // 🔥 FILTRA KPIs
  const filteredKpis = useMemo(() => {
    return kpis.filter((k) => {
      if (filterType && k.kpi?.evaluationType?.code !== filterType) return false;
      if (filterKpi && k.id !== filterKpi) return false;

      if (filterStart && k.periodEnd) {
        const kpiEnd = parseISO(k.periodEnd);
        const filterStartDate = parseISO(filterStart);
        if (isBefore(kpiEnd, filterStartDate)) return false;
      }

      if (filterEnd && k.periodStart) {
        const kpiStart = parseISO(k.periodStart);
        const filterEndDate = parseISO(filterEnd);
        if (isAfter(kpiStart, filterEndDate)) return false;
      }

      return true;
    });
  }, [kpis, filterType, filterKpi, filterStart, filterEnd]);

  // 🔥 Ajusta KPI selecionada automaticamente
  useEffect(() => {
    if (filterKpi) {
      setSelectedKpiId(filterKpi);
    } else if (!filteredKpis.find((k) => k.id === selectedKpiId)) {
      setSelectedKpiId(filteredKpis[0]?.id || null);
    }
  }, [filterKpi, filteredKpis, selectedKpiId]);

  // 🔥 KPI atual
  const selectedKpi = filteredKpis.find((k) => k.id === selectedKpiId);

  // 🔥 Evoluções filtradas por KPI + datas
  const selectedEvols = useMemo(() => {
    if (!selectedKpiId) return [];

    let evols = groupedEvolutions[selectedKpiId] || [];

    if (filterStart) {
      const start = parseISO(filterStart);
      evols = evols.filter((ev) => {
        const d = new Date(ev.date);
        return isAfter(d, start) || isEqual(d, start);
      });
    }

    if (filterEnd) {
      const end = parseISO(filterEnd);
      evols = evols.filter((ev) => {
        const d = new Date(ev.date);
        return isBefore(d, end) || isEqual(d, end);
      });
    }

    return evols;
  }, [groupedEvolutions, selectedKpiId, filterStart, filterEnd]);

  // 🔥 Evoluções agregadas (gráfico)
  const aggregatedEvolutions = useMemo(() => {
    if (!selectedKpi || !selectedEvols.length) return [];

    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const grouped: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const day = new Date(ev.date).toISOString().split("T")[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(ev);
    }

    return Object.entries(grouped).map(([date, evs]) => {
      if (type.endsWith("_SUM")) {
        return {
          date,
          value: evs.reduce(
            (acc, e) => acc + Number(e.achievedValueEvolution || 0),
            0
          ),
        };
      } else {
        const latest = evs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

        return { date, value: Number(latest.achievedValueEvolution) || 0 };
      }
    });
  }, [selectedEvols, selectedKpi]);

  // 🔥 Linha (valores)
  const lineData = useMemo(() => {
    if (!aggregatedEvolutions.length) return [];

    const values = aggregatedEvolutions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => d.value);

    const avg = values.reduce((a, b) => a + b, 0) / values.length || 0;

    return [
      {
        label: selectedKpi?.kpi?.name || "KPI",
        data: values,
        color: "#3b82f6",
        showMark: true,
      },
      {
        label: "Média",
        data: Array(values.length).fill(avg),
        color: "#9ca3af",
        lineDash: [6, 4],
      },
    ];
  }, [aggregatedEvolutions, selectedKpi]);

  const xAxisDates = aggregatedEvolutions.map((d) => d.date);

  // 🔥 Totais
  const total = filteredKpis.length;
  const counts = {
    naoIniciados: filteredKpis.filter((k) => k.status === "DRAFT").length,
    iniciados: filteredKpis.filter((k) => k.status === "SUBMITTED").length,
    finalizados: filteredKpis.filter((k) => k.status === "APPROVED").length,
  };

  // ============================================================
  // 🔥 HEATMAP — também considerando filtros de KPI e datas
  // ============================================================

  const heatmapDays = useMemo(() => {
    let evols = [...evolutions];

    if (filterType) {
      evols = evols.filter((ev) => {
        const k = kpis.find((kp) => kp.id === ev.employeeKpiId);
        return k?.kpi?.evaluationType?.code === filterType;
      });
    }

    if (filterKpi) {
      evols = evols.filter((ev) => ev.employeeKpiId === filterKpi);
    }

    if (filterStart) {
      const start = parseISO(filterStart);
      evols = evols.filter((ev) => {
        const d = new Date(ev.submittedDate);
        return isAfter(d, start) || isEqual(d, start);
      });
    }

    if (filterEnd) {
      const end = parseISO(filterEnd);
      evols = evols.filter((ev) => {
        const d = new Date(ev.submittedDate);
        return isBefore(d, end) || isEqual(d, end);
      });
    }

    return evols;
  }, [evolutions, kpis, filterStart, filterEnd, filterKpi, filterType]);

  const start = startOfMonth(subMonths(new Date(), 2));
  const end = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start, end });

  const dayCounts = allDays.map((day) => ({
    day,
    count: heatmapDays.filter((ev) =>
      isSameDay(new Date(ev.submittedDate), day)
    ).length,
  }));

  const firstWeekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weeks: { day: Date; count: number }[][] = [];
  let current = firstWeekStart;

  while (current <= end) {
    const week = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(current, i);
      const match = dayCounts.find((x) => isSameDay(x.day, d));
      return { day: d, count: match ? match.count : 0 };
    });

    weeks.push(week);
    current = addWeeks(current, 1);
  }

  const monthsLabels = Array.from(
    new Set(
      allDays
        .filter((d, i) => i % 14 === 0)
        .map((d) => format(d, "MMM", { locale: ptBR }))
    )
  );

  // 🔥 HANDLERS PERFORMANCE REVIEW
  function handleOpenReviewModal() {
    setReviewDate(format(new Date(), "yyyy-MM-dd"));
    setReviewObservation("");
    setReviewModalOpen(true);
  }


  // 🔥 Loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fafafa]">
        <CircularProgress />
      </div>
    );
  }

  // ============================================================
  // =======================   RENDER   ==========================
  // ============================================================

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ===================== TÍTULO ===================== */}
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Dashboard de Desempenho
        </Typography>

        {/* =====================   FILTROS   ===================== */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: 4,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            transition: ".2s",
            "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Filtros
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap">
            <TextField
              size="small"
              label="Data inicial"
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: "1 1 200px" }}
            />

            <TextField
              size="small"
              label="Data final"
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: "1 1 200px" }}
            />

            <FormControl sx={{ flex: "1 1 200px" }} size="small">
              <InputLabel>Tipo de KPI</InputLabel>
              <Select
                label="Tipo de KPI"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="HIGHER_BETTER_SUM">Maior melhor (SOMA)</MenuItem>
                <MenuItem value="LOWER_BETTER_SUM">Menor melhor (SOMA)</MenuItem>
                <MenuItem value="HIGHER_BETTER_PCT">Maior melhor (PCT)</MenuItem>
                <MenuItem value="LOWER_BETTER_PCT">Menor melhor (PCT)</MenuItem>
                <MenuItem value="BINARY">Binário</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ flex: "1 1 200px" }} size="small">
              <InputLabel>KPI</InputLabel>
              <Select
                label="KPI"
                value={filterKpi}
                onChange={(e) => setFilterKpi(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {filteredKpis.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {k.kpi?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setFilterStart("");
                setFilterEnd("");
                setFilterType("");
                setFilterKpi("");
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
            >
              Limpar
            </Button>
          </Box>
        </Paper>

        {/* ==================== LINHA 1 ==================== */}
        <Box display="flex" gap={3} mb={4} flexWrap="nowrap">
          {/* PIE */}
          <Paper
            elevation={0}
            sx={{
              flexBasis: "calc(30% - 16px)",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Status das KPIs
            </Typography>

            <Box sx={{ position: "relative", width: 300, height: 300 }}>
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: counts.naoIniciados,
                        label: "Não iniciadas",
                        color: "#FF6B6B",
                      },
                      {
                        id: 1,
                        value: counts.iniciados,
                        label: "Em andamento",
                        color: "#FFC260",
                      },
                      {
                        id: 2,
                        value: counts.finalizados,
                        label: "Concluídas",
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
                  pointerEvents: "none",
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="#1e293b"
                  lineHeight={1}
                >
                  {total}
                </Typography>
                <Typography variant="caption" color="#6b7280" fontWeight={500}>
                  KPIs
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* PROGRESSO */}
          <Paper
            elevation={0}
            sx={{
              flexBasis: "calc(40% - 16px)",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Progresso por KPI
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {filteredKpis.map((k) => {
                const achieved = Number(k.achievedValue) || 0;
                const goal = Number(k.goal) || 0;
                const pct = goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;
                const color = colorByProgress(achieved, goal);

                return (
                  <Box key={k.id}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body1" fontWeight={600}>
                        {k.kpi?.name || "KPI"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${achieved} / ${goal} (${pct.toFixed(0)}%)`}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#e5e7eb",
                        "& .MuiLinearProgress-bar": {
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                          borderRadius: 6,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* HEATMAP */}
          <Paper
            elevation={0}
            sx={{
              flexBasis: "calc(30% - 16px)",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={8}>
              Atividade (3 meses)
            </Typography>

            <Box display="flex" justifyContent="center" gap={8} mb={1}>
              {monthsLabels.map((m, i) => (
                <Typography key={`${m}-${i}`} variant="caption" fontWeight={600}>
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
                {["D", "S", "T", "Qa", "Qi", "Sx", "Sa"].map((d, index) => (
                  <Typography
                    key={`${d}-${index}`}
                    variant="caption"
                    color="#6b7280"
                  >
                    {d}
                  </Typography>
                ))}
              </Box>

              <Box display="flex" gap={0.5}>
                {weeks.map((week, wi) => (
                  <Box key={wi} display="flex" flexDirection="column" gap={0.5}>
                    {week.map((d, di) => (
                      <Tooltip
                        key={`${wi}-${di}`}
                        title={`${format(d.day, "dd/MM")}: ${d.count} evolução${
                          d.count !== 1 ? "es" : ""
                        }`}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: getHeatColor(d.count),
                            opacity: isSameMonth(d.day, new Date()) ? 1 : 0.4,
                            transition: "0.2s",
                            "&:hover": {
                              transform: "scale(1.15)",
                              opacity: 1,
                            },
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

        {/* ==================== LINHA 2 — GRÁFICO (60%) + TABELA (40%) ==================== */}
        <Box display="flex" gap={3}>
          {/* ESQUERDA: GRÁFICO */}
          <Paper
            elevation={0}
            sx={{
              flex: "0 0 60%",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Evolução das KPIs
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1.5} mb={3}>
              {filteredKpis.map((k) => (
                <Button
                  key={k.id}
                  variant={selectedKpiId === k.id ? "contained" : "outlined"}
                  onClick={() => setSelectedKpiId(k.id)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    px: 2.5,
                    borderColor: "#1e293b",
                    color: selectedKpiId === k.id ? "white" : "#1e293b",
                    backgroundColor:
                      selectedKpiId === k.id ? "#1e293b" : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedKpiId === k.id
                          ? "#334155"
                          : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {k.kpi?.name}
                </Button>
              ))}
            </Box>

            {aggregatedEvolutions.length > 0 ? (
              <Box sx={{ width: "100%", height: 360 }}>
                <LineChart
                  xAxis={[
                    {
                      data: xAxisDates,
                      scaleType: "point",
                      label: "Data",
                    },
                  ]}
                  series={lineData}
                  height={340}
                  margin={{ left: 40, right: 20, top: 30, bottom: 40 }}
                  sx={{
                    width: "100%",
                    "& .MuiChartsAxis-line": {
                      stroke: "#cbd5e1",
                      strokeWidth: 0.4,
                    },
                    "& .MuiChartsGrid-line": {
                      stroke: "#e2e8f0",
                      strokeWidth: 0.3,
                    },
                  }}
                />
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center" mt={2}>
                Nenhuma evolução registrada para esta KPI no período filtrado.
              </Typography>
            )}
          </Paper>

          {/* DIREITA: TABELA DE PERFORMANCE REVIEWS */}
          <Paper
            elevation={0}
            sx={{
              flex: "0 0 40%",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                Feedbacks
              </Typography>
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
                    {loadingReviews ? (
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

              {/* Paginação */}
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
                  Página {reviewPage} de {totalReviewPages} — {reviewTotal}{" "}
                  registro(s)
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
      </main>
    </div>
  );
}
