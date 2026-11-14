import Link from "next/link";
import { ArrowRight, Cpu, Zap, ClipboardList, Scale, BadgeCheck, Check } from "lucide-react";

const STEPS = [
  { n: "01", icon: ClipboardList, title: "Enter Phone Details", body: "Provide the smartphone specifications, physical condition and seller's asking price." },
  { n: "02", icon: Cpu, title: "Get an Estimated Value", body: "Our machine learning model analyses the phone's specifications and estimates its resale market value." },
  { n: "03", icon: BadgeCheck, title: "Make a Better Decision", body: "Get a BUY, NEGOTIATE or PASS recommendation based on the comparison between the estimated value and asking price." },
];

const FEATURES = [
  { icon: Cpu, title: "ML-Powered Valuation", body: "An XGBoost model trained on Indian resale data estimates what the phone should sell for, given its specs, age and condition." },
  { icon: Scale, title: "Smart Price Comparison", body: "See exactly how far the seller's price sits above or below the estimate, as a percentage and in rupees." },
  { icon: Zap, title: "Instant Buying Recommendations", body: "A clear BUY, NEGOTIATE or PASS in seconds, so you know whether to close the deal or push back." },
];

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(var(--color-line-strong)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Don&apos;t Overpay.
              <br />
              <span className="text-brand">Know What It&apos;s Worth.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Buying a used smartphone? SecondLife uses machine learning to estimate its resale value and helps you decide whether the seller&apos;s asking price is actually worth it.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyse" className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-brand px-8 text-base font-bold text-ink shadow-xl shadow-brand/25 transition hover:bg-brand-soft">
                Analyse a Phone <ArrowRight className="size-5" />
              </Link>
              <Link href="#how-it-works" className="inline-flex h-14 items-center justify-center rounded-xl border border-line-strong px-8 text-base font-semibold text-white/90 transition hover:border-brand/50 hover:bg-white/5">
                How It Works
              </Link>
            </div>
            <ul className="mt-10 flex flex-col gap-2.5 text-sm text-muted sm:flex-row sm:gap-8">
              {["Prices in INR", "16 quick questions", "Result in seconds"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-brand" strokeWidth={3} /> {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroPhone />
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-line bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted">Three steps from a seller&apos;s price tag to a decision you can defend.</p>
          </div>

          <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-brand/30">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold tabular-nums text-brand/30">{s.n}</span>
                  <span className="flex size-12 items-center justify-center rounded-xl border border-brand/20 bg-brand/10 text-brand">
                    <s.icon className="size-6" />
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Why SecondLife?</h2>
            <p className="mt-3 text-muted">Make confident buying decisions with data-driven valuation insights.</p>
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t-2 border-brand/60 pt-6">
                <f.icon className="size-7 text-brand" />
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-brand/25 bg-surface px-6 py-14 text-center sm:px-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-brand/15 blur-[90px]" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-[1.1]">
            Ready to find out if it&apos;s worth buying?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">
            Enter the phone details and get an ML-powered valuation with a clear recommendation.
          </p>
          <Link href="/analyse" className="relative mt-9 inline-flex h-14 items-center gap-2 rounded-xl bg-brand px-9 text-base font-bold text-ink shadow-xl shadow-brand/25 transition hover:bg-brand-soft">
            Analyse Now <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Hero graphic: a phone showing a sample valuation. Illustrative only. */
/* ------------------------------------------------------------------ */
function HeroPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[22rem] lg:mr-0">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-brand/10 blur-[80px]" />

      {/* device */}
      <div className="rounded-[2.75rem] border-2 border-line-strong bg-gradient-to-b from-raised to-ink p-3 shadow-2xl shadow-black/60">
        <div className="relative rounded-[2.15rem] border border-line bg-ink px-5 pb-6 pt-9">
          <span className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-surface ring-1 ring-line" />

          <p className="text-xs text-muted">iPhone 14 · 128 GB · Excellent</p>
          <p className="mt-4 text-xs font-medium text-muted">Estimated resale value</p>
          <p className="text-4xl font-extrabold tabular-nums tracking-tight">₹42,500</p>

          {/* price scale */}
          <div className="mt-6">
            <div className="relative h-2 rounded-full bg-line">
              <div className="absolute inset-y-0 left-0 w-[41%] rounded-full bg-brand/60" />
              <div className="absolute -top-1.5 left-1/2 h-5 w-0.5 bg-white/80" />
              <div className="absolute left-[41%] top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-brand shadow-[0_0_14px_rgb(34_197_94/0.6)]" />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] text-muted">
              <span>Asking ₹39,000</span>
              <span className="text-white/70">Estimate</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl border border-brand/40 bg-brand/10 p-4">
            <div>
              <p className="text-sm font-bold text-brand-soft">Looks like a good deal</p>
              <p className="mt-0.5 text-xs text-brand-soft/70">8.2% below estimated value</p>
            </div>
            <span className="rounded-full border border-brand/40 bg-brand/20 px-3 py-1 text-xs font-extrabold text-brand">BUY</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">Sample valuation for illustration</p>
    </div>
  );
}
