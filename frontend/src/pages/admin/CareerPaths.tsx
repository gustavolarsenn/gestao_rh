// src/pages/admin/CareerPaths.tsx
import { useState, useEffect, useMemo, memo } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";

import {
  useCareerPaths,
  CareerPath,
} from "@/hooks/career-path/useCareerPaths";
import { useDepartments, Department } from "@/hooks/department/useDepartments";
import { useRoles, Role } from "@/hooks/role/useRoles";
import { useRoleTypes, RoleType } from "@/hooks/role-type/useRoleTypes";

import ReactFlow, {
  Background,
  Node as FlowNode,
  Edge as FlowEdge,
  Position,
  Handle,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  PRIMARY_COLOR,
  PRIMARY_LIGHT,
  PRIMARY_LIGHT_BG,
  SECTION_BORDER_COLOR,
  primaryButtonSx,
} from "@/utils/utils";

// ======================================================
// NODE CUSTOMIZADO DO REACT FLOW (CÍRCULO + LABEL)
// ======================================================

type CareerNodeData = {
  name: string;
  initials: string;
  isHighlight: boolean;
};

const CareerNode = memo(({ data }: NodeProps<CareerNodeData>) => {
  const { name, initials, isHighlight } = data;

  const handleStyle: React.CSSProperties = {
    width: 0,
    height: 0,
    border: "none",
    background: "transparent",
  };

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        background: isHighlight
          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
          : "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
        border: isHighlight ? "2px solid #a5b4fc" : "2px solid #7dd3fc",
      }}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Handle type="source" position={Position.Right} style={handleStyle} />

      <div
        style={{
          position: "absolute",
          top: -26,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "#334155",
          fontWeight: 500,
          whiteSpace: "nowrap",
          maxWidth: 140,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {name}
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        {initials}
      </span>
    </div>
  );
});

const NODE_HORIZONTAL_GAP = 220;
const ROW_VERTICAL_GAP = 130;

