export function formatSYP(amount: number | null | undefined): string {
  if (amount == null) return "—";
  const rounded = Math.round(amount);
  return rounded.toLocaleString("en-US") + " ل.س";
}

export function formatSYPEn(amount: number | null | undefined): string {
  if (amount == null) return "—";
  const rounded = Math.round(amount);
  return rounded.toLocaleString("en-US") + " SYP";
}

export function formatCurrency(amount: number | null | undefined, lang: "ar" | "en"): string {
  return lang === "ar" ? formatSYP(amount) : formatSYPEn(amount);
}
