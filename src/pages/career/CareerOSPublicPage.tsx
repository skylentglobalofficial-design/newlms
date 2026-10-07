import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { PageShell } from "../../components/shared"
import { CareerPublicSubnav } from "../../components/product/Architecture"
import { authoredProgrammeContent } from "../../components/programme/programme-content"
import { Action, AiMark, SectionIndex, TruthChip } from "../../components/skylent/primitives"
import { Reveal } from "../../components/skylent/Reveal"
import { truthOf, type Capability } from "../../lib/truth"
import "./CareerOS.css"
import "./CareerOSPublic.css"

/**
 * Public entry to Career OS (signed out). Four capabilities, each with the state recorded in
 * src/lib/truth.ts. No sample profiles, jobs, employers or outcomes are shown.
 *
 * The workspace plate is drawn in JSX and captioned ILLUSTRATIVE. Its project, task and skill
 * names are the Data Analytics course's own material (programme-content.ts); the states on it
 * are read from truth.ts. It shows no score, no match, no salary and no opening.
 */
const CAPABILITIES: Array<{ capability: Capability; name: string; copy: ReactNode }> = [
  {
    capability: "careerProfile",
    name: "Career profile",
    copy: "A target role you write yourself, your education, experience and links, and skills you enter with a proficiency you choose.",
  },
  {
    capability: "projectsAndEvidence",
    name: "Projects and evidence",
    copy: "Capstone projects from the courses you take, with their task progress. Evidence records you can share with a reviewer are not released yet.",
  },
  {
    capability: "certificates",
    name: "Certificates",
    copy: (
      <>
        Issued when every lesson of a course is complete. Anyone with the certificate ID can <Link to="/verify">check it</Link>.
      </>
    ),
  },
  {
    capability: "openings",
    name: "Openings",
    copy: "No openings are published. Saved jobs, applications and interviews stay empty until there are.",
  },
]

const THREE_THINGS: Array<{ name: string; copy: string }> = [
  { name: "A certificate", copy: "Confirms that every lesson of a course was completed." },
  { name: "Project evidence", copy: "Is your own work on a project." },
  { name: "An employment outcome", copy: "Is neither of these, and Career OS does not record or promise one." },
]

const PLATE_TABS = ["Overview", "Profile", "Projects", "Opportunities", "Applications"] as const

