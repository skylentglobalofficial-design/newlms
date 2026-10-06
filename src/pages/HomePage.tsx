/**
 * HomePage — public homepage assembled from approved Skylent 2.0 sections.
 * Section order (frozen): Hero → Programs → HowItWorks → SeeItWorking →
 *   Education → CareerOSSpotlight → PathSection → FinalCta
 *
 * Ported from lovable_src/src/pages/Index.tsx + lovable_src/src/components/site/HomeV3.tsx
 * Adaptations for newlms:
 *  - useAuth from @/context/AuthContext (session-cookie, not Supabase)
 *  - No lucide-react → inline SVG components
 *  - No @tanstack/react-query → useState/useEffect via useLivePrograms hook
 *  - specimens → direct asset imports
 *  - ProductSpecimen → inline <figure>/<img> with frame styles
 *  - PageShell from @/components/shared (provides existing nav + footer)
 *
 * Visual system: src/skylent-site.css (site.* tokens, sk-* utilities, and the
 * Tailwind v4 @theme bridge that makes text-site-*, bg-site-*, font-heading,
 * rounded-card and shadow-sk resolve). Canvas is pure white.
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "@/components/shared";
import { useAuth } from "@/context/AuthContext";
import { useLivePrograms, type LiveProgram } from "@/hooks/useLivePrograms";
import { DEGREE_ROUTES, degreeLevelLabel, type DegreeRoute } from "@/data/education";
import { degreeImage } from "@/data/educationImages";

/** Minimal class-name joiner — replaces the cn() import that is not in this repo. */
function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ── Asset imports ─────────────────────────────────────────────────────────────
import heroStudent from "@/assets/site/hero-student.jpg";
import eduImg from "@/assets/site/hero-classroom.jpg";
import programAnalytics from "@/assets/site/program-analytics.jpg";
import programProduct from "@/assets/site/program-product.jpg";
import programAi from "@/assets/site/program-ai.jpg";
import programWeb from "@/assets/site/program-web.jpg";
import programLibrary from "@/assets/site/program-library.jpg";

// Product screenshots
import studentHomeImg from "@/assets/product/U01_student_home.webp";
import myCoursesImg from "@/assets/product/U02_my_courses.webp";
import playerImg from "@/assets/product/U03_learning_player.webp";
import careerEvidenceImg from "@/assets/product/U07_career_evidence.webp";

const specimens = {
  studentHome: { src: studentHomeImg, alt: "Skylent Student Home showing Continue learning and programme list" },
  myCourses: { src: myCoursesImg, alt: "Skylent My Courses page listing enrolled programs with progress" },
  player: { src: playerImg, alt: "The Skylent OS learning player with structured lessons and progress" },
  careerEvidence: { src: careerEvidenceImg, alt: "Career OS evidence panels showing learning record and certificates" },
};

/** Presentation-only photography, matched to the programme slug by subject keyword.
 *  It never changes what the catalogue API says about a programme. */
const PROGRAM_IMAGES: { test: RegExp; src: string; alt: string }[] = [
  { test: /data|analytics/i, src: programAnalytics, alt: "Analytics charts on paper beside a laptop" },
  { test: /web|stack|full/i, src: programWeb, alt: "A developer writing code across several screens" },
  { test: /ai|machine|prompt|gen/i, src: programAi, alt: "A researcher working at monitors in a technology lab" },
  { test: /product|mba|business/i, src: programProduct, alt: "A product team working around a shared table" },
];

