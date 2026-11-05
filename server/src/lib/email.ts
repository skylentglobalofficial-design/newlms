/**
 * Transactional email & SMS OTP delivery service.
 *
 * Email Providers Supported (Zero external npm dependencies required):
 * - Gmail / Custom SMTP (`SMTP_USER` + `SMTP_PASS` or `GMAIL_USER` + `GMAIL_APP_PASSWORD`, default host `smtp.gmail.com:465`)
 * - Resend (`RESEND_API_KEY`)
 * - Brevo / Sendinblue (`BREVO_API_KEY`)
 * - Mailgun (`MAILGUN_API_KEY` + `MAILGUN_DOMAIN`)
 * - SendGrid (`SENDGRID_API_KEY`)
 * - Webhook (`EMAIL_WEBHOOK_URL`)
 *
 * SMS OTP Gateways Supported:
 * - Fast2SMS (`FAST2SMS_API_KEY`)
 * - 2Factor.in (`TWOFACTOR_API_KEY`)
 * - MSG91 (`MSG91_AUTH_KEY` + optional `MSG91_TEMPLATE_ID`)
 * - Twilio (`TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER`)
 */

import tls from "node:tls"

export interface EmailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export type EmailProvider = "smtp" | "resend" | "brevo" | "mailgun" | "sendgrid" | "webhook" | "console"

export function getEmailProvider(): EmailProvider | null {
  const explicit = process.env.EMAIL_PROVIDER?.trim().toLowerCase()
  if (
    explicit === "smtp" ||
    explicit === "resend" ||
    explicit === "brevo" ||
    explicit === "mailgun" ||
    explicit === "sendgrid" ||
    explicit === "webhook" ||
    explicit === "console"
  ) {
    return explicit
  }
  if ((process.env.SMTP_USER && process.env.SMTP_PASS) || (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)) {
    return "smtp"
  }
  if (process.env.RESEND_API_KEY) return "resend"
  if (process.env.BREVO_API_KEY) return "brevo"
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) return "mailgun"
  if (process.env.SENDGRID_API_KEY) return "sendgrid"
  if (process.env.EMAIL_WEBHOOK_URL) return "webhook"
  if (process.env.NODE_ENV !== "production" && process.env.EMAIL_DEV_CONSOLE === "true") {
    return "console"
  }
  return null
}

export function isEmailConfigured(): boolean {
  const provider = getEmailProvider()
  if (!provider) return false
  switch (provider) {
    case "smtp":
      return Boolean(
        (process.env.SMTP_USER && process.env.SMTP_PASS) ||
          (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
      )
    case "resend":
      return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
    case "brevo":
      return Boolean(process.env.BREVO_API_KEY)
    case "mailgun":
      return Boolean(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN && process.env.EMAIL_FROM)
    case "sendgrid":
      return Boolean(process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM)
    case "webhook":
      return Boolean(process.env.EMAIL_WEBHOOK_URL)
    case "console":
      return process.env.NODE_ENV !== "production"
  }
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = getEmailProvider()
  if (!provider) {
    throw new Error("Email provider is not configured")
  }

  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    "Skylent <noreply@skylent.live>"

  switch (provider) {
    case "smtp":
      await sendViaTlsSmtp(from, message)
      return
    case "resend":
      await sendViaResend(from, message)
      return
    case "brevo":
      await sendViaBrevo(from, message)
      return
    case "mailgun":
      await sendViaMailgun(from, message)
      return
    case "sendgrid":
      await sendViaSendGrid(from, message)
      return
    case "webhook":
      await sendViaWebhook(from, message)
      return
    case "console":
      if (process.env.NODE_ENV === "production") {
        throw new Error("Console email provider is not allowed in production")
      }
      console.info(`[dev-email] To: ${message.to} | Subject: ${message.subject}`)
      return
  }
}

/**
 * Zero-dependency SMTPS (Implicit TLS port 465) client for Gmail App Passwords & standard SMTP servers.
 */
async function sendViaTlsSmtp(from: string, message: EmailMessage): Promise<void> {
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim()
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "")
  const smtpHost = (process.env.SMTP_HOST || "smtp.gmail.com").trim()
  const smtpPort = Number(process.env.SMTP_PORT || 465)

  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER/GMAIL_USER and SMTP_PASS/GMAIL_APP_PASSWORD are required for SMTP")
  }

  const fromAddressMatch = from.match(/<([^>]+)>/)
  const envelopeFrom = fromAddressMatch ? fromAddressMatch[1] : smtpUser
  const recipient = message.to.trim()

  await new Promise<void>((resolve, reject) => {
    const socket = tls.connect(
      {
        host: smtpHost,
        port: smtpPort,
        servername: smtpHost,
        rejectUnauthorized: true,
      },
      () => {
        // Connected
      },
    )

    let buffer = ""
    let step = 0
    const timeout = setTimeout(() => {
      socket.destroy()
      reject(new Error("SMTP connection timed out"))
    }, 12000)

    const finish = (err?: Error) => {
      clearTimeout(timeout)
      try {
        socket.end()
      } catch {
        // ignore
      }
      if (err) reject(err)
      else resolve()
    }

    const sendLine = (line: string) => {
      socket.write(`${line}\r\n`)
    }

    socket.on("error", (err) => finish(err))

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8")
      const lines = buffer.split("\r\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line) continue
        // Multi-line SMTP response continues if 4th char is '-'
        if (line.length >= 4 && line[3] === "-") continue
        const code = Number(line.slice(0, 3))
        if (code >= 400) {
          return finish(new Error(`SMTP error ${code}: ${line}`))
        }

        if (step === 0 && code === 220) {
          step = 1
          sendLine("EHLO skylent.live")
        } else if (step === 1 && code === 250) {
          step = 2
          const authPlain = Buffer.from(`\u0000${smtpUser}\u0000${smtpPass}`, "utf8").toString("base64")
          sendLine(`AUTH PLAIN ${authPlain}`)
        } else if (step === 2 && code === 235) {
          step = 3
          sendLine(`MAIL FROM:<${envelopeFrom}>`)
        } else if (step === 3 && code === 250) {
          step = 4
          sendLine(`RCPT TO:<${recipient}>`)
        } else if (step === 4 && code === 250) {
          step = 5
          sendLine("DATA")
        } else if (step === 5 && code === 354) {
          step = 6
          const boundary = `skylent_${Date.now().toString(36)}`
          const mime = [
            `From: ${from.includes("<") ? from : `Skylent <${envelopeFrom}>`}`,
            `To: <${recipient}>`,
            `Subject: =?UTF-8?B?${Buffer.from(message.subject, "utf8").toString("base64")}?=`,
            "MIME-Version: 1.0",
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "",
            message.text,
            "",
            `--${boundary}`,
            "Content-Type: text/html; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "",
            message.html,
            "",
            `--${boundary}--`,
            ".",
          ].join("\r\n")
          sendLine(mime)
        } else if (step === 6 && code === 250) {
          step = 7
          sendLine("QUIT")
          return finish()
        }
      }
    })
  })
}

