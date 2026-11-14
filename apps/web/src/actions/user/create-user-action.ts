"use server";

import { createUser } from "@/actions/user/user";
import { createRequestError } from "@/lib/api-error";
import { CreateAccountSchema } from "@/schemas/auth/register.schema";

type AccountFields = { name: string; email: string; password: string };
type CreateUserResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Partial<AccountFields> };

/** Retorna falhas públicas como dados serializáveis, preservando o texto em produção. */
export async function createUserAction(data: AccountFields): Promise<CreateUserResult> {
  const parsed = CreateAccountSchema.safeParse(data);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "Confira os campos indicados para criar sua conta.",
      fieldErrors: {
        name: fields.name?.[0],
        email: fields.email?.[0],
        password: fields.password?.[0],
      },
    };
  }

  try {
    const created = await createUser(parsed.data);
    if (!created) throw new Error("Resposta de cadastro ausente");
    // O browser precisa apenas da confirmação; dados do usuário ficam no servidor.
    return { ok: true };
  } catch (error) {
    const publicError = createRequestError(error, {
      context: "POST /user",
      fallback: "Não foi possível criar sua conta agora. Tente novamente.",
    });
    return { ok: false, message: publicError.message };
  }
}
