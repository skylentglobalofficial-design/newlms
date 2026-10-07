/**
 * Learn: the signed-in student home, drawn as one large plate from the authored
 * Data Analytics course. Counts and titles come from the course data; states from truth.ts.
 */
import { Action, SectionIndex, SpecSheet, TruthChip } from "@/components/skylent/primitives"
import { Reveal } from "@/components/skylent/Reveal"
import { truthOf } from "@/lib/truth"
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
              <div className="hm-home__panelhead">Evidence and certificates</div>
              <div className="hm-home__chips">
                <TruthChip state={truthOf("certificates")} />
              </div>
              <div className="hm-home__note">A certificate is issued once every lesson is complete.</div>
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
    <section id="learn" className="hm-learn" aria-labelledby="hm-learn-title">
      <div className="sky-container hm-learn__grid">
        <Reveal className="hm-learn__copy">
          <SectionIndex n="03" label="Learn" />
          <h2 id="hm-learn-title" className="sky-display sky-display--md">
            Open it and <em>know what to do next.</em>
          </h2>
          <p className="hm-lead">
            Lessons are written notes, checks and assignments. Student home keeps the next lesson, the current project and what still needs attention on one screen.
          </p>
          <div className="sky-label hm-learn__speclabel">{facts.title} · as authored today</div>
          <SpecSheet
            className="hm-facts"
            rows={[
              { label: "Modules", value: String(facts.stats.modules) },
              { label: "Lessons", value: String(facts.stats.lessons) },
              { label: "Assignments", value: String(facts.stats.assignments) },
              { label: "Checks", value: String(facts.stats.checks) },
            ]}
          />
          <Action to={`/courses/${facts.slug}`} kind="quiet">See the course</Action>
        </Reveal>

        <figure className="hm-learn__figure">
          <div className="hm-mat">
            <Reveal variant="plate" delay={80}>
              <StudentHomePlate facts={facts} />
            </Reveal>
          </div>
          <figcaption className="hm-caption">
            <span>FIG. 02 · Student home, part-way through {facts.title}</span>
            <span>Representation of the signed-in screen</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
