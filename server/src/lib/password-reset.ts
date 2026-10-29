import bcrypt from "bcrypt"
import { prisma } from "./prisma.js"
import { BCRYPT_ROUNDS, normalizeEmail } from "./auth.js"
import { isMissingSchemaError, UNAVAILABLE_MESSAGES } from "./schema-capabilities.js"
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  isValidPasswordResetTokenFormat,
  PASSWORD_RESET_GENERIC_MESSAGE,
  genericPasswordResetRequestResponse,
  responseContainsTokenMaterial,
} from "./password-reset-crypto.js"

export {
  generatePasswordResetToken,
  hashPasswordResetToken,
  isValidPasswordResetTokenFormat,
  PASSWORD_RESET_GENERIC_MESSAGE,
  genericPasswordResetRequestResponse,
  responseContainsTokenMaterial,
}

function rethrowIfSchemaMissing(error: unknown): never {
  if (isMissingSchemaError(error)) throw new PasswordResetStorageUnavailableError()
  throw error
}

const TOKEN_EXPIRY_MINUTES = 60
const MAX_TOKENS_PER_USER_WINDOW = 3
const USER_RATE_WINDOW_MS = 15 * 60 * 1000

export class PasswordResetStorageUnavailableError extends Error {
  constructor() {
    super(UNAVAILABLE_MESSAGES.passwordReset)
    this.name = "PasswordResetStorageUnavailableError"
  }
}

export class PasswordResetError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "INVALID_TOKEN"
      | "EXPIRED_TOKEN"
      | "USED_TOKEN"
      | "USER_NOT_FOUND"
      | "RATE_LIMITED",
  ) {
    super(message)
    this.name = "PasswordResetError"
  }
}

/**
 * Creates a reset token for a known password-account user.
 * Returns null for unknown emails or OAuth-only accounts (no passwordHash)
 * so callers can return a generic response either way.
 * Never logs or returns the plaintext token except as the function return value
 * for the email sender.
 */
export async function createPasswordResetToken(email: string): Promise<{
  token: string
  userId: string
  expiresAt: Date
} | null> {
  const normalized = normalizeEmail(email)

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, passwordHash: true },
  }).catch(rethrowIfSchemaMissing)

  if (!user || !user.passwordHash) {
    return null
  }

  const recentTokens = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - USER_RATE_WINDOW_MS) },
    },
  }).catch(rethrowIfSchemaMissing)

  if (recentTokens >= MAX_TOKENS_PER_USER_WINDOW) {
    throw new PasswordResetError("Too many password reset requests", "RATE_LIMITED")
  }

  const token = generatePasswordResetToken()
  const tokenHash = hashPasswordResetToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  }).catch(rethrowIfSchemaMissing)

  return { token, userId: user.id, expiresAt }
}

export async function validatePasswordResetToken(token: string): Promise<{
  userId: string
  tokenId: string
}> {
  if (!isValidPasswordResetTokenFormat(token)) {
    throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
  }

  const tokenHash = hashPasswordResetToken(token)
  const now = new Date()

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  }).catch(rethrowIfSchemaMissing)

  if (!resetToken) {
    throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
  }

  if (resetToken.usedAt) {
    throw new PasswordResetError("Password reset token has already been used", "USED_TOKEN")
  }

  if (resetToken.expiresAt < now) {
    throw new PasswordResetError("Password reset token has expired", "EXPIRED_TOKEN")
  }

  return { userId: resetToken.userId, tokenId: resetToken.id }
}

/**
 * Atomically claims the token (usedAt) then updates the password and clears sessions.
 * Concurrent callers racing the same token: only one updateMany succeeds.
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  if (!isValidPasswordResetTokenFormat(token)) {
    throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
  }

  const tokenHash = hashPasswordResetToken(token)
  const now = new Date()
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

  try {
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    })

    if (claimed.count !== 1) {
      const existing = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { usedAt: true, expiresAt: true },
      })
      if (!existing) {
        throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
      }
      if (existing.usedAt) {
        throw new PasswordResetError("Password reset token has already been used", "USED_TOKEN")
      }
      if (existing.expiresAt <= now) {
        throw new PasswordResetError("Password reset token has expired", "EXPIRED_TOKEN")
      }
      throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
    }

    const resetToken = await tx.passwordResetToken.findUniqueOrThrow({
      where: { tokenHash },
      select: { id: true, userId: true },
    })

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })

    await tx.session.deleteMany({
      where: { userId: resetToken.userId },
    })

    await tx.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
        usedAt: null,
      },
      data: { usedAt: now },
    })
  })
  } catch (error) {
    rethrowIfSchemaMissing(error)
  }
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
      createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })
  return result.count
}

