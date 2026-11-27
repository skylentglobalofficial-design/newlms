-- Roll back only the capability consent feature introduced by this migration.
BEGIN;
DROP TRIGGER IF EXISTS "CapabilityConsentEvent_append_only" ON "CapabilityConsentEvent";
DROP FUNCTION IF EXISTS prevent_capability_consent_event_mutation();
DROP TABLE IF EXISTS "CapabilityConsentEvent";
DROP TABLE IF EXISTS "CapabilityConsent";
COMMIT;
