import { Smartphone, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1E2E23] bg-[#080D0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#22C55E]" />
              </div>
              <span className="text-lg font-bold text-[#F5F5F5]">
                Second<span className="text-[#22C55E]">Life</span>
              </span>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-xs">
              ML-powered used smartphone valuation for the Indian market. Make smarter buying decisions with data-driven price analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F5F5] uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
                Home
              </Link>
              <Link href="/#how-it-works" className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
                How It Works
              </Link>
              <Link href="/analyse" className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
                Analyse a Phone
              </Link>
              <Link href="/saved-analyses" className="text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors">
                Saved Analyses
              </Link>
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#F5F5F5] uppercase tracking-wider">
              About the Project
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              SecondLife is an engineering project built as part of the Millennium Fellowship. It leverages XGBoost machine learning to predict fair resale prices for used smartphones in India.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#22C55E] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1E2E23]">
          <p className="text-center text-sm text-[#A1A1AA]/60">
            © {new Date().getFullYear()} SecondLife. Built with Next.js, FastAPI & XGBoost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
