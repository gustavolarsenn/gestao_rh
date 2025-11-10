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
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEmployeeKpis } from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployeeKpiEvolutions } from "@/hooks/employee-kpi/useEmployeeKpiEvolutions";
import {
  eachDayOfInterval,
  format,
  subMonths,
  getDay,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addWeeks,
  startOfWeek,
  addDays,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// 🎨 Cor por progresso
function colorByProgress(achieved: number, goal: number): string {
  if (!goal) return "#BDBDBD";
  const pct = (achieved / goal) * 100;
  if (pct < 50) return "#E57373";
  if (pct < 90) return "#FFB74D";
  return "#81C784";
}

// 🎨 Cor do heatmap
function getHeatColor(count: number): string {
  if (count === 0) return "#e0e0e0";
  if (count === 1) return "#FFB74D";
  if (count === 2) return "#81C784";
  if (count >= 3) return "#388E3C";
  return "#e0e0e0";
}

export default function EmployeeDashboard() {
  const { listEmployeeKpis } = useEmployeeKpis();
  const { listEmployeeKpiEvolutions } = useEmployeeKpiEvolutions();

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [ek, ev] = await Promise.all([
        listEmployeeKpis(),
        listEmployeeKpiEvolutions(),
      ]);
      setKpis(ek);
      setEvolutions(ev);
      setSelectedKpiId(ek.length ? ek[0].id : null);
      setLoading(false);
    }
    fetchData();
  }, []);

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

  const selectedKpi = kpis.find((k) => k.id === selectedKpiId);
  const selectedEvols = selectedKpiId ? groupedEvolutions[selectedKpiId] || [] : [];

  // 🔹 Evoluções agregadas por dia
  const aggregatedEvolutions = useMemo(() => {
    if (!selectedKpi || !selectedEvols.length) return [];
    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const groupedByDay: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const day = new Date(ev.date).toISOString().split("T")[0];
      if (!groupedByDay[day]) groupedByDay[day] = [];
      groupedByDay[day].push(ev);
    }

    return Object.entries(groupedByDay).map(([date, evs]) => {
      if (type.endsWith("_SUM")) {
        const total = evs.reduce(
          (acc, e) => acc + Number(e.achievedValueEvolution || 0),
          0
        );
        return { date, value: total };
      } else {
        const latest = evs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        return { date, value: Number(latest.achievedValueEvolution) || 0 };
      }
    });
  }, [selectedEvols, selectedKpi]);

  const lineData = useMemo(() => {
    if (!aggregatedEvolutions.length) return [];
    const dataPoints = aggregatedEvolutions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((d) => d.value);

    const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length || 0;

    return [
      {
        label: selectedKpi?.kpi?.name || "KPI",
        data: dataPoints,
        color: "#1E88E5",
        showMark: true,
      },
      {
        label: "Média Global",
        data: Array(dataPoints.length).fill(avg),
        color: "#9E9E9E",
        lineDash: [6, 4],
        showMark: false,
      },
    ];
  }, [aggregatedEvolutions, selectedKpi]);

  const xAxisDates = aggregatedEvolutions.map((d) => d.date);

  const total = kpis.length;
  const counts = {
    naoIniciados: kpis.filter((k) => k.status === "DRAFT").length,
    iniciados: kpis.filter((k) => k.status === "SUBMITTED").length,
    finalizados: kpis.filter((k) => k.status === "APPROVED").length,
  };

  // 🔹 Heatmap (últimos 3 meses)
  const start = startOfMonth(subMonths(new Date(), 2));
  const end = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start, end });

  const dayCounts = allDays.map((day) => {
    const count = evolutions.filter((ev) =>
      isSameDay(new Date(ev.submittedDate), day)
    ).length;
    return { day, count };
  });

  // Agrupar por semana (estrutura de calendário)
  const firstWeekStart = startOfWeek(start, { weekStartsOn: 0 });
  const weeks: { day: Date; count: number }[][] = [];
  let current = firstWeekStart;

  while (current <= end) {
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(current, i);
      const match = dayCounts.find((x) => isSameDay(x.day, d));
      return { day: d, count: match ? match.count : 0 };
    });
    weeks.push(weekDays);
    current = addWeeks(current, 1);
  }

  const monthsLabels = Array.from(
    new Set(
      allDays
        .filter((d, i) => i % 14 === 0)
        .map((d) => format(d, "MMM", { locale: ptBR }))
    )
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fefefe]">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

