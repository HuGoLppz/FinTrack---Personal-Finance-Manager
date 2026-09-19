import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SPLIT } from "../config/constants";
import { money, monthKey } from "../utils/format";
import { sum } from "../utils/movements";
import { PersonBadge } from "./Badges";
import PeriodSelect from "./PeriodSelect";

const STORAGE_KEY = "fintrack.manager.split";
const loadSplit = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return Object.fromEntries(DEFAULT_SPLIT.map((b) => [b.key, Number.isFinite(saved[b.key]) ? saved[b.key] : b.pct]));
  } catch {
    return Object.fromEntries(DEFAULT_SPLIT.map((b) => [b.key, b.pct]));
  }
};
const round1 = (n) => Math.round(n * 10) / 10;

export default function Manager({ transactions, people, salaries }) {
  const incomeMonths = useMemo(
    () => [...new Set(transactions.filter((x) => x.isIncome).map((x) => monthKey(x.date)))].sort().reverse(),
    [transactions],
  );
  const currentMonth = monthKey(new Date().toISOString());
  const [mode, setMode] = useState("month");
  const [month, setMonth] = useState("");
  const [person, setPerson] = useState("");
  const [custom, setCustom] = useState("");
  const [pcts, setPcts] = useState(loadSplit);

  const activeMonth = month || (incomeMonths.includes(currentMonth) ? currentMonth : incomeMonths[0] || "");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pcts));
    } catch {
      /* sin almacenamiento: el reparto solo dura la sesión */
    }
  }, [pcts]);

  const monthIncomes = transactions.filter(
    (x) => x.isIncome && monthKey(x.date) === activeMonth && (!person || x.person === person),
  );
  const salaryBase = salaries
    .filter((s) => !person || s.person === person)
    .reduce((a, s) => a + s.annual / 12, 0);

  const base = mode === "month" ? sum(monthIncomes) : mode === "salaries" ? salaryBase : Number(custom) || 0;

  const buckets = DEFAULT_SPLIT.map((b) => ({ ...b, pct: pcts[b.key], amount: (base * (pcts[b.key] || 0)) / 100 }));
  const totalPct = round1(buckets.reduce((a, b) => a + (Number(b.pct) || 0), 0));
  const spend = buckets.filter((b) => b.group === "spend");
  const keep = buckets.filter((b) => b.group === "keep");
  const spendAmount = sum(spend);
  const keepAmount = sum(keep);
  const spendPct = round1(spend.reduce((a, b) => a + b.pct, 0));
  const keepPct = round1(keep.reduce((a, b) => a + b.pct, 0));
  const invest = buckets.find((b) => b.key === "invest");
  const savings = buckets.find((b) => b.key === "savings");

  const real =
    mode === "month" && !person
      ? sum(transactions.filter((x) => !x.isIncome && monthKey(x.date) === activeMonth))
      : null;
  const left = real === null ? 0 : spendAmount - real;

  const setPct = (key, value) =>
    setPcts((p) => ({ ...p, [key]: value === "" ? 0 : Math.min(100, Math.max(0, Number(value))) }));

  return (
    <div className="stack">
      <section className="panel">
        <header className="panel-head">
          <div>
            <h2>Gestor</h2>
            <p className="sub">Reparte tus ingresos entre gasto, ahorro e inversión con porcentajes.</p>
          </div>
          <button
            className="btn ghost"
            onClick={() => setPcts(Object.fromEntries(DEFAULT_SPLIT.map((b) => [b.key, b.pct])))}
          >
            Restablecer porcentajes
          </button>
        </header>

        <div className="filters">
          <label>
            <span>Calcular sobre</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="month">Ingresos registrados de un mes</option>
              <option value="salaries">Salario mensual medio (anual ÷ 12)</option>
              <option value="custom">Otra cantidad</option>
            </select>
          </label>
          {mode === "month" && (
            <PeriodSelect value={activeMonth} months={incomeMonths} onChange={setMonth} allowAll={false} label="Mes" />
          )}
          {mode === "custom" && (
            <label>
              <span>Ingreso mensual</span>
              <input type="number" min="0" step="0.01" placeholder="0,00" value={custom} onChange={(e) => setCustom(e.target.value)} />
            </label>
          )}
          {mode !== "custom" && (
            <label>
              <span>Personas</span>
              <select value={person} onChange={(e) => setPerson(e.target.value)}>
                <option value="">Todas juntas</option>
                {people.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {mode !== "custom" && person && (
          <p className="sub who">
            Solo ingresos de{" "}
            <PersonBadge name={person} color={people.find((p) => p.name === person)?.color} />
          </p>
        )}

        {base <= 0 ? (
          <div className="empty">
            <h3>No hay ingresos para calcular</h3>
            <p>
              {mode === "salaries"
                ? "Registra un salario anual para calcular sobre la media mensual."
                : mode === "custom"
                  ? "Escribe una cantidad mensual para ver el reparto."
                  : "Elige un mes con ingresos o registra uno nuevo."}
            </p>
          </div>
        ) : (
          <>
            <div className="split-hero">
              <div className="split-card spend">
                <p>Puedes gastar</p>
                <strong>{money(spendAmount)}</strong>
                <small>{spendPct}% de {money(base)}</small>
              </div>
              <div className="split-card keep">
                <p>Deberías dejar de gastar</p>
                <strong>{money(keepAmount)}</strong>
                <small>{keepPct}%: ahorro, inversión y colchón</small>
              </div>
            </div>

            <div className="stackbar tall" role="img" aria-label="Reparto porcentual">
              {buckets.map((b) => (
                <span key={b.key} style={{ flex: Math.max(b.pct, 0), background: b.color }} title={`${b.label}: ${b.pct}%`} />
              ))}
            </div>
            <ul className="legend inline">
              {buckets.map((b) => (
                <li key={b.key}>
                  <span className="swatch" style={{ background: b.color }} />
                  {b.label}
                </li>
              ))}
            </ul>

            {totalPct !== 100 && (
              <div className="notice warn" role="status">
                Los porcentajes suman {totalPct}%.{" "}
                {totalPct > 100 ? `Sobran ${round1(totalPct - 100)} puntos.` : `Faltan ${round1(100 - totalPct)} puntos.`} Ajusta
                los valores para repartir exactamente el 100%.
              </div>
            )}

            <div className="buckets">
              {buckets.map((b) => (
                <article className="bucket" key={b.key} style={{ "--bc": b.color }}>
                  <header>
                    <span className="swatch" style={{ background: b.color }} />
                    <h3>{b.key === "invest" ? "Invertir al mes" : b.key === "savings" ? "Deberías ahorrar" : b.label}</h3>
                  </header>
                  <strong>{money(b.amount)}</strong>
                  <p className="muted">
                    {b.group === "spend" ? "Dinero para gastar" : "Dinero que no se gasta"}
                    {b.key === "invest" && ` · ${money(b.amount * 12)} al año`}
                    {b.key === "savings" && ` · ${money(b.amount * 12)} al año`}
                  </p>
                  <label className="pct">
                    <span>Porcentaje</span>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={b.pct}
                        onChange={(e) => setPct(b.key, e.target.value)}
                        aria-label={`Porcentaje de ${b.label}`}
                      />
                      <em>%</em>
                    </div>
                  </label>
                </article>
              ))}
            </div>

            <p className="sub summary-line">
              De {money(base)} al mes: gastar {money(spendAmount)}, ahorrar {money(savings.amount)}, invertir{" "}
              {money(invest.amount)} y dejar {money(buckets.find((b) => b.key === "buffer").amount)} de colchón.
            </p>
          </>
        )}
      </section>

      {base > 0 && real !== null && (
        <section className="panel">
          <header className="panel-head">
            <div>
              <h2>Tus gastos reales frente al reparto</h2>
              <p className="sub">Gastos registrados del mes frente a lo que puedes gastar.</p>
            </div>
          </header>
          <div className="compare">
            <div>
              <span className="muted">Has gastado</span>
              <strong className="expense">{money(real)}</strong>
            </div>
            <div>
              <span className="muted">Puedes gastar</span>
              <strong>{money(spendAmount)}</strong>
            </div>
            <div>
              <span className="muted">{left >= 0 ? "Te quedan" : "Te has pasado"}</span>
              <strong className={left >= 0 ? "income" : "expense"}>{money(Math.abs(left))}</strong>
            </div>
          </div>
          <div className="meter" role="img" aria-label={`Has gastado el ${Math.round((real / spendAmount) * 100 || 0)}% de lo previsto`}>
            <span
              className={left >= 0 ? "" : "over"}
              style={{ width: `${Math.min((real / (spendAmount || 1)) * 100, 100)}%` }}
            />
          </div>
          <p className="sub">
            {left >= 0
              ? `Vas al ${Math.round((real / (spendAmount || 1)) * 100)}% de tu límite de gasto.`
              : `Superas tu límite en ${money(-left)}: eso reduce lo que puedes ahorrar o invertir este mes.`}{" "}
            Ahorro real del mes: {money(base - real)} (recomendado: {money(keepAmount)}).
          </p>
        </section>
      )}
    </div>
  );
}
