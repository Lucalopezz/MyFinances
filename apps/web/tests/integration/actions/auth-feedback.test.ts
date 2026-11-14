import { beforeEach, expect, it, vi } from "vitest";
import { createUserAction } from "@/actions/user/create-user-action";
import { loginAction } from "@/actions/login/login-action";
const boundary = vi.hoisted(() => ({ fetch: vi.fn(), set: vi.fn() }));
vi.mock("@/lib/backend-fetch", () => ({ backendFetch: boundary.fetch }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: boundary.set }) }));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
beforeEach(() => {
  process.env.BACKEND_URL = "http://backend.test";
  boundary.fetch.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
const valid = { name: "Pessoa", email: "user@example.test", password: "password123" };
it("cadastro retorna conflito como dados que atravessam a Server Action", async () => {
  boundary.fetch.mockResolvedValue(Response.json({ message: "E-mail já cadastrado" }, { status: 409 }));
  await expect(createUserAction(valid)).resolves.toMatchObject({ ok: false, message: "E-mail já cadastrado" });
});
it("cadastro valida os limites da API antes de enviar", async () => {
  await expect(createUserAction({ ...valid, name: "ab" })).resolves.toMatchObject({ ok: false, fieldErrors: { name: expect.any(String) } });
  expect(boundary.fetch).not.toHaveBeenCalled();
});
it("cadastro oculta falhas inesperadas sem rejeitar a action", async () => {
  boundary.fetch.mockRejectedValue(new Error("segredo do banco"));
  const result = await createUserAction(valid);
  expect(result).toMatchObject({ ok: false, message: expect.stringContaining("Tente novamente") });
  expect(JSON.stringify(result)).not.toContain("segredo");
});
it("login com 401 sem JSON orienta sobre credenciais", async () => {
  boundary.fetch.mockResolvedValue(new Response(null, { status: 401 }));
  expect(await loginAction(valid)).toEqual({ ok: false, message: "E-mail ou senha inválidos. Confira os dados e tente novamente." });
});
it("login com sucesso malformado retorna orientação segura", async () => {
  boundary.fetch.mockResolvedValue(new Response("<html>gateway</html>"));
  await expect(loginAction(valid)).resolves.toMatchObject({ ok: false });
  expect(boundary.set).not.toHaveBeenCalled();
});

it("cadastro 5xx oculta o corpo mesmo quando parece mensagem de negócio", async () => {
  boundary.fetch.mockResolvedValue(Response.json({ message: "detalhe privado de infraestrutura" }, { status: 500 }));
  expect(await createUserAction(valid)).toEqual({ ok: false, message: "Não foi possível criar sua conta agora. Tente novamente." });
});
it("cadastro confirma sucesso sem transferir dados da conta", async () => {
  boundary.fetch.mockResolvedValue(Response.json({ message: "criado", user: { id: "fixture" } }));
  expect(await createUserAction(valid)).toEqual({ ok: true });
});
