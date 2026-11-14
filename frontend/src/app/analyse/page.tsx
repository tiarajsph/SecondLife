"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Smartphone,
  Battery,
  Package,
  UserRound,
  IndianRupee,
  Loader2,
  ChevronDown,
  Search,
  Check,
  ShieldCheck,
  CircleAlert,
} from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import { evaluatePhone } from "@/services/api";
import ResultCard from "@/components/ResultCard";
import { Section, Field, PillGroup, YesNo, CardChoice } from "@/components/FormKit";
import type { FormState, EvaluationResult, PhoneInput, ApiError } from "@/types";

/* ------------------------------------------------------------------ */
/* Options — values must match backend schema (schemas/phone.py)       */
/* ------------------------------------------------------------------ */
const BRANDS = [
  "Apple", "Samsung", "OnePlus", "Xiaomi", "Redmi", "Poco", "Vivo", "Oppo",
  "Realme", "iQOO", "Google", "Motorola", "Nothing", "Other",
];
const RAM = [4, 6, 8, 12, 16].map((n) => ({ value: String(n), label: `${n} GB` }));
const STORAGE = [64, 128, 256, 512, 1024].map((n) => ({
  value: String(n),
  label: n >= 1024 ? "1 TB" : `${n} GB`,
}));
const CONDITIONS = [
  { value: "Excellent", title: "Excellent", description: "Almost like new." },
  { value: "Good", title: "Good", description: "Minor signs of usage." },
  { value: "Fair", title: "Fair", description: "Noticeable wear and tear." },
  { value: "Poor", title: "Poor", description: "Significant wear or damage." },
];
const SCRATCHES = ["Minor", "Moderate", "Heavy", "Unknown"].map((v) => ({ value: v, label: v }));
const SELLERS = [
  { value: "Individual", title: "Individual", description: "A private seller, e.g. a friend or an online listing." },
  { value: "Dealer", title: "Dealer", description: "A shop, reseller or refurbisher." },
];
const DOCS: { key: "box" | "charger" | "invoice" | "warranty"; label: string }[] = [
  { key: "box", label: "Does the phone come with its original box?" },
  { key: "charger", label: "Is the original charger included?" },
  { key: "invoice", label: "Is the original purchase invoice available?" },
  { key: "warranty", label: "Is the phone still under warranty?" },
];

// Slider range must stay inside backend validation (0–100).
const BATTERY_MIN = 50;
const BATTERY_MAX = 100;

const initialForm: FormState = {
  brand: "", model: "", launch_price_inr: "", age_years: "", ram_gb: "", storage_gb: "",
  battery_health_pct: null, condition: "", screen_crack: "", scratches: "",
  box: "", charger: "", invoice: "", warranty: "", seller_type: "", asking_price: "",
};

/** The 16 user-facing fields, grouped for the progress tracker. */
const SECTIONS: { id: string; label: string; keys: (keyof FormState)[] }[] = [
  { id: "phone", label: "Phone details", keys: ["brand", "model", "launch_price_inr", "age_years", "ram_gb", "storage_gb"] },
  { id: "condition", label: "Condition", keys: ["battery_health_pct", "condition", "screen_crack", "scratches"] },
  { id: "accessories", label: "Accessories & papers", keys: ["box", "charger", "invoice", "warranty"] },
  { id: "seller", label: "Seller", keys: ["seller_type"] },
  { id: "price", label: "Asking price", keys: ["asking_price"] },
];

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  const need = "Select an option";
  if (!f.brand) e.brand = "Choose a brand";
  if (!f.model.trim()) e.model = "Enter the model name";
  if (!(Number(f.launch_price_inr) >= 1000)) e.launch_price_inr = "Enter the original launch price in ₹";
  const age = Number(f.age_years);
  if (f.age_years === "" || !Number.isInteger(age) || age < 0 || age > 15) e.age_years = "Enter a whole number from 0 to 15";
  if (!f.ram_gb) e.ram_gb = "Select the RAM";
  if (!f.storage_gb) e.storage_gb = "Select the storage";
  if (f.battery_health_pct === null) e.battery_health_pct = "Move the slider to set battery health";
  (["condition", "screen_crack", "scratches", "box", "charger", "invoice", "warranty", "seller_type"] as const).forEach((k) => {
    if (!f[k]) e[k] = need;
  });
  if (!(Number(f.asking_price) > 0)) e.asking_price = "Enter the seller's asking price in ₹";
  return e;
}

