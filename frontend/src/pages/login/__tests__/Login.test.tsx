import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, vi, expect, beforeEach } from "vitest";
import LoginPage from "../Login";
import { BrowserRouter } from "react-router-dom";

// Mock do useAuth()
const mockLogin = vi.fn();
vi.mock("@/auth/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock do useNavigate()
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderPage = () =>
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it("renderiza campos de email e senha", () => {
    renderPage();

    expect(screen.getByPlaceholderText("seuemail@empresa.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("envia email e senha corretamente", async () => {
    renderPage();

    fireEvent.change(screen.getByPlaceholderText("seuemail@empresa.com"), {
      target: { value: "teste@empresa.com" },
    });
        fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("teste@empresa.com", "123456");
    });
  });

  it("redireciona após login bem-sucedido", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("seuemail@empresa.com"), {
    target: { value: "a@a.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/companies");
    });
  });

  it("exibe mensagem de erro quando login falha", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: "Credenciais inválidas" } },
    });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText("seuemail@empresa.com"), {
    target: { value: "errado@a.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
    target: { value: "errado" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText(/Credenciais inválidas/i)).toBeInTheDocument();
  });
});
