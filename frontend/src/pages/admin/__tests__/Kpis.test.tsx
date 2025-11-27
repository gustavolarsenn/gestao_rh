import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Kpis from "@/pages/admin/Kpis";
import { useKpis } from "@/hooks/kpi/useKpis";
import { useDepartments } from "@/hooks/department/useDepartments";
import {
  useEvaluationTypes,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";

// Sidebar -> useAuth
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/kpi/useKpis");
vi.mock("@/hooks/department/useDepartments");
vi.mock("@/hooks/evaluation-type/useEvaluationTypes");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Kpis />
    </MemoryRouter>
  );

describe("Kpis Page", () => {
  let mockKpisHook: any;
  let mockDepartmentsHook: any;
  let mockEvalTypesHook: any;

  beforeEach(() => {
    // companyId usado no create
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "companyId") return "123";
      return null;
    });

    mockKpisHook = {
      listKpis: vi.fn().mockResolvedValue({
        data: [
          {
            id: "k1",
            name: "Taxa de Conversão",
            description: "Mede conversão de leads",
            departmentId: "dep1",
            evaluationTypeId: "et1",
            unit: "%",
            department: { id: "dep1", name: "Operações" },
            evaluationType: {
              id: "et1",
              name: "Desempenho",
              code: EvaluationCode.HIGHER_BETTER_PCT,
            },
          },
        ],
        total: 1,
      }),
      createKpi: vi.fn(),
      updateKpi: vi.fn(),
      deleteKpi: vi.fn(),
      loading: false,
      error: "",
    };
    (useKpis as any).mockReturnValue(mockKpisHook);

    mockDepartmentsHook = {
      listDistinctDepartments: vi.fn().mockResolvedValue([
        { id: "dep1", name: "Operações" },
      ]),
    };
    (useDepartments as any).mockReturnValue(mockDepartmentsHook);

    mockEvalTypesHook = {
      listDistinctEvaluationTypes: vi.fn().mockResolvedValue([
        {
          id: "et1",
          name: "Desempenho",
          code: EvaluationCode.HIGHER_BETTER_PCT,
        },
      ]),
    };
    (useEvaluationTypes as any).mockReturnValue(mockEvalTypesHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INITIAL
  // =========================================
  it("carrega a lista inicial de KPIs", async () => {
    renderWithRouter();

    expect(mockKpisHook.listKpis).toHaveBeenCalled();

    const nameCell = await screen.findByText("Taxa de Conversão");
    expect(nameCell).toBeInTheDocument();

    const deptCell = screen.getByText("Operações");
    expect(deptCell).toBeInTheDocument();

    // só valida que o nome do tipo aparece
    const evalTypeCell = screen.getByText(/Desempenho/);
    expect(evalTypeCell).toBeInTheDocument();

    const unitCell = screen.getByText("%");
    expect(unitCell).toBeInTheDocument();
  });

  // =========================================
  // FILTERS (nome + limpar)
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Taxa" } });

    await waitFor(() => {
      expect(mockKpisHook.listKpis).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Taxa",
        departmentId: undefined,
        evaluationTypeId: undefined,
      });
    });
  });

  it("limpa filtros ao clicar em 'Limpar'", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Teste" } });

    const clearBtn = screen.getByText("Limpar");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockKpisHook.listKpis).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        evaluationTypeId: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL (abertura)
  // =========================================
  it("abre modal de criação de KPI", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar KPI");
    fireEvent.click(openBtn);

    const nameField = await screen.findByLabelText(
      "Nome da métrica (ex: Taxa de conversão)"
    );
    expect(nameField).toBeInTheDocument();

    const unitField = screen.getByLabelText(
      "Unidade de medida (ex: R$, %, horas, features)"
    );
    expect(unitField).toBeInTheDocument();

    const descField = screen.getByLabelText("Descrição");
    expect(descField).toBeInTheDocument();
  });

  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const rowCell = await screen.findByText("Taxa de Conversão");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const editNameInput = await screen.findByLabelText("Nome da métrica");
    expect(editNameInput).toBeInTheDocument();
    expect(editNameInput).toHaveValue("Taxa de Conversão");

    const editUnitInput = screen.getByLabelText(
      "Unidade de medida"
    ) as HTMLInputElement;
    expect(editUnitInput.value).toBe("%");
  });

  it("salva alterações de KPI", async () => {
    renderWithRouter();

    const rowCell = await screen.findByText("Taxa de Conversão");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const editNameInput = (await screen.findByLabelText(
      "Nome da métrica"
    )) as HTMLInputElement;
    fireEvent.change(editNameInput, {
      target: { value: "Taxa de Conversão Atualizada" },
    });

    const editUnitInput = screen.getByLabelText(
      "Unidade de medida"
    ) as HTMLInputElement;
    fireEvent.change(editUnitInput, { target: { value: "R$" } });

    const editDescInput = screen.getByLabelText(
      "Descrição"
    ) as HTMLInputElement;
    fireEvent.change(editDescInput, {
      target: { value: "Descrição atualizada" },
    });

    const saveBtn = screen.getByText("Salvar alterações");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockKpisHook.updateKpi).toHaveBeenCalledWith("k1", {
        name: "Taxa de Conversão Atualizada",
        description: "Descrição atualizada",
        departmentId: "dep1",
        evaluationTypeId: "et1",
        unit: "R$",
      });
    });
  });

  it("exclui KPI ao clicar em 'Excluir'", async () => {
    mockKpisHook.deleteKpi.mockResolvedValue({});

    renderWithRouter();

    const rowCell = await screen.findByText("Taxa de Conversão");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockKpisHook.deleteKpi).toHaveBeenCalledWith("k1");
    });

    expect(mockKpisHook.listKpis).toHaveBeenCalled();
  });

  // =========================================
  // PAGINATION
  // =========================================
  it("avança para a próxima página de KPIs", async () => {
    // primeira chamada (render inicial) vai usar esse mockOnce
    mockKpisHook.listKpis.mockResolvedValueOnce({
      data: Array(10).fill({
        id: "kX",
        name: "KPI X",
        description: "",
        departmentId: "dep1",
        evaluationTypeId: "et1",
        unit: "%",
      }),
      total: 30,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockKpisHook.listKpis).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
        })
      );
    });
  });

  // =========================================
  // EMPTY STATE
  // =========================================
  it("mostra mensagem de vazio quando não há KPIs", async () => {
    mockKpisHook.listKpis.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const emptyText = await screen.findByText("Nenhuma KPI encontrada.");
    expect(emptyText).toBeInTheDocument();
  });

  // =========================================
  // LOADING STATE
  // =========================================
  it("mostra o estado de carregando enquanto busca dados", async () => {
    mockKpisHook.listKpis.mockImplementation(
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
