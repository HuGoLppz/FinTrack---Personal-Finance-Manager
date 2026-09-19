import { useEffect, useId, useMemo, useState } from "react";
import { FALLBACK_INCOME_TYPE, INCOME_TYPES, PAYMENT_OPTIONS, incomeTypeOf } from "../config/constants";
import { money, personColor, todayISO } from "../utils/format";
import { salaryForDate, salaryPlan } from "../utils/salary";
import { ExpenseTypeBadge, IncomeTypeBadge, PersonBadge } from "./Badges";

const fresh = (preset = {}) => ({
  kind: "expense",
  amount: "",
  category: "",
  expenseType: "",
  description: "",
  date: todayISO(),
  person: "",
  incomeType: "salary",
  annualSalary: "",
  payments: 12,
  ...preset,
});

const fromTransaction = (t) =>
  fresh({
    kind: t.isIncome ? "income" : "expense",
    amount: t.amount,
    category: t.category || "",
    expenseType: t.expenseType === "Sin tipo" ? "" : t.expenseType,
    description: t.description || "",
    date: t.date || todayISO(),
    person: t.person === "Sin asignar" ? "" : t.person,
    incomeType: t.incomeType,
    annualSalary: t.annualSalary || "",
    payments: Number(t.payments) === 14 ? 14 : 12,
  });

