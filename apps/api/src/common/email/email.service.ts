import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { EmailError } from '../errors/AppError.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  // In development, log the OTP so you can test without real email credentials
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    logger.warn({
      event: 'email.reset.dev_fallback',
      message: 'EMAIL_USER or EMAIL_PASS is missing – OTP logged instead of sent',
      otp,
      to: email,
    });
    if (env.NODE_ENV === 'production') {
      throw new EmailError('EMAIL_USER or EMAIL_PASS is missing');
    }
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Mentora" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Mentora Password Reset Code',
      text: `Your Mentora password reset code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
          <div style="background:#4f46e5;padding:24px 32px">
            <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">Mentora</span>
          </div>
          <div style="padding:32px">
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a">Password reset code</h2>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6">
              We received a request to reset the password for your Mentora account
              associated with <strong>${email}</strong>. Use the code below:
            </p>

            <div style="background:#f1f5f9;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px">
              <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:monospace">${otp}</span>
            </div>

            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6">
              This code expires in <strong>10 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
            <p style="margin:0;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} Mentora. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    logger.info({
      event: 'email.reset.sent',
      email,
    });
  } catch (error) {
    logger.error({
      event: 'email.reset.failed',
      email,
      error,
    });

    throw new EmailError('Failed to send password reset email');
  }
};