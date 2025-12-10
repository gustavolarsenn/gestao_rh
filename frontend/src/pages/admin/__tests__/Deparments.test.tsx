import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DepartmentPage from "@/pages/admin/Departments";
import { vi, expect, describe, beforeEach, afterEach, it } from "vitest";
import { useDepartments } from "@/hooks/department/useDepartments";
import { MemoryRouter } from "react-router-dom";

// MOCK DO HOOK DEPARTMENTS
vi.mock("@/hooks/department/useDepartments");

// MOCK DO useAuth USADO NO SIDEBAR
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

function makeMockDepartments(overrides = {}) {
  return {
    listDepartments: vi.fn(),
    createDepartment: vi.fn(),
    updateDepartment: vi.fn(),
    deleteDepartment: vi.fn(),
    ...overrides,
  };
}

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <DepartmentPage />
    </MemoryRouter>
  );
};

describe("DepartmentPage", () => {
  let mockHook: any;

  beforeEach(() => {
    mockHook = makeMockDepartments({
      listDepartments: vi.fn().mockResolvedValue({
        data: [{ id: "1", name: "Operações", companyId: "123" }],
        total: 1,
      }),
    });

    (useDepartments as any).mockReturnValue(mockHook);

    // companyId usado no create e também existe no objeto do departamento
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("123");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------
  // LOAD INITIAL
  // ------------------------------------
  it("carrega a lista inicial de departamentos", async () => {
    renderWithRouter();

    expect(mockHook.listDepartments).toHaveBeenCalled();

    const row = await screen.findByText("Operações");
    expect(row).toBeInTheDocument();
  });

  // ------------------------------------
  // FILTER
  // ------------------------------------
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const input = screen.getByTestId("filter-name-input");
    fireEvent.change(input, { target: { value: "Op" } });

    await waitFor(() => {
      expect(mockHook.listDepartments).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Op",
      });
    });
  });

  it("limpa o filtro", async () => {
    renderWithRouter();

    const input = screen.getByTestId("filter-name-input");
    const btn = screen.getByTestId("clear-filter-btn");

    fireEvent.change(input, { target: { value: "Teste" } });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockHook.listDepartments).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
      });
    });
  });

  // ------------------------------------
  // CREATE MODAL
  // ------------------------------------
  it("abre modal de criação", async () => {
    renderWithRouter();

    const btn = screen.getByTestId("open-create-modal-btn");
    fireEvent.click(btn);

    // BaseModal não repassa data-testid, então checamos pelo input interno
    const nameInput = await screen.findByTestId("department-name-input");
    expect(nameInput).toBeInTheDocument();
  });

  it("cria departamento ao salvar", async () => {
    mockHook.createDepartment.mockResolvedValue({});

    renderWithRouter();

    fireEvent.click(screen.getByTestId("open-create-modal-btn"));

    fireEvent.change(screen.getByTestId("department-name-input"), {
      target: { value: "Financeiro" },
    });

    fireEvent.click(screen.getByTestId("save-create-btn"));

    await waitFor(() => {
      expect(mockHook.createDepartment).toHaveBeenCalledWith({
        name: "Financeiro",
        companyId: "123",
      });
    });

    expect(mockHook.listDepartments).toHaveBeenCalled();
  });

  // ------------------------------------
  // EDIT MODAL
  // ------------------------------------
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const row = await screen.findByTestId("department-row");
    fireEvent.click(row);

    const editInput = await screen.findByTestId("department-edit-name-input");
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveValue("Operações");
  });

  it("salva edição de departamento", async () => {
    mockHook.updateDepartment.mockResolvedValue({});

    renderWithRouter();

    const row = await screen.findByTestId("department-row");
    fireEvent.click(row);

    fireEvent.change(screen.getByTestId("department-edit-name-input"), {
      target: { value: "Operações Atualizado" },
    });

    fireEvent.click(screen.getByTestId("save-edit-btn"));

    await waitFor(() => {
      expect(mockHook.updateDepartment).toHaveBeenCalledWith(
        "123",
        "1",
        { name: "Operações Atualizado" }
      );
    });

    expect(mockHook.listDepartments).toHaveBeenCalled();
  });

  it("exclui departamento", async () => {
    mockHook.deleteDepartment.mockResolvedValue({});

    renderWithRouter();

    const row = await screen.findByTestId("department-row");
    fireEvent.click(row);

    fireEvent.click(screen.getByText("Excluir"));

    await waitFor(() => {
      expect(mockHook.deleteDepartment).toHaveBeenCalledWith("123", "1");
    });

    expect(mockHook.listDepartments).toHaveBeenCalled();
  });

  // ------------------------------------
  // PAGINATION
  // ------------------------------------
  it("avança para a próxima página", async () => {
    // primeira chamada: total 30 para habilitar botão "Próxima"
    mockHook.listDepartments.mockResolvedValueOnce({
      data: Array(10).fill({ id: "x", name: "Teste", companyId: "123" }),
      total: 30,
    });

    renderWithRouter();

    const next = await screen.findByTestId("next-page-btn");
    fireEvent.click(next);

    await waitFor(() => {
      expect(mockHook.listDepartments).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
      });
    });
  });

  // ------------------------------------
  // EMPTY STATE
  // ------------------------------------
  it("mostra mensagem de vazio", async () => {
    mockHook.listDepartments.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const empty = await screen.findByTestId("empty-row");
    expect(empty).toBeInTheDocument();
  });

  // ------------------------------------
  // LOADING STATE
  // ------------------------------------
  it("mostra o loading", async () => {
    // primeiro retorno demora
    mockHook.listDepartments.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: [{ id: "1", name: "Op", companyId: "123" }],
                total: 1,
              }),
            200
          )
        )
    );

    renderWithRouter();

    const loadingRow = await screen.findByTestId("loading-row");
    expect(loadingRow).toBeInTheDocument();
  });
});
