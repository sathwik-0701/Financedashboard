import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import TransactionHistory from './pages/TransactionHistory';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ResendVerification from './pages/auth/ResendVerification';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import {
  fetchTransactions,
  createTransactionApi,
  updateTransactionApi,
  deleteTransactionApi,
} from './api/transactions';

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadTransactions = useCallback(async () => {
    if (!isAuthenticated) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }
    setIsLoadingTransactions(true);
    setLoadError(null);
    try {
      const data = await fetchTransactions();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setLoadError('Failed to load transactions. Please refresh the page.');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = async (newTransaction) => {
    const data = await createTransactionApi(newTransaction);
    setTransactions((prev) => [data.transaction, ...prev]);
  };

  const updateTransaction = async (id, updated) => {
    const data = await updateTransactionApi(id, updated);
    setTransactions((prev) => prev.map((t) => (t.id === id ? data.transaction : t)));
  };

  const deleteTransaction = async (id) => {
    await deleteTransactionApi(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {loadError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-sm text-red-700">{loadError}</p>
          </div>
        )}
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {isLoadingTransactions ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
                  </div>
                ) : (
                  <Dashboard transactions={transactions} />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute>
                <AddTransaction onAddTransaction={addTransaction} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionHistory
                  transactions={transactions}
                  onUpdateTransaction={updateTransaction}
                  onDeleteTransaction={deleteTransaction}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthenticatedApp />
      </Router>
    </AuthProvider>
  );
}

export default App;
