import { apiFetch } from './client';

export const fetchTransactions = () => apiFetch('/transactions');

export const createTransactionApi = (payload) =>
  apiFetch('/transactions', { method: 'POST', body: JSON.stringify(payload) });

export const updateTransactionApi = (id, payload) =>
  apiFetch(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const deleteTransactionApi = (id) =>
  apiFetch(`/transactions/${id}`, { method: 'DELETE' });
