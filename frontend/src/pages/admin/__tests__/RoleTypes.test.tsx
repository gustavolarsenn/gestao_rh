import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import RoleTypePage from "@/pages/admin/RoleTypes";
import { useRoleTypes } from "@/hooks/role-type/useRoleTypes";
import { useDepartments } from "@/hooks/department/useDepartments";

// mock do useAuth para o Sidebar
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/role-type/useRoleTypes");
vi.mock("@/hooks/department/useDepartments");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <RoleTypePage />
    </MemoryRouter>
  );

describe("RoleTypePage", () => {
  let mockRoleTypesHook: any;
  let mockDepartmentsHook: any;

  beforeEach(() => {
    // localStorage para companyId
    window.localStorage.setItem("companyId", "company-1");

    mockRoleTypesHook = {
      listRoleTypes: vi.fn().mockResolvedValue({
        data: [
          {
            id: "rt1",
            name: "Operacional",
            departmentId: "dep1",
            department: { id: "dep1", name: "Operações" },
          },
        ],
        total: 1,
      }),
      createRoleType: vi.fn().mockResolvedValue({}),
      updateRoleType: vi.fn().mockResolvedValue({}),
      deleteRoleType: vi.fn().mockResolvedValue({}),
    };
    (useRoleTypes as any).mockReturnValue(mockRoleTypesHook);

    mockDepartmentsHook = {
      listDistinctDepartments: vi.fn().mockResolvedValue([
        { id: "dep1", name: "Operações" },
        { id: "dep2", name: "Administração" },
      ]),
    };
    (useDepartments as any).mockReturnValue(mockDepartmentsHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  // =========================================
  // LOAD INICIAL
  // =========================================
  it("carrega a lista inicial de tipos de função", async () => {
    renderWithRouter();

    expect(mockRoleTypesHook.listRoleTypes).toHaveBeenCalled();

    const nameCell = await screen.findByText("Operacional");
    expect(nameCell).toBeInTheDocument();

    const deptCell = screen.getByText("Operações");
    expect(deptCell).toBeInTheDocument();
  });

  // =========================================
  // FILTROS
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Oper" } });

    await waitFor(() => {
      expect(mockRoleTypesHook.listRoleTypes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Oper",
        departmentId: undefined,
      });
    });
  });

  it("filtra por departamento corretamente", async () => {
    renderWithRouter();

    const comboBoxes = await screen.findAllByRole("combobox");
    const deptFilter = comboBoxes[0];

    fireEvent.mouseDown(deptFilter);

    const optOperacoes = await screen.findByRole("option", {
      name: "Operações",
    });
    fireEvent.click(optOperacoes);

    await waitFor(() => {
      expect(mockRoleTypesHook.listRoleTypes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: "dep1",
      });
    });
  });

  it("limpa filtros ao clicar em 'Limpar'", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "X" } });

    const comboBoxes = await screen.findAllByRole("combobox");
    const deptFilter = comboBoxes[0];
    fireEvent.mouseDown(deptFilter);

    const optOperacoes = await screen.findByRole("option", {
      name: "Operações",
    });
    fireEvent.click(optOperacoes);

    const clearBtn = screen.getByText("Limpar");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockRoleTypesHook.listRoleTypes).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL
  // =========================================
  it("abre modal de criação ao clicar em 'Criar Função'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Função");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const modalNameInput = nomeInputs[nomeInputs.length - 1];

    const comboBoxes = within(dialog).getAllByRole("combobox");
    expect(modalNameInput).toBeInTheDocument();
    expect(comboBoxes.length).toBeGreaterThanOrEqual(1);
  });

  it("cria função ao preencher e clicar em 'Criar'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Função");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const modalNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;
    fireEvent.change(modalNameInput, {
      target: { value: "Coordenador" },
    });

    const comboBoxes = within(dialog).getAllByRole("combobox");
    const deptSelect = comboBoxes[0];

    fireEvent.mouseDown(deptSelect);
    const optOperacoes = await screen.findByRole("option", {
      name: "Operações",
    });
    fireEvent.click(optOperacoes);

    const createBtn = within(dialog).getByText("Criar");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockRoleTypesHook.createRoleType).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Coordenador",
          departmentId: "dep1",
          companyId: "company-1",
        })
      );
    });

    expect(mockRoleTypesHook.listRoleTypes).toHaveBeenCalled();
  });

  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operacional");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    expect(editNameInput.value).toBe("Operacional");
  });

  it("salva alterações ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operacional");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    fireEvent.change(editNameInput, {
      target: { value: "Operacional Editado" },
    });

    const comboBoxes = within(dialog).getAllByRole("combobox");
    const deptSelect = comboBoxes[0];

    fireEvent.mouseDown(deptSelect);
    const optAdmin = await screen.findByRole("option", {
      name: "Administração",
    });
    fireEvent.click(optAdmin);

    const saveBtn = within(dialog).getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockRoleTypesHook.updateRoleType).toHaveBeenCalledWith("rt1", {
        name: "Operacional Editado",
        departmentId: "dep2",
      });
    });
  });

  it("exclui função ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operacional");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");
    const deleteBtn = within(dialog).getByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockRoleTypesHook.deleteRoleType).toHaveBeenCalledWith("rt1");
    });

    expect(mockRoleTypesHook.listRoleTypes).toHaveBeenCalled();
  });

  // =========================================
  // PAGINAÇÃO
  // =========================================
  it("avança para a próxima página", async () => {
    // sobrescreve o mock para este teste
    mockRoleTypesHook.listRoleTypes.mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `rtX-${i}`,
        name: `Tipo ${i}`,
        departmentId: "dep1",
      })),
      total: 25, // garante pageCount >= 2
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });

    // espera a primeira carga e o botão habilitar
    await waitFor(() => {
      expect(mockRoleTypesHook.listRoleTypes).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
      });
      expect(nextBtn).not.toBeDisabled();
    });

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockRoleTypesHook.listRoleTypes).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        departmentId: undefined,
      });
    });
  });

  // =========================================
  // LOADING
  // =========================================
  it("mostra 'Carregando...' enquanto busca tipos de função", async () => {
    mockRoleTypesHook.listRoleTypes.mockImplementation(
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
