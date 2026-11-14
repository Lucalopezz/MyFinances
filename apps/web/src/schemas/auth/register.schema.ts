import { z } from "zod";

// Os limites repetem o contrato da API; senha não recebe trim, pois espaços
// podem fazer parte da credencial. A action reaproveita as mesmas regras.
export const CreateAccountSchema = z.object({
  name: z.string().trim()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  email: z.string().trim().email("Informe um e-mail válido"),
  password: z.string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres"),
});

export const RegisterSchema = CreateAccountSchema.extend({
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
export type RegisterFormData = z.infer<typeof RegisterSchema>;
