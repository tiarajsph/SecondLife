import type { PhoneInput, PredictionResponse, EvaluationResult, ApiError, Recommendation } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Parse FastAPI 422 validation errors into human-readable messages
 */
function parseValidationError(detail: Array<{ loc: (string | number)[]; msg: string }>): string {
  return detail
    .map((err) => {
      const field = err.loc.filter((l) => typeof l === "string" && l !== "body").join(".");
      return field ? `${field}: ${err.msg}` : err.msg;
    })
    .join("\n");
}

/**
 * Central fetch wrapper with error handling
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
  } catch {
    throw {
      message: "Unable to connect to the SecondLife API. Please check if the backend server is running.",
    } as ApiError;
  }

  if (!response.ok) {
    let errorBody: Record<string, unknown> | null = null;
    try {
      errorBody = await response.json() as Record<string, unknown>;
    } catch {
      // response isn't JSON
    }

    if (response.status === 422 && errorBody?.detail && Array.isArray(errorBody.detail)) {
      throw {
        message: parseValidationError(errorBody.detail as Array<{ loc: (string | number)[]; msg: string }>),
        details: errorBody.detail,
        status: 422,
      } as ApiError;
    }

    throw {
      message:
        (errorBody?.detail as string) ||
        `Server error (${response.status}). Please try again.`,
      status: response.status,
    } as ApiError;
  }

  return response.json() as Promise<T>;
}

/**
 * TEMPORARY FALLBACK — remove once the backend /evaluate/ endpoint ships.
 *
 * The backend currently only exposes /predict/ (price only). Until
 * /evaluate/ exists we compute the comparison here so the UI is usable.
 * Thresholds follow the product spec table:
 *   <= 0%  -> BUY,   0-10% above -> NEGOTIATE,   > 10% above -> PASS
 * percentage_difference is signed: negative = asking is BELOW estimate.
 */
function deriveEvaluation(predicted: number, askingPrice: number): EvaluationResult {
  const priceDifference = askingPrice - predicted;
  const pct = predicted === 0 ? 0 : Number(((priceDifference / predicted) * 100).toFixed(1));

  let recommendation: Recommendation;
  if (pct <= 0) recommendation = "BUY";
  else if (pct <= 10) recommendation = "NEGOTIATE";
  else recommendation = "PASS";

  return {
    predicted_resale_price_inr: Math.round(predicted),
    asking_price_inr: askingPrice,
    price_difference: Math.round(Math.abs(priceDifference)),
    percentage_difference: pct,
    recommendation,
    currency: "INR",
  };
}

// Remove `city` from the payload by setting NEXT_PUBLIC_DEFAULT_CITY="" once
// the backend schema drops it.
const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY ?? "Mumbai";

// After the first 404/405 we stop probing /evaluate/ for this session.
let evaluateEndpointMissing = false;

/**
 * Evaluate a phone. Prefers the backend's POST /evaluate/ (source of truth for
 * the recommendation) and falls back to /predict/ only if it doesn't exist yet.
 */
export async function evaluatePhone(
  input: PhoneInput,
  askingPrice: number
): Promise<EvaluationResult> {
  const payload = DEFAULT_CITY ? { ...input, city: DEFAULT_CITY } : input;

  if (!evaluateEndpointMissing) {
    try {
      return await apiFetch<EvaluationResult>("/evaluate/", {
        method: "POST",
        body: JSON.stringify({ ...payload, asking_price_inr: askingPrice }),
      });
    } catch (err) {
      const status = (err as ApiError).status;
      if (status !== 404 && status !== 405) throw err;
      evaluateEndpointMissing = true;
    }
  }

  const prediction = await apiFetch<PredictionResponse>("/predict/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return deriveEvaluation(prediction.predicted_resale_price_inr, askingPrice);
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  try {
    await apiFetch<{ status: string }>("/health");
    return true;
  } catch {
    return false;
  }
}

