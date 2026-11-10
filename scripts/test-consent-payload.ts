import { CURRENT_POLICY_VERSION } from "../server/src/lib/policy.ts"

/** What a client sends after the terms checkbox is ticked. Used by the API test scripts when they act as that client. */
export const TEST_CONSENT = { accepted: true, policyVersion: CURRENT_POLICY_VERSION } as const
