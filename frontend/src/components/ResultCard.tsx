"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, AlertTriangle, XCircle, Bookmark, Check, RotateCcw, Info, Loader2 } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import { saveAnalysis } from "@/services/storage";
import type { EvaluationResult, PhoneInput, Recommendation } from "@/types";

interface Props {
  result: EvaluationResult;
  input: PhoneInput & { asking_price: number };
}

type SaveState = "idle" | "saving" | "saved" | "error";

const THEME: Record<
  Recommendation,
  { heading: string; Icon: typeof BadgeCheck; box: string; chip: string; text: string; bar: string; marker: string; tail: string }
> = {
  BUY: {
    heading: "Looks Like a Good Deal!",
    Icon: BadgeCheck,
    box: "border-brand/40 bg-brand/[0.06]",
    chip: "border-brand/40 bg-brand/15 text-brand",
    text: "text-brand-soft",
    bar: "bg-brand",
    marker: "bg-brand",
    tail: "This looks like a good deal!",
  },
  NEGOTIATE: {
    heading: "Try Negotiating!",
    Icon: AlertTriangle,
    box: "border-warn/40 bg-warn/[0.06]",
    chip: "border-warn/40 bg-warn/15 text-warn",
    text: "text-warn-soft",
    bar: "bg-warn",
    marker: "bg-warn",
    tail: "Try negotiating with the seller for a better price.",
  },
  PASS: {
    heading: "Not Worth the Asking Price.",
    Icon: XCircle,
    box: "border-danger/40 bg-danger/[0.06]",
    chip: "border-danger/40 bg-danger/15 text-danger",
    text: "text-danger-soft",
    bar: "bg-danger",
    marker: "bg-danger",
    tail: "We recommend looking for a better deal.",
  },
};

/** Wording follows the sign of the backend's percentage (negative = below estimate). */
function explain(pct: number, rec: Recommendation) {
  if (pct === 0) return "The asking price matches the estimated market value.";
  const abs = Math.abs(pct);
  const dir = pct < 0 ? "below" : "above";
  return `The asking price is ${abs}% ${dir} the estimated market value. ${THEME[rec].tail}`;
}

export default function ResultCard({ result, input }: Props) {
  const [save, setSave] = useState<SaveState>("idle");
  const {
    recommendation: rec,
    percentage_difference: pct,
    predicted_resale_price_inr: est,
    asking_price_inr: ask,
    price_difference: diff,
  } = result;
  const t = THEME[rec];
  const Icon = t.Icon;

  // Display-only: where the asking price sits relative to the estimate (±40%).
  const ratio = est > 0 ? ask / est : 1;
  const pos = Math.min(100, Math.max(0, ((ratio - 0.6) / 0.8) * 100));

  function onSave() {
    if (save === "saving" || save === "saved") return;
    setSave("saving");
    try {
      saveAnalysis({ input, result });
      setSave("saved");
    } catch {
      setSave("error");
    }
  }

  return (
    <div className={cn("rise overflow-hidden rounded-2xl border-2", t.box)} aria-live="polite">
      {/* Verdict */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl border", t.chip)}>
            <Icon className="size-7" />
          </span>
          <div>
            <span className={cn("inline-block rounded-full border px-3 py-0.5 text-xs font-extrabold tracking-wide", t.chip)}>
              {rec}
            </span>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">{t.heading}</h2>
          </div>
        </div>
        <p className="text-sm text-muted sm:text-right">
          {input.brand} {input.model}
          <br />
          {input.ram_gb} GB / {input.storage_gb >= 1024 ? "1 TB" : `${input.storage_gb} GB`} · {input.condition}
        </p>
      </div>

      {/* Numbers */}
      <div className="grid gap-px border-y border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Estimated resale value" value={formatINR(est)} />
        <Stat label="Seller's asking price" value={formatINR(ask)} />
        <Stat label="Price difference" value={formatINR(diff)} sub={ask === est ? undefined : ask < est ? "below estimate" : "above estimate"} />
        <Stat label="Percentage difference" value={`${Math.abs(pct)}%`} sub={pct === 0 ? undefined : pct < 0 ? "below estimate" : "above estimate"} tone={t.text} />
      </div>

      <div className="space-y-6 p-5 sm:p-8">
        <p className={cn("text-base font-medium leading-relaxed sm:text-lg", t.text)}>{explain(pct, rec)}</p>

        {/* Price scale */}
        <div aria-hidden className="pt-4">
          <div className="relative h-2 rounded-full bg-white/10">
            <div className={cn("absolute inset-y-0 left-0 rounded-full opacity-60", t.bar)} style={{ width: `${pos}%` }} />
            <div className="absolute -top-1.5 left-1/2 h-5 w-0.5 -translate-x-1/2 bg-white/80" />
            <div
              className={cn("absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink", t.marker)}
              style={{ left: `${pos}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-muted">
            <span>Cheaper than estimate</span>
            <span className="text-white/70">Estimated value</span>
            <span>Pricier than estimate</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2 text-xs leading-relaxed text-muted sm:max-w-md">
            <Info className="mt-0.5 size-4 shrink-0" />
            This is a price-only recommendation based on past market data. It doesn&apos;t confirm the phone is genuine or defect-free. Inspect it before you pay.
          </p>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <button
              onClick={onSave}
              disabled={save === "saving" || save === "saved"}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition",
                save === "saved" && "cursor-default border-brand/40 bg-brand/10 text-brand",
                save === "error" && "border-danger/40 bg-danger/10 text-danger-soft hover:bg-danger/20",
                (save === "idle" || save === "saving") && "border-line-strong bg-raised hover:border-brand/50 hover:bg-brand/10"
              )}
            >
              {save === "saving" && <><Loader2 className="size-4 animate-spin" /> Saving...</>}
              {save === "idle" && <><Bookmark className="size-4" /> Save Analysis</>}
              {save === "saved" && <><Check className="size-4" /> Analysis saved successfully!</>}
              {save === "error" && <><RotateCcw className="size-4" /> Couldn&apos;t save. Retry</>}
            </button>
            {save === "saved" && (
              <Link href="/saved-analyses" className="text-xs font-medium text-brand hover:underline">
                View saved analyses
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="bg-ink/70 p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1.5 text-2xl font-extrabold tabular-nums tracking-tight", tone)}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}
