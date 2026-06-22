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
  token: string
): Promise<void> => {
  const resetLink =
    `${env.CLIENT_ORIGIN}/reset-password?token=${token}`;

  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    throw new EmailError(
      'EMAIL_USER or EMAIL_PASS is missing'
    );
  }

  try {
    await transporter.sendMail({
      from: `"Your App" <${env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      text: `Reset your password by visiting: ${resetLink}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2>Password Reset</h2>
          <p>You requested a password reset.</p>

          <p>
            <a
              href="${resetLink}"
              style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px"
            >
              Reset Password
            </a>
          </p>

          <p>If the button doesn't work, copy this link:</p>
          <p>${resetLink}</p>

          <p>This link expires in 1 hour.</p>
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

    throw new EmailError(
      'Failed to send password reset email'
    );
  }
};