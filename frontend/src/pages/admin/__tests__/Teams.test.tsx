import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import TeamsPage from "@/pages/admin/Teams";
import { useTeams } from "@/hooks/team/useTeams";
import { useTeamMembers } from "@/hooks/team-member/useTeamMembers";

// mock do useAuth pro Sidebar
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock("@/hooks/team/useTeams");
vi.mock("@/hooks/team-member/useTeamMembers");

const renderWithRouter = () =>
  render(
    <MemoryRouter>
      <TeamsPage />
    </MemoryRouter>
  );

describe("TeamsPage", () => {
  let mockTeamsHook: any;
  let mockTeamMembersHook: any;

  beforeEach(() => {
    const teams = [
      {
        id: "team1",
        name: "Operações Santarém",
        description: "Time de operações no porto de Santarém",
        parentTeamId: null,
        companyId: "company-1",
      },
      {
        id: "team2",
        name: "Operações Barcarena",
        description: "",
        parentTeamId: "team1",
        companyId: "company-1",
      },
    ];

    const distinctTeams = [
      {
        id: "team1",
        name: "Operações Santarém",
        description: "",
        parentTeamId: null,
        companyId: "company-1",
      },
      {
        id: "team2",
        name: "Operações Barcarena",
        description: "",
        parentTeamId: "team1",
        companyId: "company-1",
      },
      {
        id: "team3",
        name: "Backoffice",
        description: "",
        parentTeamId: null,
        companyId: "company-1",
      },
    ];

    const members = [
      {
        id: "m1",
        teamId: "team1",
        isLeader: false,
        startDate: "2024-01-01",
        endDate: null,
        employee: { person: { name: "João da Silva" } },
      },
      {
        id: "m2",
        teamId: "team1",
        isLeader: true,
        startDate: "2023-01-01",
        endDate: null,
        employee: { person: { name: "Maria Souza" } },
      },
      {
        id: "m3",
        teamId: "team2",
        isLeader: false,
        startDate: "2023-05-10",
        endDate: "2023-12-31", // inativo
        employee: { person: { name: "Carlos Lima" } },
      },
    ];

    mockTeamsHook = {
      listTeams: vi.fn().mockResolvedValue({
        data: teams,
        total: teams.length,
      }),
      listDistinctTeams: vi.fn().mockResolvedValue(distinctTeams),
      createTeam: vi.fn().mockResolvedValue({
        id: "team-new",
        name: "Novo Time",
        description: "Descrição",
        parentTeamId: "team1",
        companyId: "company-1",
      }),
      updateTeam: vi.fn().mockResolvedValue({
        id: "team1",
        name: "Operações Santarém Editado",
        description: "Editado",
        parentTeamId: "team3",
        companyId: "company-1",
      }),
      deleteTeam: vi.fn().mockResolvedValue({}),

      loading: false,
      error: null,
    };

    (useTeams as any).mockReturnValue(mockTeamsHook);

    mockTeamMembersHook = {
      listTeamMembers: vi.fn().mockResolvedValue(members),
      updateTeamMember: vi.fn().mockResolvedValue({}),
    };

    (useTeamMembers as any).mockReturnValue(mockTeamMembersHook);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ===================== LOAD INICIAL =====================
  it("carrega a lista inicial de times", async () => {
    renderWithRouter();

    expect(mockTeamsHook.listTeams).toHaveBeenCalled();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const team1Row = rows[1]; // primeira linha de dados
    const team2Row = rows[2]; // segunda linha de dados

    // time 1
    expect(
      within(team1Row).getByText("Operações Santarém")
    ).toBeInTheDocument();
    expect(
      within(team1Row).getByText("Time de operações no porto de Santarém")
    ).toBeInTheDocument();
    expect(within(team1Row).getByText("—")).toBeInTheDocument(); // sem time pai

    // time 2
    expect(
      within(team2Row).getByText("Operações Barcarena")
    ).toBeInTheDocument();
    expect(within(team2Row).getByText("—")).toBeInTheDocument(); // descrição vazia
    expect(
      within(team2Row).getByText("Operações Santarém")
    ).toBeInTheDocument(); // time pai
  });

  // ===================== FILTROS =====================
  it("filtra por nome corretamente", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Santarém" } });

    await waitFor(() => {
      expect(mockTeamsHook.listTeams).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: "Santarém",
        parentTeamId: undefined,
      });
    });
  });

  it("filtra por time pai corretamente", async () => {
    renderWithRouter();

    // No painel de filtros, só existe 1 combobox: "Time Pai"
    const comboBoxes = await screen.findAllByRole("combobox");
    const parentFilter = comboBoxes[0];

    fireEvent.mouseDown(parentFilter);

    const optTeam1 = await screen.findByRole("option", {
      name: "Operações Santarém",
    });
    fireEvent.click(optTeam1);

    await waitFor(() => {
      expect(mockTeamsHook.listTeams).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        parentTeamId: "team1",
      });
    });
  });

  it("limpa filtros ao clicar em 'Limpar'", async () => {
    renderWithRouter();

    const nameInput = screen.getByLabelText("Nome") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "X" } });

    const comboBoxes = await screen.findAllByRole("combobox");
    const parentFilter = comboBoxes[0];
    fireEvent.mouseDown(parentFilter);

    const optTeam1 = await screen.findByRole("option", {
      name: "Operações Santarém",
    });
    fireEvent.click(optTeam1);

    const clearBtn = screen.getByText("Limpar");
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(mockTeamsHook.listTeams).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        parentTeamId: undefined,
      });
    });
  });

  // ===================== CREATE MODAL =====================
  it("abre modal de criação ao clicar em 'Criar Time'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Time");
    fireEvent.click(openBtn);

    // campo "Nome do Time" no modal (pega o último)
    const nomeInputs = await screen.findAllByLabelText(/Nome do Time/i);
    const modalNameInput = nomeInputs[nomeInputs.length - 1];

    const comboBoxes = await screen.findAllByRole("combobox"); // inclui filtro + modal

    expect(modalNameInput).toBeInTheDocument();
    expect(comboBoxes.length).toBeGreaterThanOrEqual(1);
  });

  it("cria time ao preencher e clicar em 'Criar'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Time");
    fireEvent.click(openBtn);

    // Nome no modal (último "Nome do Time" na tela)
    const nomeInputs = await screen.findAllByLabelText(/Nome do Time/i);
    const modalNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;
    fireEvent.change(modalNameInput, {
      target: { value: "Novo Time" },
    });

    // campo Descrição (o de dentro do modal, último da tela)
    const descInputs = await screen.findAllByLabelText(/Descrição/i);
    const descInput = descInputs[descInputs.length - 1] as HTMLInputElement;
    fireEvent.change(descInput, {
      target: { value: "Descrição do novo time" },
    });

    // combobox: [0] filtro "Time Pai" da página, [1] "Time Pai" do modal
    const comboBoxes = await screen.findAllByRole("combobox");
    const parentSelect = comboBoxes[comboBoxes.length - 1];

    fireEvent.mouseDown(parentSelect);
    const optTeam1 = await screen.findByRole("option", {
      name: "Operações Santarém",
    });
    fireEvent.click(optTeam1);

    const createBtn = screen.getByText("Criar");
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockTeamsHook.createTeam).toHaveBeenCalledWith({
        name: "Novo Time",
        description: "Descrição do novo time",
        parentTeamId: "team1",
      });
    });

    expect(mockTeamsHook.listTeams).toHaveBeenCalled();
  });

  // ===================== EDIT MODAL =====================
  it("abre modal de edição ao clicar em uma linha", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    const team1Row =
      rows.find((row) =>
        within(row).queryByText("Operações Santarém")
      ) ?? rows[1];

    fireEvent.click(team1Row);

    // Depois de abrir o modal, pega o último "Nome do Time" (campo do modal)
    const nomeInputs = await screen.findAllByLabelText(/Nome do Time/i);
    const editNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    expect(editNameInput.value).toBe("Operações Santarém");

    const membersTitle = await screen.findByText("Membros do Time");
    expect(membersTitle).toBeInTheDocument();
  });

  it("salva alterações ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    const team1Row =
      rows.find((row) =>
        within(row).queryByText("Operações Santarém")
      ) ?? rows[1];

    fireEvent.click(team1Row);

    // Nome no modal
    const nomeInputs = await screen.findAllByLabelText(/Nome do Time/i);
    const editNameInput =
      nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    fireEvent.change(editNameInput, {
      target: { value: "Operações Santarém Editado" },
    });

    // Descrição no modal (último "Descrição")
    const descInputs = await screen.findAllByLabelText(/Descrição/i);
    const descInput = descInputs[descInputs.length - 1] as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: "Editado" } });

    const saveBtn = screen.getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockTeamsHook.updateTeam).toHaveBeenCalledWith(
        "company-1",
        "team1",
        expect.objectContaining({
          name: "Operações Santarém Editado",
          description: "Editado",
        })
      );
    });
  });

  it("exclui time ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    const team1Row =
      rows.find((row) =>
        within(row).queryByText("Operações Santarém")
      ) ?? rows[1];

    fireEvent.click(team1Row);

    const deleteBtn = await screen.findByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockTeamsHook.deleteTeam).toHaveBeenCalledWith(
        "company-1",
        "team1"
      );
    });

    expect(mockTeamsHook.listTeams).toHaveBeenCalled();
  });

  // ===================== MEMBROS / TORNAR LÍDER =====================
  it("mostra membros e permite tornar líder", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    const team1Row =
      rows.find((row) =>
        within(row).queryByText("Operações Santarém")
      ) ?? rows[1];

    fireEvent.click(team1Row);

    const memberRow = await screen.findByText("João da Silva");
    expect(memberRow).toBeInTheDocument();

    const tornarLiderBtn = await screen.findByText("Tornar Líder");
    fireEvent.click(tornarLiderBtn);

    await waitFor(() => {
      expect(mockTeamMembersHook.updateTeamMember).toHaveBeenCalledWith("m1", {
        isLeader: true,
      });
      // depois de promover, o componente chama listTeamMembers() sem args
      expect(mockTeamMembersHook.listTeamMembers).toHaveBeenCalledTimes(2);
    });
  });

  // ===================== PAGINAÇÃO =====================
  it("avança para a próxima página", async () => {
    // Garante que existem pelo menos 2 páginas (25 > 10)
    mockTeamsHook.listTeams.mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `team-${i}`,
        name: `Time ${i}`,
        parentTeamId: undefined,
        companyId: "company-1",
      })),
      total: 25,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });

    // Espera a primeira carga (page 1) e o botão habilitar
    await waitFor(() => {
      expect(mockTeamsHook.listTeams).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        name: undefined,
        parentTeamId: undefined,
      });
      expect(nextBtn).not.toBeDisabled();
    });

    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockTeamsHook.listTeams).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        name: undefined,
        parentTeamId: undefined,
      });
    });
  });

  // ===================== LOADING =====================
  it("mostra 'Carregando...' enquanto busca times", async () => {
    mockTeamsHook.listTeams.mockImplementation(
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
