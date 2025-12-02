import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Persons from "@/pages/admin/Persons";
import { usePersons } from "@/hooks/person/usePersons";
import { useStates } from "@/hooks/geo/useStates";
import { useCities } from "@/hooks/geo/useCities";

// Sidebar -> useAuth
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/person/usePersons");
vi.mock("@/hooks/geo/useStates");
vi.mock("@/hooks/geo/useCities");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <Persons />
    </MemoryRouter>
  );

describe("Persons Page", () => {
  let mockPersonsHook: any;
  let mockStatesHook: any;
  let mockCitiesHook: any;

  beforeEach(() => {
    mockPersonsHook = {
      listPersons: vi.fn().mockResolvedValue({
        data: [
          {
            id: "p1",
            name: "João da Silva",
            email: "joao@example.com",
            cpf: "123.456.789-00",
            birthDate: "1990-01-01",
            phone: "999999999",
            address: "Rua A",
            addressNumber: "100",
            zipCode: "68000-000",
            cityId: "c1",
          },
        ],
        total: 1,
      }),
      createPerson: vi.fn().mockResolvedValue({}),
      updatePerson: vi.fn().mockResolvedValue({}),
      deletePerson: vi.fn().mockResolvedValue({}),
    };
    (usePersons as any).mockReturnValue(mockPersonsHook);

    mockStatesHook = {
      listStates: vi.fn().mockResolvedValue([
        { id: "s1", name: "Pará", uf: "PA" },
        { id: "s2", name: "Amazonas", uf: "AM" },
      ]),
    };
    (useStates as any).mockReturnValue(mockStatesHook);

    mockCitiesHook = {
      listCities: vi.fn().mockResolvedValue([
        { id: "c1", name: "Santarém", stateId: "s1" },
        { id: "c2", name: "Belém", stateId: "s1" },
        { id: "c3", name: "Manaus", stateId: "s2" },
      ]),
    };
    (useCities as any).mockReturnValue(mockCitiesHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // LOAD INITIAL
  // =========================================
  it("carrega a lista inicial de pessoas", async () => {
    renderWithRouter();

    expect(mockPersonsHook.listPersons).toHaveBeenCalled();

    const rowName = await screen.findByText("João da Silva");
    expect(rowName).toBeInTheDocument();

    const emailCell = screen.getByText("joao@example.com");
    expect(emailCell).toBeInTheDocument();

    const cpfCell = screen.getByText("123.456.789-00");
    expect(cpfCell).toBeInTheDocument();

    const stateCell = screen.getByText("Pará");
    const cityCell = screen.getByText("Santarém");
    expect(stateCell).toBeInTheDocument();
    expect(cityCell).toBeInTheDocument();
  });

  // =========================================
  // FILTERS (nome, email, cpf, limpar)
  // =========================================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "João" } });

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "João",
        email: undefined,
        cpf: undefined,
        cityId: undefined,
      });
    });
  });

  it("filtra por email corretamente", async () => {
    renderWithRouter();

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "joao@" } });

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: "joao@",
        cpf: undefined,
        cityId: undefined,
      });
    });
  });

  it("filtra por CPF corretamente", async () => {
    renderWithRouter();

    const cpfInput = screen.getByLabelText("CPF") as HTMLInputElement;
    fireEvent.change(cpfInput, { target: { value: "123" } });

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: undefined,
        cpf: "123",
        cityId: undefined,
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
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        email: undefined,
        cpf: undefined,
        cityId: undefined,
      });
    });
  });

  // =========================================
  // CREATE MODAL
  // =========================================
  it("abre modal de criação ao clicar em 'Cadastrar Pessoa'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Cadastrar Pessoa");
    fireEvent.click(openBtn);

    // Existem 2 "Nome" na tela (filtro + modal), pegamos o do modal (último)
    const nomeInputs = await screen.findAllByLabelText("Nome");
    const nameField = nomeInputs[nomeInputs.length - 1];

    // Também há 2 "CPF" (filtro + modal)
    const cpfInputs = (await screen.findAllByLabelText("CPF")) as HTMLElement[];
    const cpfField = cpfInputs[cpfInputs.length - 1];

    // "E-mail" só existe no modal (filtro é "Email")
    const emailField = screen.getByLabelText("E-mail");

    expect(nameField).toBeInTheDocument();
    expect(emailField).toBeInTheDocument();
    expect(cpfField).toBeInTheDocument();
  });

  // =========================================
  // EDIT MODAL + SAVE + DELETE
  // =========================================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("João da Silva");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    // De novo, 2 campos "Nome": filtro + modal; pegamos o do modal
    const nomeInputs = await screen.findAllByLabelText("Nome");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    // "E-mail" só aparece nos modais (criação/edição), então sempre é de lá
    const emailInputs = await screen.findAllByLabelText("E-mail");
    const editEmailInput =
      emailInputs[emailInputs.length - 1] as HTMLInputElement;

    // "CPF" existe no filtro e no modal; pegamos o último
    const cpfInputs = await screen.findAllByLabelText("CPF");
    const editCpfInput = cpfInputs[cpfInputs.length - 1] as HTMLInputElement;

    expect(editNameInput.value).toBe("João da Silva");
    expect(editEmailInput.value).toBe("joao@example.com");
    expect(editCpfInput.value).toBe("123.456.789-00");
  });

  it("salva alterações da pessoa ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("João da Silva");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const nomeInputs = await screen.findAllByLabelText("Nome");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    fireEvent.change(editNameInput, {
      target: { value: "João Editado" },
    });

    const saveBtn = screen.getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockPersonsHook.updatePerson).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({
          name: "João Editado",
        })
      );
    });
  });

  it("exclui pessoa ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const nameCell = await screen.findByText("João da Silva");
    const row = nameCell.closest("tr")!;
    fireEvent.click(row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockPersonsHook.deletePerson).toHaveBeenCalledWith("p1");
    });

    expect(mockPersonsHook.listPersons).toHaveBeenCalled();
  });

  // =========================================
  // PAGINATION
  // =========================================
  it("avança para a próxima página", async () => {
    mockPersonsHook.listPersons.mockResolvedValueOnce({
      data: Array(10).fill({
        id: "pX",
        name: "Pessoa X",
        email: "x@example.com",
        cpf: "000.000.000-00",
        birthDate: null,
        phone: null,
        address: null,
        addressNumber: null,
        zipCode: null,
        cityId: "c1",
      }),
      total: 25,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockPersonsHook.listPersons).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 10,
        })
      );
    });
  });

  // =========================================
  // LOADING STATE
  // =========================================
  it("mostra o texto de carregando enquanto busca pessoas", async () => {
    mockPersonsHook.listPersons.mockImplementation(
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
