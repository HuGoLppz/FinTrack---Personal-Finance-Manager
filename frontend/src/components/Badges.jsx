import { incomeTypeOf } from "../config/constants";
import { expenseTagColor, initial } from "../utils/format";

const glyphs = {
  salary: (
    <>
      <rect x="2" y="4" width="12" height="8" rx="1.5" />
      <circle cx="8" cy="8" r="1.7" />
    </>
  ),
  tip: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.5v5M5.5 8h5" />
    </>
  ),
  gift: (
    <>
      <rect x="2.5" y="6.2" width="11" height="7.3" rx="1" />
      <path d="M2 6.2h12M8 6.2v7.3M8 6.2C7 3 4 3.4 4.6 5.1 4.9 6 6.5 6.2 8 6.2zM8 6.2C9 3 12 3.4 11.4 5.1 11.1 6 9.5 6.2 8 6.2z" />
    </>
  ),
  aid: <path d="M8 13.2S3 10 3 6.6A2.9 2.9 0 018 5.1a2.9 2.9 0 015 1.5C13 10 8 13.2 8 13.2z" />,
  other: <circle cx="8" cy="8" r="2.5" />,
};

export function Glyph({ name }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphs[name] || glyphs.other}
    </svg>
  );
}

/** Distintivo de persona: círculo con inicial + nombre, en el color de esa persona. */
export function PersonBadge({ name, color, compact = false }) {
  return (
    <span className="person" style={{ "--pc": color }} title={compact ? name : undefined}>
      <i>{initial(name)}</i>
      {!compact && name}
    </span>
  );
}

/** Distintivo del tipo de ingreso (Salario, Propina, Regalo, Ayuda…). */
export function IncomeTypeBadge({ value }) {
  const t = incomeTypeOf(value);
  return (
    <span className="tag" style={{ "--bg": t.bg, "--fg": t.fg }}>
      <Glyph name={t.value} />
      {t.label}
    </span>
  );
}

/** Etiqueta del tipo de gasto (nombre libre puesto por el usuario). */
export function ExpenseTypeBadge({ value }) {
  const c = expenseTagColor(value);
  return (
    <span className="tag tag-expense" style={{ "--bg": c.bg, "--fg": c.fg }}>
      {value}
    </span>
  );
}
