import { useEffect, useState } from "react";

import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";

import {
  getTransactions,
  deleteTransaction,
} from "./services/transactionService";

function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      console.log("Datos recibidos:", data);
      setTransactions(data);
    } catch (error) {
      console.error("Error obteniendo las transacciones:", error);
    }
  };

  const handleTransactionCreated = (transaction) => {
    setTransactions((currentTransactions) => [
      transaction,
      ...currentTransactions,
    ]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);

      setTransactions((currentTransactions) =>
        currentTransactions.filter((transaction) => transaction.id !== id),
      );
    } catch (error) {
      console.error("Error eliminando la transacción:", error);
    }
  };

  return (
    <div>
      <h1>FinTrack</h1>
      <TransactionForm onTransactionCreated={handleTransactionCreated} />
      <TransactionList transactions={transactions} onDelete={handleDelete} />
    </div>
  );
}

export default App;
