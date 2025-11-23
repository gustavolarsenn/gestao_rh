// src/pages/admin/__tests__/Users.test.tsx
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import Users from "@/pages/admin/Users";
import { useUsers } from "@/hooks/user/useUsers";
import { useUserRoles } from "@/hooks/user/useUserRoles";
import { usePersons } from "@/hooks/person/usePersons";

// mock do useAuth pro Sidebar
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/user/useUsers");
vi.mock("@/hooks/user/useUserRoles");
vi.mock("@/hooks/person/usePersons");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>
  );

describe("UsersPage", () => {
  let mockUsersHook: any;
  let mockUserRolesHook: any;
  let mockPersonsHook: any;

  beforeEach(() => {
    // garante companyId no localStorage
    window.localStorage.setItem("companyId", "company-1");

    const roles = [
      { id: "role-admin", name: "Admin" },
      { id: "role-basic", name: "Básico" },
    ];

    const users = [
      {
        id: "u1",
        name: "Gustavo",
        email: "gustavo@example.com",
        userRoleId: "role-admin",
        companyId: "company-1",
        role: { id: "role-admin", name: "Admin" },
      },
      {
        id: "u2",
        name: "Leticia",
        email: "leticia@example.com",
        userRoleId: "role-basic",
        companyId: "company-1",
        role: { id: "role-basic", name: "Básico" },
      },
    ];

    const personsPage1 = [
      { id: "p1", name: "Pessoa 1", email: "p1@example.com" },
      { id: "p2", name: "Pessoa 2", email: "p2@example.com" },
    ];

    mockUsersHook = {
      listUsers: vi.fn().mockResolvedValue({
        data: users,
        total: users.length,
      }),
      createUser: vi.fn().mockResolvedValue({
        id: "u-new",
        name: "Pessoa 1",
        email: "p1@example.com",
        userRoleId: "role-admin",
        companyId: "company-1",
      }),
      updateUser: vi.fn().mockResolvedValue({
        id: "u1",
        name: "Gustavo",
        email: "gustavo@example.com",
        userRoleId: "role-basic",
        companyId: "company-1",
      }),
      deleteUser: vi.fn().mockResolvedValue({}),
    };
    (useUsers as any).mockReturnValue(mockUsersHook);

    mockUserRolesHook = {
      listUserRoles: vi.fn().mockResolvedValue(roles),
    };
    (useUserRoles as any).mockReturnValue(mockUserRolesHook);

    mockPersonsHook = {
      listPersons: vi.fn().mockResolvedValue({
        data: personsPage1,
        total: 20, // pra ter mais de uma página
      }),
    };
    (usePersons as any).mockReturnValue(mockPersonsHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===================== LOAD INICIAL =====================
  it("carrega a lista inicial de usuários", async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenCalled();
      expect(mockUserRolesHook.listUserRoles).toHaveBeenCalled();
    });

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    const firstDataRow = rows[1];
    const secondDataRow = rows[2];

    expect(within(firstDataRow).getByText("Gustavo")).toBeInTheDocument();
    expect(
      within(firstDataRow).getByText("gustavo@example.com")
    ).toBeInTheDocument();
    expect(within(firstDataRow).getByText("Admin")).toBeInTheDocument();

    expect(within(secondDataRow).getByText("Leticia")).toBeInTheDocument();
    expect(
      within(secondDataRow).getByText("leticia@example.com")
    ).toBeInTheDocument();
    expect(within(secondDataRow).getByText("Básico")).toBeInTheDocument();
  });

  // ===================== FILTROS =====================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Gustavo" } });

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Gustavo",
        email: undefined,
        userRoleId: undefined,
      });
    });
  });

  it("filtra por email corretamente", async () => {
    renderWithRouter();

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "@example.com" } });

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: "@example.com",
        userRoleId: undefined,
      });
    });
  });

  it("filtra por perfil corretamente", async () => {
    renderWithRouter();

    // combobox do filtro de Perfil (é o único na barra de filtros)
    const comboBoxes = await screen.findAllByRole("combobox");
    const perfilFilter = comboBoxes[0];

    fireEvent.mouseDown(perfilFilter);

    const adminOption = await screen.findByRole("option", { name: "Admin" });
    fireEvent.click(adminOption);

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: undefined,
        userRoleId: "role-admin",
      });
    });
  });

  it("limpa filtros ao clicar em 'Limpar'", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "X" } });

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "Y" } });

    const comboBoxes = await screen.findAllByRole("combobox");
    const perfilFilter = comboBoxes[0];

    fireEvent.mouseDown(perfilFilter);
    const basicOption = await screen.findByRole("option", { name: "Básico" });
    fireEvent.click(basicOption);

    const clearBtn = screen.getByText("Limpar");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: undefined,
        userRoleId: undefined,
      });
    });
  });

  // ===================== PAGINAÇÃO =====================
  it("avança para a próxima página", async () => {
    mockUsersHook.listUsers.mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `uX-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        userRoleId: "role-basic",
        companyId: "company-1",
        role: { id: "role-basic", name: "Básico" },
      })),
      total: 25,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockUsersHook.listUsers).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        email: undefined,
        userRoleId: undefined,
      });
    });
  });

  // ===================== CREATE MODAL =====================
  it("abre modal de criação ao clicar em 'Criar Usuário'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Usuário");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    // botão de selecionar pessoa
    expect(
      within(dialog).getByText("Selecionar Pessoa")
    ).toBeInTheDocument();

    // select de perfil dentro do modal (pode estar 'hidden' pro testing-library)
    const comboBoxes = within(dialog).getAllByRole("combobox", {
      hidden: true,
    });
    expect(comboBoxes.length).toBeGreaterThanOrEqual(1);

    // input de senha
    const passwordInput = within(dialog).getByLabelText("Senha");
    expect(passwordInput).toBeInTheDocument();
  });

  it("carrega pessoas ao abrir modal de seleção e permite filtros/paginação", async () => {
    renderWithRouter();

    const openCreateBtn = screen.getByText("Criar Usuário");
    fireEvent.click(openCreateBtn);

    const dialogCreate = await screen.findByRole("dialog");

    const selectPersonBtn = within(dialogCreate).getByText("Selecionar Pessoa");
    fireEvent.click(selectPersonBtn);

    const dialogPersons = await screen.findByRole("dialog", {
      name: "Selecionar Pessoa",
    });

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: undefined,
      });
    });

    // filtros de nome/email
    const nomeInput = within(dialogPersons).getByLabelText("Nome") as HTMLInputElement;
    const emailInput = within(dialogPersons).getByLabelText("Email") as HTMLInputElement;

    fireEvent.change(nomeInput, { target: { value: "Pessoa" } });
    fireEvent.change(emailInput, { target: { value: "@example.com" } });

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Pessoa",
        email: "@example.com",
      });
    });

    // paginação Próxima
    const nextBtn = within(dialogPersons).getByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: "Pessoa",
        email: "@example.com",
      });
    });
  });

  it("cria usuário ao selecionar pessoa, definir perfil e senha", async () => {
    renderWithRouter();

    const openCreateBtn = screen.getByText("Criar Usuário");
    fireEvent.click(openCreateBtn);

    const dialogCreate = await screen.findByRole("dialog");

    // abre seletor de pessoa
    const selectPersonBtn = within(dialogCreate).getByText("Selecionar Pessoa");
    fireEvent.click(selectPersonBtn);

    const dialogPersons = await screen.findByRole("dialog", {
      name: "Selecionar Pessoa",
    });

    // clica na primeira pessoa
    const pessoa1Name = await within(dialogPersons).findByText("Pessoa 1");
    const pessoa1Item = pessoa1Name.closest("div")!;
    fireEvent.click(pessoa1Item);

    // agora o botão principal deve mostrar o nome/email
    const personButtonAfterSelect = await within(dialogCreate).findByText(
      /Pessoa 1 \(p1@example.com\)/
    );
    expect(personButtonAfterSelect).toBeInTheDocument();

    // seleciona perfil (combobox 'hidden' do MUI)
    const perfilSelect = await within(dialogCreate).findByRole("combobox", {
      hidden: true,
    });

    fireEvent.mouseDown(perfilSelect);
    const adminOption = await screen.findByRole("option", { name: "Admin" });
    fireEvent.click(adminOption);

    // senha
    const passwordInput = within(dialogCreate).getByLabelText(
      "Senha"
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: "senha123" } });

    const createBtn = within(dialogCreate).getByText("Criar");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockUsersHook.createUser).toHaveBeenCalledWith({
        name: "Pessoa 1",
        email: "p1@example.com",
        password: "senha123",
        userRoleId: "role-admin",
        personId: "p1",
        companyId: "company-1",
      });
    });

    expect(mockUsersHook.listUsers).toHaveBeenCalled();
  });

  // ===================== EDIT MODAL =====================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstDataRow = rows[1];

    fireEvent.click(firstDataRow);

    const dialog = await screen.findByRole("dialog");

    const comboBoxes = within(dialog).getAllByRole("combobox", {
      hidden: true,
    });
    const perfilSelect = comboBoxes[0];

    expect(perfilSelect).toBeInTheDocument();
  });

  it("salva alterações ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstDataRow = rows[1];

    fireEvent.click(firstDataRow);

    const dialog = await screen.findByRole("dialog");

    const comboBoxes = within(dialog).getAllByRole("combobox", {
      hidden: true,
    });
    const perfilSelect = comboBoxes[0];

    fireEvent.mouseDown(perfilSelect);
    const basicOption = await screen.findByRole("option", { name: "Básico" });
    fireEvent.click(basicOption);

    const saveBtn = within(dialog).getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUsersHook.updateUser).toHaveBeenCalledWith("u1", {
        userRoleId: "role-basic",
        companyId: "company-1",
      });
    });

    expect(mockUsersHook.listUsers).toHaveBeenCalled();
  });

  it("exclui usuário ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const firstDataRow = rows[1];

    fireEvent.click(firstDataRow);

    const dialog = await screen.findByRole("dialog");

    const deleteBtn = within(dialog).getByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockUsersHook.deleteUser).toHaveBeenCalledWith("u1");
    });

    expect(mockUsersHook.listUsers).toHaveBeenCalled();
  });
});
