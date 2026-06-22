import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.verificationSuccess ? 'Email verified successfully! Please log in.' : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setNeedsVerification(false);
    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
      }
      setError(err.message || 'Failed to log in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-sm text-gray-600 mb-6">Log in to your Finance Dashboard.</p>

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
            {needsVerification && (
              <Link
                to={`/resend-verification?email=${encodeURIComponent(form.email)}`}
                className="text-sm font-medium text-red-700 underline"
              >
                Resend verification email
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field w-full"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-field w-full"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary-700 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
