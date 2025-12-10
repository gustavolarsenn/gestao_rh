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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
        {/* TÍTULO */}
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
          Revisão de KPIs
        </Typography>

        {/* TABS */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${BORDER_COLOR}`,
            mb: 4,
          }}
        >
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Tabs
              value={tab}
              onChange={(_, newValue) => setTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 0,
                "& .MuiTabs-flexContainer": {
                  gap: { xs: 0.5, md: 1 },
                },
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
                  minHeight: 0,
                  paddingY: 1,
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
                  minHeight: 0,
                  paddingY: 1,
                  "&.Mui-selected": {
                    color: PRIMARY_COLOR,
                  },
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT_BG,
                  },
                }}
              />
            </Tabs>
          </Box>
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
