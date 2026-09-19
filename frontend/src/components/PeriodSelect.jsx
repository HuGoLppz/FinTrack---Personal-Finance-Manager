import { monthLabel } from "../utils/format";

export default function PeriodSelect({ value, months, onChange, allowAll = true, label = "Periodo" }) {
  return (
    <label className="period">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {allowAll && <option value="all">Todo el histórico</option>}
        {months.map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
    </label>
  );
}
