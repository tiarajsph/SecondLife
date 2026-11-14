"use client";

import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { cn, formatINR } from "@/lib/utils";
import type { SavedAnalysis } from "@/types";

interface AnalysisCardProps {
  analysis: SavedAnalysis;
  onDelete: (id: string) => void;
}

const recommendationStyles = {
  BUY: {
    badge: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
    dot: "bg-[#22C55E]",
  },
  NEGOTIATE: {
    badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  PASS: {
    badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    dot: "bg-[#EF4444]",
  },
};

export default function AnalysisCard({ analysis, onDelete }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { input, result, timestamp } = analysis;
  const style = recommendationStyles[result.recommendation];
  const date = new Date(timestamp).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(analysis.id);
  };

  return (
    <>
      <div className="bg-[#101A13] rounded-2xl border border-[#1E2E23] hover:border-[#22C55E]/30 transition-all group">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#F5F5F5] group-hover:text-[#86EFAC] transition-colors">
                {input.brand} {input.model}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">{date}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                style.badge
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
              {result.recommendation}
            </span>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Asking</p>
              <p className="text-sm font-semibold text-[#F5F5F5]">{formatINR(result.asking_price_inr)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Estimated</p>
              <p className="text-sm font-semibold text-[#F5F5F5]">{formatINR(result.predicted_resale_price_inr)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#1E2E23]">
            <button
              onClick={() => setExpanded(true)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#22C55E] hover:bg-[#22C55E]/5 border border-[#1E2E23] hover:border-[#22C55E]/30 transition-all"
            >
              View Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className={cn(
                "p-2 rounded-lg border transition-all",
                confirmDelete
                  ? "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30"
                  : "text-[#A1A1AA] hover:text-[#EF4444] border-[#1E2E23] hover:border-[#EF4444]/30 hover:bg-[#EF4444]/5"
              )}
              title={confirmDelete ? "Click again to confirm" : "Delete analysis"}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div className="bg-[#101A13] rounded-2xl border border-[#1E2E23] w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#101A13] border-b border-[#1E2E23] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1E2E23] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F5F5]">
                    {input.brand} {input.model}
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">{date}</p>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#1E2E23] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">
              {/* Result Summary */}
              <div
                className={cn(
                  "rounded-xl p-4 border",
                  result.recommendation === "BUY"
                    ? "bg-[#22C55E]/10 border-[#22C55E]/30"
                    : result.recommendation === "NEGOTIATE"
                      ? "bg-[#F59E0B]/10 border-[#F59E0B]/30"
                      : "bg-[#EF4444]/10 border-[#EF4444]/30"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      style.badge
                    )}
                  >
                    {result.recommendation}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    {Math.abs(result.percentage_difference)}% difference
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Estimated Value</p>
                    <p className="text-lg font-bold text-[#F5F5F5]">{formatINR(result.predicted_resale_price_inr)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA]">Asking Price</p>
                    <p className="text-lg font-bold text-[#F5F5F5]">{formatINR(result.asking_price_inr)}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#F5F5F5] uppercase tracking-wider">Phone Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Brand", input.brand],
                    ["Model", input.model],
                    ["Launch Price", formatINR(input.launch_price_inr)],
                    ["Age", `${input.age_years} year${input.age_years !== 1 ? "s" : ""}`],
                    ["RAM", `${input.ram_gb} GB`],
                    ["Storage", `${input.storage_gb} GB`],
                    ["Battery Health", `${input.battery_health_pct}%`],
                    ["Condition", input.condition],
                    ["Screen Crack", input.screen_crack],
                    ["Scratches", input.scratches],
                    ["Original Box", input.box],
                    ["Charger", input.charger],
                    ["Invoice", input.invoice],
                    ["Warranty", input.warranty],
                    ["Seller Type", input.seller_type],
                    ["Asking Price", formatINR(input.asking_price)],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#080D0A]/60 rounded-lg p-3 border border-[#1E2E23]">
                      <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-[#F5F5F5]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

