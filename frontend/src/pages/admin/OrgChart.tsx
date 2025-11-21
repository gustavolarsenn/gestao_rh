import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useTeams } from "@/hooks/team/useTeams";
import { useTeamMembers } from "@/hooks/team-member/useTeamMembers";
import { Button } from "@/components/ui/button";

// Tipos auxiliares
type OrgNode = {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    isLeader: boolean;
  }[];
  children: OrgNode[];
};

export default function OrgChart() {
  const { listTeams } = useTeams();
  const { listTeamMembers } = useTeamMembers();

  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // teams pode ser paginado ou não
      const [teamsRes, members] = await Promise.all([
        listTeams(),       // pode retornar array ou { data, total }
        listTeamMembers(), // ✅ NÃO paginado: já vem como array
      ]);

      const teams: any[] = Array.isArray(teamsRes)
        ? teamsRes
        : teamsRes?.data || [];

      // Index de times
      const teamMap: Record<string, OrgNode> = {};
      for (const t of teams) {
        teamMap[t.id] = {
          id: t.id,
          name: t.name,
          members: [],
          children: [],
        };
      }

      // Vincula membros a times
      for (const m of members as any[]) {
        const team = teamMap[m.teamId];
        if (team) {
          team.members.push({
            id: m.employeeId,
            name: m.employee?.person?.name || `Emp#${m.employeeId}`,
            isLeader: m.isLeader,
          });
        }
      }

      // Monta hierarquia recursiva
      const roots: OrgNode[] = [];
      for (const team of teams) {
        if (team.parentTeamId) {
          const parent = teamMap[team.parentTeamId];
          if (parent) parent.children.push(teamMap[team.id]);
        } else {
          roots.push(teamMap[team.id]);
        }
      }

      setOrgTree(roots);
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 🔥 roda só uma vez, evita loop

  return (
    <div className="flex min-h-screen bg-[#fefefe]">
      <Sidebar />

      <main className="flex-1 p-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold text-[#151E3F] mb-6"
        >
          Organograma da Empresa
        </motion.h1>

        {loading ? (
          <p className="text-gray-500">Carregando organograma...</p>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {orgTree.map((node) => (
              <OrgBranch key={node.id} node={node} level={0} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ===============================================
// COMPONENTE RECURSIVO DE RENDERIZAÇÃO DO NÓ
// ===============================================
type BranchProps = {
  node: OrgNode;
  level: number;
};

function OrgBranch({ node, level }: BranchProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      {/* Bloco do time */}
      <div
        className={`rounded-xl shadow-md border-2 border-[#151E3F]/20 bg-white p-4 min-w-[240px] text-center ${
          level === 0 ? "bg-[#F8FAFC]" : ""
        }`}
      >
        <div className="font-semibold text-[#151E3F] text-left px-4">
          {node.name}
        </div>

        {/* Membros */}
        <div className="mt-2">
          {node.members.length === 0 ? (
            <p className="text-gray-400 text-xs italic text-left px-4">
              Sem membros
            </p>
          ) : (
            <ul className="text-xs space-y-1 text-left px-4 list-disc pl-5">
              {node.members.map((m) => (
                <li
                  key={m.id}
                  className={m.isLeader ? "font-bold text-[#151E3F]" : ""}
                >
                  {m.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {node.children.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
            className="mt-5 text-xs justify-center w-full"
          >
            {expanded ? "Ocultar Subtimes" : "Ver Subtimes"}
          </Button>
        )}
      </div>

      {/* Conector + Subtimes */}
      {expanded && node.children.length > 0 && (
        <div className="flex flex-col items-center mt-4">
          <div className="w-[2px] h-6 bg-[#151E3F]/30" />
          <div className="flex flex-wrap justify-center gap-8 mt-4">
            {node.children.map((child) => (
              <OrgBranch key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
