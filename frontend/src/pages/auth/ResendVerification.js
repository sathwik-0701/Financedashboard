import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resendVerification } from '../../api/auth';

const ResendVerification = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const data = await resendVerification(email);
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Resend verification email</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email and we&apos;ll send a new verification link.
        </p>

        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-sm text-green-700">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? 'Sending…' : 'Send verification email'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          <Link to="/login" className="text-primary-700 font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResendVerification;
