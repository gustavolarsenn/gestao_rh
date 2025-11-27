import { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import { motion } from "framer-motion";

import TeamKpisDashboard from "./dashboard/TeamKPIDashboard";   // PARTE A
import TeamMembersKpiDashboard from "./dashboard/TeamMembersKPIDashboard"; // PARTE B

const PRIMARY_COLOR = "#0369a1";

export default function TeamDashboardTabs() {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex min-h-screen bg-[#f7f7f9]">
      <Sidebar />

      <main className="flex-1 p-8">
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          sx={{ mb: 4 }}
        >
          Dashboard do Time
        </Typography>

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
                backgroundColor: PRIMARY_COLOR,
              },
            }}
            textColor="inherit"
          >
            <Tab
              label="KPIs do Time"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                "&.Mui-selected": { color: PRIMARY_COLOR },
              }}
            />
            <Tab
              label="KPIs por Funcionário"
              sx={{
                fontWeight: 600,
                color: "#1e293b",
                "&.Mui-selected": { color: PRIMARY_COLOR },
              }}
            />
          </Tabs>
        </Paper>

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
