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

import { useTeamKpis } from "@/hooks/team-kpi/useTeamKpis";
import { useTeamKpiEvolutions } from "@/hooks/team-kpi/useTeamKpiEvolutions";

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

// ==========================
// 💠 FUNÇÕES DE COR
// ==========================

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

// ==========================
// 💠 COMPONENTE PRINCIPAL
// ==========================

export default function TeamKpisDashboard() {
  const { listTeamKpis } = useTeamKpis();
  const { listTeamKpiEvolutions } = useTeamKpiEvolutions();

  const [loading, setLoading] = useState(false);

  const [teamKpis, setTeamKpis] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);

  // ==========================
  // 🔎 FILTROS
  // ==========================
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterKpi, setFilterKpi] = useState("");

  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);

  // ==========================
  // 🔥 LOAD KPIs + EVOLUTIONS
  // ==========================
  useEffect(() => {
    async function load() {
      setLoading(true);
      const tk = await listTeamKpis();
      const teamOnlyKpis = tk;
      setTeamKpis(teamOnlyKpis);

      const ev = await listTeamKpiEvolutions();
      const evFiltered = ev.filter((e) =>
        teamOnlyKpis.some((k) => k.id === e.teamKpiId)
      );
      setEvolutions(evFiltered);

      if (teamOnlyKpis.length) setSelectedKpiId(teamOnlyKpis[0].id);

      setLoading(false);
    }
    load();
  }, []);
  // ==========================
  // 🎯 APLICAR FILTROS
  // ==========================

  const filteredKpis = useMemo(() => {
    return teamKpis.filter((k) => {
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
  }, [teamKpis, filterType, filterKpi, filterStart, filterEnd]);

  useEffect(() => {
    if (filterKpi) {
      setSelectedKpiId(filterKpi);
    } else if (!filteredKpis.some((k) => k.id === selectedKpiId)) {
      setSelectedKpiId(filteredKpis[0]?.id || null);
    }
  }, [filterKpi, filteredKpis]);

  const selectedKpi = filteredKpis.find((k) => k.id === selectedKpiId);

  // ==========================
  // 🔥 FILTRO DE EVOLUÇÕES
  // ==========================

  const selectedEvols = useMemo(() => {
    if (!selectedKpiId) return [];

    let evs = evolutions.filter((e) => e.teamKpiId === selectedKpiId);

    if (filterStart) {
      const start = parseISO(filterStart);
      evs = evs.filter((e) => {
        const d = parseISO(e.submittedDate);
        return isAfter(d, start) || isEqual(d, start);
      });
    }

    if (filterEnd) {
      const end = parseISO(filterEnd);
      evs = evs.filter((e) => {
        const d = parseISO(e.submittedDate);
        return isBefore(d, end) || isEqual(d, end);
      });
    }

    return evs;
  }, [selectedKpiId, evolutions, filterStart, filterEnd]);

  // ==========================
  // 📈 AGGREGATED FOR CHART
  // ==========================

  const aggregatedEvolutions = useMemo(() => {
    if (!selectedKpi || !selectedEvols.length) return [];

    const type = selectedKpi.kpi?.evaluationType?.code || "";
    const grouped: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const day = ev.submittedDate.split("T")[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(ev);
    }

    return Object.entries(grouped).map(([date, list]) => {
      if (type.endsWith("_SUM")) {
        return {
          date,
          value: list.reduce((a, e) => a + Number(e.achievedValueEvolution || 0), 0),
        };
      }

      const latest = list.sort(
        (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()
      )[0];

      return { date, value: Number(latest.achievedValueEvolution) || 0 };
    });
  }, [selectedEvols, selectedKpi]);

  // ==========================
  // 🔢 PIE + PROGRESS
  // ==========================

  const total = filteredKpis.length;
  const counts = {
    DRAFT: filteredKpis.filter((k) => k.status === "DRAFT").length,
    SUBMITTED: filteredKpis.filter((k) => k.status === "SUBMITTED").length,
    APPROVED: filteredKpis.filter((k) => k.status === "APPROVED").length,
  };

  // ==========================
  // 🔥 HEATMAP
  // ==========================

  const start = startOfMonth(subMonths(new Date(), 2));
  const end = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start, end });

  const heatmap = allDays.map((day) => ({
    day,
    count: evolutions.filter((e) => isSameDay(parseISO(e.submittedDate), day)).length,
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
      allDays.filter((_, i) => i % 14 === 0).map((d) => format(d, "MMM", { locale: ptBR }))
    )
  );

  // ==========================
  // 🧊 RENDER
  // ==========================

  return (
    <Box>

      {/* ================= FILTROS ================= */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Filtros
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2}>

          <TextField size="small" sx={{ flex: "1 1 200px" }} label="Data inicial" type="date" value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            InputLabelProps={{ shrink: true }} />

          <TextField size="small" sx={{ flex: "1 1 200px" }} label="Data final" type="date" value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            InputLabelProps={{ shrink: true }} />

          <FormControl sx={{ flex: "1 1 200px" }} size="small">
            <InputLabel>Tipo de KPI</InputLabel>
            <Select value={filterType} label="Tipo de KPI"
              onChange={(e) => setFilterType(e.target.value)}>
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
            <Select value={filterKpi} label="KPI"
              onChange={(e) => setFilterKpi(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {filteredKpis.map((k) => (
                <MenuItem key={k.id} value={k.id}>{k.kpi?.name}</MenuItem>
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
            setFilterStart(""); setFilterEnd("");
            setFilterKpi(""); setFilterType("");
          }}>
            Limpar
          </Button>
        </Box>
      </Paper>

      {/* ===================== LINHA 1 ===================== */}
      <Box display="flex" gap={3} flexWrap="nowrap" mb={4}>

        {/* ===== PIE ===== */}
        <Paper sx={{ flexBasis: "30%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Status das KPIs
          </Typography>

          <Box sx={{ position: "relative", width: 300, height: 300 }}>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: counts.DRAFT, label: "Rascunho", color: "#FF6B6B" },
                    { id: 1, value: counts.SUBMITTED, label: "Enviado", color: "#FFC260" },
                    { id: 2, value: counts.APPROVED, label: "Aprovado", color: "#6FCF97" },
                  ],
                  innerRadius: 80,
                  outerRadius: 100,
                },
              ]}
              width={300}
              height={300}
            />

            <Box sx={{
              position: "absolute", top: "52%", left: "50%",
              transform: "translate(-50%, -60%)", textAlign: "center"
            }}>
              <Typography variant="h4" fontWeight={700}>{total}</Typography>
              <Typography variant="caption">KPIs</Typography>
            </Box>
          </Box>
        </Paper>

        {/* ===== PROGRESSO ===== */}
        <Paper sx={{ flexBasis: "40%", p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Progresso por KPI
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            {filteredKpis.map((k) => {
              const achieved = Number(k.achievedValue) || 0;
              const goal = Number(k.goal) || 0;
              const pct = goal ? Math.min((achieved / goal) * 100, 100) : 0;
              const color = colorByProgress(achieved, goal);

              return (
                <Box key={k.id}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontWeight={600}>{k.kpi?.name}</Typography>
                    <Typography>{achieved} / {goal} ({pct.toFixed(0)}%)</Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#e0e0e0",
                      "& .MuiLinearProgress-bar": {
                        background: color,
                        borderRadius: 6,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* ===== HEATMAP ===== */}
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
            <Box display="flex" flexDirection="column" justifyContent="space-between" mr={1}>
              {["D", "S", "T", "Qa", "Qi", "Sx", "Sa"].map((d, i) => (
                <Typography key={i} variant="caption" color="#6b7280">
                  {d}
                </Typography>
              ))}
            </Box>

            <Box display="flex" gap={0.5}>
              {weeks.map((week, wi) => (
                <Box key={wi} display="flex" flexDirection="column" gap={0.5}>
                  {week.map((d, di) => (
                    <Tooltip key={di}
                      title={`${format(d.day, "dd/MM")}: ${d.count} evolução(es)`}>
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        backgroundColor: getHeatColor(d.count),
                        opacity: isSameMonth(d.day, new Date()) ? 1 : 0.4,
                      }} />
                    </Tooltip>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

        </Paper>
      </Box>

      {/* ===================== GRÁFICO ===================== */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>
          Evolução das KPIs
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {filteredKpis.map((k) => (
            <Button
              key={k.id}
              variant={selectedKpiId === k.id ? "contained" : "outlined"}
              onClick={() => setSelectedKpiId(k.id)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2,
                backgroundColor: selectedKpiId === k.id ? "#1e293b" : "transparent",
                color: selectedKpiId === k.id ? "#fff" : "#1e293b",
                borderColor: "#1e293b",
              }}
            >
              {k.kpi?.name}
            </Button>
          ))}
        </Box>

        {aggregatedEvolutions.length ? (
          <Box sx={{ width: "100%", height: 350 }}>
            <LineChart
              xAxis={[
                {
                  data: aggregatedEvolutions.map((d) => d.date),
                  scaleType: "point",
                  label: "Data",
                },
              ]}
              series={[
                {
                  label: selectedKpi?.kpi?.name || "KPI",
                  data: aggregatedEvolutions.map((d) => d.value),
                  color: "#3b82f6",
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

    </Box>
  );
}
