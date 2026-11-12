import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  readCatalogLocks,
  toggleCatalogItemLock,
  toggleDegreeSemesterLock,
  writeCatalogLocks,
  type CatalogLockItem,
  type CatalogCategory
} from "../lib/catalog-locks";

type AdminTab = "analytics" | "catalog" | "degrees" | "users" | "colleges";

const COLLEGES = [
  "All Partner Colleges & Direct Learners",
  "Sri Sri University (SSU), Cuttack",
  "Jagadguru Kripalu University (JKU), Odisha",
  "Bhubaneswar Engineering & Autonomous Cohort",
  "Direct Open Enrolments (Skylent.live)"
];

const TREND_DATA: Record<string, { labels: string[]; students: number[]; faculty: number[] }> = {
  Daily: {
    labels: ["06 Nov", "07 Nov", "08 Nov", "09 Nov", "10 Nov", "11 Nov", "12 Nov"],
    students: [68, 84, 92, 110, 128, 142, 164],
    faculty: [9, 11, 12, 12, 14, 15, 16]
  },
  Weekly: {
    labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7"],
    students: [210, 265, 310, 390, 445, 520, 612],
    faculty: [14, 16, 18, 19, 22, 24, 26]
  },
  Monthly: {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    students: [320, 480, 690, 940, 1280, 1640],
    faculty: [12, 15, 19, 22, 26, 31]
  }
};

