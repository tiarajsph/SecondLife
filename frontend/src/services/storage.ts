import type { SavedAnalysis } from "@/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "secondlife_analyses";

function getAnalyses(): SavedAnalysis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedAnalysis[]) : [];
  } catch {
    return [];
  }
}

function saveAnalyses(analyses: SavedAnalysis[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
}

export function getAllAnalyses(): SavedAnalysis[] {
  return getAnalyses().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function saveAnalysis(
  analysis: Omit<SavedAnalysis, "id" | "timestamp">
): SavedAnalysis {
  const newAnalysis: SavedAnalysis = {
    ...analysis,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  const all = getAnalyses();
  all.push(newAnalysis);
  saveAnalyses(all);
  return newAnalysis;
}

export function deleteAnalysis(id: string): void {
  const all = getAnalyses().filter((a) => a.id !== id);
  saveAnalyses(all);
}

export function getAnalysisById(id: string): SavedAnalysis | undefined {
  return getAnalyses().find((a) => a.id === id);
}

