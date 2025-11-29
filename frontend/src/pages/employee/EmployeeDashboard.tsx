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
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// 🎨 Cor do heatmap
function getHeatColor(count: number): string {
  if (count === 0) return "#e5e7eb";
  if (count === 1) return "#FFCC80";
  if (count === 2) return "#81C784";
  if (count >= 3) return "#388E3C";
  return "#e0e0e0";
}

export default function EmployeeDashboard() {
  const { listEmployeeKpis, listEmployeeKpisEmployee } = useEmployeeKpis();
  const { listEmployeeKpiEvolutions, listEmployeeKpiEvolutionsEmployee } =
    useEmployeeKpiEvolutions();
  const { listPerformanceReviewsEmployee, createPerformanceReviewEmployee } =
    usePerformanceReviews();

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

  // 🔥 Carregar KPIs + Evoluções (ajustado para retorno paginado)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [ekResult, evResult] = await Promise.all([
        listEmployeeKpisEmployee({ page: 1, limit: 999 }),
        listEmployeeKpiEvolutionsEmployee({ page: 1, limit: 999 }),
      ]);

      const ek = (ekResult as any)?.data ?? ekResult ?? [];
      const evA = (evResult as any)?.data ?? evResult ?? [];
      const ev = evA.filter((e: any) => e.status === "APPROVED");

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

      const res = await listPerformanceReviewsEmployee({
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

  // 🔥 KPIs ordenadas para a listagem (progresso > 0 primeiro)
  const orderedKpisForList = useMemo(() => {
    return filteredKpis
      .slice()
      .sort((a, b) => {
        const achievedA = Number(a.achievedValue) || 0;
        const goalA = Number(a.goal) || 0;
        const pctA = goalA > 0 ? (achievedA / goalA) * 100 : 0;

        const achievedB = Number(b.achievedValue) || 0;
        const goalB = Number(b.goal) || 0;
        const pctB = goalB > 0 ? (achievedB / goalB) * 100 : 0;

        const hasA = pctA > 0 ? 1 : 0;
        const hasB = pctB > 0 ? 1 : 0;

        if (hasA !== hasB) return hasB - hasA;
        return 0;
      });
  }, [filteredKpis]);

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

  const selectedEvaluationType =
    selectedKpi?.kpi?.evaluationType?.code || "";
  const isPctType = selectedEvaluationType.endsWith("_PCT");

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
  //  - *_PCT => histórico bruto (sem agrupar por dia)
  //  - *_SUM => soma diária + ACUMULADO
  //  - demais => último valor do dia
  const aggregatedEvolutions = useMemo(() => {
    if (!selectedKpi || !selectedEvols.length) return [];

    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const isPct = type.endsWith("_PCT");
    const isSum = type.endsWith("_SUM");

    // Percentuais -> histórico bruto
    if (isPct) {
      const ordered = selectedEvols
        .slice()
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      return ordered.map((ev) => ({
        date: new Date(ev.date).toISOString(),
        value: Number(
          ev.achievedValueEvolution ?? ev.achievedValue ?? 0
        ),
      }));
    }

    // Demais tipos -> agrupar por dia
    const grouped: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const day = new Date(ev.date).toISOString().split("T")[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(ev);
    }

    let daily = Object.entries(grouped).map(([date, evs]) => {
      if (isSum) {
        const dayTotal = evs.reduce(
          (acc, e) => acc + Number(e.achievedValueEvolution || 0),
          0
        );
        return { date, value: dayTotal };
      } else {
        const latest = evs
          .slice()
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

        return {
          date,
          value: Number(
            latest.achievedValueEvolution ?? latest.achievedValue ?? 0
          ),
        };
      }
    });

    // Ordena por data
    daily = daily
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Para *_SUM, converte em acumulado
    if (isSum) {
      let running = 0;
      daily = daily.map((d) => {
        running += d.value;
        return { date: d.date, value: running };
      });
    }

    return daily;
  }, [selectedEvols, selectedKpi]);

  // 🔥 Evoluções ordenadas por data
  const sortedAggregatedEvolutions = useMemo(() => {
    if (!aggregatedEvolutions.length) return [];
    return aggregatedEvolutions
      .slice()
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [aggregatedEvolutions]);

  // 🔥 Dados do gráfico (Recharts) — valor, média e meta
  //  - Para *_PCT não calcula média
  const chartData = useMemo(() => {
    if (!sortedAggregatedEvolutions.length || !selectedKpi) return [];

    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const isPct = type.endsWith("_PCT");
    const isSum = type.endsWith("_SUM");

    let baseValuesForAverage: number[] = [];

    if (!isPct) {
      if (isSum) {
        const groupedDaily: Record<string, number> = {};
        for (const ev of selectedEvols) {
          const dateStr = new Date(ev.date).toISOString().split("T")[0];
          const value = Number(ev.achievedValueEvolution || 0);
          groupedDaily[dateStr] = (groupedDaily[dateStr] || 0) + value;
        }
        baseValuesForAverage = Object.values(groupedDaily);
      } else {
        baseValuesForAverage = sortedAggregatedEvolutions.map(
          (d) => Number(d.value) || 0
        );
      }
    }

    const avg =
      !isPct && baseValuesForAverage.length > 0
        ? baseValuesForAverage.reduce((a, b) => a + b, 0) /
          baseValuesForAverage.length
        : undefined;

    const goal = Number(selectedKpi.goal ?? 0);

    return sortedAggregatedEvolutions.map((d) => ({
      date: d.date,
      value: d.value,
      avg,
      goal: goal > 0 ? goal : undefined,
    }));
  }, [sortedAggregatedEvolutions, selectedKpi, selectedEvols]);

  // 👉 Domínio do eixo Y: 0 até 10% acima do maior valor (meta, média ou progresso)
  const yDomain = useMemo<[number, number]>(() => {
    if (!chartData.length) return [0, 10];

    let maxValue = 0;

    chartData.forEach((d) => {
      const v = Number(d.value ?? 0);
      const a = d.avg !== undefined ? Number(d.avg) : 0;
      const g = Number(d.goal ?? 0);
      maxValue = Math.max(maxValue, v, a, g);
    });

    if (maxValue === 0) return [0, 10];

    return [0, Math.ceil(maxValue * 1.1)]; // 10% acima do maior valor
  }, [chartData]);

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

  // ============================================================
  // 📊 MÉTRICAS PARA OS CARDS RESUMO
  // ============================================================
  const {
    avgProgressPct,
    completionPct,
    avgDaysRemaining,
    totalEvolutions,
    lastFeedbackDateFormatted,
  } = useMemo(() => {
    const today = new Date();

    let sumProgress = 0;
    let kpisComPrazo = 0;
    let somaDiasRestantes = 0;

    filteredKpis.forEach((k) => {
      const achieved = Number(k.achievedValue) || 0;
      const goal = Number(k.goal) || 0;
      const pct = goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;
      sumProgress += pct;

      if (k.periodEnd) {
        const end = parseISO(k.periodEnd);
        const diffMs = end.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays >= 0) {
          somaDiasRestantes += diffDays;
          kpisComPrazo += 1;
        }
      }
    });

    const avgProgressPctInner =
      filteredKpis.length > 0 ? sumProgress / filteredKpis.length : 0;

    const completionPctInner =
      filteredKpis.length > 0
        ? (counts.finalizados / filteredKpis.length) * 100
        : 0;

    const avgDaysRemainingInner =
      kpisComPrazo > 0 ? Math.round(somaDiasRestantes / kpisComPrazo) : 0;

    const totalEvolutionsInner = heatmapDays.length;

    const lastFeedbackDateFormattedInner =
      performanceReviews.length > 0
        ? format(parseISO(performanceReviews[0].date), "dd/MM/yyyy")
        : "-";

    return {
      avgProgressPct: avgProgressPctInner,
      completionPct: completionPctInner,
      avgDaysRemaining: avgDaysRemainingInner,
      totalEvolutions: totalEvolutionsInner,
      lastFeedbackDateFormatted: lastFeedbackDateFormattedInner,
    };
  }, [filteredKpis, counts.finalizados, heatmapDays, performanceReviews]);

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

        {/* ===================== CARDS RESUMO ===================== */}
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            md: "repeat(4, minmax(0, 1fr))",
          }}
          gap={3}
          mb={4}
        >
          {/* Card 1 – Performance Geral */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: `1px solid ${SECTION_BORDER_COLOR}`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" color="text.secondary">
                Performance Geral
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: PRIMARY_LIGHT_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUpRoundedIcon
                  sx={{ fontSize: 22, color: PRIMARY_COLOR }}
                />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#111827">
              {avgProgressPct.toFixed(0)}%
            </Typography>
            <Typography variant="body2" color="success.main">
              Média de conclusão das KPIs
            </Typography>
          </Paper>

          {/* Card 2 – Metas Atingidas */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: `1px solid ${SECTION_BORDER_COLOR}`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" color="text.secondary">
                Metas Atingidas
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: PRIMARY_LIGHT_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TaskAltRoundedIcon
                  sx={{ fontSize: 22, color: PRIMARY_COLOR }}
                />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#111827">
              {counts.finalizados}/{total || 0}
            </Typography>
            <Typography variant="body2" color="success.main">
              {completionPct.toFixed(0)}% das KPIs concluídas
            </Typography>
          </Paper>

          {/* Card 3 – Tempo Restante Médio */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: `1px solid ${SECTION_BORDER_COLOR}`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" color="text.secondary">
                Tempo Restante
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: PRIMARY_LIGHT_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccessTimeRoundedIcon
                  sx={{ fontSize: 22, color: PRIMARY_COLOR }}
                />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#111827">
              {avgDaysRemaining > 0 ? avgDaysRemaining : 0}d
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prazo médio das KPIs em andamento
            </Typography>
          </Paper>

          {/* Card 4 – Atividade & Feedbacks */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              border: `1px solid ${SECTION_BORDER_COLOR}`,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" color="text.secondary">
                Atividade Recente
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: PRIMARY_LIGHT_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TimelineRoundedIcon
                  sx={{ fontSize: 22, color: PRIMARY_COLOR }}
                />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#111827">
              {totalEvolutions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Evoluções nos últimos 3 meses • último feedback em{" "}
              {lastFeedbackDateFormatted}
            </Typography>
          </Paper>
        </Box>

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
                <MenuItem value="HIGHER_BETTER_SUM">
                  Maior melhor (SOMA)
                </MenuItem>
                <MenuItem value="LOWER_BETTER_SUM">
                  Menor melhor (SOMA)
                </MenuItem>
                <MenuItem value="HIGHER_BETTER_PCT">
                  Maior melhor (PCT)
                </MenuItem>
                <MenuItem value="LOWER_BETTER_PCT">
                  Menor melhor (PCT)
                </MenuItem>
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

        {/* ==================== LINHA 1: METAS + (ATIVIDADE ACIMA DE FEEDBACKS) ==================== */}
        <Box
          display="flex"
          gap={3}
          mb={4}
          flexWrap="nowrap"
          alignItems="stretch"
        >
          {/* METAS / PROGRESSO POR KPI */}
          <Paper
            elevation={0}
            sx={{
              flex: "0 0 50%",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              transition: ".2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Metas {new Date().getFullYear()}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, mt: 0.5 }}
            >
              Objetivos e progresso
            </Typography>

            {orderedKpisForList.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Nenhuma KPI encontrada com os filtros aplicados.
              </Typography>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                gap={2.5}
                sx={{
                  flex: 1,
                  maxHeight: 420,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${PRIMARY_COLOR} transparent`,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: PRIMARY_COLOR,
                    borderRadius: "4px",
                  },
                  pr: 1,
                }}
              >
                {orderedKpisForList.map((k) => {
                  const achieved = Number(k.achievedValue) || 0;
                  const goal = Number(k.goal) || 0;
                  const pct =
                    goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;

                  const deadline = k.periodEnd
                    ? format(parseISO(k.periodEnd), "dd/MM/yyyy")
                    : "-";

                  let statusLabel = "Pendente";
                  let statusBg = "#F3F4F6";
                  let statusColor = "#4B5563";
                  let StatusIcon: any = RadioButtonUncheckedRoundedIcon;
                  let iconColor = "#9CA3AF";

                if (pct < 100 && new Date() > new Date(k.periodEnd)) {
                  statusLabel = "Expirada";
                  statusBg = "#c52d2250";
                  statusColor = "#c52d22ff";
                  StatusIcon = CancelRoundedIcon;
                  iconColor = "#c52d22ff";
                } else if (
                  k.achievedValue !== null &&
                  k.achievedValue !== undefined &&
                  pct >= 100
                ) {
                  statusLabel = "Concluída";
                  statusBg = "#22c55e2a";
                  statusColor = "#22C55E";
                  StatusIcon = CheckCircleRoundedIcon;
                  iconColor = "#22C55E";
                } else if (
                  k.achievedValue !== null &&
                  k.achievedValue !== undefined &&
                  pct < 100
                ) {
                  statusLabel = "Em andamento";
                  statusBg = "#E0ECFF";
                  statusColor = "#1D4ED8";
                  StatusIcon = ScheduleRoundedIcon;
                  iconColor = PRIMARY_COLOR;
                } else {
                  statusLabel = "Pendente";
                }

                  return (
                    <Box
                      key={k.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={2}
                        mb={1.5}
                      >
                        <Box sx={{ mt: 0.3 }}>
                          <StatusIcon
                            sx={{ fontSize: 26, color: iconColor }}
                          />
                        </Box>

                        <Box flex={1}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            color="#111827"
                          >
                            {k.kpi?.name || "KPI"}
                          </Typography>

                          <Box
                            display="flex"
                            alignItems="center"
                            flexWrap="wrap"
                            gap={1.5}
                            mt={0.75}
                          >
                            <Box
                              sx={{
                                px: 1.6,
                                py: 0.4,
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                backgroundColor: statusBg,
                                color: statusColor,
                              }}
                            >
                              {statusLabel}
                            </Box>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Prazo: {deadline}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box mt={0.5}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          mb={0.5}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={500}
                          >
                            Progresso (real/meta)
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            {`${achieved} / ${goal} (${pct.toFixed(0)}%)`}
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            backgroundColor: "#edf2f7",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: PRIMARY_COLOR,
                              borderRadius: 999,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* COLUNA DIREITA: ATIVIDADE EM CIMA, FEEDBACKS EMBAIXO */}
          <Box
            sx={{
              flex: "calc(50% - 16px)",
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* HEATMAP / ATIVIDADE */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 4,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: ".2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={4}>
                Atividade (3 meses)
              </Typography>

              <Box display="flex" justifyContent="center" mb={2}>
                {monthsLabels.map((m, i) => (
                  <Typography
                    key={`${m}-${i}`}
                    variant="caption"
                    fontWeight={600}
                    sx={{ mx: 2 }}
                  >
                    {m}
                  </Typography>
                ))}
              </Box>

              {/* Heatmap centralizado */}
              <Box display="flex" justifyContent="center">
                <Box display="flex" gap={1} sx={{ mx: "auto" }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    mr={1}
                  >
                    {["D", "S", "T", "Qa", "Qi", "Sx", "Sa"].map(
                      (d, index) => (
                        <Typography
                          key={`${d}-${index}`}
                          variant="caption"
                          color="#6b7280"
                        >
                          {d}
                        </Typography>
                      )
                    )}
                  </Box>

                  <Box display="flex" gap={0.75}>
                    {weeks.map((week, wi) => (
                      <Box
                        key={wi}
                        display="flex"
                        flexDirection="column"
                        gap={0.75}
                      >
                        {week.map((d, di) => (
                          <Tooltip
                            key={`${wi}-${di}`}
                            title={`${format(
                              d.day,
                              "dd/MM"
                            )}: ${d.count} evolução${
                              d.count !== 1 ? "es" : ""
                            }`}
                          >
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 4,
                                backgroundColor: getHeatColor(d.count),
                                opacity: isSameMonth(d.day, new Date())
                                  ? 1
                                  : 0.4,
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
              </Box>
            </Paper>

            {/* FEEDBACKS */}
            <Paper
              elevation={0}
              sx={{
                flex: "0 0 auto",
                p: 4,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transition: ".2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.12)" },
                display: "flex",
                flexDirection: "column",
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
                  flex: 1,
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
                        setReviewPage((p) =>
                          Math.min(totalReviewPages, p + 1)
                        )
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
        </Box>

        {/* ==================== LINHA 2 — GRÁFICO ESTICADO ==================== */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
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
                    borderRadius: 3,
                    fontWeight: 600,
                    px: 2.5,
                    borderColor: PRIMARY_COLOR,
                    color: selectedKpiId === k.id ? "white" : PRIMARY_COLOR,
                    backgroundColor:
                      selectedKpiId === k.id ? PRIMARY_COLOR : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedKpiId === k.id
                          ? PRIMARY_COLOR
                          : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {k.kpi?.name}
                </Button>
              ))}
            </Box>

            {sortedAggregatedEvolutions.length > 0 ? (
              <Box sx={{ width: "100%", height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        format(new Date(value as string), "dd-MMM", {
                          locale: ptBR,
                        })
                      }
                      tick={{ fontSize: 12, fill: "#4b5563" }}
                    />
                    <YAxis
                      domain={yDomain}
                      tick={{ fontSize: 12, fill: "#4b5563" }}
                      tickLine={{ stroke: "#cbd5e1" }}
                    />
                    <RechartsTooltip
                      labelFormatter={(value) =>
                        format(new Date(value as string), "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      }
                    />
                    <Legend />

                    {/* Área preenchida da linha de progresso */}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.22}
                      strokeWidth={2}
                      name="Progresso"
                      dot={true}
                    />

                    {/* Linha da média (somente para tipos não percentuais) */}
                    {!isPctType && (
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name="Média"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={false}
                      />
                    )}

                    {/* Linha da meta (se existir) */}
                    {Number(selectedKpi?.goal ?? 0) > 0 && (
                      <Line
                        type="monotone"
                        dataKey="goal"
                        name="Meta"
                        stroke="#f97316"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary" textAlign="center" mt={2}>
                Nenhuma evolução registrada para esta KPI no período filtrado.
              </Typography>
            )}
          </Paper>
        </Box>
      </main>
    </div>
  );
}
