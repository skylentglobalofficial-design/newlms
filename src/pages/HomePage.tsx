import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../components/shared"
import { CourseProductVisual, CourseThumb, ProductFrame } from "../components/product/ProductLanguage"
import { courseBySlug, coursePublicView } from "../lib/catalog-maturity"
import { authoredCourseList, courseProductProfile } from "../lib/course-product"
import { FLAGSHIP_COURSE_SLUG, isAuthoredCourse } from "../lib/authored-courses"
import { getCareerEvidence, getCourseQuiz } from "../content/course-lookups"
import { CAREER_OS_IA } from "../lib/product-architecture"
import { NORTHWIND_PREVIEW as NW } from "../lib/northwind-preview"
import "./HomePage.css"

const HOME_PATHS = [
  {
    step: "01",
    id: "programs",
    title: "Professional Programs",
    copy: "Industry-relevant programs with hands-on learning and projects.",
    to: "/programs",
    image: "/images/paths/programs.jpg",
    tone: "programs" as const,
    align: "left" as const,
    context: [["BUILD", "PRACTISE", "APPLY", "CREATE"]],
  },
  {
    step: "02",
    id: "education",
    title: "Education",
    copy: "School, Undergraduate, Postgraduate and more.",
    to: "/education",
    image: "/images/paths/education.jpg",
    tone: "education" as const,
    align: "right" as const,
    context: [
      ["ACADEMIC", "FOUNDATIONS"],
      ["DEGREES", "SPECIALISATION", "LIFELONG LEARNING"],
    ],
  },
  {
    step: "03",
    id: "exams",
    title: "Competitive Exams",
    copy: "JEE, NEET, GATE, CAT, UPSC and more.",
    to: "/education/exams",
    image: "/images/paths/exams.jpg",
    tone: "exams" as const,
    align: "left" as const,
    context: [["GOAL", "SYLLABUS", "PRACTICE", "TEST", "PROGRESS"]],
  },
  {
    step: "04",
    id: "career",
    title: "Career OS",
    copy: "Build your profile, get discovered, and move towards opportunities.",
    to: "/career-os",
    image: "/images/paths/career.jpg",
    tone: "career" as const,
    align: "right" as const,
    context: [["BUILD", "SHOWCASE", "DISCOVER", "OPPORTUNITY"]],
  },
] as const

function PathLivingMotif({ id }: { id: (typeof HOME_PATHS)[number]["id"] }) {
  return (
    <svg className={`hp-choose-motif is-${id}`} viewBox="0 0 168 168" fill="none" aria-hidden="true">
      {id === "programs" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M40 118h68" />
          <path d="M108 118v24" />
          <path d="M40 142h68" />
          <path d="M54 82h68" />
          <path d="M122 82v24" />
          <path d="M54 106h68" />
          <path d="M68 46h68" />
          <path d="M136 46v24" />
          <path d="M68 70h68" />
        </g>
      ) : null}
      {id === "education" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M42 136V48" />
          <path d="M70 136V62" />
          <path d="M98 128V48" />
          <path d="M42 136h48" />
          <path d="M42 90h44" />
          <path d="M50 48h36" />
        </g>
      ) : null}
      {id === "exams" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M84 40a44 44 0 0 1 44 44" />
          <path d="M128 84a44 44 0 0 1-36 43" />
          <path d="M84 62a22 22 0 0 1 22 22" />
          <path d="M84 28v10" />
          <path d="M134 84h10" />
        </g>
      ) : null}
      {id === "career" ? (
        <g stroke="currentColor" strokeWidth="0.65">
          <path d="M30 128 66 102 94 110 138 42" />
          <path d="M66 99v6" />
          <path d="M138 39v6" />
        </g>
      ) : null}
    </svg>
  )
}

function navOffset() {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 64
}

