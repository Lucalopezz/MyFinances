import { UseFormSetError } from "react-hook-form";
import { RegisterFormData } from "@/schemas/auth/register.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useState } from "react";
import toast from "react-hot-toast";
import { createUserAction } from "@/actions/user/create-user-action";
import { useBackendConnection } from "@/providers/backend-connection-provider";

type RegisterDataWithoutConfirm = Omit<RegisterFormData, "confirmPassword">;

/** Coordena disponibilidade, resultado público e erros por campo do cadastro. */
export function useCreateUser(setFieldError?: UseFormSetError<RegisterFormData>) {
  const [error, setError] = useState("");
  const router = useRouter();
  // O cadastro usa o mesmo estado de conexão do restante do aplicativo.
  const { ensureReady } = useBackendConnection();

  const mutation = useMutation({
    mutationFn: async (data: RegisterDataWithoutConfirm) => {
      setError("");
      // O ping é compartilhado; a criação só é enviada uma vez, sem retry.
      if (!await ensureReady()) {
        return {
          ok: false as const,
          message: "Não foi possível criar sua conta agora. Tente novamente.",
        };
      }
      return createUserAction(data);
    },
    onSuccess: async (result) => {
      // Rejeições esperadas são dados, não exceções da Server Action. Só o
      // resultado positivo permite navegar; os demais mantêm o preenchimento.
      if (!result.ok) {
        setError(result.message);
        if ("fieldErrors" in result && result.fieldErrors) {
          for (const field of ["name", "email", "password"] as const) {
            const message = result.fieldErrors[field];
            if (message) setFieldError?.(field, { type: "server", message });
          }
        }
        return;
      }
      // Navegação só ocorre depois de confirmar a criação, sem assumir que uma
      // requisição de saúde bem-sucedida significa que a conta já foi cadastrada.
      await router.push("/login");
      router.refresh();
      toast.success("Usuário criado com sucesso! Faça o login agora");
    },
    onError: () => {
      // Falhas fora do contrato (rede/framework) nunca exibem error.message.
      setError("Não foi possível criar sua conta agora. Tente novamente.");
    },
  });

  return {
    createUser: mutation.mutate,
    isLoading: mutation.isPending,
    error,
  };
}
