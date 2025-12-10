import { useEffect, useState } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

import TeamKpisDashboard from "./dashboard/TeamKPIDashboard"; // PARTE A
import TeamMembersKpiDashboard from "./dashboard/TeamMembersKPIDashboard"; // PARTE B

const PRIMARY_COLOR = "#0369a1";
const PRIMARY_LIGHT_BG = "#e0f2ff";

export default function TeamDashboardTabs() {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    document.title = "Dashboard do Time";
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 w-full">
        {/* ABAS */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            mb: 4,
            border: "1px solid #e2e8f0",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
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
              label="KPIs do Time"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#64748b",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                "&.Mui-selected": {
                  color: PRIMARY_COLOR,
                },
                "&:hover": {
                  backgroundColor: PRIMARY_LIGHT_BG,
                },
              }}
            />
            <Tab
              label="KPIs por Colaborador"
              sx={{
                fontWeight: 600,
                textTransform: "none",
                color: "#64748b",
                fontSize: { xs: "0.85rem", md: "0.95rem" },
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
            <TeamKpisDashboard />
          </Box>

          <Box sx={{ display: tab === 1 ? "block" : "none" }}>
            <TeamMembersKpiDashboard />
          </Box>
        </motion.div>
      </main>
    </div>
  );
}
