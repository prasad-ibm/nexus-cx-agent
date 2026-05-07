export function fmtZAR(amount: number | string | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(n)) return "R —";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-ZA", { year: "numeric", month: "short", day: "numeric" });
}

export function fmtPct(v: number | string | null | undefined, decimals = 0): string {
  const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
  if (isNaN(n)) return "—";
  return `${(n * 100).toFixed(decimals)}%`;
}

/** Churn risk score (0–1) → Tailwind colour classes */
export function churnColor(score: number | string | null | undefined): string {
  const n = typeof score === "string" ? parseFloat(score) : (score ?? 0);
  if (n >= 0.6) return "bg-red-100 text-red-800 border-red-200";
  if (n >= 0.4) return "bg-orange-100 text-orange-800 border-orange-200";
  if (n >= 0.2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
}

export function churnLabel(score: number | string | null | undefined): string {
  const n = typeof score === "string" ? parseFloat(score) : (score ?? 0);
  if (n >= 0.6) return "CRITICAL";
  if (n >= 0.4) return "HIGH";
  if (n >= 0.2) return "MEDIUM";
  return "LOW";
}

/** O2C health label → Tailwind colour classes */
export function healthColor(label: string | null | undefined): string {
  switch (label) {
    case "HEALTHY":  return "bg-green-100 text-green-800 border-green-200";
    case "WATCH":    return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "AT_RISK":  return "bg-red-100 text-red-800 border-red-200";
    default:         return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

/** Urgency → Tailwind colour classes */
export function urgencyColor(urgency: string | null | undefined): string {
  switch (urgency) {
    case "HIGH":   return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM": return "bg-amber-100 text-amber-700 border-amber-200";
    case "LOW":    return "bg-slate-100 text-slate-600 border-slate-200";
    default:       return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

/** NBA action → Tailwind colour classes */
export function nbaColor(action: string | null | undefined): string {
  switch (action) {
    case "UPSELL":      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CROSS_SELL":  return "bg-purple-100 text-purple-800 border-purple-200";
    case "RETAIN":      return "bg-green-100 text-green-800 border-green-200";
    case "SAVE":        return "bg-red-100 text-red-800 border-red-200";
    default:            return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function renewalUrgency(months: number | string | null | undefined): string {
  const n = typeof months === "string" ? parseInt(months) : (months ?? 99);
  if (n <= 6)  return "bg-red-100 text-red-700 border-red-200";
  if (n <= 12) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}
