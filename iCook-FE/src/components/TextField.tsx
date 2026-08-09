"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/app/icons";

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
  value,
  onChange,
}: TextFieldProps) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  const controlled =
    value !== undefined
      ? {
          value,
          onChange: (e: { target: { value: string } }) =>
            onChange?.(e.target.value),
        }
      : {};

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={name} className="text-base font-semibold text-muted">
        {label}
      </label>
      <div className={isPassword ? "relative" : undefined}>
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={isPassword ? "field pr-11" : "field"}
          {...controlled}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? (
              <EyeOffIcon className="size-5" aria-hidden />
            ) : (
              <EyeIcon className="size-5" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
