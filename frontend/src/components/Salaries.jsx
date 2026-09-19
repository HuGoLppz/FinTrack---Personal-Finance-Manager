import { useMemo } from "react";
import { MONTHS } from "../config/constants";
import { money } from "../utils/format";
import { salaryPlan } from "../utils/salary";
import { PersonBadge } from "./Badges";

export default function Salaries({ salaries, onAdd }) {
  const plans = useMemo(
    () => salaries.map((s) => ({ ...s, plan: salaryPlan(s.annual, s.payments) })),
    [salaries],
  );
  const totalByMonth = MONTHS.map((_, i) => plans.reduce((a, p) => a + p.plan.months[i].total, 0));
  const totalAnnual = plans.reduce((a, p) => a + p.annual, 0);

  if (!plans.length) {
    return (
      <section className="panel empty big">
        <h2>Aún no hay salarios</h2>
        <p>
          Al registrar un ingreso de tipo Salario indicas cuánto se gana al año y si son 12 o 14
          pagas; aquí verás lo que corresponde cobrar cada mes.
        </p>
        <button className="btn primary" onClick={() => onAdd({ kind: "income", incomeType: "salary" })}>
          Añadir un salario
        </button>
      </section>
    );
  }

  return (
    <div className="stack">
      <div className="cards">
        {plans.map((p) => (
          <article className="card person-card" key={p.person} style={{ "--pc": p.color }}>
            <PersonBadge name={p.person} color={p.color} />
            <strong className="big-num">{money(p.annual)}</strong>
            <p className="muted">al año en {p.payments} pagas</p>
            <dl className="kv">
              <div>
                <dt>{p.payments === 14 ? "Paga ordinaria" : "Cada mes"}</dt>
                <dd>{money(p.plan.months[0].total)}</dd>
              </div>
              {p.payments === 14 && (
                <div>
                  <dt>Meses con paga extra</dt>
                  <dd>
                    {money(p.plan.months.find((m) => m.extra > 0).total)}
                    <small> en {p.plan.extraMonths.join(" y ").toLowerCase()}</small>
                  </dd>
                </div>
              )}
              <div>
                <dt>Media mensual</dt>
                <dd>{money(p.plan.average)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2>Lo que se cobra cada mes</h2>
            <p className="sub">Según el último salario registrado de cada persona.</p>
          </div>
          <button className="btn primary" onClick={() => onAdd({ kind: "income", incomeType: "salary" })}>
            + Salario
          </button>
        </header>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Mes</th>
                {plans.map((p) => (
                  <th scope="col" key={p.person} className="num">
                    <PersonBadge name={p.person} color={p.color} />
                  </th>
                ))}
                {plans.length > 1 && (
                  <th scope="col" className="num">
                    Total
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, i) => (
                <tr key={m}>
                  <th scope="row">{m}</th>
                  {plans.map((p) => {
                    const row = p.plan.months[i];
                    return (
                      <td key={p.person} className="num">
                        {money(row.total)}
                        {row.extra > 0 && <span className="extra">con paga extra</span>}
                      </td>
                    );
                  })}
                  {plans.length > 1 && <td className="num strong">{money(totalByMonth[i])}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total anual</th>
                {plans.map((p) => (
                  <td key={p.person} className="num">
                    {money(p.annual)}
                  </td>
                ))}
                {plans.length > 1 && <td className="num strong">{money(totalAnnual)}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
