import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import EvaluationTypesPage from "@/pages/admin/EvaluationTypes";
import {
  useEvaluationTypes,
  EvaluationCode,
} from "@/hooks/evaluation-type/useEvaluationTypes";
import { useDepartments } from "@/hooks/department/useDepartments";

// Sidebar -> useAuth
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/evaluation-type/useEvaluationTypes");
vi.mock("@/hooks/department/useDepartments");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <EvaluationTypesPage />
    </MemoryRouter>
  );

describe("EvaluationTypesPage", () => {
  let mockEvalHook: any;
  let mockDepartmentsHook: any;

  beforeEach(() => {
    // mock localStorage companyId (usado no create)
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => {
      if (key === "companyId") return "123";
      return null;
    });

    mockEvalHook = {
      listEvaluationTypes: vi.fn().mockResolvedValue({
        data: [
          {
            id: "et1",
            name: "Produtividade",
            code: EvaluationCode.HIGHER_BETTER_SUM,
            description: "Avalia produtividade total",
            departmentId: "dep1",
            department: { id: "dep1", name: "Operações" },
          },
        ],
        total: 1,
      }),
      createEvaluationType: vi.fn(),
      updateEvaluationType: vi.fn(),
      deleteEvaluationType: vi.fn(),
      loading: false,
      error: "",
    };
    (useEvaluationTypes as any).mockReturnValue(mockEvalHook);

    mockDepartmentsHook = {
      listDepartments: vi.fn().mockResolvedValue({
        data: [{ id: "dep1", name: "Operações" }],
        total: 1,
      }),
    };
    (useDepartments as any).mockReturnValue(mockDepartmentsHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INITIAL
  // =========================================
  it("carrega a lista inicial de tipos de métrica", async () => {
    renderWithRouter();

    expect(mockEvalHook.listEvaluationTypes).toHaveBeenCalled();

    const nameCell = await screen.findByText("Produtividade");
    expect(nameCell).toBeInTheDocument();

    const deptCell = screen.getByText("Operações");
    expect(deptCell).toBeInTheDocument();

    const typeText = screen.getByText("Quanto maior, melhor");
    expect(typeText).toBeInTheDocument();

    const descCell = screen.getByText("Avalia produtividade total");
    expect(descCell).toBeInTheDocument();
  });

  // =========================================
  // FILTERS (nome + limpar)
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Prod" } });

    await waitFor(() => {
      expect(mockEvalHook.listEvaluationTypes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Prod",
        departmentId: undefined,
        code: undefined,
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
      expect(mockEvalHook.listEvaluationTypes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        code: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL (abertura)
  // =========================================
  it("abre modal de criação de tipo de métrica", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Tipo de Métrica");
    fireEvent.click(openBtn);

    const titleField = await screen.findByLabelText("Nome (ex: Produtividade)");
    expect(titleField).toBeInTheDocument();

    const descField = screen.getByLabelText("Descrição");
    expect(descField).toBeInTheDocument();
  });

  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const rowCell = await screen.findByText("Produtividade");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const editNameInput = await screen.findByLabelText("Nome do Tipo");
    expect(editNameInput).toBeInTheDocument();
    expect(editNameInput).toHaveValue("Produtividade");

    const editDescInput = screen.getByLabelText("Descrição") as HTMLInputElement;
    expect(editDescInput.value).toBe("Avalia produtividade total");
  });

  it("salva alterações de tipo de métrica", async () => {
    renderWithRouter();

    const rowCell = await screen.findByText("Produtividade");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const editNameInput = (await screen.findByLabelText(
      "Nome do Tipo"
    )) as HTMLInputElement;
    fireEvent.change(editNameInput, { target: { value: "Produtividade Atualizada" } });

    const editDescInput = screen.getByLabelText(
      "Descrição"
    ) as HTMLInputElement;
    fireEvent.change(editDescInput, {
      target: { value: "Descrição atualizada" },
    });

    const saveBtn = screen.getByText("Salvar alterações");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockEvalHook.updateEvaluationType).toHaveBeenCalledWith("et1", {
        name: "Produtividade Atualizada",
        code: EvaluationCode.HIGHER_BETTER_SUM,
        description: "Descrição atualizada",
        departmentId: "dep1",
      });
    });
  });

  it("exclui tipo de métrica ao clicar em 'Excluir'", async () => {
    mockEvalHook.deleteEvaluationType.mockResolvedValue({});

    renderWithRouter();

    const rowCell = await screen.findByText("Produtividade");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockEvalHook.deleteEvaluationType).toHaveBeenCalledWith("et1");
    });

    expect(mockEvalHook.listEvaluationTypes).toHaveBeenCalled();
  });

  // =========================================
  // PAGINATION
  // =========================================
  it("avança para a próxima página de tipos de métrica", async () => {
    // primeira chamada com total maior
    mockEvalHook.listEvaluationTypes.mockResolvedValueOnce({
      data: Array(10).fill({
        id: "etX",
        name: "Tipo X",
        code: EvaluationCode.HIGHER_BETTER_SUM,
        description: "Desc",
        departmentId: "dep1",
        department: { id: "dep1", name: "Operações" },
      }),
      total: 30,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockEvalHook.listEvaluationTypes).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        code: undefined,
      });
    });
  });

  // =========================================
  // EMPTY STATE
  // =========================================
  it("mostra mensagem de vazio quando não há tipos de métrica", async () => {
    mockEvalHook.listEvaluationTypes.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const emptyText = await screen.findByText(
      "Nenhum tipo de métrica encontrado."
    );
    expect(emptyText).toBeInTheDocument();
  });

  // =========================================
  // LOADING STATE
  // =========================================
  it("mostra o estado de carregando enquanto busca dados", async () => {
    mockEvalHook.listEvaluationTypes.mockImplementation(
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