/** The Career OS workspace, drawn. Every name on it comes from the Data Analytics course material. */
function WorkspacePlate() {
  const course = authoredProgrammeContent("data-analytics-pro")
  const steps = course?.project.steps ?? []
  const nextStep = steps.find((step) => !step.worked)
  const skills = course?.evidence.record.skills ?? []

  return (
    <div className="cop-ws">
      <div className="cop-ws__bar">
        <span className="cop-ws__name">Career OS</span>
        <ul className="cop-ws__tabs" aria-hidden="true">
          {PLATE_TABS.map((tab, index) => (
            <li key={tab} className={index === 0 ? "is-on" : undefined}>
              {tab}
            </li>
          ))}
        </ul>
        <TruthChip state="illustrative" />
      </div>

      <div className="cop-ws__top">
        <div className="cop-ws__role">
          <p className="sky-label">Target role</p>
          <p className="cop-ws__rolename">Data analyst</p>
          <p className="cop-ws__meta">Example. Free text, entered by you.</p>
        </div>
        <div className="cop-ws__next">
          <div className="cop-ws__nextbody">
            <p className="cop-ws__tag">Next action</p>
            <p className="cop-ws__nexttitle">
              Continue the capstone{nextStep ? ` · step ${nextStep.number}, ${nextStep.title.toLowerCase()}` : ""}
            </p>
            <p className="cop-ws__nextnote">
              {course ? `${course.capstoneTitle}. ` : ""}
              The next action is read from your learning and your profile. It is never a score.
            </p>
          </div>
          <span className="cop-ws__btn" aria-hidden="true">
            Open project
          </span>
        </div>
      </div>

      <div className="cop-ws__grid">
        <section className="cop-ws__panel" aria-label="Skills">
          <header className="cop-ws__head">
            <p className="cop-ws__title">Your skills</p>
            <span className="sky-chip cop-ws__self">Self-entered</span>
          </header>
          <ul className="cop-ws__skills">
            {skills.map((skill) => (
              <li key={skill}>
                <span>{skill}</span>
                <span className="cop-ws__bars" role="img" aria-label="Level not set. You choose it.">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </li>
            ))}
          </ul>
          <p className="cop-ws__foot">You enter each skill and choose its level. Nothing here is verified.</p>
        </section>

        <div className="cop-ws__stack">
          <section className="cop-ws__panel cop-ws__panel--dashed" aria-label="Skill gaps">
            <header className="cop-ws__head">
              <p className="cop-ws__title">Gaps</p>
              <TruthChip state="development" />
            </header>
            <p className="cop-ws__body">
              Career OS holds no required skills per role, so it cannot compare your skills with a role yet.
            </p>
          </section>
          <section className="cop-ws__panel cop-ws__panel--ai" aria-label="Skylent AI">
            <header className="cop-ws__head">
              <AiMark />
              <TruthChip state={truthOf("careerAi")} />
            </header>
            <p className="cop-ws__body">Skylent AI cannot read your career profile yet, so it gives no career advice here.</p>
          </section>
        </div>

        <section className="cop-ws__panel cop-ws__panel--proof" aria-label="Projects and evidence">
          <header className="cop-ws__head">
            <p className="cop-ws__title">Projects and evidence</p>
            <TruthChip state={truthOf("projectsAndEvidence")} />
          </header>
          {course ? (
            <>
              <p className="sky-label cop-ws__kicker">Capstone · Data Analytics</p>
              <p className="cop-ws__project">{course.capstoneTitle}</p>
              <ol className="cop-ws__rail" aria-label="The six capstone tasks">
                {steps.map((step) => (
                  <li key={step.number} className={step.worked ? "is-on" : undefined}>
                    <span className="cop-ws__node" aria-hidden="true">
                      {step.number}
                    </span>
                    <span>{step.title}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
          <p className="cop-ws__foot">Task progress comes from the course. A shareable evidence record is not released yet.</p>
        </section>
      </div>

      <dl className="cop-ws__status">
        <div>
          <dt>Certificates</dt>
          <dd>
            <span>Issued when every lesson is complete</span>
            <TruthChip state={truthOf("certificates")} />
          </dd>
        </div>
        <div>
          <dt>Openings</dt>
          <dd>
            <span>None published</span>
            <TruthChip state={truthOf("openings")} />
          </dd>
        </div>
        <div>
          <dt>Applications and interviews</dt>
          <dd>
            <span>Empty until openings are published</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default function CareerOSPublicPage() {
  return (
    <PageShell aurora={false}>
      <div className="site-light cosp">
        <div className="sky-container">
          <CareerPublicSubnav current="overview" />
        </div>

        <section className="sky-container cosp-hero cop-hero" aria-labelledby="cosp-title">
          <div className="cosp-kicker">
            <span className="sky-label">Career OS</span>
          </div>
          <h1 id="cosp-title" className="sky-display cop-h1">
            Turn learning into <em>evidence you can use.</em>
          </h1>
          <div className="cop-hero__row">
            <p className="cosp-lead cop-lead">
              Career OS is the signed-in workspace that reads your career profile and your learning. It shows your target role, your skills,
              the work you have built and your next step. It is a workspace, not a placement service.
            </p>
            <div className="cosp-actions cop-actions">
              <Action to="/login">Sign in to Career OS</Action>
              <Action to="/programmes" kind="secondary">
                Explore programmes
              </Action>
            </div>
          </div>
        </section>

        <section className="sky-stage sky-band-navy cop-stage" aria-labelledby="cop-stage-title">
          <div className="sky-container cop-stage__inner">
            <div className="cop-stage__head">
              <div>
                <SectionIndex n="01" label="The workspace" />
                <h2 id="cop-stage-title" className="sky-display sky-display--md cop-h2">
                  Your role, your skills and the work you can show, <em>on one screen.</em>
                </h2>
              </div>
              <p className="cop-stage__side">
                Each part of the workspace states what it is: entered by you, read from your course, in development or coming soon.
              </p>
            </div>

            <Reveal as="figure" variant="plate" className="cop-stage__figure">
              <div className="sky-stage__plate cop-stage__plate">
                <WorkspacePlate />
              </div>
              <figcaption className="sky-stage__caption">
                <span>FIG. 01 · Career OS workspace, drawn with Data Analytics course material</span>
                <span>Illustrative. Not a learner's record. Yours starts empty.</span>
              </figcaption>
            </Reveal>
          </div>
        </section>

        <Reveal as="section" className="sky-container cosp-section cop-section" aria-labelledby="cosp-caps-title">
          <div className="cop-split">
            <div className="cop-split__lead">
              <SectionIndex n="02" label="What it holds today" />
              <h2 id="cosp-caps-title" className="sky-display sky-display--md cop-h2">
                Four parts, each marked with its real state.
              </h2>
            </div>
            <ul className="cosp-caps cop-caps">
              {CAPABILITIES.map((item) => (
                <li key={item.capability}>
                  <strong>{item.name}</strong>
                  <p>{item.copy}</p>
                  <TruthChip state={truthOf(item.capability)} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <section className="sky-band-proof cop-proof" aria-labelledby="cop-three-title">
          <Reveal className="sky-container">
            <SectionIndex n="03" label="Three different things" />
            <h2 id="cop-three-title" className="sky-display sky-display--md cop-h2">
              A certificate, project evidence and an employment outcome are three different things.
            </h2>
            <ul className="cop-three">
              {THREE_THINGS.map((item, index) => (
                <li key={item.name}>
                  <span className="sky-label">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.name}</strong>
                  <p>{item.copy}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="sky-stage sky-band-navy cop-close" aria-labelledby="cop-close-title">
          <Reveal className="sky-container cop-close__inner">
            <div className="cop-close__lead">
              <p className="sky-label">Next step · Sign in</p>
              <h2 id="cop-close-title" className="sky-display sky-display--lg cop-close__title">
                Every area opens after you sign in. <em>None is filled with example data.</em>
              </h2>
            </div>
            <div className="cosp-actions cop-actions">
              <Action to="/login">Sign in to Career OS</Action>
              <Action to="/programmes" kind="secondary">
                Explore programmes
              </Action>
            </div>
          </Reveal>
        </section>
      </div>
    </PageShell>
  )
}
