import ProductShell from '../design/ProductShell'
import { Rail, PageHeader, Card, ButtonLink, Note, SectionHeading } from '../design/primitives'
import { S, TY } from '../design/tokens'
import '../design/detail.css'

const PRODUCTS = [
  { title: 'Learn', body: 'Programmes and courses with a published syllabus, a real price, and a status that says whether lessons are in the platform.', to: '/skills' },
  { title: 'Education', body: 'Schooling, undergraduate, postgraduate and entrance exams — structured as academic stages, with empty stages labelled empty.', to: '/education' },
  { title: 'Virtual labs', body: 'Browser experiments matched to the subject you are studying. Not a Python interpreter or a live classroom.', to: '/labs' },
  { title: 'Career OS', body: 'A signed-in workspace for profile, jobs, applications and interview practice. Not a placement service.', to: '/career-os' },
  { title: 'Institutions', body: 'The same infrastructure, scoped to a school, college or training institute. Partnership starts with a conversation.', to: '/institutions' },
]

export default function AboutPage() {
  return (
    <ProductShell>
      <Rail>
        <PageHeader
          eyebrow="About"
          title="Education, skills, career, institutions."
          lead="Skylent is a learning platform. It is not a university, it does not award degrees, and it does not place people in jobs. We publish what is actually available, and we say so when something is not."
          actions={
            <>
              <ButtonLink to="/skills">Find something to learn</ButtonLink>
              <ButtonLink to="/contact" variant="secondary">Contact</ButtonLink>
            </>
          }
        />

        <div style={{ paddingBottom: 72 }} className="sk-stack">
          <Note>
            We do not publish learner counts, placement rates, hiring-partner tallies or salary outcomes we cannot
            verify. If a number is not on this page, that is because we do not have one.
          </Note>

          <section>
            <SectionHeading title="What Skylent is" />
            <div className="sk-article">
              <p>
                A place to take a specific course or programme, to see how academic study is organised, and — once you
                are signed in — to keep a career workspace and, for institutions, to run programmes for their own
                learners.
              </p>
              <p>
                The public catalogue, the learning platform and Career OS are the same product. A programme that has no
                lessons behind it is not sold as if it did.
              </p>
            </div>
          </section>

          <section>
            <SectionHeading title="What it is not" />
            <ul className="sk-plain-list">
              <li>Not a university, and not accredited by one.</li>
              <li>Not a placement agency. Completing a programme does not guarantee a job.</li>
              <li>Not a live-cohort campus. Lessons that exist are self-paced. A video file is only shown when one is published.</li>
            </ul>
          </section>

          <section>
            <SectionHeading title="The products" />
            <div className="sk-grid sk-grid-2">
              {PRODUCTS.map(product => (
                <Card key={product.title} padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ ...TY.h3, color: S.ink, fontFamily: 'var(--font-display)' }}>{product.title}</div>
                  <p style={{ ...TY.bodySm, color: S.inkSecondary, margin: 0, flex: 1 }}>{product.body}</p>
                  <ButtonLink to={product.to} variant="quiet" size="sm">{product.title} →</ButtonLink>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </Rail>
    </ProductShell>
  )
}
