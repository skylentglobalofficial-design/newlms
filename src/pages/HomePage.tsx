/**
 * HomePage — the public homepage (V50 Visual EdTech Funnel — Coursera/Udemy/PW Standard).
 *
 * Scroll 1: Hero (Crisp Value Prop + Quick Goal Chips + Live Platform Stats)
 * Scroll 2: Programmes & Courses Explorer (Interactive Category Filter Pills + Visual Cards)
 * Scroll 3: Interactive 4-Tab "Explore Skylent" Hub (Workshops · Inside LMS · AI & 20-Min TA · Career Proof & Degrees)
 * Scroll 4: Closing CTA
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
    icon: "🖥️",
    label: "Inside the Workspace",
    sub: "Interactive SQL Lab & 5-Stage LMS",
  },
  {
    id: "workshops" as const,
    icon: "🪙",
    label: "₹99 Live Workshops",
    sub: "100% Elixir Coin Cashback",
  },
  {
    id: "ai" as const,
    icon: "🤖",
    label: "AI Coach + 20-Min TA",
    sub: "English & Hinglish Doubt Help",
  },
  {
    id: "career" as const,
    icon: "🎓",
    label: "Career Proof & Degrees",
    sub: "Verified Dossiers & UG/PG Tracks",
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

        {/* Interactive 4-Tab Platform Explorer: Eliminates the 9,500px wall of text on Desktop & Mobile Web */}
        <section
          className="hx-platform-hub"
          aria-label="Explore how Skylent works"
          style={{
            background: "#f8f7ff",
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
                marginBottom: 18,
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#5142b5",
                  }}
                >
                   interactive platform tour · zero fluff
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "clamp(22px, 2.6vw, 32px)",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Everything you need to learn, practise &amp; prove your skills.
                </h2>
              </div>

              <div
                role="tablist"
                aria-label="Skylent platform features"
                className="hx-hub-tabs"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(165px, 1fr))",
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
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textAlign: "left",
                        padding: "11px 14px",
                        borderRadius: 14,
                        border: isActive ? "2px solid #5142b5" : "1px solid #cbd5e1",
                        background: isActive
                          ? "linear-gradient(135deg, #3B2D96 0%, #5142B5 100%)"
                          : "#ffffff",
                        color: isActive ? "#ffffff" : "#0f172a",
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 10px 24px -8px rgba(59, 45, 150, 0.4)"
                          : "0 2px 6px rgba(15, 23, 42, 0.04)",
                        transition: "all 150ms ease",
                      }}
                    >
                      <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">
                        {tab.icon}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: "block",
                            fontSize: 13.5,
                            fontWeight: 800,
                            color: isActive ? "#ffffff" : "#0f172a",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tab.label}
                        </strong>
                        <small
                          style={{
                            display: "block",
                            fontSize: 11,
                            color: isActive ? "#ddd6fe" : "#64748b",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tab.sub}
                        </small>
                      </span>
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
            <HomeInstitutionalArchitecture />
          </div>
        </section>

        <HomeClosing />
      </div>
    </PageShell>
  )
}
