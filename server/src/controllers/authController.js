const validator = require('validator');
const User = require('../models/User');
const { generateRawToken, hashToken, signAuthToken } = require('../utils/tokens');
const {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} = require('../utils/email');
const { COOKIE_NAME } = require('../middleware/auth');

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

const isProd = () => process.env.NODE_ENV === 'production';

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
    path: '/',
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const { raw, hash } = generateRawToken();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      isVerified: false,
      verificationTokenHash: hash,
      verificationTokenExpires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
    });

    const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${raw}&email=${encodeURIComponent(
      user.email
    )}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] [DEV ONLY] Verification URL: ${verifyUrl}`);
    }

    try {
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: 'Verify your email — Finance Dashboard',
        html: verificationEmailTemplate({ name: user.name, verifyUrl }),
      });
    } catch (emailErr) {
      console.error('[auth] Failed to send verification email:', emailErr.message);
      // Account is created either way; user can request a resend.
      return res.status(201).json({
        message:
          'Account created, but we could not send the verification email. Please try resending it.',
        email: user.email,
      });
    }

    return res.status(201).json({
      message: 'Account created. Please check your email to verify your account.',
      email: user.email,
    });
  } catch (err) {
    console.error('[auth] register error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// GET /api/auth/verify-email?token=...&email=...
async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ message: 'Invalid verification link.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select(
      '+verificationTokenHash +verificationTokenExpires'
    );

    if (!user || !user.verificationTokenHash) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }
    if (user.isVerified) {
      const authToken = signAuthToken(user._id.toString());
      setAuthCookie(res, authToken);
      return res.status(200).json({ message: 'Email already verified.', user: publicUser(user) });
    }
    if (user.verificationTokenExpires < new Date()) {
      return res.status(400).json({
        message: 'This verification link has expired. Please request a new one.',
      });
    }
    if (hashToken(String(token)) !== user.verificationTokenHash) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const authToken = signAuthToken(user._id.toString());
    setAuthCookie(res, authToken);

    return res.status(200).json({ message: 'Email verified successfully.', user: publicUser(user) });
  } catch (err) {
    console.error('[auth] verifyEmail error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/resend-verification
async function resendVerification(req, res) {
  try {
    const { email } = req.body || {};
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond the same way to avoid leaking which emails are registered.
    const genericMessage =
      'If an account with that email exists and is not yet verified, a new verification email has been sent.';

    if (!user || user.isVerified) {
      return res.status(200).json({ message: genericMessage });
    }

    const { raw, hash } = generateRawToken();
    user.verificationTokenHash = hash;
    user.verificationTokenExpires = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);
    await user.save();

    const verifyUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${raw}&email=${encodeURIComponent(
      user.email
    )}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] [DEV ONLY] Resend Verification URL: ${verifyUrl}`);
    }

    await sendEmail({
      to: user.email,
      toName: user.name,
      subject: 'Verify your email — Finance Dashboard',
      html: verificationEmailTemplate({ name: user.name, verifyUrl }),
    });

    return res.status(200).json({ message: genericMessage });
  } catch (err) {
    console.error('[auth] resendVerification error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const token = signAuthToken(user._id.toString());
    setAuthCookie(res, token);

    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error('[auth] login error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out.' });
}

// GET /api/auth/me
async function me(req, res) {
  return res.status(200).json({ user: publicUser(req.user) });
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    const genericMessage =
      'If an account with that email exists, a password reset link has been sent.';

    if (!email || !validator.isEmail(email)) {
      return res.status(200).json({ message: genericMessage });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const { raw, hash } = generateRawToken();
    user.resetTokenHash = hash;
    user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${raw}&email=${encodeURIComponent(
      user.email
    )}`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[auth] [DEV ONLY] Reset Password URL: ${resetUrl}`);
    }

    await sendEmail({
      to: user.email,
      toName: user.name,
      subject: 'Reset your password — Finance Dashboard',
      html: resetPasswordEmailTemplate({ name: user.name, resetUrl }),
    });

    return res.status(200).json({ message: genericMessage });
  } catch (err) {
    console.error('[auth] forgotPassword error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { token, email, password } = req.body || {};
    if (!token || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select(
      '+resetTokenHash +resetTokenExpires'
    );

    if (!user || !user.resetTokenHash || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }
    if (hashToken(String(token)) !== user.resetTokenHash) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    user.password = password; // pre-save hook will hash it
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully. You can log in now.' });
  } catch (err) {
    console.error('[auth] resetPassword error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
};
