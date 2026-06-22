const brevo = require('@getbrevo/brevo');

function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY is not set. Add it to server/.env (see .env.example).'
    );
  }
  const api = new brevo.TransactionalEmailsApi();
  api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return api;
}

async function sendEmail({ to, toName, subject, html }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'Finance Dashboard';

  if (!senderEmail) {
    throw new Error(
      'BREVO_SENDER_EMAIL is not set. Add it to server/.env (this must be a sender verified in your Brevo account).'
    );
  }

  const api = getBrevoClient();
  const payload = new brevo.SendSmtpEmail();
  payload.sender = { email: senderEmail, name: senderName };
  payload.to = [{ email: to, name: toName || to }];
  payload.subject = subject;
  payload.htmlContent = html;

  return api.sendTransacEmail(payload);
}

function verificationEmailTemplate({ name, verifyUrl }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color:#0369a1;">Verify your email</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>Thanks for signing up for Finance Dashboard. Please confirm your email address by clicking the button below.</p>
    <p style="text-align:center; margin: 32px 0;">
      <a href="${verifyUrl}" style="background:#0369a1; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
        Verify Email
      </a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color:#0369a1;">${verifyUrl}</p>
    <p style="color:#6b7280; font-size: 13px;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
  </div>`;
}

function resetPasswordEmailTemplate({ name, resetUrl }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color:#0369a1;">Reset your password</h2>
    <p>Hi ${escapeHtml(name)},</p>
    <p>We received a request to reset your Finance Dashboard password. Click the button below to choose a new one.</p>
    <p style="text-align:center; margin: 32px 0;">
      <a href="${resetUrl}" style="background:#0369a1; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:bold;">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color:#0369a1;">${resetUrl}</p>
    <p style="color:#6b7280; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
};
