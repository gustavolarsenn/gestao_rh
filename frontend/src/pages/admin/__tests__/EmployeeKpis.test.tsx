import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmployeeKpis from "@/pages/admin/EmployeeKpis";
import { vi, describe, it, beforeEach, afterEach, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { useEmployeeKpis } from "@/hooks/employee-kpi/useEmployeeKpis";
import { useEmployees } from "@/hooks/employee/useEmployees";
import { useKpis } from "@/hooks/kpi/useKpis";
import { useEvaluationTypes } from "@/hooks/evaluation-type/useEvaluationTypes";

// =======================
// MOCKS GLOBAIS
// =======================

// Sidebar -> useAuth
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

// Hook de KPIs de colaborador + enum KpiStatus usado no componente
vi.mock("@/hooks/employee-kpi/useEmployeeKpis", () => ({
  useEmployeeKpis: vi.fn(),
  KpiStatus: {
    DRAFT: "DRAFT",
    SUBMITTED: "SUBMITTED",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  },
}));

// Demais hooks
vi.mock("@/hooks/employee/useEmployees");
vi.mock("@/hooks/kpi/useKpis");
vi.mock("@/hooks/evaluation-type/useEvaluationTypes");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <EmployeeKpis />
    </MemoryRouter>
  );

describe("EmployeeKpis Page", () => {
  let mockEmployeeKpiHook: any;
  let mockEmployeesHook: any;
  let mockKpisHook: any;
  let mockEvalTypesHook: any;

  beforeEach(() => {
    // Mock principal de EmployeeKpis
    mockEmployeeKpiHook = {
      listEmployeeKpis: vi.fn().mockResolvedValue({
        data: [
          {
            id: "ek1",
            employeeId: "emp1",
            kpiId: "kpi1",
            goal: "100",
            status: "DRAFT",
            periodStart: "2024-01-01",
            periodEnd: "2024-03-01",
          },
        ],
        total: 1,
      }),
      createEmployeeKpi: vi.fn(),
      updateEmployeeKpi: vi.fn(),
      deleteEmployeeKpi: vi.fn(),
      loading: false,
      error: "",
    };
    (useEmployeeKpis as any).mockReturnValue(mockEmployeeKpiHook);

    // Mock de colaboradores
    mockEmployeesHook = {
      listEmployees: vi.fn().mockResolvedValue({
        data: [
          {
            id: "emp1",
            person: { name: "João da Silva" },
            teamId: "team1",
          },
        ],
      }),
    };
    (useEmployees as any).mockReturnValue(mockEmployeesHook);

    // Mock de KPIs
    mockKpisHook = {
      listKpis: vi.fn().mockResolvedValue({
        data: [
          {
            id: "kpi1",
            name: "Produtividade",
            evaluationTypeId: "eval1",
          },
        ],
      }),
    };
    (useKpis as any).mockReturnValue(mockKpisHook);

    // Mock tipos de avaliação
    mockEvalTypesHook = {
      listEvaluationTypes: vi.fn().mockResolvedValue({
        data: [
          {
            id: "eval1",
            name: "Percentual maior melhor",
            code: "HIGHER_BETTER_PCT",
          },
        ],
      }),
    };
    (useEvaluationTypes as any).mockReturnValue(mockEvalTypesHook);

    // localStorage
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "companyId") return "company-1";
      if (key === "userId") return "user-1";
      return null;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INITIAL
  // =========================================
  it("carrega a lista inicial de KPIs de colaboradores", async () => {
    renderWithRouter();

    expect(mockEmployeeKpiHook.listEmployeeKpis).toHaveBeenCalled();

    // goal inicial "100" na tabela
    const goalCell = await screen.findByText("100");
    expect(goalCell).toBeInTheDocument();
  });

  // =========================================
  // CREATE MODAL (apenas abertura)
  // =========================================
  it("abre modal de designar KPI", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Designar KPI");
    fireEvent.click(openBtn);

    // Campo exclusivo do modal de criação
    const periodInput = await screen.findByLabelText("Início do Período");
    expect(periodInput).toBeInTheDocument();
  });

  // =========================================
  // EDIT MODAL
  // =========================================
  it("abre modal de edição ao clicar em uma linha da tabela", async () => {
    renderWithRouter();

    // Uma linha com meta "100"
    const rowCell = await screen.findByText("100");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const metaInput = (await screen.findByLabelText(/Meta/)) as HTMLInputElement;
    expect(metaInput).toBeInTheDocument();
    expect(metaInput.value).toBe("100");
  });

  it("salva alterações de meta (mantendo status atual)", async () => {
    mockEmployeeKpiHook.updateEmployeeKpi.mockResolvedValue({});

    renderWithRouter();

    // abre modal
    const rowCell = await screen.findByText("100");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    // altera meta para um valor válido no range 0–100
    const metaInput = (await screen.findByLabelText(/Meta/)) as HTMLInputElement;
    fireEvent.change(metaInput, { target: { value: "90" } });

    // garante que o input realmente foi atualizado para "90"
    await waitFor(() => {
      expect(metaInput.value).toBe("90");
    });

    const saveBtn = screen.getByText("Salvar alterações");
    fireEvent.click(saveBtn);

    // garante que o mock foi chamado
    await waitFor(() => {
      expect(mockEmployeeKpiHook.updateEmployeeKpi).toHaveBeenCalled();
    });

    const [idArg, payloadArg] =
      mockEmployeeKpiHook.updateEmployeeKpi.mock.calls[0];

    expect(idArg).toBe("ek1");
    expect(payloadArg.goal).toBe("90");
    expect(payloadArg.status).toBe("DRAFT"); // status original

    expect(mockEmployeeKpiHook.listEmployeeKpis).toHaveBeenCalled();
  });

  it("exclui KPI ao clicar em 'Excluir'", async () => {
    mockEmployeeKpiHook.deleteEmployeeKpi.mockResolvedValue({});

    renderWithRouter();

    const rowCell = await screen.findByText("100");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockEmployeeKpiHook.deleteEmployeeKpi).toHaveBeenCalledWith("ek1");
    });

    expect(mockEmployeeKpiHook.listEmployeeKpis).toHaveBeenCalled();
  });

  // =========================================
  // PAGINATION
  // =========================================
  it("avança para a próxima página", async () => {
    // primeira chamada com total alto pra habilitar 'Próxima'
    mockEmployeeKpiHook.listEmployeeKpis.mockResolvedValueOnce({
      data: Array(10).fill({
        id: "ekX",
        employeeId: "emp1",
        kpiId: "kpi1",
        goal: "100",
        status: "DRAFT",
        periodStart: "2024-01-01",
        periodEnd: "2024-03-01",
      }),
      total: 30,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockEmployeeKpiHook.listEmployeeKpis).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        employeeId: undefined,
        kpiId: undefined,
        status: undefined,
        periodStart: undefined,
        periodEnd: undefined,
      });
    });
  });

  // =========================================
  // EMPTY STATE
  // =========================================
  it("mostra mensagem de vazio quando não há KPIs", async () => {
    mockEmployeeKpiHook.listEmployeeKpis.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const emptyText = await screen.findByText(
      "Nenhuma KPI atribuída encontrada."
    );
    expect(emptyText).toBeInTheDocument();
  });

  // =========================================
  // LOADING STATE
  // =========================================
  it("mostra o estado de carregando enquanto busca dados", async () => {
    mockEmployeeKpiHook.listEmployeeKpis.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: [],
                total: 0,
              }),
            200
          )
        )
    );

    renderWithRouter();

    const loadingText = await screen.findByText("Carregando...");
    expect(loadingText).toBeInTheDocument();
  });
});
