import { apiV1 } from "./api-base"
import { ensureCsrfToken } from "./auth-api"
import { parseApiJson } from "./http"

const API_BASE = apiV1()

export type ElixirTransaction = {
  id: string
  amount: number
  type: string
  activity: string | null
  note: string | null
  unrecovered: number
  createdAt: string
}

export type ElixirWallet = {
  balance: number
  ledgerSum: number
  consistent: boolean
  transactions: ElixirTransaction[]
  entitlements: Array<{ slug: string; title: string; kind: string }>
  rewardSchedule?: Array<{ activity: string; label: string; elixir: number; rule: string }>
}

export type ElixirResource = {
  slug: string
  kind: "notes" | "case_study"
  title: string
  summary: string | null
  elixirPrice: number
  courseSlug: string | null
  lessonKey: string | null
  owned: boolean
}

async function elixirGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include", signal })
  return parseApiJson<T>(response)
}

async function elixirPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await ensureCsrfToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
    body: JSON.stringify(body),
  })
  return parseApiJson<T>(response)
}

let walletInFlight: Promise<{ data: ElixirWallet }> | null = null
let walletCached: { data: ElixirWallet; ts: number } | null = null

export function invalidateElixirWalletCache() {
  walletCached = null
  walletInFlight = null
}

export function fetchElixirWallet(signal?: AbortSignal) {
  if (walletCached && Date.now() - walletCached.ts < 8000) {
    return Promise.resolve({ data: walletCached.data })
  }
  if (walletInFlight) {
    return walletInFlight
  }
  const req = elixirGet<{ data: ElixirWallet }>("/elixir", signal)
    .then((res) => {
      walletCached = { data: res.data, ts: Date.now() }
      return res
    })
    .finally(() => {
      walletInFlight = null
    })
  walletInFlight = req
  return req
}

export function fetchElixirResources(signal?: AbortSignal) {
  return elixirGet<{ data: ElixirResource[] }>("/elixir/resources", signal)
}

export function purchaseElixirResource(slug: string) {
  return elixirPost<{ data: { balance: number; price: number; title: string } }>(`/elixir/resources/${slug}/purchase`, {}).then((res) => {
    invalidateElixirWalletCache()
    return res
  })
}