function programImage(slug: string): { src: string; alt: string } {
  return PROGRAM_IMAGES.find((item) => item.test.test(slug)) ?? { src: programLibrary, alt: "A learner studying in a library" };
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IcoArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IcoGraduationCap({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
function IcoBookOpen({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IcoListChecks({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 6h11M10 12h11M10 18h11" /><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoHammer({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 12-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" /><path d="M17.64 15 22 10.64" /><path d="m20.91 11.7-1.25-1.25c.2-.3.3-.8.3-1.45 0-3.17-2.49-5.83-5.81-5.24l3.6 3.6L15.39 9.8l-3.6-3.6C11.2 9.58 13.86 12 17 12c.61 0 1.09-.08 1.43-.2l2.48 2.48-1 1" />
    </svg>
  );
}
function IcoCheckCircle2({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IcoBriefcase({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────

/** Intersection-observer fade-in reveal wrapper — FIX #5: 300ms, translate-y-2, Tailwind classes, motion-reduce */
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${Math.min(delay, 120)}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Primary / secondary CTA button — FIX #1: sk-btn classes, IcoArrowRight, hash-link support */
function Cta({ to, primary, children }: { to: string; primary?: boolean; children: React.ReactNode }) {
  const cls = cn("sk-btn group", primary ? "sk-btn-primary" : "sk-btn-secondary");
  const inner = (
    <>
      {children}
      <IcoArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </>
  );
  return to.startsWith("#")
    ? <a href={to} className={cls}>{inner}</a>
    : <Link to={to} className={cls}>{inner}</Link>;
}

/** Inline text link with arrow — FIX #19: TextLink component */
function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="sk-link group text-[15px]">
      {children}
      <IcoArrowRight className="h-4 w-4" />
    </Link>
  );
}

/** Truth label — one quiet chip for every availability / sample status. */
function StatusChip({ kind, children }: { kind: "info" | "soon" | "sample"; children: React.ReactNode }) {
  return <span className={cn("sk-status", `sk-status--${kind}`)}>{children}</span>;
}

/** Eyebrow / kicker label — FIX #6: text-[12px] */
const eyebrow = "text-[12px] font-semibold uppercase tracking-[0.16em] text-site-deep";

/** Section heading block — FIX #7: self-wraps in Reveal, body optional, correct typography */
function SectionHead({ k, title, body }: { k: string; title: string; body?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <p className={eyebrow}>{k}</p>
      <h2 className="mt-4 font-heading text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.06] tracking-normal text-site-ink">{title}</h2>
      {body && <p className="mt-4 max-w-[58ch] text-[16.5px] leading-[1.65] text-site-muted">{body}</p>}
    </Reveal>
  );
}

// ── Section: Hero ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    /* FIX #9: corrected padding */
    <section className="overflow-hidden border-b border-site-border bg-site-paper pt-8 pb-12 md:pt-10 md:pb-14 lg:pt-12 lg:pb-16">
      <div className="sk-container relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column — copy */}
          <div className="lg:col-span-7 lg:pb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-site-deep">
              Skill programs · Degrees · Career OS
            </p>
            {/* FIX #8: tracking-[-0.015em] */}
            <h1 className="mt-5 max-w-[13ch] font-heading text-[clamp(2.75rem,4.6vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.015em] text-site-ink lg:max-w-none">
              Education built{" "}
              <span className="lg:block lg:whitespace-nowrap">
                for{" "}
                <span className="text-site-deep">what comes next.</span>
              </span>
            </h1>
            {/* FIX #12: approved body copy */}
            <p className="mt-5 max-w-[48ch] text-[clamp(1rem,1.25vw,1.1rem)] leading-[1.65] text-site-muted">
              Skylent offers online skill programmes and university degree routes for students and working learners. Study published modules, practise with quizzes and tasks, and earn certificates anyone can verify.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Cta to="/programs" primary>Explore Skill Programs</Cta>
              <Cta to="#degrees">Explore University Degrees</Cta>
            </div>
            <Link
              to="/path"
              className="group mt-6 inline-flex items-center gap-1.5 text-[14px] text-site-muted hover:text-site-deep"
            >
              Not sure where to start?{" "}
              <span className="font-semibold text-site-deep">Find My Path</span>
              <IcoArrowRight className="h-3.5 w-3.5 text-site-deep transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
            </Link>
          </div>

          {/* Right column — imagery */}
          <figure className="lg:col-span-5">
            <div className="relative pb-28 sm:pb-24 lg:-mr-10 lg:pb-12">
              {/* Main editorial photo — FIX #10: rounded-sk-lg bg-site-soft-blue shadow-sk */}
              <div className="ml-auto w-[92%] overflow-hidden rounded-sk-lg border border-site-border bg-site-soft-blue shadow-sk lg:w-[88%]">
                <img
                  src={heroStudent}
                  alt="A student studying with a laptop and books"
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover object-[50%_30%] lg:aspect-[5/4]"
                />
              </div>
              {/* Product screenshot overlay — FIX #11: sm:w-[68%] lg:w-[70%]; FIX #13: px-3.5 py-2.5 */}
              <div className="absolute bottom-0 left-0 w-[78%] overflow-hidden rounded-card border border-site-border bg-site-white shadow-sk ring-[8px] ring-site-paper sm:w-[68%] lg:w-[70%]">
                <div className="flex items-center justify-between gap-3 border-b border-site-border px-3.5 py-2.5">
                  <span className="whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.14em] text-site-deep">Skylent Learning</span>
                  <span className="hidden whitespace-nowrap text-[10.5px] text-site-muted sm:inline lg:hidden xl:inline">Published course workspace</span>
                </div>
                <img
                  src={specimens.studentHome.src}
                  alt={specimens.studentHome.alt}
                  width={640}
                  height={360}
                  className="aspect-[16/9] w-full object-cover object-left-top"
                />
              </div>
            </div>
            <figcaption className="mt-4 text-[12.5px] text-site-dim lg:ml-[18%]">
              The real Skylent learning workspace: modules, lessons, practice and progress.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

// ── Section: Programs ─────────────────────────────────────────────────────────
const CATEGORY_ALL = "All";

/** Availability comes straight from the catalogue API (enrollmentStatus). Unknown shows nothing. */
function ProgramStatus({ status }: { status: LiveProgram["status"] }) {
  if (status === "open") return <StatusChip kind="info">Live</StatusChip>;
  if (status === "waitlist") return <StatusChip kind="soon">Waitlist</StatusChip>;
  if (status === "coming_soon") return <StatusChip kind="soon">Coming soon</StatusChip>;
  return null;
}

/** Card photo with quiet loading / error states — the frame keeps its ratio either way. */
function CatalogueImage({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "error">("loading");
  return (
    <div className="relative aspect-[4/3] overflow-hidden border-b border-site-border bg-site-soft-blue">
      {state === "error" && (
        <span className="absolute inset-0 flex items-center justify-center text-[12px] text-site-dim">Image unavailable</span>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        width={800}
        height={600}
        onLoad={() => setState("loaded")}
        onError={() => setState("error")}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 motion-reduce:transition-none",
          state === "loaded" ? "opacity-100 group-hover:scale-[1.03]" : "opacity-0"
        )}
      />
    </div>
  );
}

function CatalogueCard({ p }: { p: LiveProgram }) {
  const img = programImage(p.slug);
  const facts = [p.duration, p.deliveryMode, p.level].filter(Boolean);
  const counts = ([["Modules", p.modules], ["Tasks", p.projects]] as const).filter(([, v]) => v > 0);
  return (
    <Link
      to={`/programs/${p.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-site-border bg-site-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-site-deep/40 hover:shadow-sk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ocean motion-reduce:transition-none"
    >
      <CatalogueImage src={img.src} alt={img.alt} />
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <span className="text-site-deep">{p.category || "Skill program"}</span>
          <ProgramStatus status={p.status} />
        </p>
        <h3 className="mt-2 font-heading text-[1.3rem] font-semibold leading-snug text-site-ink group-hover:text-site-deep">{p.title}</h3>
        {p.description && <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-site-muted">{p.description}</p>}
        {facts.length > 0 && <p className="mt-4 text-[13px] font-medium text-site-ink">{facts.join("  ·  ")}</p>}
        {counts.length > 0 ? (
          <dl className={cn("mt-4 grid divide-x divide-site-border rounded-[8px] border border-site-border bg-site-white text-center", counts.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
            {counts.map(([k, v]) => (
              <div key={k} className="px-1 py-2.5">
                <dd className="font-heading text-[1.05rem] font-semibold tabular-nums text-site-ink">{v}</dd>
                <dt className="text-[10.5px] uppercase tracking-[0.1em] text-site-dim">{k}</dt>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="min-h-4 flex-1" />
        <span className="mt-5 flex items-center justify-between border-t border-site-border pt-4 text-[14px] font-semibold text-site-deep">
          View curriculum
          <IcoArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
        </span>
      </div>
    </Link>
  );
}

function Programs() {
  const { programs, isLoading, isLive, isUnavailable, retry } = useLivePrograms();
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ALL);

  const categories = [CATEGORY_ALL, ...Array.from(new Set(programs.map((p) => p.category))).sort()];
  const visible = activeCategory === CATEGORY_ALL ? programs : programs.filter((p) => p.category === activeCategory);

  return (
    <section id="programs" className="scroll-mt-20 bg-site-white sk-section">
      <div className="sk-container">
        <div className="grid gap-6 border-b border-site-border pb-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHead
              k="Skill programmes"
              title="Programmes built for where you want to go."
              body="Online courses with structured modules, practice, and a verifiable certificate."
            />
          </div>
          <Reveal className="flex flex-col gap-3 lg:col-span-5 lg:items-end">
            {/* Count is derived from the live response — never hardcoded. */}
            {isLive && (
              <p className="text-[13px] text-site-dim">
                {programs.length} published {programs.length === 1 ? "programme" : "programmes"} · updated from the Skylent catalogue
              </p>
            )}
            <TextLink to="/programs">Explore all programs</TextLink>
          </Reveal>
        </div>

        {/* Category filter tabs */}
        {categories.length > 2 && (
          <div className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter programmes by category">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={cat === activeCategory}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ocean",
                  cat === activeCategory
                    ? "border-site-deep bg-site-deep text-site-white"
                    : "border-site-border bg-site-white text-site-muted hover:border-site-deep/40 hover:text-site-ink"
                )}
              >
                {cat}
                {cat !== CATEGORY_ALL && (
                  <span className="ml-1.5 tabular-nums opacity-70">{programs.filter((p) => p.category === cat).length}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading programmes">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} aria-hidden className="h-[440px] animate-pulse overflow-hidden rounded-card border border-site-border bg-site-white motion-reduce:animate-none">
                <div className="aspect-[4/3] bg-site-soft-blue" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-24 rounded bg-site-soft" />
                  <div className="h-5 w-3/4 rounded bg-site-soft" />
                  <div className="h-3 w-full rounded bg-site-soft" />
                  <div className="mt-6 h-14 rounded-[10px] bg-site-soft" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* The catalogue API is the only source. If it does not answer, say so — no sample cards. */}
        {!isLoading && isUnavailable && (
          <div role="status" className="mt-8 flex flex-col items-start gap-5 rounded-card border border-site-border bg-site-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span aria-hidden className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-site-border bg-site-soft text-site-deep">
                <IcoBookOpen className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="font-heading text-[1.15rem] font-semibold leading-snug text-site-ink">Unable to load programmes right now.</p>
                <p className="mt-1 max-w-[52ch] text-[14px] leading-[1.6] text-site-muted">
                  The live catalogue did not respond, so nothing is shown in its place. Please try again in a moment.
                </p>
              </div>
            </div>
            <button type="button" onClick={retry} className="sk-btn sk-btn-secondary shrink-0">
              Try again
            </button>
          </div>
        )}
        {!isLoading && !isUnavailable && visible.length === 0 && (
          <div className="mt-8 rounded-card border border-site-border bg-site-white px-6 py-14 text-center text-[14px] text-site-muted">No programmes in this category yet.</div>
        )}
        {!isLoading && !isUnavailable && visible.length > 0 && (
          <ul className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {visible.slice(0, 6).map((p) => (
              <li key={p.slug} className="h-full">
                <Reveal className="h-full">
                  <CatalogueCard p={p} />
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ── Section: HowItWorks (6-stage scroll-driven) ───────────────────────────────
const howItWorksLoop = [
  { t: "Discover", b: "Compare programmes and degree routes, or use Find My Path.", I: IcoGraduationCap },
  { t: "Learn", b: "Study published modules and lessons in order.", I: IcoBookOpen },
  { t: "Practice", b: "Quizzes and tasks inside each course.", I: IcoListChecks },
  { t: "Build", b: "Applied work where the curriculum includes it.", I: IcoHammer },
  { t: "Prove", b: "Certificates with an ID anyone can check.", I: IcoCheckCircle2 },
  { t: "Grow", b: "Carry your record into Career OS.", I: IcoBriefcase },
];

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);
  const [p, setP] = useState(0); // 0 → 1 as the six steps scroll through the viewport

  useEffect(() => {
    if (prefersReducedMotion()) {
      setP(1);
      return;
    }
    function onScroll() {
      const el = listRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      setP(Math.max(0, Math.min(1, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35))));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-site-border bg-site-white sk-section">
      <div className="sk-container">
        <SectionHead k="How Skylent works" title="One connected route, from first lesson to proof." />
        {/* One list for every width: a vertical rail on phones, a horizontal rail from lg. */}
        <ol ref={listRef} className="relative mt-14 grid gap-0 lg:grid-cols-6 lg:gap-6">
          <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-px bg-site-border lg:bottom-auto lg:left-5 lg:right-5 lg:top-5 lg:h-px lg:w-auto" />
          <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-px origin-top bg-site-deep lg:hidden" style={{ transform: `scaleY(${p})` }} />
          <span aria-hidden className="absolute left-5 right-5 top-5 hidden h-px origin-left bg-site-deep lg:block" style={{ transform: `scaleX(${p})` }} />
          {howItWorksLoop.map(({ t, b, I }, i) => {
            const lit = p >= i / (howItWorksLoop.length - 1) - 0.02;
            return (
              <li key={t} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0 lg:block lg:pb-0">
                <span
                  className={cn(
                    "relative z-10 grid h-10 w-10 place-items-center rounded-full border bg-site-white transition-colors duration-300 motion-reduce:transition-none",
                    lit ? "border-site-deep text-site-deep" : "border-site-border text-site-dim"
                  )}
                >
                  <I className="h-4 w-4" />
                </span>
                <div className="lg:mt-6">
                  <p className="text-[12px] font-semibold tabular-nums tracking-[0.14em] text-site-deep">{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-1 font-heading text-[19px] font-semibold text-site-ink">{t}</p>
                  <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-site-muted">{b}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// ── Section: SeeItWorking ─────────────────────────────────────────────────────
const seeItScreens = [
  { img: specimens.studentHome, label: "Student Home", note: "Continue learning and see what comes next." },
  { img: specimens.myCourses, label: "My Courses", note: "Every enrolled programme with its progress." },
  { img: specimens.player, label: "Learning player", note: "Structured lessons, practice and progress." },
  { img: specimens.careerEvidence, label: "Career OS", note: "Turn completed learning into a record." },
];

/** FIX #15: shadow-sk, p-1.5, hover:-translate-y-1, aspect-[16/10] all, numbered figcaption with border-t */
function SeeItScreen({ img, label, note, i }: { img: { src: string; alt: string }; label: string; note: string; i: number }) {
  return (
    <figure>
      <div className="overflow-hidden rounded-[14px] border border-site-border bg-site-white p-1.5 shadow-sk transition-transform duration-500 hover:-translate-y-1 motion-reduce:transition-none">
        <img
          src={img.src}
          alt={img.alt}
          loading="lazy"
          width={1280}
          height={800}
          className="w-full rounded-[10px] object-cover object-left-top aspect-[16/10]"
        />
      </div>
      <figcaption className="mt-4 flex gap-4 border-t border-site-border pt-3">
        <span className="text-[12px] font-semibold tabular-nums text-site-deep">{String(i + 1).padStart(2, "0")}</span>
        <span>
          <span className="block text-[15px] font-semibold text-site-ink">{label}</span>
          <span className="block text-[14px] text-site-muted">{note}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function SeeItWorking() {
  const { user } = useAuth();
  return (
    <section id="see-it-working" className="scroll-mt-20 overflow-hidden border-b border-site-border bg-site-white sk-section">
      <div className="sk-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead
            k="See it working"
            title="This is what learning on Skylent looks like."
            body="Real screens from the student workspace — not mock-ups."
          />
          <Reveal className="shrink-0">
            {user ? (
              <Cta to="/dashboard">Open Dashboard</Cta>
            ) : (
              <Cta to="/learn">Open My learning</Cta>
            )}
          </Reveal>
        </div>
        <Reveal className="mt-12">
          <SeeItScreen {...seeItScreens[0]} i={0} />
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {seeItScreens.slice(1).map((s, i) => (
            <Reveal key={s.label} delay={i * 60}>
              <SeeItScreen {...s} i={i + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Education (Degrees) ──────────────────────────────────────────────
/** FIX #16: DegreeCard redesign — rounded-[16px], aspect-[16/9], level badge, hover-translate */
function DegreeCard({ d }: { d: DegreeRoute }) {
  const img = degreeImage(d.slug);
  const level = degreeLevelLabel(d.level);
  return (
    <Link
      to={`/education/degrees/${d.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-site-border bg-site-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-site-deep/40 hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ocean"
    >
      {img && (
        <div className="relative overflow-hidden">
          <img src={img.src} alt={img.alt} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
          <span className="absolute left-3 top-3 rounded-full bg-site-paper/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-site-deep">{level}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-site-dim">Degree area</p>
        <h3 className="mt-1 text-[1.1rem] font-semibold leading-snug tracking-[-0.02em] text-site-ink group-hover:text-site-deep">{d.field} degrees</h3>
        <p className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
          <span className="h-fit rounded-full border border-site-border bg-site-soft px-2.5 py-0.5 text-[12px] text-site-ink">{level}</span>
          <span className="h-fit rounded-full border border-site-border bg-site-soft px-2.5 py-0.5 text-[12px] text-site-ink">{d.studyMode === "online" ? "Online" : "On-campus"}</span>
        </p>
        <span className="mt-4 flex items-center justify-between gap-2 border-t border-site-border pt-4 text-[14px] font-semibold text-site-deep">
          <span className="flex items-center gap-1.5">View pathway<IcoArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          {d.sample && <StatusChip kind="sample">Sample listing</StatusChip>}
        </span>
      </div>
    </Link>
  );
}

function Education() {
  const [level, setLevel] = useState<"all" | "UG" | "PG">("all");
  const filtered = level === "all" ? DEGREE_ROUTES : DEGREE_ROUTES.filter((d) => d.level === level);

  return (
    <section id="degrees" className="scroll-mt-20 bg-site-white sk-section">
      <div className="sk-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {/* FIX #17: updated section copy */}
          <SectionHead
            k="Degree routes"
            title="Choose an undergraduate or postgraduate route."
            body="Compare the listed study modes and open each degree page for the information currently available."
          />
          {/* FIX #19: TextLink "Explore all degrees" */}
          <Reveal className="shrink-0">
            <TextLink to="/education">Explore all degrees</TextLink>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter degree routes by level">
          {(["all", "UG", "PG"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={v === level}
              onClick={() => setLevel(v)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ocean",
                v === level
                  ? "border-site-deep bg-site-deep text-site-white"
                  : "border-site-border bg-site-white text-site-muted hover:border-site-deep/40 hover:text-site-ink"
              )}
            >
              {v === "all" ? "All" : degreeLevelLabel(v)}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((d) => (
            <li key={d.id} className="h-full">
              <Reveal className="h-full">
                <DegreeCard d={d} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal className="mt-6">
          <p className="max-w-[92ch] text-[13px] leading-[1.6] text-site-dim">
            Degree entries marked "Coming soon" reflect planned partnerships, not confirmed enrolment. Sample entries use placeholder institution names.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Section: CareerOSSpotlight ────────────────────────────────────────────────
const careerOs = [
  { t: "Career profile", b: "One profile that carries your enrolled learning and completed work.", s: "Live" },
  { t: "Verifiable certificates", b: "Certificates issued on completion, each checkable by ID.", s: "Live" },
  { t: "Projects and evidence", b: "Applied work collected next to your learning record.", s: "In development" },
  { t: "Openings board", b: "Opportunities will appear here once published. None are listed yet.", s: "Coming soon" },
];

/** Live rows read as available; everything else stays visibly not-yet-available. */
function CareerOsStatusBadge({ s }: { s: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        s === "Live" ? "bg-site-soft-blue text-site-deep" : "border border-site-border bg-site-white text-site-muted"
      )}
    >
      {s}
    </span>
  );
}

function CareerOSSpotlight() {
  return (
    <section id="career-os" className="scroll-mt-20 border-t border-site-border bg-site-paper sk-section">
      <div className="sk-container grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <figure>
            {/* FIX #17: shadow-sk */}
            <div className="overflow-hidden rounded-[14px] border border-site-border bg-site-white p-1.5 shadow-sk">
              <img
                src={specimens.careerEvidence.src}
                alt={specimens.careerEvidence.alt}
                loading="lazy"
                width={1280}
                height={880}
                className="aspect-[16/11] w-full rounded-[10px] object-cover object-left-top"
              />
            </div>
            <figcaption className="mt-3 text-[12.5px] text-site-dim">
              Career OS in the student workspace — real screen.
            </figcaption>
          </figure>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={80}>
          <p className={eyebrow}>Career OS</p>
          {/* FIX #17: clamp(1.9rem,3.4vw,2.75rem) */}
          <h2 className="mt-4 max-w-[16ch] font-heading text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.06] tracking-normal text-site-ink">
            Turn learning into evidence you can use.
          </h2>
          {/* FIX #17: text-[16.5px] leading-[1.65] */}
          <p className="mt-4 text-[16.5px] leading-[1.65] text-site-muted">
            One record that connects your enrolled learning, completed certificates and applied work — all in your student workspace.
          </p>
          <ul className="mt-8 border-t border-site-border">
            {careerOs.map((c) => (
              <li key={c.t} className="border-b border-site-border py-4">
                <p className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[16px] font-semibold text-site-ink">{c.t}</span>
                  <CareerOsStatusBadge s={c.s} />
                </p>
                <p className="mt-1 text-[14px] leading-[1.55] text-site-muted">{c.b}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-site-dim">Career OS does not guarantee a job.</p>
          <div className="mt-8">
            <Cta to="/career-os" primary>Explore Career OS</Cta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Section: PathSection ──────────────────────────────────────────────────────
/* FIX #6: clamp(1.9rem,3.4vw,2.75rem); FIX for leadCls: max-w-[58ch] text-[16.5px] */
const h2Cls = "font-heading text-[clamp(1.9rem,3.4vw,2.75rem)] font-semibold leading-[1.06] tracking-normal text-site-ink";
const leadCls = "mt-4 max-w-[58ch] text-[16.5px] leading-[1.65] text-site-muted";

function PathSection() {
  return (
    <section className="border-t border-site-border bg-site-white sk-section">
      <div className="sk-container grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          {/* FIX: rounded-card */}
          <div className="overflow-hidden rounded-card border border-site-border bg-site-soft-blue">
            <img
              src={eduImg}
              alt="Students planning their next step together"
              loading="lazy"
              width={1200}
              height={900}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7" delay={80}>
          <p className={eyebrow}>Not sure where to start?</p>
          <h2 className={cn(h2Cls, "mt-4 max-w-[18ch]")}>Tell us what you're trying to do.</h2>
          <p className={leadCls}>
            Find My Path asks about your stage and goals, then shows you the programmes and degree routes most likely to move you forward.
          </p>
          <div className="mt-8">
            <Cta to="/path" primary>Find My Path</Cta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── Section: FinalCta — DO NOT TOUCH ─────────────────────────────────────────
const finalLinks = [
  ["Explore programmes", "/programs"],
  ["Explore degrees", "/education"],
  ["Find My Path", "/path"],
] as const;

function FinalCta() {
  return (
    <section className="border-t border-site-border bg-site-paper py-20 md:py-28">
      <div className="sk-container grid gap-10 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-7">
          <p className={eyebrow}>Begin</p>
          <h2 className="mt-4 max-w-[14ch] font-heading text-[clamp(2.2rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.015em] text-site-ink">
            Start with what you need next.
          </h2>
        </Reveal>
        <ul className="border-t border-site-border lg:col-span-5">
          {finalLinks.map(([t, to]) => (
            <li key={t} className="border-b border-site-border">
              <Link
                to={to}
                className="group flex min-h-[3.75rem] items-center justify-between text-[18px] font-semibold text-site-ink hover:text-site-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-ocean"
              >
                {t}
                <IcoArrowRight className="h-5 w-5 text-site-deep transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Page assembly ─────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light">
        <Hero />
        <Programs />
        <HowItWorks />
        <SeeItWorking />
        <Education />
        <CareerOSSpotlight />
        <PathSection />
        <FinalCta />
      </div>
    </PageShell>
  );
}
