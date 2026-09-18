function TransactionList({ transactions, onDelete }) {
  return (
    <div>
      <h2>Movimientos</h2>
      {transactions.length === 0 ? (
        <p>No hay movimientos todavía.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>
                {transaction.type === "income" ? "+" : "-"}
                {transaction.amount} €
              </strong>
              {" | "}
              {transaction.category}
              {" | "}
              {transaction.description}
              {" | "}
              {transaction.date}{" "}
              <button onClick={() => onDelete(transaction.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TransactionList;
