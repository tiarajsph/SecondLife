// Types matching the FastAPI backend schemas exactly

export interface PhoneInput {
  brand: string;
  model: string;
  launch_price_inr: number;
  age_years: number;
  ram_gb: number;
  storage_gb: number;
  battery_health_pct: number;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  screen_crack: "Yes" | "No";
  scratches: "Minor" | "Moderate" | "Heavy" | "Unknown";
  box: "Yes" | "No";
  charger: "Yes" | "No";
  invoice: "Yes" | "No";
  warranty: "Yes" | "No";
  city?: string; // sent by api.ts only while the backend still requires it
  seller_type: "Individual" | "Dealer";
}

export interface PredictionResponse {
  predicted_resale_price_inr: number;
  currency: "INR";
}

export type Recommendation = "BUY" | "NEGOTIATE" | "PASS";

export interface EvaluationResult {
  predicted_resale_price_inr: number;
  asking_price_inr: number;
  price_difference: number;
  percentage_difference: number;
  recommendation: Recommendation;
  currency: "INR";
}

export interface SavedAnalysis {
  id: string;
  timestamp: string;
  input: PhoneInput & { asking_price: number };
  result: EvaluationResult;
}

export interface FormState {
  brand: string;
  model: string;
  launch_price_inr: string;
  age_years: string;
  ram_gb: string;
  storage_gb: string;
  battery_health_pct: number | null;
  condition: string;
  screen_crack: string;
  scratches: string;
  box: string;
  charger: string;
  invoice: string;
  warranty: string;
  seller_type: string;
  asking_price: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Array<{ loc: string[]; msg: string }>;
}

