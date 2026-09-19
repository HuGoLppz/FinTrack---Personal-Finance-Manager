const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const INCOME_TYPES = new Set(["salary", "tip", "gift", "aid", "other"]);

app.use(cors());
app.use(express.json({ limit: "100kb" }));

const isValidDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};

const cleanText = (value, field, { required = false, max = 120 } = {}) => {
  if (value == null) {
    if (required) throw new Error(`${field} es obligatorio`);
    return null;
  }
  if (typeof value !== "string") throw new Error(`${field} debe ser texto`);
  const text = value.trim();
  if (required && !text) throw new Error(`${field} es obligatorio`);
  if (text.length > max)
    throw new Error(`${field} no puede superar ${max} caracteres`);
  return text || null;
};

function validateTransaction(body) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new Error("El cuerpo de la petición no es válido");
  const { type } = body;
  if (!["income", "expense"].includes(type))
    throw new Error("El tipo debe ser 'income' o 'expense'");
  if (
    typeof body.amount !== "number" ||
    !Number.isFinite(body.amount) ||
    body.amount <= 0
  ) {
    throw new Error("El importe debe ser un número mayor que 0");
  }
  if (!isValidDate(body.date))
    throw new Error("La fecha debe tener el formato YYYY-MM-DD y ser válida");

  const common = {
    type,
    amount: Math.round(body.amount * 100) / 100,
    category: cleanText(body.category, "La categoría", { max: 120 }) || "",
    description: cleanText(body.description, "La descripción", { max: 500 }),
    date: body.date,
    person: null,
    incomeType: null,
    expenseType: null,
    annualSalary: null,
    payments: null,
  };

  if (type === "expense") {
    common.expenseType = cleanText(body.expenseType, "El tipo de gasto", {
      required: true,
      max: 120,
    });
    return common;
  }

  common.person = cleanText(body.person, "La persona", {
    required: true,
    max: 120,
  });
  if (
    typeof body.incomeType !== "string" ||
    !INCOME_TYPES.has(body.incomeType)
  ) {
    throw new Error("El tipo de ingreso no es válido");
  }
  common.incomeType = body.incomeType;
  if (body.incomeType === "salary") {
    if (
      typeof body.annualSalary !== "number" ||
      !Number.isFinite(body.annualSalary) ||
      body.annualSalary <= 0
    ) {
      throw new Error("El salario anual debe ser un número mayor que 0");
    }
    if (![12, 14].includes(body.payments))
      throw new Error("El número de pagas debe ser 12 o 14");
    common.annualSalary = Math.round(body.annualSalary * 100) / 100;
    common.payments = body.payments;
  }
  return common;
}

const selectById = db.prepare("SELECT * FROM transactions WHERE id = ?");
const insert = db.prepare(`
  INSERT INTO transactions (type, amount, category, description, date, person, incomeType, expenseType, annualSalary, payments)
  VALUES (@type, @amount, @category, @description, @date, @person, @incomeType, @expenseType, @annualSalary, @payments)
`);
const update = db.prepare(`
  UPDATE transactions SET
    type = @type, amount = @amount, category = @category, description = @description, date = @date,
    person = @person, incomeType = @incomeType, expenseType = @expenseType,
    annualSalary = @annualSalary, payments = @payments
  WHERE id = @id
`);

app.get("/", (_req, res) =>
  res.json({ message: "FinTrack API funcionando correctamente" }),
);
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/transactions", (_req, res) => {
  res.json(
    db.prepare("SELECT * FROM transactions ORDER BY date DESC, id DESC").all(),
  );
});

app.post("/api/transactions", (req, res, next) => {
  try {
    const transaction = validateTransaction(req.body);
    const result = insert.run(transaction);
    res.status(201).json(selectById.get(result.lastInsertRowid));
  } catch (error) {
    next(error);
  }
});

app.get("/api/transactions/:id", (req, res) => {
  const transaction = selectById.get(req.params.id);
  if (!transaction)
    return res.status(404).json({ error: "Transacción no encontrada" });
  res.json(transaction);
});

app.put("/api/transactions/:id", (req, res, next) => {
  try {
    if (!selectById.get(req.params.id))
      return res.status(404).json({ error: "Transacción no encontrada" });
    const transaction = validateTransaction(req.body);
    update.run({ ...transaction, id: req.params.id });
    res.json(selectById.get(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/transactions/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM transactions WHERE id = ?")
    .run(req.params.id);
  if (!result.changes)
    return res.status(404).json({ error: "Transacción no encontrada" });
  res.json({ message: "Transacción eliminada correctamente" });
});

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error)
    return res.status(400).json({ error: "El JSON enviado no es válido" });
  if (error instanceof Error)
    return res.status(400).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`),
  );
}

module.exports = app;
