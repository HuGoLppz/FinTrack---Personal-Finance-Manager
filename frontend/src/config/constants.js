export const INCOME_TYPES = [
  { value: "salary", label: "Salario", bg: "#dcefe1", fg: "#22603a" },
  { value: "tip", label: "Propina", bg: "#fbefcf", fg: "#82580c" },
  { value: "gift", label: "Regalo", bg: "#f7e1ee", fg: "#93336a" },
  { value: "aid", label: "Ayuda", bg: "#dfeaf8", fg: "#2c5d97" },
];
export const FALLBACK_INCOME_TYPE = {
  value: "other",
  label: "Otro",
  bg: "#ebebe4",
  fg: "#57615b",
};
export const incomeTypeOf = (value) =>
  INCOME_TYPES.find((t) => t.value === value) || FALLBACK_INCOME_TYPE;

export const PAYMENT_OPTIONS = [12, 14];
export const EXTRA_PAY_MONTHS = [5, 11];

export const PERSON_COLORS = [
  "#4655c9",
  "#0e8a8c",
  "#b0357a",
  "#b5741a",
  "#7748c2",
  "#2678b8",
  "#8b5637",
  "#536471",
];

export const EXPENSE_TAG_COLORS = [
  { bg: "#f6e4dc", fg: "#94472f" },
  { bg: "#e5e4f6", fg: "#4a48a0" },
  { bg: "#dcf0ee", fg: "#1f6b68" },
  { bg: "#f3eadb", fg: "#7d5a1f" },
  { bg: "#efe0ee", fg: "#803a7d" },
  { bg: "#e2ebdc", fg: "#4b6a2f" },
];

export const DEFAULT_SPLIT = [
  { key: "needs", label: "Gastos vitales", pct: 50, group: "spend", color: "#2b4738" },
  { key: "wants", label: "Ocio y caprichos", pct: 15, group: "spend", color: "#c98a3b" },
  { key: "savings", label: "Ahorro", pct: 15, group: "keep", color: "#3f8f83" },
  { key: "invest", label: "Inversión", pct: 15, group: "keep", color: "#5563c4" },
  { key: "buffer", label: "Colchón de imprevistos", pct: 5, group: "keep", color: "#8a93a0" },
];

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
