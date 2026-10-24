/**
 * Email service abstraction.
 *
 * Implemented providers: mailgun, sendgrid.
 * Stubbed (not sendable): ses, smtp — reported as unconfigured until implemented.
 *
 * Required environment variables:
 * - EMAIL_PROVIDER: "mailgun" | "sendgrid" | "ses" | "smtp"
 * - EMAIL_FROM: Sender email address (e.g., "noreply@skylent.live")
 *
 * Provider-specific variables:
 *
 * Mailgun:
 * - MAILGUN_API_KEY
 * - MAILGUN_DOMAIN
 *
 * SendGrid:
 * - SENDGRID_API_KEY
 *
 * AWS SES / SMTP: not implemented — setting EMAIL_PROVIDER to these values
 * does not mark the service as configured.
 */

export type EmailProvider = "mailgun" | "sendgrid" | "ses" | "smtp" | "none"

/** Providers with a working send path in this codebase. */
export const IMPLEMENTED_EMAIL_PROVIDERS: ReadonlySet<EmailProvider> = new Set([
  "mailgun",
  "sendgrid",
])

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html?: string
}

export interface EmailConfig {
  provider: EmailProvider
  from: string
}

export class EmailServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_CONFIGURED" | "SEND_FAILED" | "INVALID_CONFIG",
  ) {
    super(message)
    this.name = "EmailServiceError"
  }
}

function getEmailConfig(): EmailConfig | null {
  const provider = (process.env.EMAIL_PROVIDER || "none") as EmailProvider
  const from = process.env.EMAIL_FROM

  if (!IMPLEMENTED_EMAIL_PROVIDERS.has(provider) || !from) {
    return null
  }

  return { provider, from }
}

export function isEmailConfigured(): boolean {
  const status = getEmailConfigStatus()
  return status.configured
}

export function getEmailConfigStatus(): {
  configured: boolean
  provider: EmailProvider
  implemented: boolean
  requiredVariables: string[]
  missingVariables: string[]
} {
  const raw = (process.env.EMAIL_PROVIDER || "none").toLowerCase()
  const provider = (
    ["mailgun", "sendgrid", "ses", "smtp", "none"].includes(raw) ? raw : "none"
  ) as EmailProvider

  const providerVars: Record<EmailProvider, string[]> = {
    none: [],
    mailgun: ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "EMAIL_FROM"],
    sendgrid: ["SENDGRID_API_KEY", "EMAIL_FROM"],
    ses: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SES_REGION", "EMAIL_FROM"],
    smtp: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"],
  }

  const required = providerVars[provider] || []
  const missing = required.filter((v) => !process.env[v])
  const implemented = IMPLEMENTED_EMAIL_PROVIDERS.has(provider)

  return {
    configured: implemented && missing.length === 0,
    provider,
    implemented,
    requiredVariables: required,
    missingVariables: missing,
  }
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const config = getEmailConfig()

  if (!config) {
    throw new EmailServiceError(
      "Email service is not configured. Set EMAIL_PROVIDER to mailgun or sendgrid with the required credentials.",
      "NOT_CONFIGURED",
    )
  }

  switch (config.provider) {
    case "mailgun":
      await sendMailgun(config, message)
      break
    case "sendgrid":
      await sendSendGrid(config, message)
      break
    default:
      throw new EmailServiceError(`Email provider is not implemented: ${config.provider}`, "INVALID_CONFIG")
  }
}

async function sendMailgun(config: EmailConfig, message: EmailMessage): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN

  if (!apiKey || !domain) {
    throw new EmailServiceError("Mailgun configuration incomplete", "INVALID_CONFIG")
  }

  const formData = new URLSearchParams()
  formData.append("from", config.from)
  formData.append("to", message.to)
  formData.append("subject", message.subject)
  formData.append("text", message.text)
  if (message.html) formData.append("html", message.html)

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new EmailServiceError(`Mailgun send failed: ${response.status}`, "SEND_FAILED")
  }
}

async function sendSendGrid(config: EmailConfig, message: EmailMessage): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY

  if (!apiKey) {
    throw new EmailServiceError("SendGrid API key not configured", "INVALID_CONFIG")
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: message.to }] }],
      from: { email: config.from },
      subject: message.subject,
      content: [
        { type: "text/plain", value: message.text },
        ...(message.html ? [{ type: "text/html", value: message.html }] : []),
      ],
    }),
  })

  if (!response.ok) {
    throw new EmailServiceError(`SendGrid send failed: ${response.status}`, "SEND_FAILED")
  }
}

export function buildPasswordResetEmail(resetUrl: string): Omit<EmailMessage, "to"> {
  return {
    subject: "Reset your Skylent password",
    text: `You requested a password reset for your Skylent account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 60 minutes.

If you did not request this password reset, you can safely ignore this email.

— The Skylent Team`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1a1a1a;">Reset your password</h2>
    <p>You requested a password reset for your Skylent account.</p>
    <p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Reset Password
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">This link will expire in 60 minutes.</p>
    <p style="color: #666; font-size: 14px;">If you did not request this password reset, you can safely ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px;">— The Skylent Team</p>
  </div>
</body>
</html>`,
  }
}
