import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import EmployeesPage from "@/pages/admin/Employees";

import { useEmployees } from "@/hooks/employee/useEmployees";
import { useEmployeeHistories } from "@/hooks/employee/useEmployeeHistories";
import { usePersons } from "@/hooks/person/usePersons";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useRoleTypes } from "@/hooks/role-type/useRoleTypes";
import { useRoles } from "@/hooks/role/useRoles";
import { useTeams } from "@/hooks/team/useTeams";
import { useBranches } from "@/hooks/branch/useBranches";

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

vi.mock("@/hooks/employee/useEmployees");
vi.mock("@/hooks/employee/useEmployeeHistories");
vi.mock("@/hooks/person/usePersons");
vi.mock("@/hooks/department/useDepartments");
vi.mock("@/hooks/role-type/useRoleTypes");
vi.mock("@/hooks/role/useRoles");
vi.mock("@/hooks/team/useTeams");
vi.mock("@/hooks/branch/useBranches");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <EmployeesPage />
    </MemoryRouter>
  );

describe("EmployeesPage", () => {
  let mockEmployeesHook: any;
  let mockHistoriesHook: any;
  let mockPersonsHook: any;
  let mockDepartmentsHook: any;
  let mockRoleTypesHook: any;
  let mockRolesHook: any;
  let mockTeamsHook: any;
  let mockBranchesHook: any;

  beforeEach(() => {
    // employees
    mockEmployeesHook = {
      listEmployees: vi.fn().mockResolvedValue({
        data: [
          {
            id: "emp1",
            personId: "person1",
            departmentId: "dep1",
            roleTypeId: "rt1",
            roleId: "role1",
            teamId: "team1",
            branchId: "branch1",
            hiringDate: "2024-01-01",
            departureDate: null,
            wage: 3000,
            person: { id: "person1", name: "João da Silva" },
            role: { id: "role1", name: "Analista" },
            department: { id: "dep1", name: "Operações" },
            branch: { id: "branch1", name: "Santarém" },
          },
        ],
        total: 1,
      }),
      createEmployee: vi.fn(),
      updateEmployee: vi.fn(),
      deleteEmployee: vi.fn(),
      loading: false,
      error: "",
    };
    (useEmployees as any).mockReturnValue(mockEmployeesHook);

    // histories
    mockHistoriesHook = {
      listEmployeeHistories: vi.fn().mockResolvedValue({
        data: [],
        total: 0,
      }),
    };
    (useEmployeeHistories as any).mockReturnValue(mockHistoriesHook);

    // persons
    mockPersonsHook = {
      listPersons: vi.fn().mockResolvedValue({
        data: [
          { id: "person1", name: "João da Silva", email: "joao@test.com" },
        ],
        total: 1,
      }),
    };
    (usePersons as any).mockReturnValue(mockPersonsHook);

    // departments
    mockDepartmentsHook = {
      listDistinctDepartments: vi.fn().mockResolvedValue([
        { id: "dep1", name: "Operações" },
      ]),
    };
    (useDepartments as any).mockReturnValue(mockDepartmentsHook);

    // role types
    mockRoleTypesHook = {
      listDistinctRoleTypes: vi.fn().mockResolvedValue([
        { id: "rt1", name: "Administrativo", departmentId: "dep1" },
      ]),
    };
    (useRoleTypes as any).mockReturnValue(mockRoleTypesHook);

    // roles
    mockRolesHook = {
      listDistinctRoles: vi.fn().mockResolvedValue([
        {
          id: "role1",
          name: "Analista",
          departmentId: "dep1",
          defaultWage: 3000,
        },
      ]),
    };
    (useRoles as any).mockReturnValue(mockRolesHook);

    // teams
    mockTeamsHook = {
      listDistinctTeams: vi.fn().mockResolvedValue([
        { id: "team1", name: "Time A" },
      ]),
    };
    (useTeams as any).mockReturnValue(mockTeamsHook);

    // branches
    mockBranchesHook = {
      listDistinctBranches: vi.fn().mockResolvedValue([
        { id: "branch1", name: "Santarém" },
      ]),
    };
    (useBranches as any).mockReturnValue(mockBranchesHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INITIAL
  // =========================================
  it("carrega a lista inicial de funcionários", async () => {
    renderWithRouter();

    expect(mockEmployeesHook.listEmployees).toHaveBeenCalled();

    const nameCell = await screen.findByText("João da Silva");
    expect(nameCell).toBeInTheDocument();

    const roleCell = screen.getByText("Analista");
    const deptCell = screen.getByText("Operações");
    const branchCell = screen.getByText("Santarém");

    expect(roleCell).toBeInTheDocument();
    expect(deptCell).toBeInTheDocument();
    expect(branchCell).toBeInTheDocument();
  });

  // =========================================
  // FILTERS (apenas nome + limpar)
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Jo" } });

    await waitFor(() => {
      expect(mockEmployeesHook.listEmployees).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Jo",
        departmentId: undefined,
        roleId: undefined,
        branchId: undefined,
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
      expect(mockEmployeesHook.listEmployees).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleId: undefined,
        branchId: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL + PERSON MODAL
  // =========================================
  it("abre modal de cadastro de funcionário", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Cadastrar colaborador");
    fireEvent.click(openBtn);

    const pessoaLabel = await screen.findByText("Pessoa");
    expect(pessoaLabel).toBeInTheDocument();

    const dataAdmissao = screen.getByLabelText("Data de Admissão");
    expect(dataAdmissao).toBeInTheDocument();
  });

  it("abre modal de seleção de pessoa a partir do cadastro", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Cadastrar colaborador");
    fireEvent.click(openBtn);

    const selectPessoaBtn = await screen.findByRole("button", {
      name: /Selecionar Pessoa/i,
    });
    fireEvent.click(selectPessoaBtn);

    // Em vez do título, usamos o campo exclusivo "Email" do modal,
    // que só existe dentro do modal de seleção de pessoa.
    const emailInput = await screen.findByLabelText("Email");
    expect(emailInput).toBeInTheDocument();
  });


  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha da tabela", async () => {
    renderWithRouter();

    const rowCell = await screen.findByText("João da Silva");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const pessoaInput = await screen.findByLabelText("Pessoa");
    expect(pessoaInput).toBeInTheDocument();
    expect(pessoaInput).toHaveValue("João da Silva");

    const salarioInput = screen.getByLabelText("Salário (R$)") as HTMLInputElement;
    expect(salarioInput.value).toBe("3000");
  });

  it("salva alterações de funcionário (salário e data de demissão)", async () => {
    mockEmployeesHook.updateEmployee.mockResolvedValue({
      id: "emp1",
      personId: "person1",
      departmentId: "dep1",
      roleTypeId: "rt1",
      roleId: "role1",
      teamId: "team1",
      branchId: "branch1",
      hiringDate: "2024-01-01",
      departureDate: "2024-02-01",
      wage: 5000,
      person: { id: "person1", name: "João da Silva" },
      role: { id: "role1", name: "Analista" },
      department: { id: "dep1", name: "Operações" },
      branch: { id: "branch1", name: "Santarém" },
    });

    renderWithRouter();

    const rowCell = await screen.findByText("João da Silva");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const salarioInput = (await screen.findByLabelText(
      "Salário (R$)"
    )) as HTMLInputElement;
    fireEvent.change(salarioInput, { target: { value: "5000" } });

    const demissaoInput = screen.getByLabelText(
      "Data de Demissão"
    ) as HTMLInputElement;
    fireEvent.change(demissaoInput, { target: { value: "2024-02-01" } });

    const saveBtn = screen.getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockEmployeesHook.updateEmployee).toHaveBeenCalledWith(
        "emp1",
        expect.objectContaining({
          wage: "5000",
          departureDate: "2024-02-01",
        })
      );
    });
  });

  it("exclui funcionário ao clicar em 'Excluir'", async () => {
    mockEmployeesHook.deleteEmployee.mockResolvedValue({});

    renderWithRouter();

    const rowCell = await screen.findByText("João da Silva");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockEmployeesHook.deleteEmployee).toHaveBeenCalledWith("emp1");
    });

    expect(mockEmployeesHook.listEmployees).toHaveBeenCalled();
  });

  // =========================================
  // PAGINATION (lista principal)
  // =========================================
  it("avança para a próxima página de funcionários", async () => {
    // primeira chamada com total maior
    mockEmployeesHook.listEmployees.mockResolvedValueOnce({
      data: Array(10).fill({
        id: "empX",
        personId: "person1",
        departmentId: "dep1",
        roleTypeId: "rt1",
        roleId: "role1",
        teamId: "team1",
        branchId: "branch1",
        hiringDate: "2024-01-01",
        departureDate: null,
        wage: 3000,
        person: { id: "person1", name: "João da Silva" },
        role: { id: "role1", name: "Analista" },
        department: { id: "dep1", name: "Operações" },
        branch: { id: "branch1", name: "Santarém" },
      }),
      total: 30,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockEmployeesHook.listEmployees).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        departmentId: undefined,
        roleId: undefined,
        branchId: undefined,
      });
    });
  });

  // =========================================
  // EMPTY STATE
  // =========================================
  it("mostra mensagem de vazio quando não há funcionários", async () => {
    mockEmployeesHook.listEmployees.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const emptyText = await screen.findByText("Nenhum colaborador encontrado.");
    expect(emptyText).toBeInTheDocument();
  });

  // =========================================
  // LOADING STATE
  // =========================================
  it("mostra o estado de carregando enquanto busca dados", async () => {
    mockEmployeesHook.listEmployees.mockImplementation(
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

  // =========================================
  // HISTÓRICO NO MODAL DE EDIÇÃO
  // =========================================
  it("carrega histórico do funcionário ao abrir modal de edição", async () => {
    mockHistoriesHook.listEmployeeHistories.mockResolvedValueOnce({
      data: [],
      total: 0,
    });

    renderWithRouter();

    const rowCell = await screen.findByText("João da Silva");
    const row = rowCell.closest("tr")!;
    fireEvent.click(row);

    await waitFor(() => {
      expect(mockHistoriesHook.listEmployeeHistories).toHaveBeenCalledWith({
        employeeId: "emp1",
        page: 1,
        limit: 5,
      });
    });

    const emptyHistoryText = await screen.findByText(
      "Nenhum histórico encontrado."
    );
    expect(emptyHistoryText).toBeInTheDocument();
  });
});
