// @vitest-environment jsdom
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormInput } from "@/components/form/form-input";
import { PasswordInput } from "@/components/form/password-input";

const registration = (name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
});

describe("Rótulos e mensagens dos formulários públicos", () => {
  it("associa o rótulo e a mensagem de erro ao campo de e-mail", () => {
    render(
      <FormInput
        label="E-mail"
        register={registration("email")}
        error="E-mail inválido"
      />,
    );
    const field = screen.getByRole("textbox", { name: "E-mail" });
    expect(field).toHaveAccessibleDescription("E-mail inválido");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });
  it("permite localizar a senha pelo rótulo e revelar ou ocultar sem enviar o formulário", async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <PasswordInput label="Senha" register={registration("password")} />
      </form>,
    );
    const field = screen.getByLabelText("Senha", { exact: true });
    expect(field).toHaveAttribute("type", "password");
    await userEvent.click(
      screen.getByRole("button", { name: "Mostrar senha" }),
    );
    expect(field).toHaveAttribute("type", "text");
    await userEvent.click(
      screen.getByRole("button", { name: "Ocultar senha" }),
    );
    expect(field).toHaveAttribute("type", "password");
    expect(submit).not.toHaveBeenCalled();
  });
  it("gera identidades distintas para campos de senha e confirmação", () => {
    render(
      <>
        <PasswordInput label="Senha" register={registration("password")} />
        <PasswordInput
          label="Confirme sua senha"
          register={registration("confirmPassword")}
        />
      </>,
    );
    expect(screen.getByLabelText("Senha", { exact: true }).id).not.toBe(
      screen.getByLabelText("Confirme sua senha").id,
    );
  });
});

/** O reset verifica que o valor exibido vem do estado, inclusive após edição. */
function ControlledFields() {
  const [name, setName] = useState("Pessoa");
  const [password, setPassword] = useState("senha123");
  return <>
    <FormInput label="Nome controlado" value={name} onChange={(event) => setName(event.target.value)} />
    <PasswordInput label="Senha controlada" value={password} onChange={(event) => setPassword(event.target.value)} />
    <button onClick={() => { setName(""); setPassword(""); }}>Limpar campos</button>
  </>;
}
it("campos aceitam valor controlado, edição e reset pelo estado", async () => {
  render(<ControlledFields />);
  const name = screen.getByLabelText("Nome controlado");
  const password = screen.getByLabelText("Senha controlada");
  expect(name).toHaveValue("Pessoa");
  expect(password).toHaveValue("senha123");
  await userEvent.type(name, " Silva");
  await userEvent.type(password, "4");
  expect(name).toHaveValue("Pessoa Silva");
  expect(password).toHaveValue("senha1234");
  await userEvent.click(screen.getByRole("button", { name: "Limpar campos" }));
  expect(name).toHaveValue("");
  expect(password).toHaveValue("");
});
