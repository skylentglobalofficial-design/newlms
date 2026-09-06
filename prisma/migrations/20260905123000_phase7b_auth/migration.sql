-- Rename session token column to reflect hashed storage
ALTER TABLE "Session" RENAME COLUMN "token" TO "tokenHash";

-- Require password hashes for authenticated users
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
