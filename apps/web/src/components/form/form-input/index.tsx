"use client";

import { useId, type ComponentProps } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps extends Omit<ComponentProps<"input">, "id" | "type"> {
  label: string;
  type?: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

// Aceita register nos consumidores existentes e value/onChange/ref do Controller.
export const FormInput = ({
  label,
  type = "text",
  error,
  register,
  ...inputProps
}: FormInputProps) => {
  // O ID por instância liga rótulo e erro ao campo sem colidir entre formulários.
  const id = useId();
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#1F2937] dark:text-gray-300"
      >
        {label}
      </label>
      <input
        {...register}
        {...inputProps}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        type={type}
        className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
      />
      {error && (
        <p id={`${id}-error`} className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
};
