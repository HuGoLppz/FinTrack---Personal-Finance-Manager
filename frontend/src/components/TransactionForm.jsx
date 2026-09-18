import { useState } from "react";
import { createTransaction } from "../services/transactionService";

function TransactionForm({ onTransactionCreated }) {

    const [formData, setFormData] = useState({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: ""
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const transaction = {
                ...formData,
                amount: Number(formData.amount)
            };

            const newTransaction = await createTransaction(transaction);

            onTransactionCreated(newTransaction);

            setFormData({
                type: "expense",
                amount: "",
                category: "",
                description: "",
                date: ""
            });

        } catch (error) {
            console.error("Error creando la transacción:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            <h2>Nueva transacción</h2>

            <div>
                <label>Tipo</label>

                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                >
                    <option value="expense">
                        Gasto
                    </option>

                    <option value="income">
                        Ingreso
                    </option>
                </select>
            </div>

            <div>
                <label>Importe</label>

                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                />
            </div>

            <div>
                <label>Categoría</label>

                <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label>Descripción</label>

                <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <div>
                <label>Fecha</label>

                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit">
                Guardar transacción
            </button>

        </form>
    );
}

export default TransactionForm;