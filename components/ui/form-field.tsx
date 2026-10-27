"use client";

import * as React from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function FieldError({
  id,
  message,
}: {
  id?: string;
  message?: string;
}) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        "min-h-5 text-sm text-destructive",
        !message && "invisible",
      )}
    >
      {message || "\u00a0"}
    </p>
  );
}

export function FormStatus({
  message,
  tone = "error",
}: {
  message?: string | null;
  tone?: "error" | "success";
}) {
  if (!message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-[var(--radius-md)] px-3 py-2 text-sm",
        tone === "success"
          ? "bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success-foreground)]"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {message}
    </p>
  );
}

/** Label that lifts on focus / when the field has a value. */
export function FloatingLabelField({
  id,
  label,
  error,
  className,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  autoComplete,
  required,
  minLength,
  showPasswordToggle,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  showPasswordToggle?: boolean;
}) {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const lifted = focused || value.length > 0;
  const isPassword = type === "password";
  const inputType =
    isPassword && showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          placeholder=" "
          className={cn(
            "peer h-12 pt-4",
            showPasswordToggle && isPassword && "pr-10",
          )}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          onChange={(e) => onChange(e.target.value)}
        />
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 text-muted-foreground transition-[transform,font-size,color] duration-[var(--duration-150)] ease-[var(--ease)]",
            lifted
              ? "top-1.5 text-[0.6875rem] font-medium text-[var(--brand-700)]"
              : "top-1/2 -translate-y-1/2 text-sm",
          )}
        >
          {label}
        </label>
        {showPasswordToggle && isPassword ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover-fine:hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Native select styled like FloatingLabelField (label always lifted). */
export function FloatingLabelSelect({
  id,
  label,
  error,
  className,
  value,
  onChange,
  options,
  placeholder = "Choose…",
  required,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <select
          id={id}
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-12 w-full appearance-none rounded-[var(--radius-md)] border border-input bg-background pl-3 pr-9 pt-4 text-base text-foreground outline-none transition-colors focus-visible:border-[var(--brand-500)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)] md:text-sm aria-invalid:border-destructive",
            !value && "text-muted-foreground",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-1.5 text-[0.6875rem] font-medium text-[var(--brand-700)]"
        >
          {label}
        </label>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
