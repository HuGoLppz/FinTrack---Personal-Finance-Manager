import { PERSON_COLORS, EXPENSE_TAG_COLORS } from "../config/constants";

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export const money = (v) => eur.format(Number(v || 0));

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthKey = (d) => String(d || "").slice(0, 7);

export const shortDate = (v) =>
  v
    ? new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(
        new Date(`${String(v).slice(0, 10)}T12:00:00`),
      )
    : "Sin fecha";

export const monthLabel = (key) => {
  if (!key || key === "all") return "Todo el histórico";
  const s = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    new Date(`${key}-15T12:00:00`),
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const hash = (s) => {
  let h = 0;
  for (const ch of String(s).toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};
export const personColor = (name, explicit) =>
  explicit || PERSON_COLORS[hash(name) % PERSON_COLORS.length];
export const expenseTagColor = (name) =>
  EXPENSE_TAG_COLORS[hash(name) % EXPENSE_TAG_COLORS.length];
export const initial = (name) => (String(name).trim()[0] || "?").toUpperCase();
