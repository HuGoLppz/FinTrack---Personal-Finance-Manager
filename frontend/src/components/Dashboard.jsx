import { useMemo } from "react";
import { incomeTypeOf } from "../config/constants";
import { money, monthKey, monthLabel, shortDate } from "../utils/format";
import { groupTotals, sum } from "../utils/movements";
import { ExpenseTypeBadge, IncomeTypeBadge, PersonBadge } from "./Badges";
import PeriodSelect from "./PeriodSelect";

export default function Dashboard({ transactions, months, period, onPeriod, loading, onNavigate, onAdd }) {
  const inPeriod = useMemo(
    () => (period === "all" ? transactions : transactions.filter((x) => monthKey(x.date) === period)),
    [transactions, period],
  );
  const incomes = inPeriod.filter((x) => x.isIncome);
  const expenses = inPeriod.filter((x) => !x.isIncome);
  const income = sum(incomes);
  const expense = sum(expenses);
  const byPerson = groupTotals(incomes, (x) => x.person).map((g) => ({
    ...g,
    color: incomes.find((x) => x.person === g.key).personColor,
  }));
  const byIncomeType = groupTotals(incomes, (x) => x.incomeType);
  const byExpenseType = groupTotals(expenses, (x) => x.expenseType);
  const latest = [...inPeriod].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const maxExpense = byExpenseType[0]?.total || 1;

  if (!loading && !transactions.length) {
    return (
      <section className="panel empty big">
        <h2>Empieza registrando tus ingresos</h2>
        <p>
          Añade el salario de cada persona y tus gastos. Con eso verás el balance, las listas y el
          reparto que te propone el Gestor.
        </p>
        <button className="btn primary" onClick={() => onAdd({ kind: "income" })}>
          Añadir el primer ingreso
        </button>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="ledger">
        <div className="ledger-main">
          <PeriodSelect value={period} months={months} onChange={onPeriod} />
          <p className="ledger-label">Balance de {monthLabel(period).toLowerCase()}</p>
          <strong className="ledger-figure">{money(income - expense)}</strong>
          <p className="ledger-sub">
            <span>+{money(income)} ingresos</span>
            <span>−{money(expense)} gastos</span>
          </p>
        </div>
        <div className="ledger-people">
          <p className="ledger-label">Quién aporta</p>
          {byPerson.length ? (
            <>
              <div className="stackbar" role="img" aria-label="Reparto de ingresos por persona">
                {byPerson.map((p) => (
                  <span key={p.key} style={{ flex: p.total, background: p.color }} title={`${p.key}: ${money(p.total)}`} />
                ))}
              </div>
              <ul className="legend">
                {byPerson.map((p) => (
                  <li key={p.key}>
                    <PersonBadge name={p.key} color={p.color} />
                    <b>{money(p.total)}</b>
                    <small>{Math.round((p.total / income) * 100)}%</small>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="ledger-sub">Sin ingresos en este periodo.</p>
          )}
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <header className="panel-head">
            <h2>Ingresos por tipo</h2>
          </header>
          {byIncomeType.length ? (
            <ul className="bars">
              {byIncomeType.map((g) => {
                const t = incomeTypeOf(g.key);
                return (
                  <li key={g.key}>
                    <div className="bars-top">
                      <IncomeTypeBadge value={g.key} />
                      <b>{money(g.total)}</b>
                    </div>
                    <div className="bar">
                      <span style={{ width: `${(g.total / income) * 100}%`, background: t.fg }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Sin ingresos en este periodo.</p>
          )}
        </section>
        <section className="panel">
          <header className="panel-head">
            <h2>Gastos por tipo</h2>
          </header>
          {byExpenseType.length ? (
            <ul className="bars">
              {byExpenseType.map((g) => (
                <li key={g.key}>
                  <div className="bars-top">
                    <ExpenseTypeBadge value={g.key} />
                    <b>{money(g.total)}</b>
                  </div>
                  <div className="bar">
                    <span className="expense-bar" style={{ width: `${(g.total / maxExpense) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Sin gastos en este periodo.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <div>
            <h2>Últimos movimientos</h2>
            <p className="sub">{monthLabel(period)}</p>
          </div>
          <button className="btn ghost" onClick={() => onNavigate("movimientos/todos")}>
            Ver todos
          </button>
        </header>
        {latest.length ? (
          <ul className="rows compact">
            {latest.map((x) => (
              <li className="row" key={x.id}>
                <i className={`dir ${x.isIncome ? "income" : "expense"}`} aria-hidden="true">
                  {x.isIncome ? "↑" : "↓"}
                </i>
                <div className="row-main">
                  <strong>
                    {x.description ||
                      (x.isIncome ? incomeTypeOf(x.incomeType).label : x.category || x.expenseType)}
                  </strong>
                  <span className="row-tags">
                    {x.isIncome ? (
                      <>
                        <PersonBadge name={x.person} color={x.personColor} />
                        <IncomeTypeBadge value={x.incomeType} />
                      </>
                    ) : (
                      <ExpenseTypeBadge value={x.expenseType} />
                    )}
                  </span>
                </div>
                <time dateTime={x.date}>{shortDate(x.date)}</time>
                <b className={`amt ${x.isIncome ? "income" : "expense"}`}>
                  {x.isIncome ? "+" : "−"}
                  {money(x.amount)}
                </b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No hay movimientos en este periodo.</p>
        )}
      </section>
    </div>
  );
}
