import { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { apiV1 } from "../../lib/api-base"
import { fetchLmsEnrollments, type ApiEnrollmentSummary } from "../../lib/lms-api"
import { myCourseRows } from "../../lib/my-courses"
import { readCachedRiseRows, writeCachedRiseRows, type RiseRow } from "../../components/learner/CareerRiseCard"
import CareerOSShell from "../../components/career/CareerOSShell"
import CareerOSPublicPage from "./CareerOSPublicPage"
import CareerOSPublicAreaPage from "./CareerOSPublicAreaPage"
import "./CareerOS.css"

const ENROLLMENTS_CACHE_KEY = "skylent_cache_enrollments_v1"

function readCachedEnrollments(): ApiEnrollmentSummary[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(ENROLLMENTS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ApiEnrollmentSummary[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeCachedEnrollments(rows: ApiEnrollmentSummary[]) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(ENROLLMENTS_CACHE_KEY, JSON.stringify(rows))
  } catch {
    // ignore storage errors
  }
}

type TrackGateItem = {
  slug: string
  title: string
  percent: number
  completedModules: number
  totalModules: number
}

function CareerOsLockedInsideLearnerShell({
  tracks,
  loadingTracks,
}: {
  tracks: TrackGateItem[]
  loadingTracks: boolean
}) {
  const [selectedSlug, setSelectedSlug] = useState<string>(() => tracks[0]?.slug ?? "")

  useEffect(() => {
    if (tracks.length > 0 && !tracks.some((t) => t.slug === selectedSlug)) {
      setSelectedSlug(tracks[0].slug)
    }
  }, [tracks, selectedSlug])

  const activeTrack = tracks.find((t) => t.slug === selectedSlug) ?? tracks[0] ?? null

  return (
    <CareerOSShell hideSubnav>
      <section aria-labelledby="cos-locked-title" style={{ maxWidth: 880, padding: "12px 0 40px", display: "grid", gap: 18 }}>
        {/* Top Royal Purple Banner */}
        <div
          style={{
            padding: "26px 28px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #3b2d96 100%)",
            color: "#ffffff",
            boxShadow: "0 16px 36px -16px rgba(15, 23, 42, 0.35)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#e0e7ff",
              background: "rgba(255, 255, 255, 0.14)",
              padding: "4px 12px",
              borderRadius: 999,
              marginBottom: 10,
            }}
          >
            SKYLENT CAREER OS · PLACEMENT &amp; READINESS GATE
          </span>
          <h1 id="cos-locked-title" style={{ margin: "0 0 8px", fontSize: "clamp(22px, 2.8vw, 30px)", color: "#ffffff" }}>
            Unlock Career OS Exclusive
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#cbd5e1", maxWidth: 680 }}>
            Complete <strong style={{ color: "#ffffff" }}>60% of your course + quizzes + project</strong> within 6 months to unlock Career OS &amp; get <strong style={{ color: "#ffffff" }}>+3 Months Extra Practice</strong>.
          </p>
        </div>

        {loadingTracks && tracks.length === 0 ? (
          <div
            style={{
              padding: "28px",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
            }}
          >
            <span className="os-skeleton" style={{ width: 220, height: 22, display: "block", marginBottom: 14 }} />
            <span className="os-skeleton" style={{ width: "100%", height: 64, display: "block" }} />
          </div>
        ) : tracks.length > 0 && activeTrack ? (
          <>
            {/* Enrolled Course Switcher Pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {tracks.map((t) => {
                const isSelected = t.slug === activeTrack.slug
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setSelectedSlug(t.slug)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      border: isSelected ? "2px solid #5142b5" : "1px solid #cbd5e1",
                      background: isSelected ? "#f5f3ff" : "#ffffff",
                      color: isSelected ? "#5142b5" : "#334155",
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t.title} ({t.percent}%)
                  </button>
                )
              })}
            </div>

            {/* Active Track Eligibility Progress Card */}
            <div
              style={{
                padding: "24px 26px",
                borderRadius: 16,
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                boxShadow: "0 10px 28px -16px rgba(15, 23, 42, 0.06)",
                display: "grid",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#5142b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    ACTIVE TRACK · FLAGSHIP LIVE + CAREER OS PRO
                  </span>
                  <h2 style={{ margin: "4px 0 0", fontSize: 21, color: "#0f172a" }}>
                    {activeTrack.title} — Eligibility Progress
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "#ecfdf5",
                    color: "#047857",
                  }}
                >
                  ✓ +3M Practice Extension Ready on Unlock
                </span>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ padding: "16px 18px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>1. Complete 60% of Course Curriculum</strong>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#5142b5" }}>{activeTrack.percent}% / 60% Required</span>
                  </div>
                  <div style={{ width: "100%", height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, activeTrack.percent)}%`, height: "100%", background: "#5142b5" }} />
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>2. Pass Course Module Quizzes</strong>
                    <span style={{ fontSize: 12.5, color: "#64748b" }}>Verify core concepts in your course checks</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#e2e8f0", color: "#475569" }}>
                    {activeTrack.percent >= 60 ? "Completed" : "Pending"}
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>3. Complete Capstone Project (0/6 Milestones)</strong>
                    <span style={{ fontSize: 12.5, color: "#64748b" }}>Submit your verified project in the Project Studio</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#e2e8f0", color: "#475569" }}>
                    0/6 Done
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 6 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link
                    to={`/learn/${activeTrack.slug}`}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: 13.5,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Continue Course →
                  </Link>
                  <Link
                    to="/dashboard/student#student-projects"
                    style={{
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: 13.5,
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Open Project Studio →
                  </Link>
                </div>
                <span
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "#e2e8f0",
                    color: "#475569",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  🔒 Complete 60%, Quizzes &amp; Project to Enroll
                </span>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              padding: "32px 26px",
              borderRadius: 16,
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#0f172a" }}>Enrol in a Course First</h2>
            <p style={{ margin: "0 0 18px", fontSize: 14, color: "#64748b" }}>
              Choose a Premium or Pro career track to start your learning and unlock Career OS.
            </p>
            <Link
              to="/dashboard/student#explore-programmes"
              style={{
                display: "inline-block",
                padding: "12px 22px",
                borderRadius: 10,
                background: "#5142b5",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Explore Programmes →
            </Link>
          </div>
        )}
      </section>
    </CareerOSShell>
  )
}

function buildTracksFromCaches(
  riseRows: RiseRow[] | null,
  enrollments: ApiEnrollmentSummary[] | null,
): TrackGateItem[] {
  const map = new Map<string, TrackGateItem>()
  if (riseRows) {
    for (const r of riseRows) {
      map.set(r.slug, {
        slug: r.slug,
        title: r.title,
        percent: r.percent ?? 0,
        completedModules: r.completedModules ?? 0,
        totalModules: r.totalModules ?? 5,
      })
    }
  }
  if (enrollments) {
    for (const c of myCourseRows(enrollments)) {
      if (!c.slug) continue
      if (!map.has(c.slug)) {
        map.set(c.slug, {
          slug: c.slug,
          title: c.title,
          percent: c.progressPct ?? 0,
          completedModules: 0,
          totalModules: 5,
        })
      }
    }
  }
  return Array.from(map.values())
}

export default function CareerOSLayout() {
  const { user, ready } = useAuth()
  const { pathname } = useLocation()
  const initialRise = readCachedRiseRows()
  const initialEnrollments = readCachedEnrollments()
  const [tracks, setTracks] = useState<TrackGateItem[]>(() =>
    buildTracksFromCaches(initialRise, initialEnrollments),
  )
  const [loadingTracks, setLoadingTracks] = useState<boolean>(
    () => initialRise === null && initialEnrollments === null,
  )
  const [accessState, setAccessState] = useState<"loading" | "open" | "locked">(() => {
    if (
      user?.role === "superadmin" ||
      user?.role === "admin" ||
      user?.email?.toLowerCase() === "tariniprasadtripathy17@gmail.com"
    ) {
      return "open"
    }
    return "locked"
  })

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const isSuperOrAdmin =
      user.role === "superadmin" ||
      user.role === "admin" ||
      user.email?.toLowerCase() === "tariniprasadtripathy17@gmail.com"

    if (isSuperOrAdmin) {
      setAccessState("open")
    }

    const checkEligibility = async () => {
      try {
        const [accessRes, riseRes, enrolRes] = await Promise.all([
          fetch(`${apiV1()}/career/access`, { credentials: "include" }).catch(() => null),
          fetch(`${apiV1()}/career-rise`, { credentials: "include" }).catch(() => null),
          fetchLmsEnrollments().catch(() => null),
        ])

        let explicitEntitled = false
        if (accessRes && accessRes.ok) {
          const body = (await accessRes.json().catch(() => ({}))) as { data?: { entitled?: boolean } }
          explicitEntitled = body.data?.entitled === true
        }

        let riseRows: RiseRow[] | null = readCachedRiseRows()
        let qualified60 = false
        if (riseRes && riseRes.ok) {
          const riseBody = (await riseRes.json().catch(() => ({}))) as { data?: RiseRow[] }
          riseRows = riseBody.data ?? []
          writeCachedRiseRows(riseRows)
          for (const r of riseRows) {
            if (r.percent >= (r.thresholdPercent || 60) && (r.eligible || r.enrolled)) {
              qualified60 = true
            }
          }
        }

        if (enrolRes) {
          writeCachedEnrollments(enrolRes)
        }

        if (!cancelled) {
          const merged = buildTracksFromCaches(riseRows, enrolRes ?? readCachedEnrollments())
          setTracks(merged)
          setLoadingTracks(false)
          if (isSuperOrAdmin || (explicitEntitled && qualified60)) {
            setAccessState("open")
          } else {
            setAccessState("locked")
          }
        }
      } catch {
        if (!cancelled) {
          setLoadingTracks(false)
          setAccessState("locked")
        }
      }
    }
    void checkEligibility()
    return () => {
      cancelled = true
    }
  }, [user?.id, user?.role, user?.email])

  if (!ready) {
    return (
      <CareerOSShell hideSubnav>
        <div style={{ padding: "32px 24px", color: "#475569", fontSize: 14 }}>
          Loading Career OS…
        </div>
      </CareerOSShell>
    )
  }

  if (!user) {
    const isOverview = pathname === "/career-os" || pathname === "/career-os/"
    if (isOverview) return <CareerOSPublicPage />
    return <CareerOSPublicAreaPage />
  }

  if (accessState !== "open") {
    return <CareerOsLockedInsideLearnerShell tracks={tracks} loadingTracks={loadingTracks} />
  }

  return (
    <CareerOSShell>
      <Outlet />
    </CareerOSShell>
  )
}
