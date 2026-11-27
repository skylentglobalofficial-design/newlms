-- Capability consent ledger: employer-specific, revocable sharing permissions.
-- No existing learner, enrolment, certificate, or payment rows are modified.
BEGIN;

CREATE TABLE "CapabilityConsent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "learnerUserId" UUID NOT NULL,
  "employerId" UUID NOT NULL,
  "scopes" TEXT[] NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CapabilityConsent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CapabilityConsent_learnerUserId_fkey"
    FOREIGN KEY ("learnerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CapabilityConsent_employerId_fkey"
    FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CapabilityConsent_learnerUserId_employerId_key"
  ON "CapabilityConsent"("learnerUserId", "employerId");
CREATE INDEX "CapabilityConsent_employerId_revokedAt_idx"
  ON "CapabilityConsent"("employerId", "revokedAt");
CREATE INDEX "CapabilityConsent_learnerUserId_revokedAt_idx"
  ON "CapabilityConsent"("learnerUserId", "revokedAt");

CREATE TABLE "CapabilityConsentEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "consentId" UUID NOT NULL,
  "actorUserId" UUID NOT NULL,
  "action" TEXT NOT NULL,
  "scopes" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CapabilityConsentEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CapabilityConsentEvent_consentId_createdAt_idx"
  ON "CapabilityConsentEvent"("consentId", "createdAt");

CREATE FUNCTION prevent_capability_consent_event_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Capability consent events are append-only';
END;
$$;
CREATE TRIGGER "CapabilityConsentEvent_append_only"
  BEFORE UPDATE OR DELETE ON "CapabilityConsentEvent"
  FOR EACH ROW EXECUTE FUNCTION prevent_capability_consent_event_mutation();

COMMIT;
