"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Smartphone, ArrowRight, BarChart3 } from "lucide-react";
import { getAllAnalyses, deleteAnalysis } from "@/services/storage";
import AnalysisCard from "@/components/AnalysisCard";
import type { SavedAnalysis } from "@/types";

export default function SavedAnalysesPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAnalyses(getAllAnalyses());
  }, []);

  const handleDelete = (id: string) => {
    deleteAnalysis(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#22C55E]/30 border-t-[#22C55E] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-2">
            Saved Analyses
          </h1>
          <p className="text-[#A1A1AA]">
            {analyses.length > 0
              ? `${analyses.length} analysis${analyses.length !== 1 ? "es" : ""} saved`
              : "Your saved phone evaluations will appear here."}
          </p>
        </div>
        <Link
          href="/analyse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#22C55E] text-[#080D0A] hover:bg-[#86EFAC] transition-colors shrink-0"
        >
          Analyse a Phone
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Content */}
      {analyses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mb-6">
            <BarChart3 className="w-8 h-8 text-[#22C55E]/40" />
          </div>
          <h2 className="text-xl font-semibold text-[#F5F5F5] mb-2">
            No saved analyses yet
          </h2>
          <p className="text-[#A1A1AA] mb-8 max-w-md">
            Analyse your first smartphone to get started! Your saved valuations
            will appear here for easy reference.
          </p>
          <Link
            href="/analyse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#22C55E] text-[#080D0A] hover:bg-[#86EFAC] transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            Analyse a Phone
          </Link>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

