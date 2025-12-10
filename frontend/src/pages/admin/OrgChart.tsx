import { useEffect, useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useTeams } from "@/hooks/team/useTeams";
import { useTeamMembers } from "@/hooks/team-member/useTeamMembers";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
} from "@/utils/utils";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle, 
  Position
} from "reactflow";
import "reactflow/dist/style.css";

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

type OrgNodeData = { node: OrgNode };

// =========================
// NODE COMPONENT DO REACT FLOW
// =========================
function OrgNodeCard({ data }: { data: OrgNodeData }) {
  const node = data.node;

  return (
    <div className="relative rounded-xl shadow-md border-2 border-[#151E3F]/20 bg-white p-3 sm:p-4 min-w-[230px] max-w-[260px] text-center">

      {/* Handle de ENTRADA (de cima) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          borderRadius: "999px",
          opacity: 0,          // esconde o “ponto”, mas mantém a conexão
        }}
        isConnectable={false}
      />

      <div className="font-semibold text-[#151E3F] text-left px-1 sm:px-2 text-sm sm:text-base break-words">
        {node.name}
      </div>

      <div className="mt-2">
        {node.members.length === 0 ? (
          <p className="text-gray-400 text-xs italic text-left px-1 sm:px-2">
            Sem membros
          </p>
        ) : (
          <ul className="text-xs space-y-1 text-left px-1 sm:px-2 list-disc pl-4">
            {node.members.map((m) => (
              <li
                key={m.id}
                className={`${m.isLeader ? "font-bold text-[#151E3F]" : ""} break-words`}
              >
                {m.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Handle de SAÍDA (embaixo) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          borderRadius: "999px",
          opacity: 0,
        }}
        isConnectable={false}
      />
    </div>
  );
}

// Mapeia o tipo "orgNode" para o componente acima
const nodeTypes = {
  orgNode: OrgNodeCard,
};

export default function OrgChart() {
  const { listTeams } = useTeams();
  const { listTeamMembers } = useTeamMembers();

  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Organograma";
  }, []);

  // ref para o MAIN inteiro (tudo que você quer na imagem)
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [teamsRes, members] = await Promise.all([
        listTeams({ page: "1", limit: "1000" }),
        listTeamMembers(),
      ]);

      const teams: any[] = Array.isArray(teamsRes)
        ? teamsRes
        : teamsRes?.data || [];

      const teamMap: Record<string, OrgNode> = {};
      for (const t of teams) {
        teamMap[t.id] = {
          id: t.id,
          name: t.name,
          members: [],
          children: [],
        };
      }

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
  }, []);

  // =========================
  // CONVERTER ARVORE EM NODES / EDGES DO REACT FLOW
  // =========================
    const { flowNodes, flowEdges } = useMemo(() => {
    const nodes: Node<OrgNodeData>[] = [];
    const edges: Edge[] = [];

    const X_STEP = 260; // distância horizontal
    const Y_STEP = 220; // distância vertical
    let nextX = 0;

    // retorna a coordenada X do nó
    function layout(node: OrgNode, depth: number, parentId?: string): number {
      const id = node.id.toString();
      let x: number;

      if (!node.children.length) {
        // folha: ocupa a próxima coluna
        x = nextX * X_STEP;
        nextX += 1;
      } else {
        // calcula posição de todos os filhos primeiro
        let firstChildX: number | null = null;
        let lastChildX: number | null = null;

        node.children.forEach((child) => {
          const childX = layout(child, depth + 1, id);
          if (firstChildX === null || childX < firstChildX) firstChildX = childX;
          if (lastChildX === null || childX > lastChildX) lastChildX = childX;
        });

        if (firstChildX === null || lastChildX === null) {
          // fallback (não deve acontecer, mas por segurança)
          x = nextX * X_STEP;
          nextX += 1;
        } else {
          // pai fica centralizado entre primeiro e último filho
          x = (firstChildX + lastChildX) / 2;
        }
      }

      nodes.push({
        id,
        type: "orgNode",
        data: { node },
        position: { x, y: depth * Y_STEP },
      });

      if (parentId) {
        edges.push({
          id: `${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: false,
        });
      }

      return x;
    }

    // aplica layout para cada raiz
    orgTree.forEach((root) => layout(root, 0));

    // opcional: normaliza para começar um pouco à direita de 0
    if (nodes.length > 0) {
      const minX = nodes.reduce(
        (min, n) => (n.position.x < min ? n.position.x : min),
        nodes[0].position.x
      );
      const offsetX = -minX + X_STEP; // deixa uma margem à esquerda

      nodes.forEach((n) => {
        n.position = { ...n.position, x: n.position.x + offsetX };
      });
    }

    return { flowNodes: nodes, flowEdges: edges };
  }, [orgTree]);


  // =========================
  // EXPORTAR PARA PNG
  // =========================
  const handleExport = async () => {
    if (!exportRef.current) return;

    const container = exportRef.current;
    const rect = container.getBoundingClientRect();

    // adiciona classe para ocultar botões
    container.classList.add("org-exporting");

    try {
      // garante fontes carregadas (quando suportado)
      if ((document as any).fonts?.ready) {
        try {
          await (document as any).fonts.ready;
        } catch {
          /* ignora erro */
        }
      }

      const canvas = await html2canvas(container, {
        backgroundColor: "#fefefe",
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
        scale: 2,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `organograma-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.click();
    } finally {
      // volta tudo ao normal na tela
      container.classList.remove("org-exporting");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#fefefe]">
      <Sidebar />

      {/* tudo que será exportado está dentro deste main com ref */}
      <main ref={exportRef} className="flex-1 p-4 md:p-8 relative w-full">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-bold text-[#151E3F] mb-6 text-center md:text-left"
        >
          Organograma da Empresa
        </motion.h1>

        {loading ? (
          <p className="text-gray-500 text-sm md:text-base">
            Carregando organograma...
          </p>
        ) : (
          <div className="h-[70vh] md:h-[calc(100vh-160px)] w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            panOnScroll
            zoomOnScroll
            zoomOnPinch
            panOnDrag
            defaultEdgeOptions={{
              type: "step",
            }}
          >
          <Controls />
          </ReactFlow>

          </div>
        )}

        {/* Botão de exportação fixo, com ajustes para mobile */}
        <Button
          onClick={handleExport}
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 px-4 md:px-6 py-2 md:py-3 shadow-lg bg-[#0369a1] hover:bg-[#025f8c] text-white text-xs md:text-sm font-semibold org-export-btn"
        >
          Exportar organograma
        </Button>
      </main>
    </div>
  );
}
