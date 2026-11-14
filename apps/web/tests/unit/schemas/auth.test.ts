import { expect, it } from "vitest";
import { RegisterSchema } from "@/schemas/auth/register.schema";
import { LoginSchema } from "@/schemas/auth/login.schema";
const valid = { name: "Pessoa", email: "user@example.test", password: "12345678", confirmPassword: "12345678" };
it.each(["ab", " ", "a".repeat(51)])("cadastro rejeita nome fora do contrato: %s", (name) => {
  expect(RegisterSchema.safeParse({ ...valid, name }).success).toBe(false);
});
it.each([7, 129])("cadastro e login rejeitam senha de %s caracteres", (size) => {
  const password = "a".repeat(size);
  expect(RegisterSchema.safeParse({ ...valid, password, confirmPassword: password }).success).toBe(false);
  expect(LoginSchema.safeParse({ email: valid.email, password }).success).toBe(false);
});
it.each([8, 128])("aceita limite de senha %s preservando espaços da credencial", (size) => {
  const password = " " + "a".repeat(size - 2) + " ";
  expect(LoginSchema.parse({ email: " user@example.test ", password })).toEqual({ email: valid.email, password });
  expect(RegisterSchema.parse({ ...valid, name: " Pessoa ", password, confirmPassword: password }).name).toBe("Pessoa");
});
it("confirmação diferente indica o campo correto", () => {
  const result = RegisterSchema.safeParse({ ...valid, confirmPassword: "outrasenha" });
  expect(result.success).toBe(false);
  if (!result.success) expect(result.error.flatten().fieldErrors.confirmPassword).toEqual(["As senhas não coincidem"]);
});
