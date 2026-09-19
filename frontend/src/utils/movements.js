import { personColor } from "./format";

/** Normaliza un movimiento del backend (también los antiguos sin los campos nuevos). */
export const normalize = (x) => {
  const isIncome = x.type === "income";
  const person = String(x.person || "").trim() || "Sin asignar";
  return {
    ...x,
    isIncome,
    amount: Number(x.amount) || 0,
    date: String(x.date || "").slice(0, 10),
    person,
    personColor: personColor(person, x.personColor),
    incomeType: x.incomeType || "other",
    expenseType: String(x.expenseType || "").trim() || "Sin tipo",
    kindKey: isIncome ? `i:${x.incomeType || "other"}` : `e:${String(x.expenseType || "").trim() || "Sin tipo"}`,
  };
};

export const SORTS = [
  { value: "date-desc", label: "Fecha: más reciente primero" },
  { value: "date-asc", label: "Fecha: más antigua primero" },
  { value: "amount-desc", label: "Cantidad: de mayor a menor" },
  { value: "amount-asc", label: "Cantidad: de menor a mayor" },
  { value: "type", label: "Tipo (A–Z)" },
];

const typeLabel = (x, incomeLabel) => (x.isIncome ? incomeLabel(x.incomeType) : x.expenseType);

export function applyFilters(list, f, incomeLabel) {
  const q = f.q.trim().toLowerCase();
  const out = list.filter((x) => {
    if (f.kind && x.kindKey !== f.kind) return false;
    if (f.person && !(x.isIncome && x.person === f.person)) return false;
    if (f.from && x.date < f.from) return false;
    if (f.to && x.date > f.to) return false;
    if (q) {
      const hay = [x.description, x.category, x.person, x.expenseType, incomeLabel(x.incomeType)]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const by = {
    "date-desc": (a, b) => b.date.localeCompare(a.date),
    "date-asc": (a, b) => a.date.localeCompare(b.date),
    "amount-desc": (a, b) => b.amount - a.amount,
    "amount-asc": (a, b) => a.amount - b.amount,
    type: (a, b) =>
      typeLabel(a, incomeLabel).localeCompare(typeLabel(b, incomeLabel), "es") ||
      b.date.localeCompare(a.date),
  }[f.sort];
  return out.sort(by);
}

export const sum = (list) => list.reduce((s, x) => s + x.amount, 0);

/** Agrupa por clave y suma; devuelve [{key, total, count}] de mayor a menor. */
export const groupTotals = (list, keyOf) => {
  const m = new Map();
  list.forEach((x) => {
    const k = keyOf(x);
    const cur = m.get(k) || { key: k, total: 0, count: 0 };
    cur.total += x.amount;
    cur.count += 1;
    m.set(k, cur);
  });
  return [...m.values()].sort((a, b) => b.total - a.total);
};
