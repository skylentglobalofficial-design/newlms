function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "")
}

export function railwayHttpsOrigin(): string | undefined {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
  if (!domain) return undefined
  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  if (!host) return undefined
  return `https://${host}`
}

export function configuredFrontendOrigin(): string | undefined {
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured) return stripTrailingSlash(configured)
  return railwayHttpsOrigin()
}

export function frontendOrigin(): string {
  return configuredFrontendOrigin() ?? "http://localhost:5173"
}