export default function CareerPathsPage() {
  const {
    listCareerPaths,
    createCareerPath,
    updateCareerPath,
    deleteCareerPath,
    loading,
    error,
  } = useCareerPaths();
  const { listDistinctDepartments } = useDepartments();
  const { listDistinctRoles } = useRoles();
  const { listDistinctRoleTypes } = useRoleTypes();

  useEffect(() => {
    document.title = "Trilhas de Carreira";
  }, []);

  // ======================================================
  // STATIC DATA
  // ======================================================
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);

  useEffect(() => {
    async function loadStatic() {
      const [deps, rls, rtypes] = await Promise.all([
        listDistinctDepartments(),
        listDistinctRoles(),
        listDistinctRoleTypes(),
      ]);

      setDepartments(deps || []);
      setRoles(rls || []);
      setRoleTypes(rtypes || []);
    }
    loadStatic();
  }, []);

  // ======================================================
  // DEPARTMENT SELECTION & PATH LIST
  // ======================================================
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  async function loadPaths(departmentId: string) {
    if (!departmentId) {
      setPaths([]);
      return;
    }
    setLoadingTable(true);
    const data = await listCareerPaths({ departmentId });
    setPaths(data || []);
    setLoadingTable(false);
  }

  useEffect(() => {
    if (selectedDepartmentId) {
      loadPaths(selectedDepartmentId);
    } else {
      setPaths([]);
    }
  }, [selectedDepartmentId]);

  const rolesByDept = useMemo(
    () => roles.filter((r) => r.departmentId === selectedDepartmentId),
    [roles, selectedDepartmentId]
  );
  const roleTypesByDept = useMemo(
    () => roleTypes.filter((rt) => rt.departmentId === selectedDepartmentId),
    [roleTypes, selectedDepartmentId]
  );

  const getRoleName = (roleId: string) =>
    rolesByDept.find((r) => r.id === roleId)?.name || "—";

  // ======================================================
  // CREATE MODAL (nova ligação)
  // ======================================================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCurrentRoleTypeId, setCreateCurrentRoleTypeId] = useState("");
  const [createCurrentRoleId, setCreateCurrentRoleId] = useState("");
  const [createNextRoleTypeId, setCreateNextRoleTypeId] = useState("");
  const [createNextRoleId, setCreateNextRoleId] = useState("");
  const [createSortOrder, setCreateSortOrder] = useState("0");
  const [createIsEntryPoint, setCreateIsEntryPoint] = useState(false);

  const filteredCreateCurrentRoles = useMemo(
    () =>
      rolesByDept.filter((r) =>
        createCurrentRoleTypeId ? r.roleTypeId === createCurrentRoleTypeId : true
      ),
    [rolesByDept, createCurrentRoleTypeId]
  );

  const filteredCreateNextRoles = useMemo(
    () =>
      rolesByDept.filter((r) =>
        createNextRoleTypeId ? r.roleTypeId === createNextRoleTypeId : true
      ),
    [rolesByDept, createNextRoleTypeId]
  );

  const handleOpenCreateModal = () => {
    setCreateName("");
    setCreateCurrentRoleTypeId("");
    setCreateCurrentRoleId("");
    setCreateNextRoleTypeId("");
    setCreateNextRoleId("");
    setCreateSortOrder("0");
    setCreateIsEntryPoint(false);
    setCreateModalOpen(true);
  };

  const handleCreatePath = async () => {
    if (!selectedDepartmentId || !createCurrentRoleId || !createNextRoleId)
      return;

    const currentRoleName = getRoleName(createCurrentRoleId);
    const nextRoleName = getRoleName(createNextRoleId);

    const nameToSend =
      createName.trim() || `${currentRoleName} → ${nextRoleName}`;

    await createCareerPath({
      name: nameToSend,
      description: null,
      departmentId: selectedDepartmentId,
      currentRoleId: createCurrentRoleId,
      nextRoleId: createNextRoleId,
      sortOrder: Number(createSortOrder) || 0,
      isEntryPoint: createIsEntryPoint,
    } as any);

    setCreateModalOpen(false);
    loadPaths(selectedDepartmentId);
  };

  const canCreate =
    !!selectedDepartmentId &&
    !!createCurrentRoleId &&
    !!createNextRoleId &&
    createCurrentRoleId !== createNextRoleId;

  // ======================================================
  // EDIT MODAL
  // ======================================================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [editName, setEditName] = useState("");
  const [editCurrentRoleTypeId, setEditCurrentRoleTypeId] = useState("");
  const [editCurrentRoleId, setEditCurrentRoleId] = useState("");
  const [editNextRoleTypeId, setEditNextRoleTypeId] = useState("");
  const [editNextRoleId, setEditNextRoleId] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [editIsEntryPoint, setEditIsEntryPoint] = useState(false);

  const filteredEditCurrentRoles = useMemo(
    () =>
      rolesByDept.filter((r) =>
        editCurrentRoleTypeId ? r.roleTypeId === editCurrentRoleTypeId : true
      ),
    [rolesByDept, editCurrentRoleTypeId]
  );

  const filteredEditNextRoles = useMemo(
    () =>
      rolesByDept.filter((r) =>
        editNextRoleTypeId ? r.roleTypeId === editNextRoleTypeId : true
      ),
    [rolesByDept, editNextRoleTypeId]
  );

  const openEditModal = (p: CareerPath) => {
    setSelectedPath(p);
    setEditName(p.name);
    setEditCurrentRoleId(p.currentRoleId);
    setEditNextRoleId(p.nextRoleId);
    setEditSortOrder(String(p.sortOrder ?? 0));
    setEditIsEntryPoint(!!p.isEntryPoint);

    const currentRole = rolesByDept.find((r) => r.id === p.currentRoleId);
    const nextRole = rolesByDept.find((r) => r.id === p.nextRoleId);

    setEditCurrentRoleTypeId(currentRole?.roleTypeId || "");
    setEditNextRoleTypeId(nextRole?.roleTypeId || "");

    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPath || !selectedDepartmentId) return;

    const currentRoleName = getRoleName(editCurrentRoleId);
    const nextRoleName = getRoleName(editNextRoleId);

    const nameToSend =
      editName.trim() || `${currentRoleName} → ${nextRoleName}`;

    await updateCareerPath(selectedPath.id, {
      name: nameToSend,
      departmentId: selectedDepartmentId,
      currentRoleId: editCurrentRoleId,
      nextRoleId: editNextRoleId,
      sortOrder: Number(editSortOrder) || 0,
      isEntryPoint: editIsEntryPoint,
    } as any);

    setEditModalOpen(false);
    loadPaths(selectedDepartmentId);
  };

  const handleDelete = async () => {
    if (!selectedPath || !selectedDepartmentId) return;
    await deleteCareerPath(selectedPath.id);
    setEditModalOpen(false);
    loadPaths(selectedDepartmentId);
  };

  const canSaveEdit =
    !!selectedDepartmentId &&
    !!editCurrentRoleId &&
    !!editNextRoleId &&
    editCurrentRoleId !== editNextRoleId;

  // ======================================================
  // VISUALIZAÇÃO EM LINHA (TRILHA + Y) - BASE DE DADOS
  // ======================================================
  const pathsByCurrentRole = useMemo(() => {
    const map = new Map<string, CareerPath[]>();
    for (const p of paths) {
      const arr = map.get(p.currentRoleId) || [];
      arr.push(p);
      map.set(p.currentRoleId, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) =>
          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
          getRoleName(a.nextRoleId).localeCompare(getRoleName(b.nextRoleId))
      );
      map.set(k, arr);
    }
    return map;
  }, [paths, rolesByDept]);

  const entryRoleIds = useMemo(() => {
    const flagged = paths.filter((p) => p.isEntryPoint);
    if (flagged.length > 0) {
      return Array.from(new Set(flagged.map((p) => p.currentRoleId)));
    }

    const allCurrent = new Set(paths.map((p) => p.currentRoleId));
    const allNext = new Set(paths.map((p) => p.nextRoleId));
    const entries: string[] = [];
    allCurrent.forEach((id) => {
      if (!allNext.has(id)) entries.push(id);
    });
    return entries;
  }, [paths]);

  function buildPathWithBranches(entryId: string) {
    const base: string[] = [entryId];
    const branchGroups: { baseIndex: number; branches: string[][] }[] = [];
    const visited = new Set<string>();
    let curr = entryId;

    while (true) {
      if (visited.has(curr)) break;
      visited.add(curr);

      const edgesRaw = pathsByCurrentRole.get(curr) || [];
      if (edgesRaw.length === 0) break;

      const mainEdge = edgesRaw[0];
      const extraEdges = edgesRaw.slice(1);

      if (extraEdges.length > 0) {
        const baseIndex = base.indexOf(curr);
        const branches = extraEdges.map((edge) => {
          const path: string[] = [];
          let c = edge.nextRoleId;
          const localVisited = new Set<string>(visited);

          while (true) {
            path.push(c);
            if (localVisited.has(c)) break;
            localVisited.add(c);

            const nextEdgesRaw = pathsByCurrentRole.get(c) || [];
            if (nextEdgesRaw.length === 0) break;

            const nextMain = nextEdgesRaw[0];
            c = nextMain.nextRoleId;
          }

          return path;
        });

        branchGroups.push({ baseIndex, branches });
      }

      const nextId = mainEdge.nextRoleId;
      if (visited.has(nextId)) break;
      base.push(nextId);
      curr = nextId;
    }

    return { base, branchGroups };
  }

  // ======================================================
  // VISUALIZAÇÃO EM LINHA (TRILHA + Y) - REACT FLOW
  // ======================================================
  type FlowGraph = {
    entryId: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    height: number;
  };

  const flowGraphs: FlowGraph[] = useMemo(() => {
    if (entryRoleIds.length === 0) return [];

    return entryRoleIds.map((entryId, pathIndex) => {
      const { base, branchGroups } = buildPathWithBranches(entryId);

      const nodes: FlowNode[] = [];
      const edges: FlowEdge[] = [];

      const branchingBaseIndexes = new Set<number>();
      branchGroups.forEach((g) => {
        if (g.branches.length > 0) branchingBaseIndexes.add(g.baseIndex);
      });

      const makeNodeData = (roleId: string, isHighlight: boolean) => {
        const name = getRoleName(roleId);
        const initials =
          name && name.length > 0
            ? name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "?";
        return { name, initials, isHighlight };
      };

      base.forEach((roleId, idx) => {
        const nodeId = `p${pathIndex}-b-${idx}-${roleId}`;
        const isBranching = branchingBaseIndexes.has(idx);

        nodes.push({
          id: nodeId,
          position: {
            x: idx * NODE_HORIZONTAL_GAP,
            y: 0,
          },
          data: makeNodeData(roleId, isBranching),
          type: "careerNode",
        });

        if (idx > 0) {
          const prevId = `p${pathIndex}-b-${idx - 1}-${base[idx - 1]}`;

          edges.push({
            id: `e-${prevId}-${nodeId}`,
            source: prevId,
            target: nodeId,
            type: "straight",
            style: {
              stroke: "#64748b",
              strokeWidth: 2,
            },
          });
        }
      });

      let branchRow = 1;

      branchGroups.forEach((group) => {
        const parentBaseId = `p${pathIndex}-b-${group.baseIndex}-${base[group.baseIndex]}`;

        group.branches.forEach((branch) => {
          const y = branchRow * ROW_VERTICAL_GAP;
          const currentRow = branchRow;
          branchRow++;

          let previousNodeId: string | null = null;

          branch.forEach((roleId, idx) => {
            const nodeId = `p${pathIndex}-g${group.baseIndex}-r${currentRow}-n${idx}-${roleId}`;

            const x = (group.baseIndex + 1 + idx) * NODE_HORIZONTAL_GAP;

            nodes.push({
              id: nodeId,
              position: { x, y },
              data: makeNodeData(roleId, false),
              type: "careerNode",
            });

            if (idx === 0) {
              edges.push({
                id: `e-${parentBaseId}-${nodeId}`,
                source: parentBaseId,
                target: nodeId,
                type: "straight",
                style: {
                  stroke: "#64748b",
                  strokeWidth: 2,
                },
              });
            } else if (previousNodeId) {
              edges.push({
                id: `e-${previousNodeId}-${nodeId}`,
                source: previousNodeId,
                target: nodeId,
                type: "straight",
                style: {
                  stroke: "#64748b",
                  strokeWidth: 2,
                },
              });
            }

            previousNodeId = nodeId;
          });
        });
      });

      const height = Math.max(260, branchRow * ROW_VERTICAL_GAP + 120);

      return {
        entryId,
        nodes,
        edges,
        height,
      };
    });
  }, [entryRoleIds, pathsByCurrentRole, rolesByDept]);

  const nodeTypes = useMemo(
    () => ({
      careerNode: CareerNode,
    }),
    []
  );

  // ======================================================
  // UI
  // ======================================================
  return (
    // >>> ÚNICA MUDANÇA AQUI: overflow-x-auto em mobile
    <div className="flex min-h-screen bg-[#f7f7f9] overflow-x-auto md:overflow-x-hidden">
      <Sidebar />

      <main className="flex-1 p-8">
        <Typography
          variant="h4"
          fontWeight={700}
          color="#1e293b"
          sx={{ mb: 4 }}
        >
          Trilhas de Carreira
        </Typography>

        {error && (
          <Typography variant="body2" sx={{ mb: 2 }} color="error.main">
            {error}
          </Typography>
        )}

        {/* SELEÇÃO DE DEPARTAMENTO / AÇÕES */}
        <Paper
          sx={{
            width: "100%",
            p: 4,
            mb: 4,
            borderRadius: 3,
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            border: `1px solid ${SECTION_BORDER_COLOR}`,
          }}
        >
          <Typography variant="h6" fontWeight={600} mb={3}>
            Configuração de Trilhas
          </Typography>

          <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-end">
            <FormControl size="small" sx={{ flex: "1 1 260px" }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                label="Departamento"
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
              >
                <MenuItem value="">Selecione</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="large"
              sx={primaryButtonSx}
              disabled={!selectedDepartmentId}
              onClick={handleOpenCreateModal}
            >
              Adicionar Ligação
            </Button>
          </Box>

          {!selectedDepartmentId && (
            <Typography
              variant="body2"
              sx={{ mt: 2 }}
              color="text.secondary"
            >
              Selecione um departamento para visualizar e configurar os caminhos
              de carreira.
            </Typography>
          )}
        </Paper>

        {/* LISTA + VISUALIZAÇÃO */}
        {selectedDepartmentId && (
          <>
            {/* TABELA DE LIGAÇÕES */}
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                mb: 4,
                boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                border: `1px solid ${SECTION_BORDER_COLOR}`,
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={3}>
                Ligações de Carreira
              </Typography>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">
                      Atual
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">
                      Próximo
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">
                      Ordem
                    </th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-700">
                      Entrada
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTable ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        Carregando...
                      </td>
                    </tr>
                  ) : paths.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        Nenhuma ligação cadastrada para este departamento.
                      </td>
                    </tr>
                  ) : (
                    paths
                      .slice()
                      .sort(
                        (a, b) =>
                          (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
                          a.name.localeCompare(b.name)
                      )
                      .map((p) => (
                        <tr
                          key={p.id}
                          className="border-b hover:bg-gray-100 cursor-pointer transition"
                          onClick={() => openEditModal(p)}
                        >
                          <td className="px-3 py-2">{p.name}</td>
                          <td className="px-3 py-2">
                            {p.currentRole?.name ||
                              getRoleName(p.currentRoleId)}
                          </td>
                          <td className="px-3 py-2">
                            {p.nextRole?.name || getRoleName(p.nextRoleId)}
                          </td>
                          <td className="px-3 py-2">{p.sortOrder}</td>
                          <td className="px-3 py-2">
                            {p.isEntryPoint ? "Sim" : "Não"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </Paper>

            {/* VISUALIZAÇÃO EM LINHA (TRILHA + Y) */}
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                mb: 4,
                backgroundColor: "#ffffff",
                boxShadow: "0 4px 12px rgba(15,23,42,0.10)",
                border: `1px solid ${SECTION_BORDER_COLOR}`,
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Visualização das Trilhas
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Trilhas de carreira organizadas por ponto de entrada. Os cargos
                destacados em roxo indicam pontos de ramificação.
              </Typography>

              <div
                style={{
                  overflowX: "auto",
                  overflowY: "visible",
                  paddingBottom: 32,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    gap: 48,
                    minWidth: "100%",
                  }}
                >
                  {paths.length === 0 || entryRoleIds.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 16px",
                        backgroundColor: "#f8fafc",
                        borderRadius: 8,
                        border: "2px dashed #cbd5e1",
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <svg
                          style={{
                            margin: "0 auto 12px",
                            height: 48,
                            width: 48,
                            color: "#94a3b8",
                          }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                          />
                        </svg>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Nenhuma trilha para exibir
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          style={{ marginTop: 4 }}
                        >
                          Adicione ligações de carreira para visualizar os
                          caminhos
                        </Typography>
                      </div>
                    </div>
                  ) : (
                    flowGraphs.map((flow) => (
                      <div
                        key={flow.entryId}
                        style={{
                          position: "relative",
                          background:
                            "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
                          padding: 24,
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          width: "100%",
                          height: flow.height,
                        }}
                      >
                        <ReactFlow
                          nodes={flow.nodes}
                          edges={flow.edges}
                          nodeTypes={nodeTypes}
                          fitView
                          fitViewOptions={{ padding: 0.45 }}
                          nodesDraggable={false}
                          nodesConnectable={false}
                          elementsSelectable={false}
                          panOnScroll={false}
                          zoomOnScroll={false}
                          panOnDrag={false}
                        >
                          <Background gap={32} size={0.5} color="#e5e7eb" />
                        </ReactFlow>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Legenda */}
              {paths.length > 0 && entryRoleIds.length > 0 && (
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    style={{
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Legenda:
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      gap: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)",
                          border: "2px solid #7dd3fc",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Cargo regular
                      </Typography>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                          border: "2px solid #a5b4fc",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Ponto de ramificação
                      </Typography>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <svg width="40" height="4">
                        <line
                          x1="0"
                          y1="2"
                          x2="40"
                          y2="2"
                          stroke="#64748b"
                          strokeWidth="2"
                        />
                      </svg>
                      <Typography variant="caption" color="text.secondary">
                        Caminho principal
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </Paper>
          </>
        )}

        {/* ========== CREATE MODAL ========== */}
        <BaseModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Adicionar Ligação de Carreira"
          description="Selecione o cargo atual e o próximo cargo na trilha."
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button
                variant="outlined"
                onClick={() => setCreateModalOpen(false)}
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
                Cancelar
              </Button>
              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
                disabled={!canCreate || loading}
                onClick={handleCreatePath}
              >
                {loading ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome da Ligação (opcional)"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              helperText="Se vazio, será gerado automaticamente ex: 'Analista → Coordenador'."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={createIsEntryPoint}
                  onChange={(e) => setCreateIsEntryPoint(e.target.checked)}
                  size="small"
                />
              }
              label="Marcar como ponto de entrada da trilha"
            />

            <TextField
              size="small"
              label="Ordem (para organização)"
              type="number"
              value={createSortOrder}
              onChange={(e) => setCreateSortOrder(e.target.value)}
            />

            {/* Cargo Atual */}
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Cargo Atual
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de Função (Atual)</InputLabel>
              <Select
                label="Tipo de Função (Atual)"
                value={createCurrentRoleTypeId}
                onChange={(e) => {
                  setCreateCurrentRoleTypeId(e.target.value);
                  setCreateCurrentRoleId("");
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roleTypesByDept.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Cargo Atual</InputLabel>
              <Select
                label="Cargo Atual"
                value={createCurrentRoleId}
                onChange={(e) => setCreateCurrentRoleId(e.target.value)}
              >
                {filteredCreateCurrentRoles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Próximo Cargo */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Próximo Cargo
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de Função (Próximo)</InputLabel>
              <Select
                label="Tipo de Função (Próximo)"
                value={createNextRoleTypeId}
                onChange={(e) => {
                  setCreateNextRoleTypeId(e.target.value);
                  setCreateNextRoleId("");
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roleTypesByDept.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Próximo Cargo</InputLabel>
              <Select
                label="Próximo Cargo"
                value={createNextRoleId}
                onChange={(e) => setCreateNextRoleId(e.target.value)}
              >
                {filteredCreateNextRoles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </BaseModal>

        {/* ========== EDIT MODAL ========== */}
        <BaseModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Editar Ligação de Carreira"
          description="Atualize ou remova a ligação selecionada."
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                Excluir
              </Button>
              <Button
                sx={{
                  backgroundColor: PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    backgroundColor: PRIMARY_LIGHT,
                  },
                }}
                disabled={!canSaveEdit || loading}
                onClick={handleSaveEdit}
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <TextField
              size="small"
              label="Nome da Ligação"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editIsEntryPoint}
                  onChange={(e) => setEditIsEntryPoint(e.target.checked)}
                  size="small"
                />
              }
              label="Ponto de entrada da trilha"
            />

            <TextField
              size="small"
              label="Ordem"
              type="number"
              value={editSortOrder}
              onChange={(e) => setEditSortOrder(e.target.value)}
            />

            {/* Cargo Atual */}
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Cargo Atual
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de Função (Atual)</InputLabel>
              <Select
                label="Tipo de Função (Atual)"
                value={editCurrentRoleTypeId}
                onChange={(e) => {
                  setEditCurrentRoleTypeId(e.target.value);
                  setEditCurrentRoleId("");
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roleTypesByDept.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Cargo Atual</InputLabel>
              <Select
                label="Cargo Atual"
                value={editCurrentRoleId}
                onChange={(e) => setEditCurrentRoleId(e.target.value)}
              >
                {filteredEditCurrentRoles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Próximo Cargo */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Próximo Cargo
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de Função (Próximo)</InputLabel>
              <Select
                label="Tipo de Função (Próximo)"
                value={editNextRoleTypeId}
                onChange={(e) => {
                  setEditNextRoleTypeId(e.target.value);
                  setEditNextRoleId("");
                }}
              >
                <MenuItem value="">Todos</MenuItem>
                {roleTypesByDept.map((rt) => (
                  <MenuItem key={rt.id} value={rt.id}>
                    {rt.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Próximo Cargo</InputLabel>
              <Select
                label="Próximo Cargo"
                value={editNextRoleId}
                onChange={(e) => setEditNextRoleId(e.target.value)}
              >
                {filteredEditNextRoles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </BaseModal>
      </main>
    </div>
  );
}