<main className="flex-1 p-8 overflow-y-auto">
  <Typography variant="h4" fontWeight={700} color="#151E3F" gutterBottom>
    Dashboard de Desempenho
  </Typography>

  {/* ===== Linha 1: PieChart (30%) + Progresso (40%) + Heatmap (30%) ===== */}
  <Box display="flex" gap={3} mb={6} flexWrap="nowrap" alignItems="stretch">
    {/* PieChart */}
    <Paper
      elevation={2}
      sx={{
        flex: "0 0 30%",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h6" mb={2}>
        Status das KPIs ({total})
      </Typography>
      <PieChart
        series={[
          {
            data: [
              { id: 0, value: counts.naoIniciados, label: "Não iniciadas", color: "#E57373" },
              { id: 1, value: counts.iniciados, label: "Em andamento", color: "#FFB74D" },
              { id: 2, value: counts.finalizados, label: "Concluídas", color: "#81C784" },
            ],
            innerRadius: 50,
            outerRadius: 90,
          },
        ]}
        width={260}
        height={220}
      />
    </Paper>

    {/* Progresso */}
    <Paper
      elevation={2}
      sx={{
        flex: "0 0 40%",
        p: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="h6" mb={3}>
        Progresso por KPI
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {kpis.map((k) => {
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
                  [`& .MuiLinearProgress-bar`]: { backgroundColor: color },
                  backgroundColor: "#e0e0e0",
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>

    {/* Heatmap */}
    <Paper
      elevation={2}
      sx={{
        flex: "0 0 30%",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <Typography variant="h6" mb={2}>
        Atividade (3 meses)
      </Typography>

      {/* Labels dos meses */}
      <Box display="flex" justifyContent="center" gap={3} mb={1}>
        {monthsLabels.map((m, i) => (
          <Typography key={i} variant="caption" fontWeight={600}>
            {m}
          </Typography>
        ))}
      </Box>

      {/* Dias da semana + grade */}
      <Box display="flex" gap={0.5}>
        {/* Dias da semana */}
        <Box display="flex" flexDirection="column" justifyContent="space-between" mr={1}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
            <Typography key={d} variant="caption" color="text.secondary">
              {d}
            </Typography>
          ))}
        </Box>

        {/* Grade de dias */}
        <Box display="flex" gap={0.5}>
          {weeks.map((week, wi) => (
            <Box key={wi} display="flex" flexDirection="column" gap={0.5}>
              {week.map((d, di) => (
                <Tooltip
                  key={di}
                  title={`${format(d.day, "dd/MM")}: ${
                    d.count
                  } evolução${d.count !== 1 ? "es" : ""}`}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "2px",
                      backgroundColor: getHeatColor(d.count),
                      opacity: isSameMonth(d.day, new Date()) ? 1 : 0.4,
                      transition: "0.2s",
                      "&:hover": { transform: "scale(1.15)", opacity: 1 },
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

  {/* ===== Linha 2: Gráfico de Linhas (100%) ===== */}
  <Paper
    elevation={2}
    sx={{
      width: "100%",
      p: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
    }}
  >
    <Typography variant="h6" mb={3}>
      Evolução das KPIs
    </Typography>

    <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
      {kpis.map((k) => (
        <Button
          key={k.id}
          variant={selectedKpiId === k.id ? "contained" : "outlined"}
          onClick={() => setSelectedKpiId(k.id)}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#232c33",
            color: selectedKpiId === k.id ? "white" : "rgba(35,44,51,0.8)",
            backgroundColor: selectedKpiId === k.id ? "#232c33" : "transparent",
            "&:hover": {
              backgroundColor: selectedKpiId === k.id ? "#3f4755" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          {k.kpi?.name || "KPI"}
        </Button>
      ))}
    </Box>

    {aggregatedEvolutions.length > 0 ? (
      <Box sx={{ width: "100%", height: 360 }}>
        <LineChart
          xAxis={[{ data: xAxisDates, scaleType: "point", label: "Data de Envio" }]}
          series={lineData}
          width={undefined}
          height={340}
          margin={{ left: 40, right: 20, top: 30, bottom: 40 }}
          sx={{
            width: "100%",
            "& .MuiChartsAxis-line": { stroke: "#9e9e9e", strokeWidth: 0.2 },
            "& .MuiChartsGrid-line": { stroke: "#e0e0e0", strokeWidth: 0.1 },
          }}
        />
      </Box>
    ) : (
      <Typography color="text.secondary" textAlign="center" mt={2}>
        Nenhuma evolução registrada para esta KPI.
      </Typography>
    )}
  </Paper>
</main>

    </div>
  );
}
