/**
 * HomePage — the public homepage (V51 Human-Crafted EdTech Standard).
 *
 * 1. Hero (Clear value proposition + direct navigation links)
 * 2. Courses & Career Tracks (Category filter tabs + clean course cards)
 * 3. Platform Overview (Clean 4-tab switcher: Workspace · Live Workshops · Mentor Support · Career & Degrees)
 * 4. Closing CTA
 */
import { useState } from "react"
import { PageShell } from "@/components/shared"
import { homeCataloguePhase } from "@/lib/catalogue-availability"
import { useCatalogPrograms } from "@/hooks/useCatalog"
import {
  HomeAi,
  HomeCareer,
  HomeClosing,
  HomeDegrees,
  HomeElixirFlywheel,
  confirmedOpenTitles,
  HomeHero,
  HomeInstitutionalArchitecture,
  HomeProgrammes,
  InsideProgramme,
  ZeroLoginInteractiveTryout,
} from "./home/Repolish"
import "./HomePage.v2.css"
import "./HomeRepolish.css"

const EXPLORE_TABS = [
  {
    id: "workspace" as const,
    label: "Course Workspace",
    sub: "Lessons, labs & projects",
  },
  {
    id: "workshops" as const,
    label: "Live Workshops",
    sub: "₹99 weekend sessions",
  },
  {
    id: "ai" as const,
    label: "Doubt Support",
    sub: "AI coach & 20-min TA",
  },
  {
    id: "career" as const,
    label: "Certificates & Degrees",
    sub: "Portfolios & university tracks",
  },
] as const

type ExploreTabId = (typeof EXPLORE_TABS)[number]["id"]

export default function HomePage() {
  const catalog = useCatalogPrograms()
  const catalogue = homeCataloguePhase(catalog.loading, catalog.offline)
  const [activeTab, setActiveTab] = useState<ExploreTabId>("workspace")

  return (
    <PageShell aurora={false}>
      <div className="site-light hm-page hx-page hx-page--home">
        <HomeHero
          catalogue={catalogue}
          openTitles={catalogue === "confirmed" ? confirmedOpenTitles(catalog.data ?? []) : []}
        />
        <HomeProgrammes
          programmes={catalog.data ?? []}
          loading={catalogue === "loading"}
          confirmed={catalogue === "confirmed"}
          onRetry={() => void catalog.reload()}
        />
        <ZeroLoginInteractiveTryout />

        {/* Clean 4-Tab Platform Switcher (Zero Emojis, Zero AI Slogans) */}
        <section
          className="hx-platform-hub"
          aria-label="How Skylent works"
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            borderBottom: "1px solid #e2e8f0",
            padding: "clamp(28px, 4vw, 44px) 0 8px",
          }}
        >
          <div className="sky-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 16,
                flexWrap: "wrap",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 6px",
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  How learning works on Skylent
                </h2>
                <p style={{ margin: 0, fontSize: 14.5, color: "#475569" }}>
                  Select a tab below to preview the course workspace, weekend workshops, mentor support, or verified credentials.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Platform sections"
                className="hx-hub-tabs"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(150px, 1fr))",
                  gap: 8,
                  width: "100%",
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {EXPLORE_TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: isActive ? "1.5px solid #5142b5" : "1px solid #cbd5e1",
                        background: isActive ? "#5142b5" : "#ffffff",
                        color: isActive ? "#ffffff" : "#0f172a",
                        cursor: "pointer",
                        transition: "background-color 140ms ease, border-color 140ms ease",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: isActive ? "#ffffff" : "#0f172a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.label}
                      </strong>
                      <small
                        style={{
                          display: "block",
                          marginTop: 2,
                          fontSize: 11.5,
                          color: isActive ? "#e0e7ff" : "#64748b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.sub}
                      </small>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div style={{ display: activeTab === "workspace" ? "block" : "none" }}>
            <InsideProgramme />
          </div>
          <div style={{ display: activeTab === "workshops" ? "block" : "none" }}>
            <HomeElixirFlywheel />
          </div>
          <div style={{ display: activeTab === "ai" ? "block" : "none" }}>
            <HomeAi />
          </div>
          <div style={{ display: activeTab === "career" ? "block" : "none" }}>
            <HomeCareer />
            <HomeDegrees />
          </div>
        </section>

        <HomeClosing />
      </div>
    </PageShell>
  )
}
