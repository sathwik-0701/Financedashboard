import { apiFetch } from './client';

export const registerUser = (payload) =>
  apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const loginUser = (payload) =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });

export const logoutUser = () => apiFetch('/auth/logout', { method: 'POST' });

export const getCurrentUser = () => apiFetch('/auth/me');

export const verifyEmail = (token, email) =>
  apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);

export const resendVerification = (email) =>
  apiFetch('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const forgotPassword = (email) =>
  apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = (payload) =>
  apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
