import { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

import EmployeeKpiReviewSection from "./components/EmployeeKpiReviewSection";
import TeamKpiReviewSection from "./components/TeamKpiReviewSection";

// Paleta unificada
const PRIMARY_COLOR = "#0369a1";
const PRIMARY_LIGHT = "#0ea5e9";
const PRIMARY_LIGHT_BG = "#e0f2ff";
const BORDER_COLOR = "#e2e8f0";

export default function KpiReview() {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* TÍTULO */}
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          sx={{ mb: 4 }}
        >
          Revisão de KPIs
        </Typography>

        {/* TABS */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${BORDER_COLOR}`,
            mb: 4,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: PRIMARY_COLOR,
                height: 3,
                borderRadius: 999,
              },
            }}
            textColor="inherit"
          >
            <Tab
              label="KPIs de Funcionários"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#64748b",
                "&.Mui-selected": {
                  color: PRIMARY_COLOR,
                },
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
            />
            <Tab
              label="KPIs de Times"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#64748b",
                "&.Mui-selected": {
                  color: PRIMARY_COLOR,
                },
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
            />
          </Tabs>
        </Paper>

        {/* CONTEÚDO DAS ABAS */}
        <motion.div
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ display: tab === 0 ? "block" : "none" }}>
            <EmployeeKpiReviewSection />
          </Box>

          <Box sx={{ display: tab === 1 ? "block" : "none" }}>
            <TeamKpiReviewSection />
          </Box>
        </motion.div>
      </main>
    </div>
  );
}
