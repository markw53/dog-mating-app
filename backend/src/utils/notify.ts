import axios from 'axios';
import nodemailer from 'nodemailer';
import logger from './logger';

// Admin notifications are best-effort and fire-and-forget: they must never
// block or fail the request that triggered them. Channels activate based on
// which env vars are set:
//   DISCORD_WEBHOOK_URL                        — posts to a Discord channel
//   SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS
//   + ADMIN_EMAIL                              — sends an email
// With neither configured this is a no-op.

const transporter =
  process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
    : null;

// Transactional email to a specific user (password resets etc.). Returns
// false when SMTP isn't configured or sending fails, so callers can decide
// how to degrade.
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!transporter) return false;
  try {
    await transporter.sendMail({
      from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
      to,
      subject: `[DogMate] ${subject}`,
      text: body,
    });
    return true;
  } catch (err) {
    logger.warn({ err }, 'Transactional email failed');
    return false;
  }
}

export function notifyAdmin(subject: string, body: string): void {
  void (async () => {
    try {
      if (process.env.DISCORD_WEBHOOK_URL) {
        await axios.post(
          process.env.DISCORD_WEBHOOK_URL,
          { content: `**${subject}**\n${body}` },
          { timeout: 5000 },
        );
      }

      if (transporter && process.env.ADMIN_EMAIL) {
        await transporter.sendMail({
          from: process.env.NOTIFY_FROM || process.env.SMTP_USER,
          to: process.env.ADMIN_EMAIL,
          subject: `[DogMate] ${subject}`,
          text: body,
        });
      }
    } catch (err) {
      logger.warn({ err }, 'Admin notification failed');
    }
  })();
}
