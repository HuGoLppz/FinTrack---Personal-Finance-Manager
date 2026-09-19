const express = require("express");
const cors = require("cors");

const db = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "FinTrack API funcionando correctamente"
    });
});

app.get("/api/transactions", (req, res) => {
    const transactions = db
        .prepare("SELECT * FROM transactions ORDER BY date DESC")
        .all();

    res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
    const {
        type,
        amount,
        category,
        description,
        date
    } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
        return res.status(400).json({
            error: "El tipo debe ser 'income' o 'expense'"
        });
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            error: "El importe debe ser un número mayor que 0"
        });
    }

    if (!category || category.trim() === "") {
        return res.status(400).json({
            error: "La categoría es obligatoria"
        });
    }

    if (!date || date.trim() === "") {
        return res.status(400).json({
            error: "La fecha es obligatoria"
        });
    }

    const result = db.prepare(`
        INSERT INTO transactions
        (type, amount, category, description, date)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        type,
        amount,
        category.trim(),
        description?.trim() || null,
        date
    );

    const transaction = db
        .prepare("SELECT * FROM transactions WHERE id = ?")
        .get(result.lastInsertRowid);

    res.status(201).json(transaction);
});

app.get("/api/transactions/:id", (req, res) => {
    const { id } = req.params;

    const transaction = db
        .prepare("SELECT * FROM transactions WHERE id = ?")
        .get(id);

    if (!transaction) {
        return res.status(404).json({
            error: "Transacción no encontrada"
        });
    }

    res.json(transaction);
});

app.put("/api/transactions/:id", (req, res) => {
    const { id } = req.params;

    const {
        type,
        amount,
        category,
        description,
        date
    } = req.body;

    const existingTransaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);

    if (!existingTransaction) {
        return res.status(404).json({
            error: "Transacción no encontrada"
        });
    }

    if (!type || !["income", "expense"].includes(type)) {
        return res.status(400).json({
            error: "El tipo debe ser 'income' o 'expense'"
        });
    }

    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
            error: "El importe debe ser un número mayor que 0"
        });
    }

    if (!category || category.trim() === "") {
        return res.status(400).json({
            error: "La categoría es obligatoria"
        });
    }

    if (!date || date.trim() === "") {
        return res.status(400).json({
            error: "La fecha es obligatoria"
        });
    }

    db.prepare(`
        UPDATE transactions
        SET
            type = ?,
            amount = ?,
            category = ?,
            description = ?,
            date = ?
        WHERE id = ?
    `).run(
        type,
        amount,
        category.trim(),
        description?.trim() || null,
        date,
        id
    );

    const updatedTransaction = db
        .prepare("SELECT * FROM transactions WHERE id = ?")
        .get(id);

    res.json(updatedTransaction);
});

app.delete("/api/transactions/:id", (req, res) => {
    const { id } = req.params;

    const transaction = db
        .prepare("SELECT * FROM transactions WHERE id = ?")
        .get(id);

    if (!transaction) {
        return res.status(404).json({
            error: "Transacción no encontrada"
        });
    }

    db.prepare("DELETE FROM transactions WHERE id = ?").run(id);

    res.json({
        message: "Transacción eliminada correctamente"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});