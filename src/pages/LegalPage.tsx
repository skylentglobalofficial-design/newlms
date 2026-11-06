/**
 * /terms and /privacy. Plain-language documents that describe what the Skylent product actually
 * does today (accounts, enrolment, live PayU payment & refund terms, progress, Career OS records, enquiries, session cookies).
 */
import { Link } from "react-router-dom"
import { PageShell } from "@/components/shared"
import "./LegalPage.css"

const UPDATED = "6 November 2026"
const SUPPORT_EMAIL = "support@skylent.live"

type Section = { id: string; title: string; body: React.ReactNode[] }

const TERMS: Section[] = [
  {
    id: "using",
    title: "Using Skylent",
    body: [
      "These terms apply when you browse skylent.live, try the public guest browser labs, create an account, enrol in a course, programme, or workshop, or use Career OS and Skylent AI.",
      "By creating an account, completing checkout, enrolling, or sending an enquiry, you agree to these terms and to the Privacy Policy. If you do not agree, please do not create an account, enrol, or send an enquiry.",
      "When you agree, Skylent records the date and the version of these documents that you accepted.",
    ],
  },
  {
    id: "account",
    title: "Your account",
    body: [
      "Give accurate details when you sign up and keep your password private. You are responsible for activity on your account.",
      "To protect certificate integrity, your full name printed on certificates can be updated once every 180 days (6 months) from your Profile Settings.",
      "We may suspend an account that is used to harm other learners, share single-user login sessions across unauthorized devices, misuse the platform, or break these terms.",
    ],
  },
  {
    id: "enrolment",
    title: "Enrolment, pricing, payments and refunds",
    body: [
      "Visitors can try Skylent's public guest browser labs (/labs) and Module 1 preview tasks without payment. Full access to all 6 self-paced flagship courses and career programmes is offered across three transparent plans: Basic (₹1,499), Flagship Professional (₹3,499), and Pro Career OS (₹6,499), alongside ₹99 live weekend builder workshops (which credit 99 Elixir Coins back to your learning wallet).",
      "Payments are processed securely in Indian Rupees (INR) via PayU India (supporting UPI, Debit/Credit Cards, NetBanking, and EMI). Official discount codes require Admin authorization before they can be redeemed on the Order Details (/checkout) page.",
      "Refund policy: If you request a refund within 7 calendar days of purchase and have completed less than 20% of the course lessons without claiming a certificate, you may email support@skylent.live with your PayU transaction ID for a full refund to your original payment method within 5–7 business days.",
      "Degree pathway disclosures: UG and PG degree listings on /education are proposed university articulation pathways. Skylent does not independently award degrees or NEP/ABC credits; degree admission, curriculum approval, and degree conferral rest solely with a UGC/AICTE-authorised Partner Higher Education Institution (HEI) once confirmed.",
    ],
  },
  {
    id: "your-work",
    title: "Your work and evidence",
    body: [
      "Work you submit (answers, lab queries, project files, and written reflections) stays yours. You allow Skylent to store and display it to you, and to show it on your public verification dossier (/verify/:code) only where you choose to share it.",
      "A Skylent certificate is issued by the Skylent Global Assessment Board upon completing all required lessons, module quizzes, and the graded capstone project. It is an industry proof-of-work credential, not a university degree, and does not guarantee employment or a specific salary.",
    ],
  },
  {
    id: "integrity",
    title: "Academic integrity",
    body: [
      "Submit your own work. Skylent AI acts as a Socratic mentor and will not give direct answers to an open quiz or write an open capstone assignment for you.",
      "Copying answers, sharing assessment content, or submitting someone else's work may lead to revoked certificates, removed progress, or a suspended account.",
    ],
  },
  {
    id: "ai",
    title: "Skylent AI",
    body: [
      "Skylent AI helps you debug code, practice Socratic cold calls, and review concepts in English and Hinglish. Its answers can be wrong; always verify important technical or academic decisions against the lesson material and faculty rubric.",
    ],
  },
  {
    id: "careers",
    title: "Career OS and opportunities",
    body: [
      "Career OS unlocks once a learner completes at least 60% of an eligible course curriculum, passes module quizzes, and submits their graded capstone project. Career OS helps you organize your verified portfolio, skill-gap match, and mock defense prep; Skylent does not promise job placement or guaranteed salary outcomes.",
    ],
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: [
      "We may update these terms. The date at the top shows the latest version; important changes will be announced on the site or by email.",
      <>
        Questions about these terms or refund requests: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </>,
    ],
  },
]

const PRIVACY: Section[] = [
  {
    id: "collect",
    title: "What we collect",
    body: [
      "Account details: your name, email address and password (stored only as a secure bcrypt hash), or your Google account name and email if you sign in with Google.",
      "Learning records: enrolments, payment transaction references (processed via PayU India; Skylent never stores raw card numbers or UPI PINs), lesson progress, quiz attempts, assignment and lab submissions, and project work.",
      "Career OS records you enter: target role, skills, education, experience, links, projects, applications and support requests.",
      "Enquiries: the name, email, optional phone number and message you send through a contact or degree enquiry form.",
      "Skylent AI: the questions you ask and the lesson they relate to, so that a mentor response can be produced. If you are signed in, the site assistant also sends your display name and the names of the courses you are enrolled in.",
      "Acceptance records: the date and the version of the Terms & Conditions and Privacy Policy you accepted when you created an account, enrolled or sent an enquiry.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      "To run your account, fulfill course and workshop enrolments, show your progress, issue verifiable certificates you have earned, reply to your enquiries and keep the platform secure.",
      "We do not sell your personal information.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    body: [
      "Skylent uses two essential cookies: one keeps you signed in and one protects forms against forged requests (CSRF). A third, short-lived cookie is set only while you sign in with Google. We do not use third-party advertising cookies.",
      "Some choices, such as local draft saves in practice labs and career goal preferences, are kept in your browser's local storage so you never lose unsaved work.",
    ],
  },
  {
    id: "sharing",
    title: "Who can see it",
    body: [
      "Your learning and Career OS records are visible to you and to authorised Skylent faculty and staff who grade submissions and support the service.",
      "A certificate verification code (/verify/:code) can be checked by anyone you share it with; the check shows your name, the completed course, rubric evidence summary, and the issue date.",
      "We share information with infrastructure providers that host and operate the platform (hosting, PostgreSQL database, PayU payment gateway, transactional SMTP email, Google sign-in, and the AI service behind Skylent AI), only as needed to run it.",
    ],
  },
  {
    id: "rights",
    title: "Your choices",
    body: [
      <>
        You can update your profile details or permanently delete your account directly from your Student Dashboard Profile Settings, or by emailing{" "}
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