function storyMotionEnabled() {
  return window.matchMedia("(min-width: 981px)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const PATH_COUNT = HOME_PATHS.length
const PATH_SEGMENT = 1 / PATH_COUNT
const PATH_FADE = 0.11
const PATH_SHIFT = 12
const CONTEXT_SHIFT = 10
const PATH_HIDE = 0.28

function pathShift() {
  return window.matchMedia("(max-width: 1200px)").matches ? 8 : PATH_SHIFT
}

function storyBlend(progress: number) {
  const p = Math.min(1, Math.max(0, progress))
  if (p >= 0.999) return { from: PATH_COUNT - 1, to: PATH_COUNT - 1, t: 1 }
  const index = Math.min(PATH_COUNT - 1, Math.floor(p / PATH_SEGMENT))
  const local = (p - index * PATH_SEGMENT) / PATH_SEGMENT
  const fadeStart = 1 - PATH_FADE
  if (index < PATH_COUNT - 1 && local > fadeStart) {
    return { from: index, to: index + 1, t: (local - fadeStart) / PATH_FADE }
  }
  return { from: index, to: index, t: 0 }
}

function storyCrossfade(t: number) {
  if (t <= 0) return { out: 1, inn: 0 }
  if (t >= 1) return { out: 0, inn: 1 }
  if (t <= 0.5) {
    const u = t / 0.5
    return { out: 1 - 0.65 * u, inn: 0.65 * u }
  }
  const u = (t - 0.5) / 0.5
  return { out: 0.35 * (1 - u), inn: 0.65 + 0.35 * u }
}

function HomePathStory() {
  const trackRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const contextRefs = useRef<Array<HTMLDivElement | null>>([])
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([])
  const markRef = useRef<HTMLSpanElement>(null)
  const cueRef = useRef<HTMLParagraphElement>(null)
  const activeRef = useRef(0)
  const modeRef = useRef<"story" | "static" | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let frame = 0
    const desktopMq = window.matchMedia("(min-width: 981px)")
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const panels = () => panelRefs.current
    const contexts = () => contextRefs.current

    const resetSticky = () => {
      const sticky = stickyRef.current
      if (!sticky) return
      sticky.style.position = ""
      sticky.style.top = ""
      sticky.style.left = ""
      sticky.style.right = ""
      sticky.style.width = ""
      sticky.style.bottom = ""
    }

    const resetCues = () => {
      if (markRef.current) markRef.current.style.transform = ""
      if (cueRef.current) {
        cueRef.current.style.opacity = ""
        cueRef.current.style.visibility = ""
      }
    }

    const resetPanels = () => {
      resetSticky()
      resetCues()
      panels().forEach((el) => {
        if (!el) return
        el.style.opacity = ""
        el.style.visibility = ""
        el.style.transform = ""
        el.style.pointerEvents = ""
        el.style.zIndex = ""
        el.removeAttribute("aria-hidden")
        el.removeAttribute("tabindex")
      })
      contexts().forEach((el) => {
        if (!el) return
        el.style.opacity = ""
        el.style.visibility = ""
        el.style.transform = ""
        el.style.zIndex = ""
      })
    }

    const pinStage = (progress: number, sticky: HTMLElement, top: number) => {
      if (progress <= 0) {
        if (sticky.style.position) resetSticky()
        return
      }
      if (progress >= 1) {
        if (sticky.style.position !== "absolute") {
          sticky.style.position = "absolute"
          sticky.style.top = "auto"
          sticky.style.bottom = "0"
          sticky.style.left = "0"
          sticky.style.right = "0"
          sticky.style.width = "100%"
        }
        return
      }
      if (sticky.style.position !== "fixed") {
        sticky.style.position = "fixed"
        sticky.style.left = "0"
        sticky.style.right = "0"
        sticky.style.width = "100%"
        sticky.style.bottom = "auto"
      }
      const nextTop = `${top}px`
      if (sticky.style.top !== nextTop) sticky.style.top = nextTop
    }

    const applyPanel = (
      el: HTMLAnchorElement,
      opacity: number,
      translateX: number,
      z: number,
    ) => {
      const hidden = opacity < PATH_HIDE
      el.style.opacity = hidden ? "0" : opacity.toFixed(3)
      el.style.visibility = hidden ? "hidden" : "visible"
      el.style.transform = `translateX(${translateX.toFixed(2)}px)`
      el.style.pointerEvents = !hidden && opacity > 0.55 ? "auto" : "none"
      el.style.zIndex = String(z)
      el.tabIndex = hidden || opacity < 0.4 ? -1 : 0
      el.setAttribute("aria-hidden", hidden || opacity < 0.4 ? "true" : "false")
    }

    const applyContext = (el: HTMLDivElement, opacity: number, translateX: number, z: number) => {
      const hidden = opacity < PATH_HIDE
      el.style.opacity = hidden ? "0" : opacity.toFixed(3)
      el.style.visibility = hidden ? "hidden" : "visible"
      el.style.transform = `translateX(${translateX.toFixed(2)}px)`
      el.style.zIndex = String(z)
    }

    const applyStory = () => {
      const track = trackRef.current
      const sticky = stickyRef.current
      if (!storyMotionEnabled() || !track || !sticky) {
        if (modeRef.current !== "static") {
          modeRef.current = "static"
          resetPanels()
        }
        return
      }

      modeRef.current = "story"
      const top = navOffset()
      const rect = track.getBoundingClientRect()
      const travel = Math.max(1, rect.height - sticky.offsetHeight)
      const progress = Math.min(1, Math.max(0, (top - rect.top) / travel))
      pinStage(progress, sticky, top)

      const blend = storyBlend(progress)
      const fade = storyCrossfade(blend.t)
      const nextActive = blend.from === blend.to || blend.t >= 0.5 ? blend.to : blend.from
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive
        setActive(nextActive)
      }

      const shift = pathShift()
      const panelDir = [-shift, shift, -shift, shift] as const
      const contextDir = [CONTEXT_SHIFT, -CONTEXT_SHIFT, CONTEXT_SHIFT, -CONTEXT_SHIFT] as const
      const outgoing = fade.inn >= 0.65 ? 0 : fade.out

      panels().forEach((el, index) => {
        if (!el) return
        if (blend.from === blend.to) {
          const on = index === blend.from
          applyPanel(el, on ? 1 : 0, 0, on ? 3 : 0)
          return
        }
        if (index === blend.from) {
          applyPanel(el, outgoing, panelDir[blend.from] * blend.t, 1)
          return
        }
        if (index === blend.to) {
          applyPanel(el, fade.inn, panelDir[blend.to] * (1 - blend.t), 4)
          return
        }
        applyPanel(el, 0, 0, 0)
      })

      contexts().forEach((el, index) => {
        if (!el) return
        if (blend.from === blend.to) {
          applyContext(el, index === blend.from ? 1 : 0, 0, index === blend.from ? 2 : 0)
          return
        }
        if (index === blend.from) {
          applyContext(el, outgoing, contextDir[blend.from] * blend.t, 2)
          return
        }
        if (index === blend.to) {
          applyContext(el, fade.inn, contextDir[blend.to] * (1 - blend.t), 2)
          return
        }
        applyContext(el, 0, 0, 0)
      })

      const firstStep = stepRefs.current[0]
      const list = firstStep?.closest("ol")
      const stepPitch = list ? list.offsetHeight / PATH_COUNT : 24
      if (markRef.current) {
        markRef.current.style.transform = `translateY(${(nextActive * stepPitch).toFixed(2)}px)`
      }
      stepRefs.current.forEach((btn, index) => {
        if (!btn) return
        btn.classList.toggle("is-on", index === nextActive)
      })

      const cue = cueRef.current
      if (cue) {
        const cueOpacity = nextActive === 0 ? Math.max(0, 1 - Math.max(0, progress - 0.08) / 0.07) : 0
        cue.style.opacity = cueOpacity.toFixed(3)
        cue.style.visibility = cueOpacity < 0.04 ? "hidden" : "visible"
      }
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        applyStory()
      })
    }

    const observeInView = () => {
      if (storyMotionEnabled()) return null
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in", entry.isIntersecting)
        })
      }, { threshold: 0.32, rootMargin: "0px 0px -8% 0px" })
      panels().forEach((el) => { if (el) io.observe(el) })
      return io
    }

    let io = observeInView()
    applyStory()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    const onModeChange = () => {
      io?.disconnect()
      io = observeInView()
      onScroll()
    }
    desktopMq.addEventListener("change", onModeChange)
    motionMq.addEventListener("change", onModeChange)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      desktopMq.removeEventListener("change", onModeChange)
      motionMq.removeEventListener("change", onModeChange)
      io?.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  const scrollToStep = (index: number) => {
    const track = trackRef.current
    const sticky = stickyRef.current
    if (!track || !sticky || !storyMotionEnabled()) return
    const top = navOffset()
    const travel = Math.max(1, track.offsetHeight - sticky.offsetHeight)
    const origin = track.getBoundingClientRect().top + window.scrollY
    const progress = Math.min(0.97, (index + 0.38) * PATH_SEGMENT)
    window.scrollTo({ top: origin - top + travel * progress, behavior: "auto" })
  }

  return (
    <div className="hp-choose-track" ref={trackRef}>
      <div className="hp-choose-sticky" ref={stickyRef}>
        <div className="hp-rail hp-choose-frame">
          <header className="hp-choose-intro">
            <p className="hp-eyebrow hp-choose-eyebrow">ONE PLATFORM. MULTIPLE PATHS.</p>
            <h2 id="home-paths-heading" className="hp-choose-title">Choose your path.</h2>
            <p className="hp-choose-lead">Different goals. Same destination — a better you.</p>
          </header>

          <div className="hp-choose-stage" ref={stageRef}>
            <div className="hp-choose-steps-wrap">
              <span className="hp-choose-steps-mark" ref={markRef} aria-hidden="true" />
              <ol className="hp-choose-steps" aria-label="Path sequence">
                {HOME_PATHS.map((path, index) => (
                  <li key={path.id}>
                    <button
                      type="button"
                      ref={(node) => { stepRefs.current[index] = node }}
                      className={index === active ? "is-on" : undefined}
                      aria-current={index === active ? "step" : undefined}
                      aria-label={`${path.step} ${path.title}`}
                      onClick={() => scrollToStep(index)}
                    >
                      {path.step}
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="hp-choose-panels">
              {HOME_PATHS.map((path, index) => (
                <div key={path.id} className={`hp-choose-chapter is-${path.align}`}>
                  <div
                    ref={(node) => { contextRefs.current[index] = node }}
                    className={`hp-choose-context is-${path.align === "left" ? "right" : "left"} is-${path.id}`}
                    aria-hidden="true"
                  >
                    <PathLivingMotif id={path.id} />
                    <span className="hp-choose-context-num">{path.step}</span>
                    <div className="hp-choose-context-copy">
                      {path.context.map((group) => (
                        <p key={group.join("-")} className="hp-choose-context-group">
                          {group.map((word) => (
                            <span key={word}>{word}</span>
                          ))}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Link
                    ref={(node) => { panelRefs.current[index] = node }}
                    className={`hp-choose-panel is-${path.align} is-${path.tone}`}
                    to={path.to}
                  >
                    <div className="hp-choose-panel-copy">
                      <p className="hp-choose-panel-step">{path.step}</p>
                      <h3>{path.title}</h3>
                      <p>{path.copy}</p>
                      <span className="hp-choose-panel-cta">Explore →</span>
                    </div>
                    <div className="hp-choose-panel-visual" aria-hidden="true">
                      <img src={path.image} alt="" loading="lazy" decoding="async" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <p className="hp-choose-cue" ref={cueRef}>Scroll to explore</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Learn",
    copy: "Access structured content from experts.",
    labels: "CONCEPTS · GUIDANCE · CLARITY",
  },
  {
    step: "02",
    title: "Practise",
    copy: "Reinforce your skills with hands-on exercises.",
    labels: "EXERCISES · SIMULATIONS · FEEDBACK",
  },
  {
    step: "03",
    title: "Build",
    copy: "Work on real projects and create meaningful work.",
    labels: "PROJECTS · PORTFOLIO · SOLUTIONS",
  },
  {
    step: "04",
    title: "Evidence",
    copy: "Keep what you build and use it as proof of your skills.",
    labels: "EVIDENCE · PROFILE · OPPORTUNITIES",
  },
] as const

function HomeWorkflow() {
  const sectionRef = useRef<HTMLElement>(null)
  const profile = courseProductProfile(FLAGSHIP_COURSE_SLUG)
  const course = courseBySlug(FLAGSHIP_COURSE_SLUG)
  const view = course ? coursePublicView(course) : null

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      section.classList.add("is-in")
      return
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        section.classList.add("is-in")
        io.disconnect()
      })
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hp-section hp-workflow" aria-labelledby="home-workflow-heading" ref={sectionRef}>
      <div className="hp-rail">
        <header className="hp-workflow-intro">
          <p className="hp-eyebrow hp-workflow-eyebrow">HOW SKYLENT WORKS</p>
          <h2 id="home-workflow-heading" className="hp-workflow-title">
            From learning
            <span>to real outcomes.</span>
          </h2>
          <p className="hp-workflow-lead">
            A simple, structured journey. Learn from experts, practise with purpose, build real work, and keep evidence of what you can do.
          </p>
        </header>

        {profile ? (
          <div className="hp-workflow-visual">
            <CourseProductVisual visual={profile.visual} />
            {view ? (
              <p className="hp-workflow-caption">
                {view.title} · {NW.filename}
              </p>
            ) : null}
          </div>
        ) : null}

        <ol className="hp-workflow-path" aria-label="Learn, practise, build, evidence">
          {WORKFLOW_STEPS.map((stage) => (
            <li key={stage.step}>
              <p className="hp-workflow-num">{stage.step}</p>
              <h3>{stage.title}</h3>
              <p className="hp-workflow-copy-line">{stage.copy}</p>
              <p className="hp-workflow-labels">{stage.labels}</p>
            </li>
          ))}
        </ol>

        <div className="hp-workflow-close">
          <div className="hp-workflow-close-copy">
            <p className="hp-eyebrow hp-workflow-eyebrow">MORE THAN COURSES.</p>
            <p className="hp-workflow-close-title">A complete learning-to-career ecosystem.</p>
          </div>
          <Link className="hp-workflow-close-cta" to="/programs">Explore Skylent →</Link>
        </div>
      </div>
    </section>
  )
}

const HOME_CERTIFICATE_PROGRAMS = [
  { programSlug: "data-analytics-pro", courseSlug: "data-analytics" },
  { programSlug: "product-management", courseSlug: "product-management" },
] as const

function homeCertificatePrograms() {
  return HOME_CERTIFICATE_PROGRAMS.flatMap((row) => {
    const course = courseBySlug(row.courseSlug)
    const profile = courseProductProfile(row.courseSlug)
    if (!course || !profile || !isAuthoredCourse(course.slug)) return []
    const view = coursePublicView(course)
    const capstone = course.modules
      .flatMap((module) => module.lessons)
      .some((lesson) => /capstone/i.test(lesson.title))
    return [{
      href: `/programs/${row.programSlug}`,
      title: course.title,
      work: course.desc,
      duration: view.duration,
      level: course.level,
      moduleCount: view.stats.moduleCount,
      lessonCount: view.stats.lessonCount,
      visual: profile.visual,
      practice: view.stats.quizCount > 0,
      project: Boolean(profile.project),
      evidence: capstone,
      projectNote: profile.project?.note ?? null,
    }]
  })
}

const HERO_VALUE_ITEMS = [
  "Industry-relevant curriculum",
  "Hands-on practice and projects",
  "Mentor support and guidance",
  "Career-focused learning",
] as const

const HERO_LMS_NAV = ["Learning", "Practice", "Projects", "Evidence", "Career"] as const
type HeroOsPane = (typeof HERO_LMS_NAV)[number]

function HeroOsIcon({ name }: { name: HeroOsPane }) {
  const s = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.45 }
  if (name === "Learning") return <svg {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
  if (name === "Practice") return <svg {...s}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
  if (name === "Projects") return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
  if (name === "Evidence") return <svg {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
  return <svg {...s}><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
}

function heroFeaturedWorkspace() {
  const authored = authoredCourseList()
  const course = authored.find((item) => item.slug === FLAGSHIP_COURSE_SLUG) ?? authored[0] ?? null
  if (!course) return null
  const profile = courseProductProfile(course.slug)
  const view = coursePublicView(course)
  const lessons = course.modules.flatMap((module) => module.lessons)
  const firstLesson = course.modules[0]?.lessons[0]
  const firstQuiz = lessons.find((lesson) => lesson.type === "quiz")
  const capstone = lessons.find((lesson) => /capstone|product case/i.test(lesson.title))
  const quiz = getCourseQuiz(course.slug, firstQuiz?.id)
  const evidence = capstone ? getCareerEvidence(course.slug, capstone.id) : undefined
  const visual = profile?.visual === "harbor-desk" ? "harbor-desk" as const : "northwind" as const
  const courseHref = `/courses/${course.slug}`
  return {
    title: course.title,
    lessonTitle: firstLesson?.title ?? "Open the first lesson",
    lessonCount: view.stats.lessonCount,
    quizCount: view.stats.quizCount,
    visual,
    courseHref,
    practice: {
      title: firstQuiz?.title ?? profile?.learningSteps[1]?.label ?? "Practice",
      intro: profile?.practiceIntro ?? "Short checks after a block of lessons.",
      duration: firstQuiz?.duration ?? null,
      questionCount: quiz?.questions.length ?? view.stats.quizCount,
      prompt: quiz?.questions[0]?.prompt ?? null,
      options: (quiz?.questions[0]?.options ?? []).slice(0, 4),
      href: courseHref,
    },
    project: {
      title: capstone?.title ?? profile?.project?.note?.split(" — ")[0] ?? "Capstone",
      note: profile?.project?.note ?? profile?.learningSteps.find((step) => step.label === "Capstone")?.detail ?? "Work you produce in this course.",
      href: profile?.project?.href ?? courseHref,
      status: "Capstone · not started",
    },
    evidence: {
      title: evidence?.artifact ?? capstone?.title ?? "Work sample you keep",
      skill: evidence?.skill ?? null,
      copy: evidence?.evidence ?? "Carry evidence into Career OS yourself. Nothing is invented here.",
      href: "/career-os/projects",
    },
    career: {
      href: "/career-os",
      skill: view.outcomes[0] ?? CAREER_OS_IA[1].sub,
      opportunity: "When roles are published",
    },
  }
}

function heroOsMeta(pane: HeroOsPane, workspace: NonNullable<ReturnType<typeof heroFeaturedWorkspace>>) {
  if (pane === "Practice") return `${workspace.quizCount} checks · not started`
  if (pane === "Projects") return workspace.project.status
  if (pane === "Evidence") return "Nothing kept yet"
  if (pane === "Career") return "Profile · evidence · opportunities"
  return `${workspace.lessonCount} lessons · not started`
}

function HeroReviewSheet() {
  return (
    <div className="hp-hero-report" aria-hidden="true">
      <p>Commercial review</p>
      <strong>{NW.filename}</strong>
      <ul>
        <li><span>Window</span>{NW.window}</li>
        <li><span>Valid rows</span>{String(NW.validRows)}</li>
        <li><span>Net revenue</span>{NW.netRevenueLabel}</li>
        <li><span>Lead</span>{NW.topCategory}</li>
      </ul>
    </div>
  )
}

function HomeHeroProduct() {
  const workspace = heroFeaturedWorkspace()
  const [pane, setPane] = useState<HeroOsPane>("Learning")

  if (!workspace) {
    return (
      <div className="hp-hero-visual">
        <div className="hp-hero-lms">
          <CourseThumb authored={false} />
        </div>
      </div>
    )
  }

  const next = pane === "Learning"
    ? { kicker: "Next", title: workspace.practice.title, pane: "Practice" as const }
    : pane === "Practice"
      ? { kicker: "Next", title: workspace.project.title, pane: "Projects" as const }
      : pane === "Projects"
        ? { kicker: "Next", title: "Keep this as evidence", pane: "Evidence" as const }
        : pane === "Evidence"
          ? { kicker: "Next", title: "Career OS", pane: "Career" as const }
          : { kicker: "Path", title: "Back to learning", pane: "Learning" as const }

  return (
    <div className="hp-hero-visual">
      <div className="hp-hero-lms">
        <ProductFrame title={pane === "Career" ? "Career OS" : workspace.title} meta={heroOsMeta(pane, workspace)}>
          <div className="hp-hero-os">
            <nav className="hp-hero-lms-rail" role="tablist" aria-label="Skylent OS preview">
              {HERO_LMS_NAV.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  id={`hero-os-tab-${item}`}
                  aria-selected={pane === item}
                  aria-controls="hero-os-panel"
                  className={pane === item ? "is-on" : undefined}
                  onClick={() => setPane(item)}
                >
                  <HeroOsIcon name={item} />
                  {item}
                </button>
              ))}
            </nav>
            <div className="hp-hero-lms-stage">
              <div
                key={pane}
                className="hp-hero-pane"
                role="tabpanel"
                id="hero-os-panel"
                aria-labelledby={`hero-os-tab-${pane}`}
              >
                {pane === "Learning" ? (
                  <article className="hp-hero-workspace">
                    <div className="hp-hero-media">
                      <CourseProductVisual visual={workspace.visual} compact />
                    </div>
                    <div className="hp-hero-caption">
                      <div>
                        <h3>{workspace.title}</h3>
                        <p>{workspace.lessonTitle}</p>
                        <p className="hp-hero-meta">{workspace.lessonCount} lessons · not started</p>
                      </div>
                      <Link className="hp-hero-os-cta" to={workspace.courseHref}>Start learning →</Link>
                    </div>
                  </article>
                ) : null}
                {pane === "Practice" ? (
                  <article className="hp-hero-workspace is-practice">
                    <div className="hp-hero-caption">
                      <div>
                        <h3>{workspace.practice.title}</h3>
                        <p className="hp-hero-meta">1 of {workspace.practice.questionCount} · not started</p>
                      </div>
                    </div>
                    {workspace.practice.prompt ? (
                      <div className="hp-hero-exercise">
                        <p className="hp-hero-exercise-q">{workspace.practice.prompt}</p>
                        {workspace.practice.options.length > 0 ? (
                          <ol className="hp-hero-choices" aria-hidden="true">
                            {workspace.practice.options.map((option, index) => (
                              <li key={option}>
                                <span>{String.fromCharCode(65 + index)}</span>
                                {option}
                              </li>
                            ))}
                          </ol>
                        ) : null}
                      </div>
                    ) : null}
                    <Link className="hp-hero-os-cta" to={workspace.practice.href}>Continue practice →</Link>
                  </article>
                ) : null}
                {pane === "Projects" ? (
                  <article className="hp-hero-workspace">
                    <div className="hp-hero-media is-report">
                      {workspace.visual === "northwind" ? (
                        <HeroReviewSheet />
                      ) : (
                        <CourseProductVisual visual={workspace.visual} compact />
                      )}
                    </div>
                    <div className="hp-hero-caption">
                      <div>
                        <h3>{workspace.project.title}</h3>
                        <p className="hp-hero-purpose">{workspace.project.note}</p>
                        <p className="hp-hero-meta">{workspace.project.status}</p>
                      </div>
                      <Link className="hp-hero-os-cta" to={workspace.project.href}>View project →</Link>
                    </div>
                  </article>
                ) : null}
                {pane === "Evidence" ? (
                  <article className="hp-hero-workspace is-keep">
                    <div className="hp-hero-folio">
                      <p>Work sample</p>
                      <h3>{workspace.project.title}</h3>
                      <ul>
                        {workspace.evidence.title.split(/\s+\+\s+/).map((part) => (
                          <li key={part}>{part.charAt(0).toUpperCase() + part.slice(1)}</li>
                        ))}
                      </ul>
                      <p className="hp-hero-meta">Capstone · not kept yet</p>
                    </div>
                    <Link className="hp-hero-os-cta" to={workspace.evidence.href}>View evidence →</Link>
                  </article>
                ) : null}
                {pane === "Career" ? (
                  <article className="hp-hero-workspace is-career">
                    <p className="pl-kicker">Career profile</p>
                    <ul className="hp-hero-career-line">
                      <li>
                        <span>Skills</span>
                        <b>{workspace.career.skill}</b>
                      </li>
                      <li>
                        <span>Projects</span>
                        <b>{workspace.project.title}</b>
                      </li>
                      <li>
                        <span>Evidence</span>
                        <b>Not kept yet</b>
                      </li>
                      <li>
                        <span>Opportunities</span>
                        <b>{workspace.career.opportunity}</b>
                      </li>
                    </ul>
                    <Link className="hp-hero-os-cta" to={workspace.career.href}>Open Career OS →</Link>
                  </article>
                ) : null}
              </div>
              <aside className="hp-hero-next">
                <p className="pl-kicker">{next.kicker}</p>
                <p>{next.title}</p>
                <button type="button" className="hp-hero-next-go" onClick={() => setPane(next.pane)}>
                  Open {next.pane}
                </button>
              </aside>
            </div>
          </div>
        </ProductFrame>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <PageShell aurora={false}>
      <div className="home-p3">
        <section className="hp-hero" aria-labelledby="home-hero-heading">
          <div className="hp-rail">
            <div className="hp-hero-grid">
              <div className="hp-hero-copy">
                <p className="hp-eyebrow hp-hero-eyebrow">LEARN · PRACTISE · BUILD · EVIDENCE</p>
                <h1 id="home-hero-heading">
                  Build skills
                  <br />
                  that take you
                  <br />
                  <span className="hp-hero-further">further</span>
                  <span className="hp-hero-further-dot">.</span>
                </h1>
                <p className="hp-hero-lead">
                  Structured programs, hands-on practice, real projects
                  <br className="hp-hero-lead-br" />
                  {" "}and career support — all in one place.
                </p>
                <div className="hp-actions">
                  <Link className="hp-btn hp-btn-primary" to="/programs">Explore Programs →</Link>
                  <button type="button" className="hp-btn hp-btn-ghost hp-btn-video">
                    <span className="hp-btn-play" aria-hidden="true" />
                    Watch Video
                  </button>
                </div>
              </div>
              <div className="hp-hero-stage">
                <HomeHeroProduct />
              </div>
            </div>
            <ul className="hp-hero-values" aria-label="Platform highlights">
              {HERO_VALUE_ITEMS.map((label, index) => (
                <li key={label}>
                  <span className="hp-hero-values-num">{String(index + 1).padStart(2, "0")}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="hp-section hp-choose" aria-labelledby="home-paths-heading">
          <HomePathStory />
        </section>

        <section className="hp-section hp-programs" aria-labelledby="home-programs-heading">
          <div className="hp-rail">
            <p className="hp-eyebrow">PROFESSIONAL CERTIFICATE PROGRAMS</p>
            <h2 id="home-programs-heading" className="hp-h2">
              Build practical capability through structured learning, practice and real work.
            </h2>
            <p className="hp-lead">
              A Skylent Professional Certificate Program is a pathway in Skylent OS: written lessons, practice, and a piece of work you keep. It is not a single course tile, and it is not a catalogue of unrelated classes.
            </p>
            <ul className="hp-pcp-list">
              {homeCertificatePrograms().map((program) => (
                <li key={program.href}>
                  <article className="hp-pcp">
                    <div className="hp-pcp-body">
                      <p className="hp-pcp-label">Professional Certificate</p>
                      <h3>{program.title}</h3>
                      <dl className="hp-pcp-facts">
                        <div>
                          <dt>Duration</dt>
                          <dd>{program.duration}</dd>
                        </div>
                        <div>
                          <dt>Level</dt>
                          <dd>{program.level}</dd>
                        </div>
                        <div>
                          <dt>Modules</dt>
                          <dd>{program.moduleCount}</dd>
                        </div>
                        <div>
                          <dt>Lessons</dt>
                          <dd>{program.lessonCount}</dd>
                        </div>
                      </dl>
                      <p className="hp-pcp-work">{program.work}</p>
                      {program.projectNote ? <p className="hp-pcp-project">{program.projectNote}</p> : null}
                      <ul className="hp-pcp-marks">
                        <li className={program.practice ? "is-on" : undefined}>Practice</li>
                        <li className={program.project ? "is-on" : undefined}>Project</li>
                        <li className={program.evidence ? "is-on" : undefined}>Evidence</li>
                      </ul>
                      <Link className="hp-btn hp-btn-primary" to={program.href}>View Program</Link>
                    </div>
                    <div className="hp-pcp-visual">
                      <p className="hp-preview-caption">Work you produce in this program</p>
                      <CourseProductVisual visual={program.visual} compact />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
            <p className="hp-honesty">
              Only these two Professional Certificate Programs have authored teaching today. Enrolment opens the linked course in Skylent OS — it does not create a separate classroom. Other programme listings are not shown here because they are not teachable yet.
            </p>
          </div>
        </section>

        <HomeWorkflow />
      </div>
    </PageShell>
  )
}
