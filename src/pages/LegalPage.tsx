/**
 * /terms and /privacy. Plain-language documents that describe what the Skylent product actually
 * does today (accounts, enrolment, progress, Career OS records, enquiries, session cookies).
 * They make no compliance claim. The wording must be confirmed by the Skylent owner and legal
 * counsel before launch: see docs/REPOLISH-REPORT.md.
 */
import { Link } from "react-router-dom"
import { PageShell } from "@/components/shared"
import "./LegalPage.css"

const UPDATED = "9 October 2026"
const SUPPORT_EMAIL = "support@skylent.live"

type Section = { id: string; title: string; body: React.ReactNode[] }

const TERMS: Section[] = [
  {
    id: "using",
    title: "Using Skylent",
    body: [
      "These terms apply when you browse skylent.live, create an account, enrol in a programme or course, or use Career OS and Skylent AI.",
      "By creating an account, enrolling or sending an enquiry, you agree to these terms and to the Privacy Policy. If you do not agree, please do not create an account, enrol or send an enquiry.",
      "When you agree, Skylent records the date and the version of these documents that you accepted.",
    ],
  },
  {
    id: "account",
    title: "Your account",
    body: [
      "Give accurate details when you sign up and keep your password private. You are responsible for activity on your account.",
      "We may suspend an account that is used to harm other learners, misuse the platform or break these terms.",
    ],
  },
  {
    id: "enrolment",
    title: "Enrolment",
    body: [
      "Enrolling gives you access to the lessons, checks, labs and projects of that programme or course while your account is active.",
      "Programme pages say whether enrolment is open. Where a fee applies, the amount and any refund terms are shown before you pay. Skylent does not take payment on this website today.",
      "Degree listings on this website are planned study areas. No institution is confirmed for them yet and you cannot apply through Skylent. If a listing is confirmed, the institution sets admission, fees, curriculum and assessment, and awards the degree.",
    ],
  },
  {
    id: "your-work",
    title: "Your work and evidence",
    body: [
      "Work you submit (answers, lab work, project files and reflections) stays yours. You allow Skylent to store and display it to you, and to show it to others only where you choose to share it.",
      "A Skylent certificate confirms that you completed every lesson of a course. It is not a degree and does not guarantee employment.",
    ],
  },
  {
    id: "integrity",
    title: "Academic integrity",
    body: [
      "Submit your own work. Skylent AI will not give answers to an open quiz or write an open assignment for you.",
      "Copying answers, sharing assessment content or submitting someone else's work may lead to removed progress or a suspended account.",
    ],
  },
  {
    id: "ai",
    title: "Skylent AI",
    body: [
      "Skylent AI helps you choose and learn. Its answers can be wrong; check important information with the lesson, your institution or the Skylent team.",
    ],
  },
  {
    id: "careers",
    title: "Career OS and opportunities",
    body: [
      "Career OS helps you keep your profile, projects and applications in one place. Skylent does not promise interviews, placements, jobs or salaries.",
    ],
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: [
      "We may update these terms. The date at the top shows the latest version; important changes will be announced on the site or by email.",
      <>
        Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </>,
    ],
  },
]

const PRIVACY: Section[] = [
  {
    id: "collect",
    title: "What we collect",
    body: [
      "Account details: your name, email address and password (stored only as a secure hash), or your Google account name and email if you sign in with Google.",
      "Learning records: enrolments, lesson progress, quiz attempts, assignment and lab submissions, and project work.",
      "Career OS records you enter: target role, skills, education, experience, links, projects, applications and support requests.",
      "Enquiries: the name, email, optional phone number and message you send through a contact or degree enquiry form.",
      "Skylent AI: the questions you ask and the lesson they relate to, so that an answer can be produced. To produce it, your question and the relevant lesson or catalogue text are sent to an AI service provider. If you are signed in, the site assistant also sends your display name and the names of the courses you are enrolled in.",
      "Acceptance records: the date and the version of the Terms & Conditions and Privacy Policy you accepted when you created an account, enrolled or sent an enquiry.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      "To run your account, show your progress, issue certificates you have earned, reply to your enquiries and keep the platform secure.",
      "We do not sell your personal information.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "Skylent uses two essential cookies: one keeps you signed in and one protects forms against forged requests. A third, short-lived cookie is set only while you sign in with Google. We do not use advertising cookies.",
      "Some choices, such as answers you give on the path finder, are kept only in your own browser.",
    ],
  },
  {
    id: "sharing",
    title: "Who can see it",
    body: [
      "Your learning and Career OS records are visible to you and to authorised Skylent staff who support the service.",
      "A certificate code can be checked by anyone you share it with; the check shows your name, the course and the issue date.",
      "We share information with service providers that host and operate the platform (hosting, database, video delivery, file storage, Google sign-in and the AI service behind Skylent AI), only as needed to run it.",
    ],
  },
  {
    id: "rights",
    title: "Your choices",
    body: [
      <>
        You can update most profile details yourself. To request a copy of your data, a correction or deletion of your account, email{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </>,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    body: ["We may update this policy. The date at the top shows the latest version."],
  },
]

export default function LegalPage({ kind }: { kind: "terms" | "privacy" }) {
  const isTerms = kind === "terms"
  const sections = isTerms ? TERMS : PRIVACY
  const title = isTerms ? "Terms & Conditions" : "Privacy Policy"
  return (
    <PageShell>
      <div className="site-light lg-page">
        <div className="sky-container lg-wrap">
          <header className="lg-head">
            <p className="sky-label">Legal</p>
            <h1 className="lg-title">{title}</h1>
            <p className="lg-updated">Last updated {UPDATED}</p>
            <nav className="lg-switch" aria-label="Legal documents">
              <Link to="/terms" aria-current={isTerms ? "page" : undefined}>Terms &amp; Conditions</Link>
              <Link to="/privacy" aria-current={!isTerms ? "page" : undefined}>Privacy Policy</Link>
            </nav>
          </header>
          <div className="lg-body">
            <nav className="lg-toc" aria-label="On this page">
              <ol>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="lg-doc">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="lg-section" aria-labelledby={`${section.id}-t`}>
                  <h2 id={`${section.id}-t`}>{section.title}</h2>
                  {section.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
