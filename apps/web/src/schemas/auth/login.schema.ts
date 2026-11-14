import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(128, "A senha deve ter no máximo 128 caracteres"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
