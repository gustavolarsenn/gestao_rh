import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import CompanyPage from "@/pages/super-admin/Company"; // ajuste se o caminho for outro

// ====== MOCKS GERAIS ======

vi.mock("@/components/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock("@/components/modals/BaseModal", () => ({
  BaseModal: ({ open, title, description, children, footer }: any) =>
    open ? (
      <div data-testid="base-modal">
        {title && <h2>{title}</h2>}
        {description && <p>{description}</p>}
        <div>{children}</div>
        {footer}
      </div>
    ) : null,
}));

// ====== MOCKS DOS HOOKS ======

const mockListCompanies = vi.fn();
const mockCreateCompany = vi.fn();
const mockUpdateCompany = vi.fn();
const mockDeleteCompany = vi.fn();

vi.mock("@/hooks/company/useCompanies", () => ({
  useCompanies: () => ({
    listCompanies: mockListCompanies,
    createCompany: mockCreateCompany,
    updateCompany: mockUpdateCompany,
    deleteCompany: mockDeleteCompany,
  }),
}));

const mockListStates = vi.fn();
vi.mock("@/hooks/geo/useStates", () => ({
  useStates: () => ({
    listStates: mockListStates,
  }),
}));

const mockListCities = vi.fn();
vi.mock("@/hooks/geo/useCities", () => ({
  useCities: () => ({
    listCities: mockListCities,
  }),
}));

// ====== MOCKS DE DADOS ======

const mockStates = [
  { id: "s1", name: "Pará" },
  { id: "s2", name: "Santa Catarina" },
];

const mockCities = [
  { id: "c1", name: "Belém", stateId: "s1" },
  { id: "c2", name: "Santarém", stateId: "s1" },
  { id: "c3", name: "Joinville", stateId: "s2" },
];

const mockCompanies = [
  {
    id: "comp1",
    name: "Empresa Alpha",
    cnpj: "12345678000199",
    zipCode: "66000000",
    address: "Rua A",
    addressNumber: "100",
    cityId: "c1",
  },
  {
    id: "comp2",
    name: "Empresa Beta",
    cnpj: "98765432000111",
    zipCode: "88000000",
    address: "Rua B",
    addressNumber: "200",
    cityId: "c3",
  },
];

// helper
const renderPage = () =>
  render(
    <MemoryRouter>
      <CompanyPage />
    </MemoryRouter>
  );

describe("CompanyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockListStates.mockResolvedValue(mockStates);
    mockListCities.mockResolvedValue(mockCities);

    mockListCompanies.mockResolvedValue({
      data: mockCompanies,
      total: mockCompanies.length,
    });
    mockCreateCompany.mockResolvedValue({});
    mockUpdateCompany.mockResolvedValue({});
    mockDeleteCompany.mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza a lista inicial de empresas", async () => {
    renderPage();

    expect(await screen.findByText("Empresas")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    expect(await screen.findByText("Empresa Alpha")).toBeInTheDocument();
    expect(screen.getByText("Empresa Beta")).toBeInTheDocument();
  });

  it("aplica filtro por nome e recarrega empresas", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const inputNome = await screen.findByLabelText("Nome");
    fireEvent.change(inputNome, { target: { value: "Alpha" } });

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    const lastCallArg = mockListCompanies.mock.calls.at(-1)?.[0] as string;

    expect(lastCallArg).toContain("page=1");
    expect(lastCallArg).toContain("name=Alpha");
  });

  it("abre o modal de criação e cria uma nova empresa", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const addButton = await screen.findByRole("button", {
      name: "Adicionar Empresa",
    });

    fireEvent.click(addButton);

    const modal = await screen.findByTestId("base-modal");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Cadastrar Empresa")).toBeInTheDocument();

    const modalUtils = within(modal);

    fireEvent.change(modalUtils.getByLabelText("Nome"), {
      target: { value: "Nova Empresa" },
    });

    fireEvent.change(modalUtils.getByLabelText("CNPJ"), {
      target: { value: "11222333000144" },
    });

    fireEvent.change(modalUtils.getByLabelText("CEP"), {
      target: { value: "12345678" },
    });

    fireEvent.change(modalUtils.getByLabelText("Endereço"), {
      target: { value: "Rua Nova" },
    });

    fireEvent.change(modalUtils.getByLabelText("Número"), {
      target: { value: "999" },
    });

    // não mexemos com Estado/Cidade aqui, por causa da acessibilidade do Select do MUI

    const criarButton = modalUtils.getByRole("button", { name: "Criar" });
    fireEvent.click(criarButton);

    await waitFor(() => {
      expect(mockCreateCompany.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    expect(mockCreateCompany).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Nova Empresa",
        cnpj: "11222333000144",
        zipCode: "12345678",
        address: "Rua Nova",
        addressNumber: "999",
      })
    );

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("abre modal de edição ao clicar em uma linha da tabela e salva alteração", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockListCompanies.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const rowCell = await screen.findByText("Empresa Alpha");
    fireEvent.click(rowCell);

    const modal = await screen.findByTestId("base-modal");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Editar Empresa")).toBeInTheDocument();

    const modalUtils = within(modal);

    const inputNome = modalUtils.getByLabelText("Nome");
    fireEvent.change(inputNome, {
      target: { value: "Empresa Alpha Editada" },
    });

    const salvarButton = modalUtils.getByRole("button", { name: "Salvar" });
    fireEvent.click(salvarButton);

    await waitFor(() => {
      expect(mockUpdateCompany.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const updateArgs = mockUpdateCompany.mock.calls[0];
    expect(updateArgs[0]).toBe("comp1");
  });
});
