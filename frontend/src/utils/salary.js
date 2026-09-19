import { EXTRA_PAY_MONTHS, MONTHS } from "../config/constants";

/**
 * Reparte un salario anual en 12 meses.
 * - 12 pagas: cada mes cobra anual / 12.
 * - 14 pagas: cada mes cobra anual / 14 y, en los meses de paga extra
 *   (junio y diciembre), cobra además otra paga.
 * Se redondea al céntimo con acumulado, así la suma de los 12 meses
 * es exactamente el salario anual.
 */
export function salaryPlan(annualInput, paymentsInput) {
  const annual = Math.max(Number(annualInput) || 0, 0);
  const payments = Number(paymentsInput) === 14 ? 14 : 12;
  const cents = Math.round(annual * 100);
  let paid = 0;
  let count = 0;
  const take = () => {
    count += 1;
    const upTo = Math.round((cents * count) / payments);
    const amount = upTo - paid;
    paid = upTo;
    return amount / 100;
  };
  const months = MONTHS.map((name, index) => {
    const ordinary = take();
    const extra = payments === 14 && EXTRA_PAY_MONTHS.includes(index) ? take() : 0;
    return { index, name, ordinary, extra, total: Math.round((ordinary + extra) * 100) / 100 };
  });
  return {
    annual,
    payments,
    paga: annual / payments,
    average: annual / 12,
    months,
    extraMonths: EXTRA_PAY_MONTHS.map((i) => MONTHS[i]),
  };
}

/** Importe que corresponde cobrar en el mes de una fecha (YYYY-MM-DD). */
export function salaryForDate(annual, payments, date) {
  const m = Number(String(date).slice(5, 7)) - 1;
  const plan = salaryPlan(annual, payments);
  return plan.months[m >= 0 && m < 12 ? m : 0].total;
}

/** Último salario anual registrado por persona (el más reciente manda). */
export function latestSalaries(items) {
  const byPerson = new Map();
  items
    .filter((x) => x.isIncome && x.incomeType === "salary" && Number(x.annualSalary) > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((x) => byPerson.set(x.person, x));
  return [...byPerson.values()]
    .map((x) => ({
      person: x.person,
      color: x.personColor,
      annual: Number(x.annualSalary),
      payments: Number(x.payments) === 14 ? 14 : 12,
      date: x.date,
    }))
    .sort((a, b) => a.person.localeCompare(b.person, "es"));
}