export function DashboardAdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0]);
  const [chartRole, setChartRole] = useState<"students" | "faculty">("students");
  const [chartGranularity, setChartGranularity] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [catalogCategory, setCatalogCategory] = useState<CatalogCategory>("self-paced");
  const [catalogItems, setCatalogItems] = useState<CatalogLockItem[]>(() => readCatalogLocks());
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseCategory, setNewCourseCategory] = useState<CatalogCategory>("self-paced");
  const [newCoursePrice, setNewCoursePrice] = useState("1499");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setCatalogItems(readCatalogLocks());
    window.addEventListener("skylent:catalog-locks-updated", sync);
    return () => window.removeEventListener("skylent:catalog-locks-updated", sync);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const handleToggleLock = (id: string, title: string) => {
    const next = toggleCatalogItemLock(id);
    setCatalogItems(next);
    const target = next.find((i) => i.id === id);
    showToast(`${title} is now ${target?.locked ? "LOCKED 🔒" : "LIVE & UNLOCKED ✓"}`);
  };

  const handleToggleSemester = (id: string, sem: number) => {
    const next = toggleDegreeSemesterLock(id, sem);
    setCatalogItems(next);
    showToast(`Updated Semester ${sem} access lock state.`);
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    const price = Number(newCoursePrice) || 1499;
    const created: CatalogLockItem = {
      id: "custom-" + Date.now(),
      code: "SKY-" + Math.floor(100 + Math.random() * 899),
      title: newCourseTitle.trim(),
      category: newCourseCategory,
      subtitle: "Case study + browser lab track configured from Skylent Admin Studio",
      duration: newCourseCategory === "expert-9-12m" ? "9 Months (36 Weeks)" : newCourseCategory === "degree-sem" ? "4 Years (8 Semesters)" : "2 Months (8 Weeks)",
      priceInr: price,
      originalPriceInr: price * 2,
      discountLabel: "50% OFF Scholarship",
      locked: false,
      badge: newCourseCategory === "expert-9-12m" ? "9-12M Expert Track" : newCourseCategory === "degree-sem" ? "Degree Track" : "Case Study Track",
      mentorOrUniversity: "Skylent Academic Council",
      semestersTotal: newCourseCategory === "degree-sem" ? 8 : undefined,
      unlockedSemesters: newCourseCategory === "degree-sem" ? [1, 2] : undefined,
      caseStudiesCount: 6,
      labsCount: 16
    };
    const next = [created, ...catalogItems];
    writeCatalogLocks(next);
    setCatalogItems(next);
    setNewCourseTitle("");
    setModalOpen(false);
    showToast(`Created "${created.title}" in live catalog.`);
  };

  const handleDownloadCsv = () => {
    const series = TREND_DATA[chartGranularity];
    const rows = ["Period,Active Students,Active Faculty"];
    series.labels.forEach((lbl, idx) => {
      rows.push(`${lbl},${series.students[idx]},${series.faculty[idx]}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skylent-analytics-${chartGranularity.toLowerCase()}.csv`;
    a.click();
    showToast("Downloaded analytics CSV report.");
  };

  const series = TREND_DATA[chartGranularity];
  const activeValues = chartRole === "students" ? series.students : series.faculty;
  const maxVal = Math.max(...activeValues, 10);
  const svgPoints = activeValues
    .map((val, idx) => {
      const x = 40 + (idx * 520) / Math.max(activeValues.length - 1, 1);
      const y = 180 - (val / maxVal) * 140;
      return `${x},${y}`;
    })
    .join(" ");

  const activeCount = catalogItems.filter((i) => !i.locked).length;
  const lockedCount = catalogItems.filter((i) => i.locked).length;
  const expertCount = catalogItems.filter((i) => i.category === "expert-9-12m").length;
  const degreeCount = catalogItems.filter((i) => i.category === "degree-sem").length;

  const CLEAN_USERS = [
    { id: 1, name: "Aarav Mohanty", email: "aarav.m@ssu.ac.in", role: "STUDENT", org: "Sri Sri University", track: "Data Analytics Case Study Track", status: "ACTIVE", progress: "78% · 4/6 Case Studies" },
    { id: 2, name: "Priyanka Panda", email: "priyanka.p@jku.edu.in", role: "STUDENT", org: "JKU Odisha", track: "Full-Stack TypeScript & Cloud", status: "ACTIVE", progress: "92% · Capstone V2 Approved" },
    { id: 3, name: "Dr. Subrat Dash", email: "s.dash@skylent.live", role: "FACULTY", org: "Skylent Academic Council", track: "AI & Analytics Case Study Reviewer", status: "ACTIVE", progress: "28 Submissions Reviewed" },
    { id: 4, name: "Siddharth Rout", email: "siddharth.r@gmail.com", role: "STUDENT", org: "Direct Enrolment", track: "12M Applied AI & Cloud Program", status: "ACTIVE", progress: "64% · Live Cohort" },
    { id: 5, name: "Prof. Ananya Mishra", email: "ananya.m@ssu.ac.in", role: "COLLEGE_ADMIN", org: "Sri Sri University", track: "B.Tech CSE & AI (Sem 1–2 Unlocked)", status: "ACTIVE", progress: "142 Campus Learners" },
    { id: 6, name: "Rohan Patnaik", email: "rohan.patnaik@outlook.com", role: "FACULTY", org: "Industry Expert Council", track: "9M Data Science Expert Program", status: "ACTIVE", progress: "Weekend Masterclasses" }
  ].filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      !userSearch.trim() ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.track.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ background: "linear-gradient(135deg, #2e1f84 0%, #3b2d96 45%, #1d4ed8 100%)", color: "#ffffff", padding: "20px 28px", boxShadow: "0 10px 30px rgba(29, 78, 216, 0.18)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: "rgba(255,255,255,0.16)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Skylent Executive Control Center · v123
              </span>
              <span style={{ background: "#22c55e", color: "#052e16", padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                ● LIVE PRODUCTION
              </span>
            </div>
            <h1 style={{ margin: "6px 0 2px", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Admin Analytics, Catalogue & Degree Lock Studio
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.84)" }}>
              Manage ₹1,499 Case Study Tracks, ₹11,999 Job Assistance Cohorts, 9–12M Industry Expert Programs & University Semester Locks.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              aria-label="Filter by College or Cohort"
              style={{ background: "rgba(255,255,255,0.14)", color: "#fff", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 600, outline: "none" }}
            >
              {COLLEGES.map((c) => (
                <option key={c} value={c} style={{ color: "#0f172a" }}>{c}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{ background: "#ffffff", color: "#1e3a8a", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
            >
              + Create Course / Expert Program
            </button>
            <Link to="/programmes" style={{ color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.12)" }}>
              View Public Site ↗
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 1360, margin: "18px auto 0", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14 }}>
          {[
            { id: "analytics", label: "1. Analytics, Heatmap & Funnel" },
            { id: "catalog", label: "2. Courses & 9–12M Expert Programs (Lock/Price)" },
            { id: "degrees", label: "3. Online Degrees & Semester 1–8 Locks" },
            { id: "users", label: "4. Clean Users & Faculty Directory" },
            { id: "colleges", label: "5. Partner Colleges & Employers" }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as AdminTab)}
              style={{
                background: activeTab === t.id ? "#ffffff" : "rgba(255,255,255,0.1)",
                color: activeTab === t.id ? "#1e3a8a" : "#ffffff",
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "linear-gradient(135deg, #3b2d96, #1d4ed8)", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 13, boxShadow: "0 12px 28px rgba(29,78,216,0.35)" }}>
          {toast}
        </div>
      )}

      <main style={{ maxWidth: 1360, margin: "24px auto", padding: "0 24px 60px" }}>
        {activeTab === "analytics" && (
          <div style={{ display: "grid", gap: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {[
                { label: "Total Enrolled Learners", value: "1,640", delta: "+28.4% vs last 30 days", sub: "Across ₹1,499 & ₹11,999 tracks", accent: "#2563eb" },
                { label: "Case Study & Lab Submissions", value: "4,820", delta: "+34.1% completion velocity", sub: "SQL, Python, Full-Stack & PRD labs", accent: "#4f46e5" },
                { label: "Active Weekly Logins", value: "1,192", delta: "72.6% 7-day retention", sub: "Zero-setup browser workspace sessions", accent: "#0891b2" },
                { label: "Active Partner Colleges & Tracks", value: `${activeCount} Live / ${lockedCount} Locked`, delta: "SSU, JKU & Direct Cohorts", sub: "Instant semester lock control enabled", accent: "#7c3aed" }
              ].map((kpi) => (
                <div key={kpi.label} style={{ background: "#ffffff", borderRadius: 16, padding: 20, border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(15,23,42,0.04)", borderTop: `4px solid ${kpi.accent}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>{kpi.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: "8px 0 6px" }}>{kpi.value}</div>
                  <div style={{ display: "inline-block", background: "#eff6ff", color: "#1d4ed8", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{kpi.delta}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#ffffff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Active Cohort & Case Study Engagement Trend</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Scope: {selectedCollege}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
                    {(["students", "faculty"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setChartRole(r)}
                        style={{ border: "none", background: chartRole === r ? "#1d4ed8" : "transparent", color: chartRole === r ? "#fff" : "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
                    {(["Daily", "Weekly", "Monthly"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setChartGranularity(g)}
                        style={{ border: "none", background: chartGranularity === g ? "#3b2d96" : "transparent", color: chartGranularity === g ? "#fff" : "#475569", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    ⬇ Download CSV
                  </button>
                </div>
              </div>

              <svg viewBox="0 0 600 210" style={{ width: "100%", height: 220, overflow: "visible" }}>
                <defs>
                  <linearGradient id="skylentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#3b2d96" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
                  const y = 40 + step * 140;
                  const val = Math.round(maxVal * (1 - step));
                  return (
                    <g key={i}>
                      <line x1="40" y1={y} x2="560" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <text x="8" y={y + 4} fontSize="10" fill="#64748b" fontWeight="600">{val}</text>
                    </g>
                  );
                })}
                <polygon points={`40,180 ${svgPoints} 560,180`} fill="url(#skylentAreaGrad)" />
                <polyline fill="none" stroke="#1d4ed8" strokeWidth="3.5" points={svgPoints} />
                {activeValues.map((val, idx) => {
                  const x = 40 + (idx * 520) / Math.max(activeValues.length - 1, 1);
                  const y = 180 - (val / maxVal) * 140;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#3b2d96" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b">{val}</text>
                      <text x={x} y="198" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">{series.labels[idx]}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 18 }}>
              <div style={{ background: "#ffffff", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800 }}>Weekly Browser Lab & Case Study Heatmap</h3>
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748b" }}>Peak lab concurrency across IST time slots (Mon–Sun)</p>
                <div style={{ display: "grid", gridTemplateColumns: "60px repeat(6, 1fr)", gap: 6, fontSize: 11, fontWeight: 600, color: "#475569" }}>
                  <div></div>
                  <div>9 AM</div><div>12 PM</div><div>3 PM</div><div>6 PM</div><div>9 PM</div><div>11 PM</div>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, dIdx) => (
                    <React.Fragment key={day}>
                      <div style={{ alignSelf: "center", fontWeight: 700 }}>{day}</div>
                      {[1, 2, 3, 4, 5, 6].map((slot) => {
                        const intensity = ((dIdx * 3 + slot * 7) % 5) + 1;
                        const bg =
                          intensity === 5 ? "#1d4ed8" :
                          intensity === 4 ? "#3b2d96" :
                          intensity === 3 ? "#60a5fa" :
                          intensity === 2 ? "#bfdbfe" : "#eff6ff";
                        return (
                          <div
                            key={slot}
                            title={`${day} Slot ${slot}: ${intensity * 18} active lab sessions`}
                            style={{ height: 24, borderRadius: 6, background: bg }}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div style={{ background: "#ffffff", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800 }}>Learner Case-Study Activation Funnel</h3>
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748b" }}>Progression from account creation to verified portfolio certificate</p>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    { stage: "1. Signed Up / Campus Invited", count: 1640, pct: 100, color: "#3b2d96" },
                    { stage: "2. Logged into Skylent Workspace", count: 1460, pct: 89, color: "#4338ca" },
                    { stage: "3. Executed First Browser Lab", count: 1210, pct: 74, color: "#1d4ed8" },
                    { stage: "4. Submitted Industry Case Study", count: 890, pct: 54, color: "#2563eb" },
                    { stage: "5. Verified Certificate & Portfolio Ready", count: 640, pct: 39, color: "#0284c7" }
                  ].map((f) => (
                    <div key={f.stage}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                        <span>{f.stage}</span>
                        <span>{f.count} ({f.pct}%)</span>
                      </div>
                      <div style={{ height: 10, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${f.pct}%`, height: "100%", background: f.color, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "catalog" && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>ACTIVE & UNLOCKED</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#16a34a" }}>{activeCount}</div>
              </div>
              <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>LOCKED BY ADMIN</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#dc2626" }}>{lockedCount}</div>
              </div>
              <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>9–12M EXPERT PROGRAMS</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#1d4ed8" }}>{expertCount}</div>
              </div>
              <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>DEGREE PATHWAYS</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#3b2d96" }}>{degreeCount}</div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { id: "self-paced", label: "Practical Case Study Tracks (₹1,499)" },
                    { id: "expert-9-12m", label: "9–12 Month Industry Expert Programs" },
                    { id: "degree-sem", label: "Online & Campus Degrees (Sem 1–8)" }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCatalogCategory(c.id as CatalogCategory)}
                      style={{
                        background: catalogCategory === c.id ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                        color: catalogCategory === c.id ? "#fff" : "#334155",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 15px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  + Add New Track
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 10px" }}>Code</th>
                      <th style={{ padding: "12px 10px" }}>Program / Track Title</th>
                      <th style={{ padding: "12px 10px" }}>Case Studies & Labs</th>
                      <th style={{ padding: "12px 10px" }}>Duration</th>
                      <th style={{ padding: "12px 10px" }}>Fee & Discount</th>
                      <th style={{ padding: "12px 10px" }}>Access Status (1-Click Lock)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogItems
                      .filter((item) => item.category === catalogCategory)
                      .map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "14px 10px", fontWeight: 700, color: "#475569" }}>{item.code}</td>
                          <td style={{ padding: "14px 10px" }}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>{item.title}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.subtitle}</div>
                            <div style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 700, marginTop: 4 }}>{item.mentorOrUniversity}</div>
                          </td>
                          <td style={{ padding: "14px 10px", fontWeight: 700 }}>
                            {item.caseStudiesCount} Case Studies · {item.labsCount} Labs
                          </td>
                          <td style={{ padding: "14px 10px" }}>{item.duration}</td>
                          <td style={{ padding: "14px 10px" }}>
                            <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>₹{item.priceInr.toLocaleString("en-IN")}</span>{" "}
                            <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: 12 }}>₹{item.originalPriceInr.toLocaleString("en-IN")}</span>
                            <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>{item.discountLabel}</div>
                          </td>
                          <td style={{ padding: "14px 10px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleLock(item.id, item.title)}
                              style={{
                                background: item.locked ? "#fef2f2" : "#dcfce7",
                                color: item.locked ? "#dc2626" : "#15803d",
                                border: `1px solid ${item.locked ? "#fecaca" : "#86efac"}`,
                                borderRadius: 999,
                                padding: "6px 14px",
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: "pointer"
                              }}
                            >
                              {item.locked ? "🔒 LOCKED (Click to Unlock)" : "✓ LIVE & OPEN (Click to Lock)"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "degrees" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Online & Partner University Degree Skeleton (Semester 1–8 Lock Control)</h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
              Click any Semester pill (Sem 1 to Sem 8) below to instantly lock or unlock that semester for students and partner colleges.
            </p>
            <div style={{ display: "grid", gap: 16 }}>
              {catalogItems
                .filter((i) => i.category === "degree-sem")
                .map((deg) => {
                  const total = deg.semestersTotal ?? 8;
                  const unlocked = deg.unlockedSemesters ?? [1, 2];
                  return (
                    <div key={deg.id} style={{ border: "1px solid #cbd5e1", borderRadius: 14, padding: 18, background: deg.locked ? "#f8fafc" : "#ffffff" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{deg.code}</span>
                          <h3 style={{ margin: "6px 0 2px", fontSize: 17, fontWeight: 800 }}>{deg.title}</h3>
                          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{deg.subtitle}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleLock(deg.id, deg.title)}
                          style={{
                            background: deg.locked ? "#dc2626" : "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "8px 14px",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer"
                          }}
                        >
                          {deg.locked ? "🔒 Degree Track Locked (Unlock Now)" : "✓ Degree Admissions Active (Lock Degree)"}
                        </button>
                      </div>

                      <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginRight: 4 }}>Semester Locks:</span>
                        {Array.from({ length: total }, (_, idx) => idx + 1).map((sem) => {
                          const isOpen = unlocked.includes(sem);
                          return (
                            <button
                              key={sem}
                              type="button"
                              onClick={() => handleToggleSemester(deg.id, sem)}
                              style={{
                                background: isOpen ? "linear-gradient(135deg, #3b2d96, #1d4ed8)" : "#f1f5f9",
                                color: isOpen ? "#ffffff" : "#64748b",
                                border: isOpen ? "none" : "1px solid #cbd5e1",
                                borderRadius: 8,
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Sem {sem} {isOpen ? "✓ Open" : "🔒 Locked"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Verified Learners, Faculty Mentors & Campus Admins</h2>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Clean directory (automated test UUID records are hidden for clarity)</p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="search"
                  placeholder="Search name, email, or track..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 13, minWidth: 240 }}
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontWeight: 600 }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="FACULTY">Faculty & Industry Experts</option>
                  <option value="COLLEGE_ADMIN">College Admins</option>
                </select>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: 12 }}>#</th>
                  <th style={{ padding: 12 }}>Name & Email</th>
                  <th style={{ padding: 12 }}>Role</th>
                  <th style={{ padding: 12 }}>Institution / Source</th>
                  <th style={{ padding: 12 }}>Enrolled Track / Assignment</th>
                  <th style={{ padding: 12 }}>Case Study Progress</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {CLEAN_USERS.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: 12, fontWeight: 700 }}>{u.id}</td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{u.email}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ background: u.role === "FACULTY" ? "#ede9fe" : u.role === "COLLEGE_ADMIN" ? "#dbeafe" : "#f1f5f9", color: u.role === "FACULTY" ? "#5b21b6" : u.role === "COLLEGE_ADMIN" ? "#1e40af" : "#334155", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{u.org}</td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.track}</td>
                    <td style={{ padding: 12, color: "#1d4ed8", fontWeight: 700 }}>{u.progress}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
                        ● {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "colleges" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>Onboard Partner University / Autonomous College</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>Provision a dedicated /dashboard/college workspace with semester lock controls.</p>
              <div style={{ display: "grid", gap: 12 }}>
                <input placeholder="University / College Full Name (e.g., Sri Sri University)" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
                <input placeholder="Academic Nodal Officer Email" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
                <select style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}>
                  <option>B.Tech CSE & AI (Semesters 1–8)</option>
                  <option>BCA Data Analytics & Cloud (Semesters 1–6)</option>
                  <option>MCA / MBA Postgraduate Track (Semesters 1–4)</option>
                </select>
                <button
                  type="button"
                  onClick={() => showToast("Partner University workspace provisioned.")}
                  style={{ background: "linear-gradient(135deg, #3b2d96, #1d4ed8)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                >
                  Provision Partner College Workspace
                </button>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>Register Hiring Partner (Job Assistance Desk)</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748b" }}>Connect employers to verified graduates from the ₹11,999 & 9–12M Professional Programs.</p>
              <div style={{ display: "grid", gap: 12 }}>
                <input placeholder="Company Name (e.g., Tech Mahindra / Fintech Partner)" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
                <input placeholder="Hiring Role (e.g., Data Analyst / Full-Stack Engineer)" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
                <input placeholder="CTC Band (e.g., ₹6.5 – ₹12 LPA)" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
                <button
                  type="button"
                  onClick={() => showToast("Hiring partner added to Career OS Placement Desk.")}
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #3b2d96)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                >
                  Publish Role to Job Assistance Desk
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <form onSubmit={handleAddProgram} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, display: "grid", gap: 14 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Create New Course / 9–12M Expert Program</h3>
            <input
              required
              placeholder="Program Title (e.g., Applied GenAI Case Study Track)"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
            />
            <select
              value={newCourseCategory}
              onChange={(e) => setNewCourseCategory(e.target.value as CatalogCategory)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
            >
              <option value="self-paced">Practical Case Study Track (2 Months)</option>
              <option value="expert-9-12m">9–12 Month Industry Expert Program</option>
              <option value="degree-sem">Online / Partner University Degree (Sem 1–8)</option>
            </select>
            <input
              type="number"
              placeholder="Discounted Fee in INR (e.g., 1499 or 34999)"
              value={newCoursePrice}
              onChange={(e) => setNewCoursePrice(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>
                Cancel
              </button>
              <button type="submit" style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3b2d96, #1d4ed8)", color: "#fff", cursor: "pointer", fontWeight: 800 }}>
                Save & Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default DashboardAdminPage;