async function sendViaResend(from: string, message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set")

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Resend API returned status ${response.status}`)
  }
}

async function sendViaBrevo(from: string, message: EmailMessage): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY is not set")

  const senderEmail = (process.env.EMAIL_FROM || from).replace(/^.*<([^>]+)>.*$/, "$1").trim()
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Skylent", email: senderEmail || "noreply@skylent.live" },
      to: [{ email: message.to }],
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Brevo API returned status ${response.status}`)
  }
}

async function sendViaMailgun(from: string, message: EmailMessage): Promise<void> {
  const apiKey = process.env.MAILGUN_API_KEY
  const domain = process.env.MAILGUN_DOMAIN
  if (!apiKey || !domain) throw new Error("MAILGUN_API_KEY and MAILGUN_DOMAIN are required")

  const baseUrl = process.env.MAILGUN_API_BASE || "https://api.mailgun.net"
  const form = new URLSearchParams()
  form.set("from", from)
  form.set("to", message.to)
  form.set("subject", message.subject)
  form.set("text", message.text)
  form.set("html", message.html)

  const credentials = Buffer.from(`api:${apiKey}`).toString("base64")
  const response = await fetch(`${baseUrl}/v3/${encodeURIComponent(domain)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  })

  if (!response.ok) {
    throw new Error(`Mailgun API returned status ${response.status}`)
  }
}

async function sendViaSendGrid(from: string, message: EmailMessage): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) throw new Error("SENDGRID_API_KEY is not set")

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: message.to }] }],
      from: { email: from },
      subject: message.subject,
      content: [
        { type: "text/plain", value: message.text },
        { type: "text/html", value: message.html },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`SendGrid API returned status ${response.status}`)
  }
}

async function sendViaWebhook(from: string, message: EmailMessage): Promise<void> {
  const url = process.env.EMAIL_WEBHOOK_URL
  if (!url) throw new Error("EMAIL_WEBHOOK_URL is not set")

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (process.env.EMAIL_WEBHOOK_SECRET) {
    headers["Authorization"] = `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}`
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ from, ...message }),
  })

  if (!response.ok) {
    throw new Error(`Email webhook returned status ${response.status}`)
  }
}

export function isSmsGatewayConfigured(): boolean {
  return Boolean(
    process.env.FAST2SMS_API_KEY ||
      process.env.TWOFACTOR_API_KEY ||
      process.env.MSG91_AUTH_KEY ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER),
  )
}

/**
 * Sends a 6-digit OTP to a 10-digit Indian mobile number via Fast2SMS, 2Factor.in, MSG91, or Twilio.
 */
export async function sendSmsOtp(phone10: string, code: string): Promise<{ sent: boolean; provider: string }> {
  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim()
  if (fast2smsKey) {
    // Try Fast2SMS Quick/OTP route
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: fast2smsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: `Your Skylent verification OTP is ${code}. Valid for 10 minutes. Do not share this code.`,
        language: "english",
        flash: 0,
        numbers: phone10,
      }),
    })
    if (response.ok) {
      return { sent: true, provider: "fast2sms" }
    }
    throw new Error(`Fast2SMS returned HTTP ${response.status}`)
  }

  const twoFactorKey = process.env.TWOFACTOR_API_KEY?.trim()
  if (twoFactorKey) {
    const response = await fetch(
      `https://2factor.in/API/V1/${encodeURIComponent(twoFactorKey)}/SMS/+91${encodeURIComponent(phone10)}/${encodeURIComponent(code)}/SKYLENT_OTP`,
      { method: "GET" },
    )
    if (response.ok) {
      return { sent: true, provider: "2factor" }
    }
    throw new Error(`2Factor.in returned HTTP ${response.status}`)
  }

  const msg91Key = process.env.MSG91_AUTH_KEY?.trim()
  if (msg91Key) {
    const templateId = process.env.MSG91_TEMPLATE_ID?.trim() || ""
    const url = new URL("https://control.msg91.com/api/v5/otp")
    if (templateId) url.searchParams.set("template_id", templateId)
    url.searchParams.set("mobile", `91${phone10}`)
    url.searchParams.set("otp", code)
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        authkey: msg91Key,
        "Content-Type": "application/json",
      },
    })
    if (response.ok) {
      return { sent: true, provider: "msg91" }
    }
    throw new Error(`MSG91 returned HTTP ${response.status}`)
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const twilioFrom = process.env.TWILIO_FROM_NUMBER?.trim()
  if (twilioSid && twilioToken && twilioFrom) {
    const form = new URLSearchParams()
    form.set("To", `+91${phone10}`)
    form.set("From", twilioFrom)
    form.set("Body", `Your Skylent verification OTP is ${code}. Valid for 10 minutes.`)
    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twilioSid)}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      },
    )
    if (response.ok) {
      return { sent: true, provider: "twilio" }
    }
    throw new Error(`Twilio returned HTTP ${response.status}`)
  }

  return { sent: false, provider: "none" }
}

