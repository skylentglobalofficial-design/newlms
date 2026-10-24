import crypto from "node:crypto"
import bcrypt from "bcrypt"
import { prisma } from "./prisma.js"
import { BCRYPT_ROUNDS, normalizeEmail } from "./auth.js"

const TOKEN_BYTES = 32
const TOKEN_EXPIRY_MINUTES = 60

export class PasswordResetError extends Error {
  constructor(
    message: string,
    public readonly code: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "USED_TOKEN" | "USER_NOT_FOUND" | "RATE_LIMITED"
  ) {
    super(message)
    this.name = "PasswordResetError"
  }
}

function generateToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString("hex")
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function createPasswordResetToken(email: string): Promise<{
  token: string
  userId: string
  expiresAt: Date
} | null> {
  const normalized = normalizeEmail(email)
  
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, passwordHash: true },
  })

  if (!user || !user.passwordHash) {
    return null
  }

  const recentTokens = await prisma.passwordResetToken.count({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  })

  if (recentTokens >= 3) {
    throw new PasswordResetError("Too many password reset requests", "RATE_LIMITED")
  }

  const token = generateToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  return { token, userId: user.id, expiresAt }
}

export async function validatePasswordResetToken(token: string): Promise<{
  userId: string
  tokenId: string
}> {
  const tokenHash = hashToken(token)
  const now = new Date()

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, usedAt: true },
  })

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

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<void> {
  const tokenHash = hashToken(token)
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    })

    if (!resetToken) {
      throw new PasswordResetError("Invalid password reset token", "INVALID_TOKEN")
    }

    if (resetToken.usedAt) {
      throw new PasswordResetError("Password reset token has already been used", "USED_TOKEN")
    }

    if (resetToken.expiresAt < now) {
      throw new PasswordResetError("Password reset token has expired", "EXPIRED_TOKEN")
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })

    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
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
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { usedAt: { not: null } },
      ],
      createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })
  return result.count
}
