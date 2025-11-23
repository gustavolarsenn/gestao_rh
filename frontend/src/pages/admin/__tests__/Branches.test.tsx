import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Branch from "@/pages/admin/Branches";
import { vi, describe, test, expect, beforeEach } from "vitest";

// ==========================
// MOCKS DOS HOOKS
// ==========================
const listBranchesMock = vi.fn();
const createBranchMock = vi.fn();
const updateBranchMock = vi.fn();
const deleteBranchMock = vi.fn();

const listStatesMock = vi.fn();
const listCitiesMock = vi.fn();

vi.mock("@/hooks/branch/useBranches", () => ({
  useBranches: () => ({
    createBranch: createBranchMock,
    listBranches: listBranchesMock,
    updateBranch: updateBranchMock,
    deleteBranch: deleteBranchMock,
    loading: false,
    error: "",
  }),
}));

vi.mock("@/hooks/geo/useStates", () => ({
  useStates: () => ({
    listStates: listStatesMock,
  }),
}));

vi.mock("@/hooks/geo/useCities", () => ({
  useCities: () => ({
    listCities: listCitiesMock,
  }),
}));

// mock do sidebar para não quebrar
vi.mock("@/components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

// mock do modal
vi.mock("@/components/modals/BaseModal", () => ({
  BaseModal: ({ open, children }: any) =>
    open ? <div data-testid="modal">{children}</div> : null,
}));

// ==========================
// TESTES
// ==========================
describe("Branch Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listStatesMock.mockResolvedValue([
      { id: "st1", name: "São Paulo" },
      { id: "st2", name: "Pará" },
    ]);

    listCitiesMock.mockResolvedValue([
      { id: "c1", stateId: "st1", name: "Campinas" },
      { id: "c2", stateId: "st2", name: "Belém" },
    ]);
  });

  test("renderiza o título corretamente", async () => {
    listBranchesMock.mockResolvedValue({ data: [], total: 0 });

    render(<Branch />);

    expect(await screen.findByText("Filiais")).toBeInTheDocument();
  });

  test("exibe tabela com filiais", async () => {
    listBranchesMock.mockResolvedValue({
      data: [
        { id: "b1", name: "Filial A", cnpj: "123456" },
        { id: "b2", name: "Filial B", cnpj: "789000" },
      ],
      total: 2,
    });

    render(<Branch />);

    expect(await screen.findByText("Filial A")).toBeInTheDocument();
    expect(screen.getByText("Filial B")).toBeInTheDocument();
  });

  test("exibe mensagem quando não há filiais", async () => {
    listBranchesMock.mockResolvedValue({
      data: [],
      total: 0,
    });

    render(<Branch />);

    expect(
      await screen.findByText("Nenhuma filial encontrada.")
    ).toBeInTheDocument();
  });

  test("abre o modal de criação ao clicar em 'Criar Filial'", async () => {
    listBranchesMock.mockResolvedValue({ data: [], total: 0 });

    render(<Branch />);

    const btn = await screen.findByText("Criar Filial");
    fireEvent.click(btn);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  test("abre o modal de edição ao clicar em uma linha da tabela", async () => {
    listBranchesMock.mockResolvedValue({
      data: [{ id: "b1", name: "Filial Teste", cnpj: "111222" }],
      total: 1,
    });

    render(<Branch />);

    const row = await screen.findByText("Filial Teste");
    fireEvent.click(row);

    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });
});
