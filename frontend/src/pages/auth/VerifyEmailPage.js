import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token || !email) {
        setStatus(STATUS.ERROR);
        setMessage('This verification link is missing required information.');
        return;
      }
      try {
        const data = await verifyEmail(token, email);
        if (cancelled) return;
        setStatus(STATUS.SUCCESS);
        setMessage(data.message || 'Email verified successfully.');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          if (!cancelled) {
            navigate('/login', { state: { verificationSuccess: true } });
          }
        }, 3000);
      } catch (err) {
        if (cancelled) return;
        setStatus(STATUS.ERROR);
        setMessage(err.message || 'Verification failed.');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, email, navigate, refreshUser]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="card text-center">
        {status === STATUS.LOADING && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {status === STATUS.SUCCESS ? 'Verification successful' : status === STATUS.ERROR ? 'Verification problem' : 'Verifying…'}
        </h1>
        <p className="text-sm text-gray-600">{message}</p>

        {status === STATUS.SUCCESS && (
          <div className="mt-6 space-y-2 animate-pulse">
            <p className="text-xs text-gray-500">Redirecting to Login page in 3 seconds...</p>
            <Link to="/login" className="btn btn-primary inline-block">
              Go to Login
            </Link>
          </div>
        )}

        {status === STATUS.ERROR && (
          <Link
            to={`/resend-verification${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="btn btn-primary inline-block mt-6"
          >
            Resend verification email
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
