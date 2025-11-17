import { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

import EmployeeKpiReviewSection from "./components/EmployeeKpiReviewSection";
import TeamKpiReviewSection from "./components/TeamKpiReviewSection";

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
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            mb: 4,
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "#1e293b",
              },
            }}
            textColor="inherit"
          >
            <Tab
              label="KPIs de Funcionários"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                "&.Mui-selected": { color: "#1e293b" },
              }}
            />
            <Tab
              label="KPIs de Times"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                "&.Mui-selected": { color: "#1e293b" },
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
