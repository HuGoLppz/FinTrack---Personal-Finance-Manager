import { useCallback, useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard";
import Manager from "./components/Manager";
import MovementList from "./components/MovementList";
import Salaries from "./components/Salaries";
import TransactionForm from "./components/TransactionForm";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "./services/transactionService";
import { monthKey } from "./utils/format";
import { normalize } from "./utils/movements";
import { latestSalaries } from "./utils/salary";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "movimientos", label: "Movimientos" },
  { id: "salarios", label: "Salarios" },
  { id: "gestor", label: "Gestor" },
];
const LISTS = [
  { id: "todos", label: "Ingresos y gastos", mode: "all" },
  { id: "gastos", label: "Gastos", mode: "expense" },
  { id: "ingresos", label: "Ingresos", mode: "income" },
];

const readHash = () => window.location.hash.replace(/^#\/?/, "") || "resumen";

export default function App() {
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [period, setPeriod] = useState(null);
  const [route, setRoute] = useState(readHash);

  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = useCallback((path) => {
    window.location.hash = `/${path}`;
    window.scrollTo({ top: 0 });
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setRaw(await getTransactions());
      setError("");
    } catch {
      setError(
        "No hemos podido conectar con tus movimientos. Comprueba que la API está activa.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const transactions = useMemo(() => raw.map(normalize), [raw]);

  const people = useMemo(() => {
    const m = new Map();
    transactions.forEach((x) => {
      if (x.isIncome && x.person !== "Sin asignar" && !m.has(x.person))
        m.set(x.person, x.personColor);
    });
    return [...m]
      .map(([name, color]) => ({ name, color }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [transactions]);

  const expenseTypes = useMemo(
    () =>
      [
        ...new Set(
          transactions
            .filter((x) => !x.isIncome && x.expenseType !== "Sin tipo")
            .map((x) => x.expenseType),
        ),
      ].sort((a, b) => a.localeCompare(b, "es")),
    [transactions],
  );

  const salaries = useMemo(() => latestSalaries(transactions), [transactions]);

  const months = useMemo(
    () =>
      [...new Set(transactions.map((x) => monthKey(x.date)).filter(Boolean))]
        .sort()
        .reverse(),
    [transactions],
  );
  const currentMonth = monthKey(new Date().toISOString());
  const effectivePeriod =
    period ??
    (months.includes(currentMonth) ? currentMonth : months[0] || "all");

  const submitForm = async (values) => {
    const editing = form.transaction;
    const item = editing
      ? await updateTransaction(editing.id, values)
      : await createTransaction(values);
    setRaw((all) =>
      editing ? all.map((x) => (x.id === item.id ? item : x)) : [item, ...all],
    );
    setForm(null);
  };

  const remove = async (id) => {
    try {
      await deleteTransaction(id);
      setRaw((all) => all.filter((x) => x.id !== id));
    } catch {
      setError("No se ha podido eliminar el movimiento.");
    }
  };

  const openForm = (preset = {}, transaction = null) =>
    setForm({ preset, transaction });

  const [section, sub] = route.split("/");
  const tab = TABS.some((t) => t.id === section) ? section : "resumen";
  const list = LISTS.find((l) => l.id === sub) || LISTS[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/resumen">
          <i>F</i>FinTrack
        </a>
        <nav aria-label="Secciones">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#/${t.id}`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              {t.label}
            </a>
          ))}
        </nav>
        <button className="btn primary add" onClick={() => openForm()}>
          + Nuevo movimiento
        </button>
      </header>

      <main>
        {error && (
          <div className="notice" role="alert">
            {error}
            <button className="btn tiny ghost" onClick={load}>
              Reintentar
            </button>
          </div>
        )}

        {tab === "resumen" && (
          <Dashboard
            transactions={transactions}
            months={months}
            period={effectivePeriod}
            onPeriod={setPeriod}
            loading={loading}
            onNavigate={go}
            onAdd={openForm}
          />
        )}

        {tab === "movimientos" && (
          <>
            <div
              className="subtabs"
              role="tablist"
              aria-label="Listas de movimientos"
            >
              {LISTS.map((l) => (
                <a
                  key={l.id}
                  href={`#/movimientos/${l.id}`}
                  role="tab"
                  aria-selected={list.id === l.id}
                >
                  {l.label}
                </a>
              ))}
            </div>
            <MovementList
              key={list.id}
              mode={list.mode}
              transactions={transactions}
              people={people}
              loading={loading}
              onEdit={(x) => openForm({}, x)}
              onDelete={remove}
              onAdd={openForm}
            />
          </>
        )}

        {tab === "salarios" && (
          <Salaries salaries={salaries} onAdd={openForm} />
        )}

        {tab === "gestor" && (
          <Manager
            transactions={transactions}
            people={people}
            salaries={salaries}
          />
        )}
      </main>

      {form && (
        <TransactionForm
          transaction={form.transaction}
          preset={form.preset}
          people={people}
          expenseTypes={expenseTypes}
          onSubmit={submitForm}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