export function buildLoginOtpEmail(code: string, phone10: string): Pick<EmailMessage, "subject" | "text" | "html"> {
  const subject = `${code} is your Skylent verification OTP`
  const text = [
    `Your Skylent 6-digit verification code for +91-${phone10} is: ${code}`,
    "",
    "This code expires in 10 minutes. Never share this OTP with anyone.",
  ].join("\n")

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Your Skylent Verification Code</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; max-width: 520px; margin: 0 auto; padding: 24px;">
  <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #ffffff;">
    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #5142b5;">Skylent Security Verification</p>
    <h1 style="font-size: 20px; margin: 0 0 12px; color: #0f172a;">Verify your sign-in (+91-${phone10})</h1>
    <p style="margin: 0 0 20px; font-size: 14px; color: #475569;">Enter the 6-digit verification code below on the Skylent sign-in screen:</p>
    <div style="padding: 16px 20px; border-radius: 12px; background: #f5f3ff; border: 1.5px solid #c4b5fd; text-align: center; margin-bottom: 20px;">
      <span style="font-size: 28px; font-weight: 800; letter-spacing: 0.24em; color: #3b2d96; font-family: monospace;">${code}</span>
    </div>
    <p style="font-size: 12.5px; color: #64748b; margin: 0;">This OTP is valid for 10 minutes. If you did not request this code, you can safely ignore this message.</p>
  </div>
</body>
</html>`

  return { subject, text, html }
}

export function buildPasswordResetEmail(resetUrl: string): Pick<EmailMessage, "subject" | "text" | "html"> {
  const safeUrl = resetUrl.replace(/"/g, "&quot;")
  const subject = "Reset your Skylent password"
  const text = [
    "You requested a password reset for your Skylent account.",
    "",
    `Reset your password using this one-time link (valid for 30 minutes):`,
    resetUrl,
    "",
    "If you did not request this, you can safely ignore this email. Your password will not be changed.",
  ].join("\n")

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Reset your Skylent password</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 20px; margin-bottom: 12px;">Reset your Skylent password</h1>
  <p>You requested a password reset for your Skylent account. Click the button below to choose a new password. This link is valid for 30 minutes and can only be used once.</p>
  <p style="margin: 24px 0;">
    <a href="${safeUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 600;">Choose a new password</a>
  </p>
  <p style="font-size: 13px; color: #475569;">If you did not request this reset, you can safely ignore this email.</p>
</body>
</html>`

  return { subject, text, html }
}
