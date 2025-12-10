import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import RolesPage from "@/pages/admin/Roles";
import { useRoles } from "@/hooks/role/useRoles";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useRoleTypes } from "@/hooks/role-type/useRoleTypes";

// mock do useAuth para o Sidebar
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/role/useRoles");
vi.mock("@/hooks/department/useDepartments");
vi.mock("@/hooks/role-type/useRoleTypes");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <RolesPage />
    </MemoryRouter>
  );

describe("RolesPage", () => {
  let mockRolesHook: any;
  let mockDepartmentsHook: any;
  let mockRoleTypesHook: any;

  beforeEach(() => {
    mockRolesHook = {
      listRoles: vi.fn().mockResolvedValue({
        data: [
          {
            id: "role1",
            name: "Operador de Guindaste",
            departmentId: "dep1",
            roleTypeId: "rt1",
            defaultWage: 5000,
            companyId: "company-1",
          },
        ],
        total: 1,
      }),
      createRole: vi.fn().mockResolvedValue({}),
      updateRole: vi.fn().mockResolvedValue({}),
      deleteRole: vi.fn().mockResolvedValue({}),
    };
    (useRoles as any).mockReturnValue(mockRolesHook);

    mockDepartmentsHook = {
      listDistinctDepartments: vi.fn().mockResolvedValue([
        { id: "dep1", name: "Operações" },
        { id: "dep2", name: "Administração" },
      ]),
    };
    (useDepartments as any).mockReturnValue(mockDepartmentsHook);

    mockRoleTypesHook = {
      listDistinctRoleTypes: vi.fn().mockResolvedValue([
        { id: "rt1", name: "Operacional", departmentId: "dep1" },
        { id: "rt2", name: "Supervisão", departmentId: "dep1" },
      ]),
    };
    (useRoleTypes as any).mockReturnValue(mockRoleTypesHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INICIAL
  // =========================================
  it("carrega a lista inicial de cargos", async () => {
    renderWithRouter();

    expect(mockRolesHook.listRoles).toHaveBeenCalled();

    const nameCell = await screen.findByText("Operador de Guindaste");
    expect(nameCell).toBeInTheDocument();

    const deptCell = screen.getByText("Operações");
    const typeCell = screen.getByText("Operacional");
    const wageCell = screen.getByText("R$ 5000,00");

    expect(deptCell).toBeInTheDocument();
    expect(typeCell).toBeInTheDocument();
    expect(wageCell).toBeInTheDocument();
  });

  // =========================================
  // FILTROS
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Operador" } });

    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Operador",
        departmentId: undefined,
        roleTypeId: undefined,
      });
    });
  });

  it("filtra por departamento corretamente", async () => {
    renderWithRouter();

    // No painel de filtros existem 2 combobox:
    // [0] Departamento, [1] Tipo de Função
    const comboBoxes = await screen.findAllByRole("combobox");
    const deptFilter = comboBoxes[0];

    fireEvent.mouseDown(deptFilter);

    const optOperacoes = await screen.findByRole("option", {
      name: "Operações",
    });
    fireEvent.click(optOperacoes);

    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: "dep1",
        roleTypeId: undefined,
      });
    });
  });

  it("filtra por tipo de função corretamente", async () => {
    renderWithRouter();

    // No painel de filtros: [0] Departamento, [1] Tipo de Função
    const comboBoxes = await screen.findAllByRole("combobox");
    const typeFilter = comboBoxes[1];

    fireEvent.mouseDown(typeFilter);

    const optOperacional = await screen.findByRole("option", {
      name: "Operacional",
    });
    fireEvent.click(optOperacional);

    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleTypeId: "rt1",
      });
    });
  });

  it("limpa filtros ao clicar em 'Limpar'", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "X" } });

    const clearBtn = screen.getByText("Limpar");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleTypeId: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL
  // =========================================
  it("abre modal de criação ao clicar em 'Criar Cargo'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Cargo");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    // Campo Nome dentro do modal
    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const modalNameInput = nomeInputs[nomeInputs.length - 1];

    // Dentro do modal devem existir 2 combobox (Departamento e Tipo)
    const comboBoxes = within(dialog).getAllByRole("combobox");

    expect(modalNameInput).toBeInTheDocument();
    expect(comboBoxes.length).toBeGreaterThanOrEqual(2);
  });

  it("cria cargo ao preencher e clicar em 'Criar'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Cargo");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    // Nome no modal
    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const modalNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;
    fireEvent.change(modalNameInput, {
      target: { value: "Supervisor de Operções" },
    });

    // Dentro do modal: [0] Departamento, [1] Tipo
    const comboBoxes = within(dialog).getAllByRole("combobox");
    const modalDeptSelect = comboBoxes[0];
    const modalTypeSelect = comboBoxes[1];

    // Departamento
    fireEvent.mouseDown(modalDeptSelect);
    const optOperacoes = await screen.findByRole("option", {
      name: "Operações",
    });
    fireEvent.click(optOperacoes);

    // Tipo
    fireEvent.mouseDown(modalTypeSelect);
    const optOperacional = await screen.findByRole("option", {
      name: "Operacional",
    });
    fireEvent.click(optOperacional);

    // Salário
    const wageInput = within(dialog).getByLabelText(
      "Salário Padrão"
    ) as HTMLInputElement;
    fireEvent.change(wageInput, { target: { value: "7500" } });

    const createBtn = within(dialog).getByText("Criar");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockRolesHook.createRole).toHaveBeenCalledWith({
        name: "Supervisor de Operções",
        departmentId: "dep1",
        roleTypeId: "rt1",
        defaultWage: 7500,
      });
    });

    expect(mockRolesHook.listRoles).toHaveBeenCalled();
  });

  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operador de Guindaste");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const editNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    const wageInput = within(dialog).getByLabelText(
      "Salário Padrão"
    ) as HTMLInputElement;

    expect(editNameInput.value).toBe("Operador de Guindaste");
    expect(wageInput.value).toBe("5000");
  });

  it("salva alterações ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operador de Guindaste");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome");
    const editNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    fireEvent.change(editNameInput, {
      target: { value: "Operador Editado" },
    });

    const saveBtn = within(dialog).getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockRolesHook.updateRole).toHaveBeenCalledWith(
        "company-1",
        "role1",
        {
          name: "Operador Editado",
          departmentId: "dep1",
          roleTypeId: "rt1",
          defaultWage: 5000,
        }
      );
    });
  });

  it("exclui cargo ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("Operador de Guindaste");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const dialog = await screen.findByRole("dialog");
    const deleteBtn = within(dialog).getByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockRolesHook.deleteRole).toHaveBeenCalledWith(
        "company-1",
        "role1"
      );
    });

    expect(mockRolesHook.listRoles).toHaveBeenCalled();
  });

  // =========================================
  // PAGINAÇÃO
  // =========================================
  it("avança para a próxima página", async () => {
    // sobrescreve o mock para este teste com mais itens e total maior
    mockRolesHook.listRoles.mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `roleX-${i}`,
        name: "Cargo X",
        departmentId: "dep1",
        roleTypeId: "rt1",
        defaultWage: 3000,
        companyId: "company-1",
      })),
      total: 25,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });

    // Espera a primeira carga (page 1) e o botão habilitar
    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleTypeId: undefined,
      });
      expect(nextBtn).not.toBeDisabled();
    });

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockRolesHook.listRoles).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleTypeId: undefined,
      });
    });
  });

  // =========================================
  // LOADING
  // =========================================
  it("mostra 'Carregando...' enquanto busca cargos", async () => {
    mockRolesHook.listRoles.mockImplementation(
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
