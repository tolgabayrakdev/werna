import { eventEmitter } from '../utils/events.js';
import transporter from '../config/mail.js';
import env from '../config/env.js';

eventEmitter.on('send-verification-code', async ({ email, code }) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Account Verification</h2>
        <p style="text-align: center; color: #555;">Use the code below to verify your account.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 6px;">${code}</span>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">This code is valid for 10 minutes.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send verification code:', err);
  }
});

eventEmitter.on('send-password-reset', async ({ email, token }) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Password Reset</h2>
        <p style="text-align: center; color: #555;">Click the button below to reset your password.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">This link is valid for 1 hour. If you did not make this request, you can ignore it.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
});

eventEmitter.on('send-feedback-verification', async ({ email, code }) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Feedback Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="text-align: center; color: #333;">Feedback Verification</h2>
        <p style="text-align: center; color: #555;">Use the code below to confirm your feedback.</p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 6px;">${code}</span>
        </div>
        <p style="text-align: center; color: #888; font-size: 13px;">This code is valid for 10 minutes. Once verified, your feedback will be forwarded to the business.</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Failed to send feedback verification email:', err);
  }
});
