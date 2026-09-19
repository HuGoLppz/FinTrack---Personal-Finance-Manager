import { useMemo, useState } from "react";
import { INCOME_TYPES, incomeTypeOf } from "../config/constants";
import { money, shortDate } from "../utils/format";
import { SORTS, applyFilters, sum } from "../utils/movements";
import { ExpenseTypeBadge, IncomeTypeBadge, PersonBadge } from "./Badges";

const COPY = {
  expense: {
    title: "Gastos",
    empty: "Aún no hay gastos",
    emptyHint: "Registra tu primer gasto para verlo aquí.",
  },
  income: {
    title: "Ingresos",
    empty: "Aún no hay ingresos",
    emptyHint: "Registra un ingreso y a qué persona corresponde.",
  },
  all: {
    title: "Ingresos y gastos",
    empty: "Aún no hay movimientos",
    emptyHint: "Registra tu primer ingreso o gasto para verlo aquí.",
  },
};

const blank = { q: "", kind: "", person: "", from: "", to: "", sort: "date-desc" };

export default function MovementList({
  mode,
  transactions,
  people,
  loading,
  onEdit,
  onDelete,
  onAdd,
}) {
  const copy = COPY[mode];
  const [f, setF] = useState(blank);
  const [confirming, setConfirming] = useState(null);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));

  const base = useMemo(
    () =>
      transactions.filter((x) =>
        mode === "all" ? true : mode === "income" ? x.isIncome : !x.isIncome,
      ),
    [transactions, mode],
  );

  const incomeTypesUsed = useMemo(() => {
    const used = new Set(base.filter((x) => x.isIncome).map((x) => x.incomeType));
    const known = INCOME_TYPES.map((t) => t.value);
    return [...known, ...[...used].filter((v) => !known.includes(v))];
  }, [base]);
  const expenseTypesUsed = useMemo(
    () => [...new Set(base.filter((x) => !x.isIncome).map((x) => x.expenseType))].sort((a, b) => a.localeCompare(b, "es")),
    [base],
  );

  const rows = useMemo(
    () => applyFilters(base, f, (v) => incomeTypeOf(v).label),
    [base, f],
  );
  const incomeTotal = sum(rows.filter((x) => x.isIncome));
  const expenseTotal = sum(rows.filter((x) => !x.isIncome));
  const dirty = JSON.stringify(f) !== JSON.stringify(blank);
  const showPerson = mode !== "expense";

  const remove = async (id) => {
    setConfirming(null);
    await onDelete(id);
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <div>
          <h2>{copy.title}</h2>
          <p className="sub">
            {rows.length === base.length
              ? `${base.length} ${base.length === 1 ? "movimiento" : "movimientos"}`
              : `${rows.length} de ${base.length} movimientos`}
          </p>
        </div>
        <button className="btn primary" onClick={() => onAdd(mode === "income" ? { kind: "income" } : {})}>
          + Añadir
        </button>
      </header>

      <div className="filters" role="search">
        <label className="grow">
          <span>Buscar</span>
          <input
            type="search"
            placeholder="Descripción, persona, tipo…"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
          />
        </label>
        <label>
          <span>Tipo</span>
          <select value={f.kind} onChange={(e) => set({ kind: e.target.value })}>
            <option value="">Todos los tipos</option>
            {mode !== "expense" && (
              <optgroup label="Ingresos">
                {incomeTypesUsed.map((v) => (
                  <option key={v} value={`i:${v}`}>
                    {incomeTypeOf(v).label}
                  </option>
                ))}
              </optgroup>
            )}
            {mode !== "income" && expenseTypesUsed.length > 0 && (
              <optgroup label="Gastos">
                {expenseTypesUsed.map((t) => (
                  <option key={t} value={`e:${t}`}>
                    {t}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        {showPerson && (
          <label>
            <span>Persona</span>
            <select value={f.person} onChange={(e) => set({ person: e.target.value })}>
              <option value="">Todas</option>
              {people.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span>Desde</span>
          <input type="date" value={f.from} max={f.to || undefined} onChange={(e) => set({ from: e.target.value })} />
        </label>
        <label>
          <span>Hasta</span>
          <input type="date" value={f.to} min={f.from || undefined} onChange={(e) => set({ to: e.target.value })} />
        </label>
        <label>
          <span>Ordenar por</span>
          <select value={f.sort} onChange={(e) => set({ sort: e.target.value })}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {dirty && (
          <button className="btn link" onClick={() => setF(blank)}>
            Quitar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty">Cargando tus movimientos…</div>
      ) : !base.length ? (
        <div className="empty">
          <h3>{copy.empty}</h3>
          <p>{copy.emptyHint}</p>
        </div>
      ) : !rows.length ? (
        <div className="empty">
          <h3>Ningún movimiento coincide</h3>
          <p>Prueba a cambiar o quitar algún filtro.</p>
        </div>
      ) : (
        <>
          <ul className="rows">
            {rows.map((x) => (
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
                        {x.incomeType === "salary" && Number(x.payments) > 0 && (
                          <span className="meta">{x.payments} pagas</span>
                        )}
                      </>
                    ) : (
                      <>
                        <ExpenseTypeBadge value={x.expenseType} />
                        {x.category && <span className="meta">{x.category}</span>}
                      </>
                    )}
                  </span>
                </div>
                <time dateTime={x.date}>{shortDate(x.date)}</time>
                <b className={`amt ${x.isIncome ? "income" : "expense"}`}>
                  {x.isIncome ? "+" : "−"}
                  {money(x.amount)}
                </b>
                <div className="row-actions">
                  {confirming === x.id ? (
                    <>
                      <button className="btn tiny danger" onClick={() => remove(x.id)}>
                        Eliminar
                      </button>
                      <button className="btn tiny ghost" onClick={() => setConfirming(null)}>
                        No
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn tiny ghost" onClick={() => onEdit(x)}>
                        Editar
                      </button>
                      <button
                        className="btn tiny ghost"
                        onClick={() => setConfirming(x.id)}
                        aria-label={`Eliminar ${x.description || x.category || "movimiento"}`}
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <footer className="list-total">
            {mode !== "expense" && (
              <span>
                Ingresos <b className="income">+{money(incomeTotal)}</b>
              </span>
            )}
            {mode !== "income" && (
              <span>
                Gastos <b className="expense">−{money(expenseTotal)}</b>
              </span>
            )}
            {mode === "all" && (
              <span>
                Balance <b>{money(incomeTotal - expenseTotal)}</b>
              </span>
            )}
          </footer>
        </>
      )}
    </section>
  );
}
