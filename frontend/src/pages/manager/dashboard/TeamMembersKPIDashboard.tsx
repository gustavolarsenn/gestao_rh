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
  CircularProgress,
} from "@mui/material";

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

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
} from "@/utils/utils";

// 👉 Recharts
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
  const { listTeamMembers, listTeamMembersForKPI } = useTeamMembers();
  const { listEmployeeKpis } = useEmployeeKpis();
  const { listEmployeeKpiEvolutions } = useEmployeeKpiEvolutions();
  const { listPerformanceReviewsEmployee, createPerformanceReviewEmployee } =
    usePerformanceReviews();

  // =====================================
  // 🔥 STATE
  // =====================================
  const [members, setMembers] = useState<any[]>([]);
  const [employeeKpis, setEmployeeKpis] = useState<any[]>([]);
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
  const [filterStart, setFilterStart] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const [filterEnd, setFilterEnd] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterKpi, setFilterKpi] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");

  const [selectedEmployeeKpiId, setSelectedEmployeeKpiId] =
    useState<string | null>(null);

  // =====================================
  // 🔥 LOAD INITIAL DATA
  // =====================================
  useEffect(() => {
    async function load() {
      setLoading(true);

      // Team members
      const mResult = await listTeamMembersForKPI();
      const m = (mResult as any)?.data ?? mResult ?? [];
      setMembers(m);

      const memberEmployeeIds = new Set(
        m.map((tm: any) => tm.employeeId).filter(Boolean)
      );

      // Employee KPIs -> apenas dos membros do time
      const ekResult = await listEmployeeKpis({ page: 1, limit: 999 });
      const ekAll = (ekResult as any)?.data ?? ekResult ?? [];
      const ek = ekAll.filter((k: any) => memberEmployeeIds.has(k.employeeId));
      setEmployeeKpis(ek);

      // Evoluções -> apenas das KPIs acima
      const evResult = await listEmployeeKpiEvolutions({
        page: 1,
        limit: 999,
      });
      const evAll = (evResult as any)?.data ?? evResult ?? [];
      const employeeKpiIds = new Set(ek.map((k: any) => k.id));
      const evA = evAll.filter((e: any) => employeeKpiIds.has(e.employeeKpiId));
      const ev = evA.filter((e: any) => e.status === "APPROVED");
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
      const res = await listPerformanceReviewsEmployee({
        employeeId,
        page,
        limit: reviewPageSize,
        leaderView: true,
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
    if (!filterEmployee) {
      setPerformanceReviews([]);
      setReviewTotal(0);
      setReviewPage(1);
      return;
    }
    setReviewPage(1);
  }, [filterEmployee]);

  useEffect(() => {
    if (!filterEmployee) return;
    fetchPerformanceReviews(filterEmployee, reviewPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmployee, reviewPage]);

  const totalReviewPages = Math.max(
    1,
    Math.ceil((reviewTotal || 1) / reviewPageSize)
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
  }, [
    employeeKpis,
    filterEmployee,
    filterType,
    filterKpi,
    filterStart,
    filterEnd,
  ]);

  // =====================================
  // 🔢 VALOR AGREGADO POR KPI (cards)
  // =====================================
  const kpiAggregatedAchieved = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};

    employeeKpis.forEach((k) => {
      const type = k.kpi?.evaluationType?.code || "";
      const evs = evolutions.filter((ev) => ev.employeeKpiId === k.id);

      if (type.endsWith("_SUM")) {
        const total = evs.reduce((acc, ev) => {
          const n = Number(ev.achievedValueEvolution || 0);
          return acc + (Number.isFinite(n) ? n : 0);
        }, 0);
        map[k.id] = total;
      } else {
        if (evs.length) {
          const latest = evs
            .slice()
            .sort(
              (a, b) =>
                new Date(b.submittedDate ?? b.submittedAt).getTime() -
                new Date(a.submittedDate ?? a.submittedAt).getTime()
            )[0];
          const n = Number(
            latest.achievedValueEvolution ??
              latest.achievedValue ??
              k.achievedValue ??
              0
          );
          map[k.id] = Number.isFinite(n) ? n : 0;
        } else {
          const n = Number(k.achievedValue ?? 0);
          map[k.id] = Number.isFinite(n) ? n : 0;
        }
      }
    });

    return map;
  }, [employeeKpis, evolutions]);

  // Atualiza KPI selecionada automaticamente
  useEffect(() => {
    if (filterKpi) {
      setSelectedEmployeeKpiId(filterKpi);
    } else if (
      !filteredEmployeeKpis.some((k) => k.id === selectedEmployeeKpiId)
    ) {
      setSelectedEmployeeKpiId(filteredEmployeeKpis[0]?.id || null);
    }
  }, [filterKpi, filteredEmployeeKpis, selectedEmployeeKpiId]);

  const selectedKpi = filteredEmployeeKpis.find(
    (k) => k.id === selectedEmployeeKpiId
  );

  const selectedEvaluationType = selectedKpi?.kpi?.evaluationType?.code || "";

  const isPctType = selectedEvaluationType.endsWith("_PCT");
  const isSumType = selectedEvaluationType.endsWith("_SUM");

  // =====================================
  // 🔥 FILTRAR EVOLUÇÕES DA KPI SELECIONADA
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
    const isPct = type.endsWith("_PCT");
    const isSum = type.endsWith("_SUM");

    if (isPct) {
      const ordered = selectedEvols
        .slice()
        .sort(
          (a, b) =>
            new Date(a.submittedDate ?? a.submittedAt).getTime() -
            new Date(b.submittedDate ?? b.submittedAt).getTime()
        );

      return ordered.map((ev) => ({
        date: ev.submittedDate || ev.submittedAt,
        value: Number(
          ev.achievedValueEvolution ?? ev.achievedValue ?? 0
        ),
      }));
    }

    const grouped: Record<string, any[]> = {};

    for (const ev of selectedEvols) {
      const dateStr = (ev.submittedDate || ev.submittedAt).split("T")[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(ev);
    }

    let daily = Object.entries(grouped).map(([date, list]) => {
      if (isSum) {
        const dayTotal = (list as any[]).reduce((acc, x) => {
          const n = Number(x.achievedValueEvolution || 0);
          return acc + (Number.isFinite(n) ? n : 0);
        }, 0);
        return { date, value: dayTotal };
      }

      const latest = (list as any[])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.submittedDate ?? b.submittedAt).getTime() -
            new Date(a.submittedDate ?? a.submittedAt).getTime()
        )[0];

      const n = Number(latest.achievedValueEvolution || 0);
      return { date, value: Number.isFinite(n) ? n : 0 };
    });

    daily = daily.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (isSum) {
      let running = 0;
      daily = daily.map((d) => {
        running += d.value;
        return { date: d.date, value: running };
      });
    }

    return daily;
  }, [selectedEvols, selectedKpi]);

  const sortedAggregatedEvolutions = aggregatedEvolutions;

  // =====================================
  // 📊 DADOS DO GRÁFICO + DOMÍNIO
  // =====================================
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
          const dateStr = (ev.submittedDate || ev.submittedAt).split("T")[0];
          const value = Number(ev.achievedValueEvolution || 0);
          groupedDaily[dateStr] =
            (groupedDaily[dateStr] || 0) +
            (Number.isFinite(value) ? value : 0);
        }

        baseValuesForAverage = Object.values(groupedDaily);
      } else {
        baseValuesForAverage = sortedAggregatedEvolutions.map((d) => {
          const v = Number(d.value) || 0;
          return Number.isFinite(v) ? v : 0;
        });
      }
    }

    const avg =
      !isPct && baseValuesForAverage.length > 0
        ? baseValuesForAverage.reduce((a, b) => a + b, 0) /
          baseValuesForAverage.length
        : undefined;

    const rawGoal = Number(selectedKpi.goal ?? 0);
    const goal =
      Number.isFinite(rawGoal) && rawGoal > 0 ? rawGoal : undefined;

    return sortedAggregatedEvolutions.map((d) => ({
      date: d.date,
      value: d.value,
      avg,
      goal,
    }));
  }, [sortedAggregatedEvolutions, selectedKpi, selectedEvols]);

  const yDomain = useMemo<[number, number]>(() => {
    if (!chartData.length) return [0, 10];

    let maxValue = 0;
    chartData.forEach((d) => {
      const v = Number(d.value ?? 0);
      const a = d.avg !== undefined ? Number(d.avg) : 0;
      const g = Number(d.goal ?? 0);
      maxValue = Math.max(
        maxValue,
        Number.isFinite(v) ? v : 0,
        Number.isFinite(a) ? a : 0,
        Number.isFinite(g) ? g : 0
      );
    });

    if (maxValue === 0) return [0, 10];
    return [0, Math.ceil(maxValue * 1.1)];
  }, [chartData]);

  // =====================================
  // STATUS E TOTAIS
  // =====================================
  const total = filteredEmployeeKpis.length;
  const counts = {
    naoIniciados: filteredEmployeeKpis.filter((k) => k.status === "DRAFT")
      .length,
    iniciados: filteredEmployeeKpis.filter((k) => k.status === "SUBMITTED")
      .length,
    finalizados: filteredEmployeeKpis.filter((k) => k.status === "APPROVED")
      .length,
  };

  // =====================================
  // 🔥 HEATMAP (considera filtros)
  // =====================================
  const heatmapDays = useMemo(() => {
    let evs = [...evolutions];

    if (filterEmployee) {
      const kpisIds = employeeKpis
        .filter((k) => k.employeeId === filterEmployee)
        .map((k) => k.id);
      const idsSet = new Set(kpisIds);
      evs = evs.filter((e) => idsSet.has(e.employeeKpiId));
    }

    if (filterType) {
      evs = evs.filter((ev) => {
        const k = employeeKpis.find((kp) => kp.id === ev.employeeKpiId);
        return k?.kpi?.evaluationType?.code === filterType;
      });
    }

    if (filterKpi) {
      evs = evs.filter((ev) => ev.employeeKpiId === filterKpi);
    }

    if (filterStart) {
      const start = parseISO(filterStart);
      evs = evs.filter((ev) => {
        const d = parseISO(ev.submittedDate ?? ev.submittedAt);
        return isAfter(d, start) || isEqual(d, start);
      });
    }

    if (filterEnd) {
      const end = parseISO(filterEnd);
      evs = evs.filter((ev) => {
        const d = parseISO(ev.submittedDate ?? ev.submittedAt);
        return isBefore(d, end) || isEqual(d, end);
      });
    }

    return evs;
  }, [
    evolutions,
    employeeKpis,
    filterEmployee,
    filterType,
    filterKpi,
    filterStart,
    filterEnd,
  ]);

  const start = startOfMonth(subMonths(new Date(), 2));
  const end = endOfMonth(new Date());
  const allDays = eachDayOfInterval({ start, end });

  const dayCounts = allDays.map((day) => ({
    day,
    count: heatmapDays.filter((ev) =>
      isSameDay(parseISO(ev.submittedDate ?? ev.submittedAt), day)
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
        .filter((_, i) => i % 14 === 0)
        .map((d) => format(d, "MMM", { locale: ptBR }))
    )
  );

  // =====================================
  // 📊 MÉTRICAS PARA OS CARDS RESUMO
  // =====================================
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

    filteredEmployeeKpis.forEach((k) => {
      const type = k.kpi?.evaluationType?.code || "";

      let achieved = 0;
      let goal = 0;

      if (type === "BINARY") {
        // KPI binária: 0 ou 1
        achieved = k.achievedValue === "Sim" ? 1 : 0;
        goal = 1;
      } else {
        const rawAchieved =
          kpiAggregatedAchieved[k.id] ?? Number(k.achievedValue ?? 0);
        const nAchieved = Number(rawAchieved);
        achieved = Number.isFinite(nAchieved) ? nAchieved : 0;

        const rawGoal = Number(k.goal);
        goal = Number.isFinite(rawGoal) && rawGoal > 0 ? rawGoal : 0;
      }

      const pct =
        goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;

      sumProgress += pct;

      if (k.periodEnd) {
        const endDate = parseISO(k.periodEnd);
        const diffMs = endDate.getTime() - today.getTime();
        const diffDays = Math.round(
          diffMs / (1000 * 60 * 60 * 24)
        );
        if (diffDays >= 0) {
          somaDiasRestantes += diffDays;
          kpisComPrazo += 1;
        }
      }
    });

    const avgProgressPctInnerRaw =
      filteredEmployeeKpis.length > 0
        ? sumProgress / filteredEmployeeKpis.length
        : 0;
    const avgProgressPctInner = Number.isFinite(avgProgressPctInnerRaw)
      ? avgProgressPctInnerRaw
      : 0;

    const completionPctInnerRaw =
      filteredEmployeeKpis.length > 0
        ? (counts.finalizados / filteredEmployeeKpis.length) * 100
        : 0;
    const completionPctInner = Number.isFinite(completionPctInnerRaw)
      ? completionPctInnerRaw
      : 0;

    const avgDaysRemainingInner =
      kpisComPrazo > 0 ? Math.round(somaDiasRestantes / kpisComPrazo) : 0;

    const totalEvolutionsInner = heatmapDays.length;

    const lastFeedbackDateFormattedInner =
      performanceReviews.length > 0 &&
      performanceReviews[0].date &&
      !Number.isNaN(
        new Date(performanceReviews[0].date).getTime()
      )
        ? format(
            parseISO(performanceReviews[0].date),
            "dd/MM/yyyy"
          )
        : "-";

    return {
      avgProgressPct: avgProgressPctInner,
      completionPct: completionPctInner,
      avgDaysRemaining: avgDaysRemainingInner,
      totalEvolutions: totalEvolutionsInner,
      lastFeedbackDateFormatted: lastFeedbackDateFormattedInner,
    };
  }, [
    filteredEmployeeKpis,
    counts.finalizados,
    heatmapDays,
    performanceReviews,
    kpiAggregatedAchieved,
  ]);

  const displayAvgProgress = Number.isFinite(avgProgressPct)
    ? avgProgressPct.toFixed(0)
    : "0";

  const displayCompletionPct = Number.isFinite(completionPct)
    ? completionPct.toFixed(0)
    : "0";

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

    await createPerformanceReviewEmployee({
      employeeId: filterEmployee,
      date: reviewDate,
      observation: reviewObservation,
    } as any);

    setReviewModalOpen(false);
    setReviewPage(1);
    await fetchPerformanceReviews(filterEmployee, 1);
  }

  // =====================================
  // 🔥 EXPORTAR PDF (esconde filtros e botão; usa <main>)
  // =====================================
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      const sidebar = document.querySelector("aside") as
        | HTMLElement
        | null;
      const filters = document.getElementById(
        "dashboard-filters"
      ) as HTMLElement | null;
      const exportBtn = document.getElementById(
        "dashboard-export-btn"
      ) as HTMLElement | null;

      const originalSidebarDisplay = sidebar?.style.display ?? "";
      const originalFiltersDisplay = filters?.style.display ?? "";
      const originalBtnDisplay = exportBtn?.style.display ?? "";

      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      if (sidebar) sidebar.style.display = "none";
      if (filters) filters.style.display = "none";
      if (exportBtn) exportBtn.style.display = "none";

      await new Promise((resolve) => setTimeout(resolve, 400));

      const mainElement = document.querySelector("main") as
        | HTMLElement
        | null;
      if (!mainElement) {
        throw new Error("Elemento main não encontrado");
      }

      window.scrollTo(0, 0);

      const canvas = await html2canvas(mainElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#f7f7f9",
        windowWidth: mainElement.scrollWidth,
        windowHeight: mainElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // mm
      const pageHeight = 297; // A4 mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let pdf;

      if (imgHeight <= pageHeight) {
        // página única com altura exata (sem espaço em branco)
        pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: [imgWidth, imgHeight],
        });
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // várias páginas A4
        pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`dashboard-equipe-${format(new Date(), "yyyy-MM-dd")}.pdf`);

      // restaura
      if (sidebar) sidebar.style.display = originalSidebarDisplay;
      if (filters) filters.style.display = originalFiltersDisplay;
      if (exportBtn) exportBtn.style.display = originalBtnDisplay;
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Erro ao exportar o dashboard. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  // =====================================
  // RENDER
  // =====================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa]">
        <Box className="flex h-screen items-center justify-center">
          <CircularProgress />
        </Box>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f9]">
      <Box className="min-h-screen bg-[#f7f7f9]">
        {/* BOTÃO EXPORTAR */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 0 },
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="#1e293b"
            sx={{
              textAlign: { xs: "center", md: "left" },
              fontSize: { xs: "1.5rem", md: "2.125rem" },
            }}
          >
            Dashboard de KPIs de Membros de Time
          </Typography>
          <Button
            id="dashboard-export-btn"
            variant="contained"
            startIcon={
              isExporting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            disabled={isExporting}
            onClick={handleExportPDF}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1,
              backgroundColor: PRIMARY_COLOR,
              "&:hover": { backgroundColor: PRIMARY_COLOR },
            }}
          >
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </Box>

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
              {displayAvgProgress}%
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
              {displayCompletionPct}% das KPIs concluídas
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

        {/* ===================== FILTROS ===================== */}
        <Paper
          id="dashboard-filters"
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
              <InputLabel>Funcionário</InputLabel>
              <Select
                label="Funcionário"
                value={filterEmployee}
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
                label="Tipo de KPI"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="HIGHER_BETTER_SUM">
                  Maior melhor (Soma)
                </MenuItem>
                <MenuItem value="LOWER_BETTER_SUM">
                  Menor melhor (Soma)
                </MenuItem>
                <MenuItem value="HIGHER_BETTER_PCT">
                  Maior melhor (Pct)
                </MenuItem>
                <MenuItem value="LOWER_BETTER_PCT">
                  Menor melhor (Pct)
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
                {filteredEmployeeKpis.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {k.employee?.person?.name} — {k.kpi?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setFilterStart(format(new Date(), "yyyy-MM-dd"));
                setFilterEnd("");
                setFilterType("");
                setFilterKpi("");
                setFilterEmployee("");
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

        {/* ==================== LINHA 1: METAS + COLUNA DIREITA ==================== */}
        <Box
          display="flex"
          gap={3}
          mb={4}
          flexWrap={{ xs: "wrap", lg: "nowrap" }}
          alignItems="stretch"
        >
          {/* METAS / PROGRESSO POR KPI */}
          <Paper
            elevation={0}
            sx={{
              flex: { xs: "1 1 100%", lg: "1 1 0" },
              minWidth: 0,
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
              Objetivos e progresso por KPI da equipe
            </Typography>

            {filteredEmployeeKpis.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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
                {filteredEmployeeKpis.map((k) => {
                  const type = k.kpi?.evaluationType?.code || "";
                  let achieved =
                    kpiAggregatedAchieved[k.id] ??
                    Number(k.achievedValue ?? 0);
                  let goal = Number(k.goal) || 0;
                  let pct =
                    goal > 0 ? Math.min((achieved / goal) * 100, 100) : 0;

                  const deadline = k.periodEnd
                    ? format(parseISO(k.periodEnd), "dd/MM/yyyy")
                    : "-";

                  let statusLabel = "Pendente";
                  let statusBg = "#F3F4F6";
                  let statusColor = "#4B5563";
                  let StatusIcon: any = RadioButtonUncheckedRoundedIcon;
                  let iconColor = "#9CA3AF";

                  if (type === "BINARY") {
                    goal = 1;
                    if (
                      (k.achievedValue != "Sim" &&
                        k.periodEnd &&
                        new Date() > new Date(k.periodEnd)) ||
                      k.achievedValue == "Não"
                    ) {
                      statusLabel = "Expirada";
                      statusBg = "#c52d2250";
                      statusColor = "#c52d22ff";
                      StatusIcon = CancelRoundedIcon;
                      iconColor = "#c52d22ff";
                      achieved = 0;
                      pct = 0;
                    } else if (k.achievedValue === "Sim") {
                      statusLabel = "Concluída";
                      statusBg = "#22c55e2a";
                      statusColor = "#22C55E";
                      StatusIcon = CheckCircleRoundedIcon;
                      iconColor = "#22C55E";
                      achieved = 1;
                      pct = 100;
                    }
                  }

                  if (type.endsWith("_SUM") || type.endsWith("_PCT")) {
                    if (
                      pct < 100 &&
                      k.periodEnd &&
                      new Date() > new Date(k.periodEnd)
                    ) {
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

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={0.3}
                          >
                            {k.employee?.person?.name ?? "Funcionário"}
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
                              backgroundColor:
                                pct < 100 ? PRIMARY_COLOR : "#22c55e",
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

          {/* COLUNA DIREITA: HEATMAP + FEEDBACKS */}
          <Box
            sx={{
              flex: { xs: "1 1 100%", lg: "1 1 0" },
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {/* HEATMAP */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                flex: "0 0 auto",
                p: 3,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                overflowX: "auto",
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Atividade (3 meses)
              </Typography>

              <Box display="flex" justifyContent="center" mb={1.5}>
                {monthsLabels.map((m, i) => (
                  <Typography
                    key={`${m}-${i}`}
                    variant="caption"
                    fontWeight={600}
                    sx={{ mx: 1.5 }}
                  >
                    {m}
                  </Typography>
                ))}
              </Box>

              <Box display="flex" justifyContent="center">
                <Box display="flex" gap={0.75} sx={{ mx: "auto" }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                    mr={0.75}
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

                  <Box display="flex" gap={0.5}>
                    {weeks.map((week, wi) => (
                      <Box
                        key={wi}
                        display="flex"
                        flexDirection="column"
                        gap={0.5}
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
                                width: 18,
                                height: 18,
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
                width: "100%",
                flex: "0 0 calc(50% - 20px)",
                p: 3,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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

                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    backgroundColor: PRIMARY_COLOR,
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
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: 260,
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
                            Selecione um funcionário nos filtros para
                            visualizar as avaliações.
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

                {/* paginação */}
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

        {/* ==================== GRÁFICO ESTICADO ==================== */}
        <Box pb={4}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: 4,
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Evolução das KPIs
            </Typography>

            <Box
              display="flex"
              flexWrap="wrap"
              gap={1.5}
              mb={3}
              sx={{ maxHeight: 120, overflowY: "auto" }}
            >
              {filteredEmployeeKpis.map((k) => (
                <Button
                  key={k.id}
                  variant={
                    selectedEmployeeKpiId === k.id ? "contained" : "outlined"
                  }
                  onClick={() => setSelectedEmployeeKpiId(k.id)}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    fontWeight: 600,
                    px: 2.5,
                    borderColor: PRIMARY_COLOR,
                    color:
                      selectedEmployeeKpiId === k.id ? "white" : PRIMARY_COLOR,
                    backgroundColor:
                      selectedEmployeeKpiId === k.id
                        ? PRIMARY_COLOR
                        : "transparent",
                    "&:hover": {
                      backgroundColor:
                        selectedEmployeeKpiId === k.id
                          ? PRIMARY_COLOR
                          : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {k.employee?.person?.name} — {k.kpi?.name}
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

        {/* MODAL NOVA PERFORMANCE REVIEW */}
        <BaseModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Nova Performance Review"
          description="Registre uma avaliação para o funcionário selecionado."
          footer={
            <Box display="flex" justifyContent="flex-end" gap={1} width="100%">
              <Button
                variant="outlined"
                onClick={() => setReviewModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: PRIMARY_COLOR }}
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
    </main>
  );
}
