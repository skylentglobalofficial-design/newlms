import crypto from "node:crypto"

const TOKEN_BYTES = 32

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "If an account exists with that email, you will receive a password reset link."

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex")
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function isValidPasswordResetTokenFormat(token: string): boolean {
  return /^[a-f0-9]{64}$/i.test(token)
}

export function genericPasswordResetRequestResponse(emailConfigured: boolean) {
  return {
    message: PASSWORD_RESET_GENERIC_MESSAGE,
    emailConfigured,
  }
}

export function responseContainsTokenMaterial(body: unknown, token: string): boolean {
  if (!token || token.length < 16) return false
  const serialized = JSON.stringify(body)
  return serialized.includes(token)
}
