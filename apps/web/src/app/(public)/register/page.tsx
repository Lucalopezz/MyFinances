"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormInput } from "@/components/form/form-input";
import { PasswordInput } from "@/components/form/password-input";
import { Button } from "@/components/ui/button";
import {
  RegisterFormData,
  RegisterSchema,
} from "@/schemas/auth/register.schema";
import { useCreateUser } from "@/hooks/queries/useCreateUser";
import { Loader } from "lucide-react";

export default function RegisterPage() {
  const {
    control,
    handleSubmit,
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    // Controller mantém value/onChange no React Hook Form, sem estado duplicado.
    // O resolver Zod atualiza as mensagens a cada edição e bloqueia o envio inválido.
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });
  const { createUser, isLoading, error } = useCreateUser(setError);

  const onSubmit = (formData: RegisterFormData) => {
    const { confirmPassword, ...dataToSend } = formData;

    createUser(dataToSend);
  };

  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-[#1F2937]">
        <h2 className="mb-6 text-2xl font-bold text-[#1F2937] dark:text-white">
          Criar conta
        </h2>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <FormInput
                label="Nome"
                {...field}
                error={fieldState.error?.message}
                autoComplete="name"
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <FormInput
                label="E-mail"
                type="email"
                {...field}
                error={fieldState.error?.message}
                autoComplete="email"
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Senha"
                {...field}
                error={fieldState.error?.message}
                autoComplete="new-password"
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordInput
                label="Confirme sua senha"
                {...field}
                error={fieldState.error?.message}
                autoComplete="new-password"
              />
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white"
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              "Criar conta"
            )}
          </Button>
          {/* Rejeições como e-mail duplicado precisam permanecer visíveis para correção. */}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </form>
        <p className="mt-4 text-sm text-[#6B7280] dark:text-gray-400">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#3B82F6] hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
