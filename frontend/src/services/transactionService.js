import axios from "axios";

const API_URL = "http://localhost:3000/api/transactions";

export const getTransactions = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createTransaction = async (transaction) => {
    const response = await axios.post(API_URL, transaction);
    return response.data;
};

export const updateTransaction = async (id, transaction) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        transaction
    );

    return response.data;
};

export const deleteTransaction = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`
    );

    return response.data;
};