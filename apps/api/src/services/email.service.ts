/**
 * Email delivery. Two interchangeable transports, chosen by which env vars are
 * set — so the same code works locally (console), on Render (Resend over HTTPS),
 * or with any SMTP provider (SendGrid / Brevo / Gmail / Mailgun / …):
 *
 *   RESEND_API_KEY set        → Resend HTTP API   (recommended; HTTPS, no SMTP ports)
 *   SMTP_HOST set             → SMTP via nodemailer
 *   neither                   → console (dev): logs the message + code, never throws
 *
 * Sending is best-effort at the call site: a provider outage must not brick
 * signup, so callers log failures and surface an `emailSent` flag instead.
 */
import { env } from '../config/env.js';

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type EmailProvider = 'resend' | 'brevo' | 'smtp' | 'console';

/** Split `Name <addr@x.com>` (or a bare address) into name + email. */
function parseFrom(from: string): { name: string; email: string } {
  const m = /^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/.exec(from);
  if (m) return { name: m[1]!.replace(/^"|"$/g, ''), email: m[2]! };
  return { name: '', email: from.trim() };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendViaResend(mail: Mail): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env().RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env().EMAIL_FROM, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

async function sendViaBrevo(mail: Mail): Promise<void> {
  const from = parseFrom(env().EMAIL_FROM);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env().BREVO_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: from.name || env().APP_NAME, email: from.email },
      to: [{ email: mail.to }],
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

async function sendViaSmtp(mail: Mail): Promise<void> {
  const { default: nodemailer } = await import('nodemailer');
  const port = env().SMTP_PORT;
  const transport = nodemailer.createTransport({
    host: env().SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587/25 = STARTTLS
    auth: env().SMTP_USER ? { user: env().SMTP_USER, pass: env().SMTP_PASS } : undefined,
    // Fail fast — some hosts block outbound SMTP ports; don't hang the request.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
  await transport.sendMail({ from: env().EMAIL_FROM, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text });
}

/**
 * Send an email via whichever transport is configured. HTTP transports (Resend,
 * Brevo) are preferred because they use HTTPS (443) — reliable on hosts that
 * block outbound SMTP ports. Returns the transport used.
 */
export async function sendMail(mail: Mail): Promise<EmailProvider> {
  const cfg = env();
  if (cfg.RESEND_API_KEY) {
    await sendViaResend(mail);
    return 'resend';
  }
  if (cfg.BREVO_API_KEY) {
    await sendViaBrevo(mail);
    return 'brevo';
  }
  if (cfg.SMTP_HOST) {
    await sendViaSmtp(mail);
    return 'smtp';
  }
  // No provider configured — log so the flow still works in local dev and so the
  // code is recoverable from server logs if a provider is missing in production.
  console.warn(`[email] no provider configured — not sending. To: ${mail.to} · Subject: ${mail.subject}`);
  console.warn(`[email] message body (text):\n${mail.text}`);
  return 'console';
}

const BRAND = '#4F46E5';
const INK = '#0f172a';
const MUTED = '#64748b';

/** The verification + welcome email: greeting, a big bold code, and T&C. */
export function verificationEmail(name: string, code: string): Mail {
  const app = env().APP_NAME;
  const url = env().APP_URL;
  const support = env().SUPPORT_EMAIL;
  const firstName = (name || 'there').trim().split(/\s+/)[0]!;
  const safeName = escapeHtml(firstName);
  const safeCode = escapeHtml(code);

  const terms = `Terms & Conditions — By verifying your email and using ${app}, you agree that: (1) ${app} is a diagnostic and self-reflection tool for design students and is not professional, academic, or career advice; (2) the responses and portfolio details you provide are processed to generate your Design Signature report and may be reviewed by a ${app} facilitator before release; (3) your data is stored securely and used only to produce and improve your report; (4) you may request deletion of your account and data at any time by emailing ${support}. Continued use of ${app} constitutes acceptance of these terms and our Privacy Policy.`;

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
        <!-- brand bar -->
        <tr><td style="height:6px;background:${BRAND};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 36px 8px 36px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <div style="font-size:13px;font-weight:700;letter-spacing:3px;color:${BRAND};text-transform:uppercase;">${escapeHtml(app)}</div>
          <h1 style="margin:14px 0 6px 0;font-size:24px;line-height:1.25;color:${INK};font-weight:800;">Welcome to ${escapeHtml(app)}, ${safeName} 👋</h1>
          <p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED};">
            You're one step from seeing the designer your work already shows. Confirm your email with the code below, and your first session is ready when you are.
          </p>
        </td></tr>

        <!-- big bold code -->
        <tr><td style="padding:20px 36px 8px 36px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <div style="font-size:12px;font-weight:600;letter-spacing:1px;color:${MUTED};text-transform:uppercase;margin-bottom:10px;">Your verification code</div>
          <div style="background:#EEF2FF;border:1px solid #c7d2fe;border-radius:14px;padding:22px 12px;text-align:center;">
            <span style="font-family:'SFMono-Regular',Menlo,Consolas,monospace;font-size:44px;font-weight:800;letter-spacing:12px;color:${BRAND};">${safeCode}</span>
          </div>
          <p style="margin:14px 0 0 0;font-size:14px;line-height:1.6;color:${MUTED};">
            Enter this 6-digit code on the verification screen to activate your account.
          </p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:16px 36px 8px 36px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:10px;">Open ${escapeHtml(app)}</a>
          <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">
            If you didn't create a ${escapeHtml(app)} account, you can safely ignore this email — nothing will happen.
          </p>
        </td></tr>

        <!-- divider -->
        <tr><td style="padding:8px 36px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

        <!-- terms -->
        <tr><td style="padding:8px 36px 28px 36px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">Terms &amp; Conditions</div>
          <p style="margin:0;font-size:11px;line-height:1.6;color:#94a3b8;">${escapeHtml(terms)}</p>
          <p style="margin:14px 0 0 0;font-size:11px;line-height:1.6;color:#cbd5e1;">
            ${escapeHtml(app)} · Questions? <a href="mailto:${escapeHtml(support)}" style="color:#94a3b8;">${escapeHtml(support)}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to ${app}, ${firstName}!

You're one step from seeing the designer your work already shows.
Confirm your email with the code below.

  YOUR VERIFICATION CODE:  ${code}

Enter this 6-digit code on the verification screen to activate your account.
Open ${app}: ${url}

If you didn't create a ${app} account, you can safely ignore this email.

------------------------------------------------------------
${terms}

${app} · Questions? ${support}`;

  return { to: '', subject: `Your ${app} verification code: ${code}`, html, text };
}

/** Build + send the verification email to a recipient. Returns the transport used. */
export async function sendVerificationEmail(to: string, name: string, code: string): Promise<EmailProvider> {
  const mail = verificationEmail(name, code);
  mail.to = to;
  return sendMail(mail);
}
