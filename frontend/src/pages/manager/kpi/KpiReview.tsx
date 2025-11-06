import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

import EmployeeKpiReviewSection from "./components/EmployeeKpiReviewSection";
import TeamKpiReviewSection from "./components/TeamKpiReviewSection";

export default function KpiReview() {
  const [activeTab, setActiveTab] = useState<"employees" | "teams">("employees");

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8 flex flex-col gap-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#151E3F]"
        >
          Revisão de KPIs
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab("employees")}
            className={`rounded-full px-5 ${
              activeTab === "employees"
                ? "bg-[#151E3F] text-white"
                : "bg-[#fefefe] border border-[#151E3F] text-[#151E3F] hover:bg-[#151E3F] hover:text-white"
            }`}
          >
            Funcionários
          </Button>
          <Button
            onClick={() => setActiveTab("teams")}
            className={`rounded-full px-5 ${
              activeTab === "teams"
                ? "bg-[#151E3F] text-white"
                : "bg-[#fefefe] border border-[#151E3F] text-[#151E3F] hover:bg-[#151E3F] hover:text-white"
            }`}
          >
            Times
          </Button>
        </div>

        {/* Conteúdo dinâmico */}
        <AnimatePresence mode="wait">
          {activeTab === "employees" ? (
            <motion.div
              key="employees"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.3 }}
            >
              <EmployeeKpiReviewSection />
            </motion.div>
          ) : (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.3 }}
            >
              <TeamKpiReviewSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