const isFilled = (f: FormState, k: keyof FormState) =>
  k === "battery_health_pct" ? f[k] !== null : String(f[k]).trim() !== "";

const digits = (s: string) => s.replace(/\D/g, "");

/* ------------------------------------------------------------------ */

export default function AnalysePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    result: EvaluationResult;
    input: PhoneInput & { asking_price: number };
    at: number;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validate(form), [form]);
  const err = (k: keyof FormState) => (showErrors ? errors[k] : undefined);

  const filled = SECTIONS.reduce((n, s) => n + s.keys.filter((k) => isFilled(form, k)).length, 0);
  const total = 16;
  const pct = Math.round((filled / total) * 100);

  const set = useCallback(<K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  async function handleSubmit() {
    if (loading) return;
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      const first = SECTIONS.flatMap((s) => s.keys).find((k) => errors[k]);
      requestAnimationFrame(() =>
        document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
      return;
    }

    setLoading(true);
    setApiError(null);
    setSubmitted(null);

    const input: PhoneInput = {
      brand: form.brand,
      model: form.model.trim(),
      launch_price_inr: Number(form.launch_price_inr),
      age_years: Number(form.age_years),
      ram_gb: Number(form.ram_gb),
      storage_gb: Number(form.storage_gb),
      battery_health_pct: form.battery_health_pct as number,
      condition: form.condition as PhoneInput["condition"],
      screen_crack: form.screen_crack as PhoneInput["screen_crack"],
      scratches: form.scratches as PhoneInput["scratches"],
      box: form.box as PhoneInput["box"],
      charger: form.charger as PhoneInput["charger"],
      invoice: form.invoice as PhoneInput["invoice"],
      warranty: form.warranty as PhoneInput["warranty"],
      seller_type: form.seller_type as PhoneInput["seller_type"],
    };
    const asking = Number(form.asking_price);

    try {
      const result = await evaluatePhone(input, asking);
      // Snapshot the input NOW so later form edits can't desync the saved record.
      setSubmitted({ result, input: { ...input, asking_price: asking }, at: Date.now() });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (e) {
      setApiError((e as ApiError).message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Let&apos;s Evaluate Your Phone</h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Enter a few details about the smartphone and its asking price to find out whether it&apos;s a good deal.
        </p>
      </header>

      {/* Mobile progress bar */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-line bg-ink/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
        <div className="mb-1.5 flex justify-between text-xs font-medium text-muted">
          <span>{filled} of {total} answered</span>
          <span className="text-brand">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ============================ FORM ============================ */}
        <div className="space-y-6">
          {/* A — Phone details */}
          <Section id="phone" icon={<Smartphone className="size-5" />} title="Phone details" hint="What is the phone, and how old is it?">
            <Field id="brand" label="Brand" error={err("brand")}>
              <BrandSelect value={form.brand} onChange={(v) => set("brand", v)} invalid={!!err("brand")} />
            </Field>

            <Field id="model" label="Model" error={err("model")}>
              <input
                id="model"
                className="ctl"
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="e.g. Galaxy S23, iPhone 14, OnePlus 12"
                aria-invalid={!!err("model")}
                autoComplete="off"
              />
            </Field>

            <Field
              id="launch_price_inr"
              label="Original launch price (₹)"
              error={err("launch_price_inr")}
              help={form.launch_price_inr ? formatINR(Number(form.launch_price_inr)) : "The price when the phone first launched in India."}
            >
              <Rupee>
                <input
                  id="launch_price_inr"
                  className="ctl pl-9"
                  inputMode="numeric"
                  value={form.launch_price_inr}
                  onChange={(e) => set("launch_price_inr", digits(e.target.value))}
                  placeholder="74999"
                  aria-invalid={!!err("launch_price_inr")}
                />
              </Rupee>
            </Field>

            <Field id="age_years" label="Phone age (years)" error={err("age_years")} help="Whole years since purchase or launch. Use 0 for under a year.">
              <input
                id="age_years"
                className="ctl"
                inputMode="numeric"
                value={form.age_years}
                onChange={(e) => set("age_years", digits(e.target.value).slice(0, 2))}
                placeholder="e.g. 2"
                aria-invalid={!!err("age_years")}
              />
            </Field>

            <Field id="ram_gb" label="RAM" error={err("ram_gb")}>
              <PillGroup name="RAM" value={form.ram_gb} options={RAM} onChange={(v) => set("ram_gb", v)} invalid={!!err("ram_gb")} />
            </Field>

            <Field id="storage_gb" label="Storage" error={err("storage_gb")}>
              <PillGroup name="Storage" value={form.storage_gb} options={STORAGE} onChange={(v) => set("storage_gb", v)} invalid={!!err("storage_gb")} />
            </Field>
          </Section>

          {/* B — Condition */}
          <Section id="condition" icon={<Battery className="size-5" />} title="Phone condition" hint="Be honest. Condition changes the value a lot.">
            <Field
              id="battery_health_pct"
              label="Battery health"
              wide
              error={err("battery_health_pct")}
              help="iPhone: Settings → Battery → Battery Health & Charging. Android: dial *#*#4636#*#* or use the maker's diagnostics app."
            >
              <div className="rounded-xl border border-line bg-ink p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {form.battery_health_pct === null ? "Not set yet" : "Maximum capacity"}
                  </span>
                  <span
                    className={cn(
                      "min-w-16 rounded-lg border px-3 py-1 text-center text-base font-bold tabular-nums",
                      form.battery_health_pct === null
                        ? "border-line text-muted"
                        : "border-brand/40 bg-brand/10 text-brand"
                    )}
                  >
                    {form.battery_health_pct === null ? "—" : `${form.battery_health_pct}%`}
                  </span>
                </div>
                <input
                  id="battery_health_pct"
                  type="range"
                  min={BATTERY_MIN}
                  max={BATTERY_MAX}
                  step={1}
                  value={form.battery_health_pct ?? 80}
                  className={cn("range", form.battery_health_pct === null && "is-empty")}
                  style={{ ["--fill" as string]: `${(((form.battery_health_pct ?? BATTERY_MIN) - BATTERY_MIN) / (BATTERY_MAX - BATTERY_MIN)) * 100}%` }}
                  onChange={(e) => set("battery_health_pct", Number(e.target.value))}
                  // Tapping the thumb without moving it should still count as an answer
                  onPointerUp={(e) => form.battery_health_pct === null && set("battery_health_pct", Number(e.currentTarget.value))}
                  onKeyDown={(e) => form.battery_health_pct === null && set("battery_health_pct", Number(e.currentTarget.value))}
                  aria-valuetext={form.battery_health_pct === null ? "not set" : `${form.battery_health_pct} percent`}
                />
                <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
                  <span>{BATTERY_MIN}%</span>
                  <span>{BATTERY_MAX}%</span>
                </div>
              </div>
            </Field>

            <Field id="condition" label="Overall condition" wide error={err("condition")}>
              <CardChoice name="Overall condition" cols={4} value={form.condition} options={CONDITIONS} onChange={(v) => set("condition", v)} invalid={!!err("condition")} />
            </Field>

            <Field id="screen_crack" label="Does the screen have any cracks?" error={err("screen_crack")}>
              <YesNo name="Screen cracks" yesTone="bad" value={form.screen_crack} onChange={(v) => set("screen_crack", v)} invalid={!!err("screen_crack")} />
            </Field>

            <Field id="scratches" label="How would you describe the scratches?" error={err("scratches")}>
              <PillGroup name="Scratches" value={form.scratches} options={SCRATCHES} onChange={(v) => set("scratches", v)} invalid={!!err("scratches")} />
            </Field>
          </Section>

          {/* C — Accessories */}
          <Section id="accessories" icon={<Package className="size-5" />} title="Accessories & documentation" hint="Complete sets resell for more.">
            {DOCS.map((d) => (
              <Field key={d.key} id={d.key} label={d.label} error={err(d.key)}>
                <YesNo name={d.label} value={form[d.key]} onChange={(v) => set(d.key, v)} invalid={!!err(d.key)} />
              </Field>
            ))}
          </Section>

          {/* D — Seller */}
          <Section id="seller" icon={<UserRound className="size-5" />} title="Seller details">
            <Field id="seller_type" label="Who is selling the phone?" wide error={err("seller_type")}>
              <CardChoice name="Seller type" value={form.seller_type} options={SELLERS} onChange={(v) => set("seller_type", v)} invalid={!!err("seller_type")} />
            </Field>
          </Section>

          {/* E — Asking price (visually dominant on purpose) */}
          <section
            id="price"
            className="scroll-mt-28 rounded-2xl border border-brand/30 bg-gradient-to-b from-brand/[0.07] to-surface p-5 sm:p-7"
          >
            <header className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-brand/30 bg-brand/15 text-brand">
                <IndianRupee className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-bold leading-tight">Seller&apos;s asking price</h2>
                <p className="mt-0.5 text-sm text-muted">We compare this with the estimated resale value.</p>
              </div>
            </header>
            <div id="field-asking_price" className="scroll-mt-32">
              <label htmlFor="asking_price" className="mb-2 block text-sm font-semibold text-white/90">
                How much is the seller asking for this phone?
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand">₹</span>
                <input
                  id="asking_price"
                  inputMode="numeric"
                  value={form.asking_price}
                  onChange={(e) => set("asking_price", digits(e.target.value))}
                  placeholder="48000"
                  aria-invalid={!!err("asking_price")}
                  className={cn(
                    "h-16 w-full rounded-xl border-2 bg-ink pl-12 pr-5 text-3xl font-extrabold tabular-nums placeholder:text-muted/30 transition-colors hover:border-brand/50 focus:border-brand focus:ring-4 focus:ring-brand/15",
                    err("asking_price") ? "border-danger/60" : "border-line-strong"
                  )}
                />
              </div>
              <p className={cn("mt-2 text-xs", err("asking_price") ? "font-medium text-danger-soft" : "text-muted")} role={err("asking_price") ? "alert" : undefined}>
                {err("asking_price") ?? (form.asking_price ? formatINR(Number(form.asking_price)) : "Example: ₹48,000")}
              </p>
            </div>
          </section>

          {/* Submit */}
          {apiError && (
            <div role="alert" className="flex gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
              <div>
                <p className="text-sm font-semibold text-danger-soft">Couldn&apos;t get a recommendation</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-danger-soft/90">{apiError}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-brand text-base font-bold text-ink shadow-lg shadow-brand/20 transition hover:bg-brand-soft disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Analysing your phone...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-5" /> View Recommendation
                </>
              )}
            </button>
            {showErrors && Object.keys(errors).length > 0 && (
              <p role="alert" className="mt-3 text-center text-sm font-medium text-danger-soft">
                {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""} still need an answer.
              </p>
            )}
          </div>

          <div ref={resultRef} className="scroll-mt-24">
            {submitted && <ResultCard key={submitted.at} result={submitted.result} input={submitted.input} />}
          </div>
        </div>

        {/* ========================= SIDEBAR (desktop) ========================= */}
        <aside className="sticky top-24 hidden lg:block">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-muted">Progress</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums">
                  {filled}<span className="text-lg font-semibold text-muted">/{total}</span>
                </p>
              </div>
              <span className="text-sm font-bold text-brand tabular-nums">{pct}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
            </div>

            <ul className="mt-5 space-y-1">
              {SECTIONS.map((s) => {
                const done = s.keys.filter((k) => isFilled(form, k)).length;
                const complete = done === s.keys.length;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition hover:bg-white/5"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full border transition",
                            complete ? "border-brand bg-brand text-ink" : "border-line-strong text-transparent"
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className={complete ? "text-white" : "text-muted"}>{s.label}</span>
                      </span>
                      <span className="text-xs text-muted tabular-nums">{done}/{s.keys.length}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-4 px-1 text-xs leading-relaxed text-muted">
            Recommendations compare price only. They don&apos;t confirm a phone is genuine or defect-free, so always inspect it in person.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small local components                                              */
/* ------------------------------------------------------------------ */

function Rupee({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted">₹</span>
      {children}
    </div>
  );
}

function BrandSelect({ value, onChange, invalid }: { value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const list = BRANDS.filter((b) => b.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (b: string) => {
    onChange(b);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={wrap} className="relative">
      <button
        id="brand"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-ink px-4 text-sm transition-colors hover:border-brand/40",
          value ? "border-line-strong text-white" : "border-line text-muted/70",
          invalid && "border-danger/60",
          open && "border-brand ring-2 ring-brand/20"
        )}
      >
        {value || "Select a brand"}
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line-strong bg-raised shadow-2xl shadow-black/50">
          <div className="border-b border-line p-2">
            <div className="flex items-center gap-2 rounded-lg bg-ink px-3">
              <Search className="size-4 text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && list[0] && (e.preventDefault(), pick(list[0]))}
                placeholder="Search brands"
                className="h-10 flex-1 bg-transparent text-sm placeholder:text-muted/50"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto p-1">
            {list.map((b) => (
              <li key={b} role="option" aria-selected={value === b}>
                <button
                  type="button"
                  onClick={() => pick(b)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition",
                    value === b ? "bg-brand/10 text-brand" : "hover:bg-white/5"
                  )}
                >
                  {b}
                  {value === b && <Check className="size-4" />}
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="px-3 py-3 text-sm text-muted">No brand found. Pick “Other”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
