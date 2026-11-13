"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Section card ---------- */
export function Section({
  id,
  icon,
  title,
  hint,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-line bg-surface p-5 sm:p-7"
    >
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
          {icon}
        </span>
        <div>
          <h2 className="text-base font-bold leading-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
        </div>
      </header>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/* ---------- Field wrapper (label, help, error) ---------- */
export function Field({
  id,
  label,
  help,
  error,
  wide,
  children,
}: {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div id={`field-${id}`} className={cn("scroll-mt-32", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-danger-soft">
          {error}
        </p>
      ) : help ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">{help}</p>
      ) : null}
    </div>
  );
}

/* ---------- Compact pill choice (RAM, storage, scratches) ---------- */
export function PillGroup({
  name,
  value,
  options,
  onChange,
  invalid,
}: {
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      aria-invalid={invalid}
      className="flex flex-wrap gap-2"
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-11 min-w-[4.25rem] rounded-xl border px-4 text-sm font-semibold transition",
              on
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-ink text-muted hover:border-brand/40 hover:text-white",
              invalid && !on && "border-danger/40"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Yes / No ---------- */
export function YesNo({
  name,
  value,
  onChange,
  invalid,
  yesTone = "good",
}: {
  name: string;
  value: string;
  onChange: (v: "Yes" | "No") => void;
  invalid?: boolean;
  /** "bad" colours a selected Yes red (e.g. screen cracked). */
  yesTone?: "good" | "bad";
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid grid-cols-2 gap-2">
      {(["Yes", "No"] as const).map((v) => {
        const on = value === v;
        const bad = on && v === "Yes" && yesTone === "bad";
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v)}
            className={cn(
              "h-12 rounded-xl border text-sm font-semibold transition",
              on && !bad && "border-brand bg-brand/10 text-brand",
              bad && "border-danger bg-danger/10 text-danger-soft",
              !on && "border-line bg-ink text-muted hover:border-brand/40 hover:text-white",
              invalid && !on && "border-danger/40"
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Selectable cards (condition, seller type) ---------- */
export function CardChoice({
  name,
  value,
  options,
  onChange,
  invalid,
  cols = 2,
}: {
  name: string;
  value: string;
  options: { value: string; title: string; description: string }[];
  onChange: (v: string) => void;
  invalid?: boolean;
  cols?: 2 | 4;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn("grid gap-2.5", cols === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2")}
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative rounded-xl border p-4 text-left transition",
              on ? "border-brand bg-brand/10" : "border-line bg-ink hover:border-brand/40",
              invalid && !on && "border-danger/40"
            )}
          >
            <span
              className={cn(
                "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border transition",
                on ? "border-brand bg-brand text-ink" : "border-line-strong"
              )}
            >
              {on && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cn("block pr-6 text-sm font-bold", on ? "text-brand" : "text-white")}>
              {o.title}
            </span>
            <span className="mt-1 block text-xs leading-snug text-muted">{o.description}</span>
          </button>
        );
      })}
    </div>
  );
}
