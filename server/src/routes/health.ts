import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getAiHealthSummary } from "../lib/ai-diagnostics.js";
import { getSchemaReadiness } from "../lib/schema-check.js";
import { getStorageStatus } from "../lib/storage-Check.js";

const router = Router();
const startedAt = Date.now();

export const DEPLOYED_APP_VERSION = process.env.SKYLENT_APP_VERSION || "10.2.0";

function computeDynamicBuildId(): string {
  if (process.env.SKYLENT_BUILD_ID) return process.env.SKYLENT_BUILD_ID;
  const gitSha = (
    process.env.RENDER_GIT_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT ||
    ""
  ).slice(0, 8);

  const candidates = [
    path.resolve(process.cwd(), "dist/index.html"),
    path.resolve(process.cwd(), "../dist/index.html"),
  ];
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) {
        const html = readFileSync(candidate, "utf8");
        const mtime = Math.floor(statSync(candidate).mtimeMs / 1000);
        const digest = createHash("sha1").update(html).digest("hex").slice(0, 10);
        return `v102-${gitSha ? `${gitSha}-` : ""}${digest}-${mtime}`;
      }
    } catch {
      // ignore and fall back
    }
  }
  return `v102-${gitSha || "live"}-${Math.floor(startedAt / 1000)}`;
}

export const DEPLOYED_BUILD_ID = computeDynamicBuildId();
export const MINIMUM_ANDROID_VERSION_CODE = 10200;

router.get("/version", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.json({
    ok: true,
    appVersion: DEPLOYED_APP_VERSION,
    buildId: computeDynamicBuildId(),
    minAndroidVersionCode: MINIMUM_ANDROID_VERSION_CODE,
    releasedAt: new Date(startedAt).toISOString(),
    apkDownloadUrl: "/downloads/skylent-android-latest.apk",
    features: [
      "all-6-tracks-live",
      "video-lab-ready",
      "elixir-wallet-v2",
      "auto-ota-sync-v102",
      "anti-piracy-drm-v102",
    ],
  });
});

router.get("/", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const storage = getStorageStatus();
  const ai = getAiHealthSummary();
  const currentBuildId = computeDynamicBuildId();
  try {
    const started = Date.now();
    await pool.query("SELECT 1");
    const dbLatencyMs = Date.now() - started;
    const schema = await getSchemaReadiness();
    const ok = schema.ready && storage.healthy;
    res.status(ok ? 200 : 503).json({
      ok,
      service: "skylent-api",
      appVersion: DEPLOYED_APP_VERSION,
      buildId: currentBuildId,
      minAndroidVersionCode: MINIMUM_ANDROID_VERSION_CODE,
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      dbLatencyMs,
      schema,
      storage,
      ai,
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      service: "skylent-api",
      appVersion: DEPLOYED_APP_VERSION,
      buildId: currentBuildId,
      error: err instanceof Error ? err.message : "Database unavailable",
      storage,
      ai,
    });
  }
});

export default router;
