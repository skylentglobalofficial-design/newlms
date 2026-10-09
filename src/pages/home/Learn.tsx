/**
 * Learn: the signed-in student home, drawn as one large plate from the authored
 * Data Analytics course. Counts and titles come from the course data; states from truth.ts.
 */
import { Action } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { courseFacts, type CourseFacts } from "./course-facts"

function StudentHomePlate({ facts }: { facts: CourseFacts }) {
  const nextLesson = facts.currentModule.lessons[facts.currentModule.lessons.findIndex((l) => l.id === facts.current.id) + 1]
  return (
    <div
      className="hm-plate hm-home"
      role="img"
      aria-label={`Student home for a learner part-way through ${facts.title}. Next: lesson ${facts.lessonNumber}, ${facts.current.title}. ${facts.done} of ${facts.total} lessons complete.`}
    >
      <div className="hm-home__bar">
        <span>Student home</span>
        <span>{facts.title}</span>
      </div>
      <div className="hm-home__inner">
        <div className="hm-home__h">What to do next</div>
        <div className="hm-home__continue">
          <div className="hm-art-label">
            {facts.title} · M{facts.currentModuleNumber} · {facts.current.kind} · {facts.current.duration}
          </div>
          <div className="hm-home__lesson">
            Lesson {facts.lessonNumber} · {facts.current.title}
          </div>
          <div className="hm-home__where">
            Module {facts.currentModuleNumber} of {facts.stats.modules} · {facts.currentModule.title}
            {nextLesson ? `. Next: ${nextLesson.title}` : ""}
          </div>
          <div className="hm-home__row">
            <div className="hm-home__progress">
              <span>
                {facts.done} of {facts.total} lessons complete
              </span>
              <span className="hm-home__track">
                <span style={{ width: `${facts.percent}%` }} />
              </span>
            </div>
            <span className="hm-home__btn">Continue learning</span>
          </div>
        </div>

        <div className="hm-home__grid">
          <div className="hm-home__panel">
            <div className="hm-home__panelhead">My learning</div>
            {facts.modules.map((module) => (
              <div key={module.id} className={`hm-home__mod hm-home__mod--${module.state}`}>
                <span className="hm-home__modn">{module.label}</span>
                <span className="hm-home__modtitle">{module.title}</span>
                <span className="hm-home__ticks">
                  {module.lessons.map((lesson, i) => (
                    <span key={lesson.id} className={i < module.done ? "hm-home__tick hm-home__tick--on" : "hm-home__tick"} />
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="hm-home__side">
            <div className="hm-home__panel">
              <div className="hm-home__panelhead">
                <span>Current project</span>
                <span className="hm-home__status">Not started</span>
              </div>
              <div className="hm-home__project">{facts.capstoneTitle}</div>
              <div className="hm-home__note">Module {facts.capstoneModuleNumber} assignment</div>
            </div>
            <div className="hm-home__panel">
              <div className="hm-home__panelhead">Certificate</div>
              <div className="hm-home__note">Issued once every lesson is complete, with a code anyone can check.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Learn() {
  const facts = courseFacts()
  if (!facts) return null
  return (
    <section id="learn" className="hm-learn hx-learn" aria-labelledby="hm-learn-title">
      <div className="sky-container hm-learn__grid">
        <Reveal className="hm-learn__copy" stagger step={80}>
          <p className="hx-eyebrow">After you enrol</p>
          <h2 id="hm-learn-title" className="hx-h2 hx-h2--light">
            Open Skylent and <em>know what to do next.</em>
          </h2>
          <p className="hx-learn__lead">
            Your student home keeps the next lesson, your progress, the current project and your certificate on one screen.
          </p>
          <ul className="hx-learn__list">
            <li>Continue exactly where you stopped</li>
            <li>See progress module by module</li>
            <li>Projects and certificate in the same place</li>
          </ul>
          <Action to="/signup" kind="secondary">Create your account</Action>
        </Reveal>

        <figure className="hm-learn__figure">
          <Reveal className="hm-mat hx-learn__mat" variant="plate" delay={200}>
            <StudentHomePlate facts={facts} />
          </Reveal>
        </figure>
      </div>
    </section>
  )
}
