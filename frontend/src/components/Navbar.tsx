"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Smartphone, ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Analyse", href: "/analyse" },
  { label: "Saved Analyses", href: "/saved-analyses" },
];

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/80 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl border border-brand/30 bg-brand/10">
            <Smartphone className="size-[18px] text-brand" />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            Second<span className="text-brand">Life</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(pathname, l.href)
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {/* Reserved slot for future auth (Login / Profile) */}
          <button
            disabled
            title="Accounts are coming soon"
            className="cursor-not-allowed rounded-lg px-3.5 py-2 text-sm font-medium text-muted/50"
          >
            Sign in
          </button>
          <Link
            href="/analyse"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-brand/20 transition hover:bg-brand-soft"
          >
            Analyse a Phone
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium",
                  isActive(pathname, l.href)
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:bg-white/5 hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/analyse"
              className="mt-3 rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-ink"
            >
              Analyse a Phone
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
