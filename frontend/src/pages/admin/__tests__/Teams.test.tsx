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
      },
      {
        id: "team2",
        name: "Operações Barcarena",
        description: "",
        parentTeamId: "team1",
      },
    ];

    const distinctTeams = [
      { id: "team1", name: "Operações Santarém", description: "", parentTeamId: null },
      { id: "team2", name: "Operações Barcarena", description: "", parentTeamId: "team1" },
      { id: "team3", name: "Backoffice", description: "", parentTeamId: null },
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
      }),
      updateTeam: vi.fn().mockResolvedValue({
        id: "team1",
        name: "Operações Santarém Editado",
        description: "Editado",
        parentTeamId: "team3",
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

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome do Time");
    const modalNameInput = nomeInputs[nomeInputs.length - 1];

    const comboBoxes = within(dialog).getAllByRole("combobox"); // Time Pai
    expect(modalNameInput).toBeInTheDocument();
    expect(comboBoxes.length).toBeGreaterThanOrEqual(1);
  });

  it("cria time ao preencher e clicar em 'Criar'", async () => {
    renderWithRouter();

    const openBtn = screen.getByText("Criar Time");
    fireEvent.click(openBtn);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome do Time");
    const modalNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;
    fireEvent.change(modalNameInput, {
      target: { value: "Novo Time" },
    });

    const descInput = within(dialog).getByLabelText(
      "Descrição"
    ) as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: "Descrição do novo time" } });

    const comboBoxes = within(dialog).getAllByRole("combobox");
    const parentSelect = comboBoxes[0];

    fireEvent.mouseDown(parentSelect);
    const optTeam1 = await screen.findByRole("option", {
      name: "Operações Santarém",
    });
    fireEvent.click(optTeam1);

    const createBtn = within(dialog).getByText("Criar");
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
    const team1Row = rows[1];

    fireEvent.click(team1Row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome do Time");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    expect(editNameInput.value).toBe("Operações Santarém");

    const membersTitle = within(dialog).getByText("Membros do Time");
    expect(membersTitle).toBeInTheDocument();
  });

  it("salva alterações ao clicar em 'Salvar'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const team1Row = rows[1];

    fireEvent.click(team1Row);

    const dialog = await screen.findByRole("dialog");

    const nomeInputs = within(dialog).getAllByLabelText("Nome do Time");
    const editNameInput = nomeInputs[nomeInputs.length - 1] as HTMLInputElement;

    fireEvent.change(editNameInput, {
      target: { value: "Operações Santarém Editado" },
    });

    const descInput = within(dialog).getByLabelText(
      "Descrição"
    ) as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: "Editado" } });

    const comboBoxes = within(dialog).getAllByRole("combobox");
    // No modal de edição: [0] Time Pai, [1] Status
    const parentSelect = comboBoxes[0];

    fireEvent.mouseDown(parentSelect);
    const optBackoffice = await screen.findByRole("option", {
      name: "Backoffice",
    });
    fireEvent.click(optBackoffice);

    const saveBtn = within(dialog).getByText("Salvar");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockTeamsHook.updateTeam).toHaveBeenCalledWith("team1", {
        name: "Operações Santarém Editado",
        description: "Editado",
        parentTeamId: "team3",
      });
    });
  });

  it("exclui time ao clicar em 'Excluir'", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const team1Row = rows[1];

    fireEvent.click(team1Row);

    const dialog = await screen.findByRole("dialog");
    const deleteBtn = within(dialog).getByText("Excluir");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockTeamsHook.deleteTeam).toHaveBeenCalledWith("team1");
    });

    expect(mockTeamsHook.listTeams).toHaveBeenCalled();
  });

  // ===================== MEMBROS / TORNAR LÍDER =====================
  it("mostra membros e permite tornar líder", async () => {
    renderWithRouter();

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");
    const team1Row = rows[1];

    fireEvent.click(team1Row);

    const dialog = await screen.findByRole("dialog");

    const memberRow = await screen.findByText("João da Silva");
    expect(memberRow).toBeInTheDocument();

    const tornarLiderBtn = within(dialog).getByText("Tornar Líder");
    fireEvent.click(tornarLiderBtn);

    await waitFor(() => {
      expect(mockTeamMembersHook.updateTeamMember).toHaveBeenCalledWith("m1", {
        isLeader: true,
      });
      expect(mockTeamMembersHook.listTeamMembers).toHaveBeenCalledWith("team1");
    });
  });

  // ===================== PAGINAÇÃO =====================
  it("avança para a próxima página", async () => {
    mockTeamsHook.listTeams.mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({
        id: `teamX-${i}`,
        name: `Time ${i}`,
        description: "",
        parentTeamId: null,
      })),
      total: 25,
    });

    renderWithRouter();

    const nextBtn = await screen.findByRole("button", { name: "Próxima" });
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