export default function TransactionForm({
  transaction,
  preset,
  people,
  expenseTypes,
  onSubmit,
  onClose,
}) {
  const uid = useId();
  const [data, setData] = useState(() => (transaction ? fromTransaction(transaction) : fresh(preset)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const change = (e) => set({ [e.target.name]: e.target.value });

  const isIncome = data.kind === "income";
  const isSalary = isIncome && data.incomeType === "salary";
  const plan = useMemo(
    () => salaryPlan(data.annualSalary, data.payments),
    [data.annualSalary, data.payments],
  );
  const salaryAmount = isSalary ? salaryForDate(data.annualSalary, data.payments, data.date) : 0;
  const newType =
    !isIncome &&
    data.expenseType.trim() &&
    !expenseTypes.some((t) => t.toLowerCase() === data.expenseType.trim().toLowerCase());

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    let values;
    if (isIncome) {
      if (!data.person.trim()) return setError("Indica a qué persona corresponde el ingreso.");
      if (isSalary && !(Number(data.annualSalary) > 0))
        return setError("Indica cuánto se gana al año.");
      values = {
        type: "income",
        amount: isSalary ? salaryAmount : Number(data.amount),
        // category se mantiene por compatibilidad con movimientos antiguos
        category: incomeTypeOf(data.incomeType).label,
        description: data.description.trim(),
        date: data.date,
        person: data.person.trim(),
        incomeType: data.incomeType,
        ...(isSalary
          ? { annualSalary: Number(data.annualSalary), payments: Number(data.payments) }
          : {}),
      };
    } else {
      if (!data.expenseType.trim()) return setError("Indica el tipo de gasto.");
      values = {
        type: "expense",
        amount: Number(data.amount),
        category: data.category.trim(),
        description: data.description.trim(),
        date: data.date,
        expenseType: data.expenseType.trim(),
      };
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch {
      setError("No se ha podido guardar. Comprueba que la API está activa e inténtalo de nuevo.");
      setSaving(false);
    }
  };

  const extraTotal = plan.months.find((m) => m.extra > 0)?.total;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
        <header className="modal-head">
          <h2 id={`${uid}-t`}>{transaction ? "Editar movimiento" : "Nuevo movimiento"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <form onSubmit={submit} className="form">
          <div className="seg" role="group" aria-label="Tipo de movimiento">
            <button
              type="button"
              className={!isIncome ? "on expense" : ""}
              aria-pressed={!isIncome}
              onClick={() => set({ kind: "expense" })}
            >
              ↓ Gasto
            </button>
            <button
              type="button"
              className={isIncome ? "on income" : ""}
              aria-pressed={isIncome}
              onClick={() => set({ kind: "income" })}
            >
              ↑ Ingreso
            </button>
          </div>

          {isIncome && (
            <>
              <div className="field">
                <label htmlFor={`${uid}-person`}>Persona</label>
                <input
                  id={`${uid}-person`}
                  name="person"
                  list={`${uid}-people`}
                  placeholder="Nombre de la persona"
                  value={data.person}
                  onChange={change}
                  autoComplete="off"
                  required
                />
                <datalist id={`${uid}-people`}>
                  {people.map((p) => (
                    <option key={p.name} value={p.name} />
                  ))}
                </datalist>
                <div className="chips">
                  {people.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      className={`chip ${data.person === p.name ? "on" : ""}`}
                      onClick={() => set({ person: p.name })}
                    >
                      <PersonBadge name={p.name} color={p.color} />
                    </button>
                  ))}
                  {data.person.trim() && !people.some((p) => p.name === data.person.trim()) && (
                    <span className="hint inline">
                      <PersonBadge name={data.person.trim()} color={personColor(data.person.trim())} />{" "}
                      persona nueva
                    </span>
                  )}
                </div>
              </div>

              <div className="field">
                <span className="label">Tipo de ingreso</span>
                <div className="chips">
                  {(data.incomeType === "other" ? [...INCOME_TYPES, FALLBACK_INCOME_TYPE] : INCOME_TYPES).map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      className={`chip ${data.incomeType === t.value ? "on" : ""}`}
                      aria-pressed={data.incomeType === t.value}
                      onClick={() => set({ incomeType: t.value })}
                    >
                      <IncomeTypeBadge value={t.value} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {isSalary ? (
            <>
              <div className="two">
                <div className="field">
                  <label htmlFor={`${uid}-annual`}>Salario anual (bruto o neto, como prefieras)</label>
                  <div className="amount">
                    <span>€</span>
                    <input
                      id={`${uid}-annual`}
                      name="annualSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={data.annualSalary}
                      onChange={change}
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <span className="label">Pagas al año</span>
                  <div className="seg small" role="group" aria-label="Número de pagas">
                    {PAYMENT_OPTIONS.map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={data.payments === n ? "on" : ""}
                        aria-pressed={data.payments === n}
                        onClick={() => set({ payments: n })}
                      >
                        {n} pagas
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="calc" aria-live="polite">
                {plan.annual > 0 ? (
                  plan.payments === 12 ? (
                    <>
                      <strong>{money(plan.months[0].total)}</strong> al mes durante 12 meses.
                    </>
                  ) : (
                    <>
                      <strong>{money(plan.months[0].total)}</strong> al mes, y en{" "}
                      {plan.extraMonths.join(" y ").toLowerCase()} cobras además la paga
                      extra: <strong>{money(extraTotal)}</strong> esos meses.
                    </>
                  )
                ) : (
                  "Introduce el salario anual para calcular lo que cobras cada mes."
                )}
                {plan.annual > 0 && (
                  <div className="calc-row">
                    Este movimiento (mes de la fecha elegida):{" "}
                    <strong>{money(salaryAmount)}</strong>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="field">
              <label htmlFor={`${uid}-amount`}>Importe</label>
              <div className="amount">
                <span>€</span>
                <input
                  id={`${uid}-amount`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={data.amount}
                  onChange={change}
                  required
                />
              </div>
            </div>
          )}

          {!isIncome && (
            <>
              <div className="field">
                <label htmlFor={`${uid}-etype`}>Tipo de gasto</label>
                <input
                  id={`${uid}-etype`}
                  name="expenseType"
                  list={`${uid}-etypes`}
                  placeholder="Ej. Vital, Suscripción, Capricho…"
                  value={data.expenseType}
                  onChange={change}
                  autoComplete="off"
                  required
                />
                <datalist id={`${uid}-etypes`}>
                  {expenseTypes.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <div className="chips">
                  {expenseTypes.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`chip ${data.expenseType.trim() === t ? "on" : ""}`}
                      onClick={() => set({ expenseType: t })}
                    >
                      <ExpenseTypeBadge value={t} />
                    </button>
                  ))}
                </div>
                <p className="hint">
                  {newType
                    ? `Se creará el tipo «${data.expenseType.trim()}» y quedará disponible para próximos gastos.`
                    : expenseTypes.length
                      ? "Elige uno existente o escribe uno nuevo."
                      : "Aún no hay tipos. Escribe el primero, por ejemplo «Vital»."}
                </p>
              </div>
              <div className="field">
                <label htmlFor={`${uid}-cat`}>
                  Categoría <small>opcional</small>
                </label>
                <input
                  id={`${uid}-cat`}
                  name="category"
                  placeholder="Ej. Alimentación"
                  value={data.category}
                  onChange={change}
                />
              </div>
            </>
          )}

          <div className="two">
            <div className="field">
              <label htmlFor={`${uid}-desc`}>
                Descripción <small>opcional</small>
              </label>
              <input
                id={`${uid}-desc`}
                name="description"
                placeholder="Añade una nota"
                value={data.description}
                onChange={change}
              />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-date`}>Fecha</label>
              <input
                id={`${uid}-date`}
                name="date"
                type="date"
                value={data.date}
                onChange={change}
                required
              />
            </div>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <footer className="modal-foot">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn primary" disabled={saving}>
              {saving ? "Guardando…" : transaction ? "Guardar cambios" : "Guardar movimiento"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
