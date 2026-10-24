import { lazy, Suspense, useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom"
import { globalCSS } from "./components/shared"

import { AuthProvider } from "./context/AuthContext"
import { RoleRouteGuard } from "./components/routing/RoleRouteGuard"
import { DemoStateProvider } from "./demo/DemoStateContext"
import RouteFallback from "./components/RouteFallback"

const DEFAULT_TITLE = "Skylent — Learn. Practise. Build."

/** Longest prefix wins. Authenticated routes stay out of the public sitemap. */
const PAGE_TITLES: Array<[string, string]> = [
  ["/dashboard/student", "Learner home"],
  ["/dashboard/faculty", "Teaching"],
  ["/dashboard/organisation", "Organisation"],
  ["/dashboard/recruiter", "Recruiter"],
  ["/dashboard/admin", "Admin"],
  ["/learn", "Lesson"],
  ["/os/labs", "Lab"],
  ["/os/projects", "Project"],
  ["/career-os/profile", "Career profile"],
  ["/career-os/projects", "Projects"],
  ["/career-os/jobs", "Jobs"],
  ["/career-os/applications", "Applications"],
  ["/career-os/interviews", "Interviews"],
  ["/career-os/support", "Support"],
  ["/career-os", "Career OS"],
  ["/education/school", "School"],
  ["/education/postgraduate", "Postgraduate"],
  ["/education/exams", "Exams"],
  ["/education/online", "Degree"],
  ["/education/campus", "Degree"],
  ["/education/degrees", "Degree"],
  ["/education", "Education"],
  ["/programmes", "Programmes"],
  ["/programs", "Programmes"],
  ["/skills", "Skills"],
  ["/workshops", "Workshops"],
  ["/events", "Events"],
  ["/institutions", "Institutions"],
  ["/universities", "Universities"],
  ["/labs", "Labs"],
  ["/stories", "Stories"],
  ["/about", "About"],
  ["/blog", "Journal"],
  ["/contact", "Contact"],
  ["/terms", "Terms"],
  ["/privacy", "Privacy"],
  ["/verify", "Verify a certificate"],
  ["/login", "Sign in"],
  ["/signup", "Create an account"],
  ["/path/result", "Path result"],
  ["/path", "Find a path"],
  ["/os", "Skylent OS"],
]

function titleForPath(pathname: string): string {
  if (pathname === "/") return DEFAULT_TITLE
  const match = PAGE_TITLES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  return match ? `${match[1]} · Skylent` : "Skylent"
}

const CANONICAL_ORIGIN = "https://skylent.live"

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = titleForPath(pathname)
    const href = `${CANONICAL_ORIGIN}${pathname === "/" ? "/" : pathname}`
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement("link")
      link.rel = "canonical"
      document.head.appendChild(link)
    }
    link.href = href
  }, [pathname])
  return null
}

const HomePage = lazy(() => import("./pages/HomePage"))
const LegalPage = lazy(() => import("./pages/LegalPage"))
const PathPage = lazy(() => import("./pages/path/PathPage"))
const PathResultPage = lazy(() => import("./pages/path/PathResultPage"))
const EducationPage = lazy(() => import("./pages/EducationPage"))
const SchoolingPage = lazy(() => import("./pages/education/SchoolingPage"))
const DegreeDetailPage = lazy(
  () => import("./pages/education/DegreeDetailPage"),
)
const ExamsPage = lazy(() => import("./pages/education/ExamsPage"))
const OSPage = lazy(() => import("./pages/OSPage"))
const InstitutionsPage = lazy(() => import("./pages/InstitutionsPage"))
const UniversitiesPage = lazy(() => import("./pages/UniversitiesPage"))
const LabsPage = lazy(() => import("./pages/LabsPage"))
const StoriesPage = lazy(() => import("./pages/StoriesPage"))
const AboutPage = lazy(() => import("./pages/AboutPage"))
const ProgramPage = lazy(() => import("./pages/ProgramPage"))
const ProgramsPage = lazy(() => import("./pages/ProgramsPage"))
const SkillsPage = lazy(() => import("./pages/SkillsPage"))
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage"))
const WorkshopsPage = lazy(() => import("./pages/WorkshopsPage"))
const WorkshopDetailPage = lazy(() => import("./pages/WorkshopDetailPage"))
const EventsPage = lazy(() => import("./pages/EventsPage"))
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"))
const CareerOSLayout = lazy(() => import("./pages/career/CareerOSLayout"))
const CareerOSOverviewPage = lazy(
  () => import("./pages/career/CareerOSOverviewPage"),
)
const CareerOSProfilePage = lazy(
  () => import("./pages/career/CareerOSProfilePage"),
)
const CareerOSProjectsPage = lazy(
  () => import("./pages/career/CareerOSProjectsPage"),
)
const CareerOSProjectDetailPage = lazy(
  () => import("./pages/career/CareerOSProjectDetailPage"),
)
const CareerOSJobsPage = lazy(() => import("./pages/career/CareerOSJobsPage"))
const CareerOSApplicationsPage = lazy(
  () => import("./pages/career/CareerOSApplicationsPage"),
)
const CareerOSApplicationDetailPage = lazy(
  () => import("./pages/career/CareerOSApplicationDetailPage"),
)
const CareerOSInterviewsPage = lazy(
  () => import("./pages/career/CareerOSInterviewsPage"),
)
const CareerOSInterviewDetailPage = lazy(
  () => import("./pages/career/CareerOSInterviewDetailPage"),
)
const CareerOSSupportPage = lazy(
  () => import("./pages/career/CareerOSSupportPage"),
)
const CareerOSSupportDetailPage = lazy(
  () => import("./pages/career/CareerOSSupportDetailPage"),
)
const BlogPage = lazy(() => import("./pages/BlogPage"))
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))
const VerifyPage = lazy(() => import("./pages/VerifyPage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const PathComingPage = lazy(() => import("./pages/PathComingPage"))
const DashboardStudentPage = lazy(() => import("./pages/DashboardStudentPage"))
const DashboardFacultyPage = lazy(() => import("./pages/DashboardFacultyPage"))
const DashboardOrgPage = lazy(() => import("./pages/DashboardOrgPage"))
const DashboardRecruiterPage = lazy(
  () => import("./pages/DashboardRecruiterPage"),
)
const DashboardAdminPage = lazy(() => import("./pages/DashboardAdminPage"))
const LearnPage = lazy(() => import("./pages/LearnPage"))
const NorthwindLabPage = lazy(() => import("./pages/NorthwindLabPage"))
const NorthwindProjectPage = lazy(() => import("./pages/NorthwindProjectPage"))
const PracticeWorkspacePage = lazy(
  () => import("./pages/PracticeWorkspacePage"),
)
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"))

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <DocumentTitle />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Core Skylent path product */}
        <Route path="/path" element={<PathPage />} />
        <Route path="/path/result" element={<PathResultPage />} />
        <Route path="/find-my-path" element={<Navigate to="/path" replace />} />
        <Route
          path="/find-my-path/result"
          element={<Navigate to="/path/result" replace />}
        />

        {/* Education: canonical public IA + backwards-compatible legacy routes */}
        <Route path="/education" element={<EducationPage />} />
        <Route
          path="/education/online/:slug"
          element={<DegreeDetailPage mode="ONLINE" />}
        />
        <Route
          path="/education/campus/:slug"
          element={<DegreeDetailPage mode="CAMPUS" />}
        />
        <Route path="/education/degrees/:slug" element={<DegreeDetailPage />} />
        <Route path="/education/school" element={<SchoolingPage />} />
        <Route
          path="/education/schooling"
          element={<Navigate to="/education/school" replace />}
        />
        <Route
          path="/education/online-degree"
          element={<Navigate to="/education?mode=online" replace />}
        />
        <Route
          path="/education/offline-degree"
          element={<Navigate to="/education?mode=campus" replace />}
        />
        <Route
          path="/education/undergraduate"
          element={<Navigate to="/education?level=ug" replace />}
        />
        <Route
          path="/education/postgraduate"
          element={<Navigate to="/education?level=pg" replace />}
        />
        <Route path="/education/exams" element={<ExamsPage />} />
        <Route
          path="/exams"
          element={<Navigate to="/education/exams" replace />}
        />
        <Route path="/exams/:slug" element={<PathComingPage />} />

        {/* Programmes are the learner-facing product layer; keep /programs for compatibility. */}
        <Route path="/programmes" element={<ProgramsPage />} />
        <Route path="/programmes/:slug" element={<ProgramPage />} />
        <Route
          path="/programs"
          element={<Navigate to="/programmes" replace />}
        />
        <Route path="/programs/:slug" element={<ProgramPage />} />

        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/career-os" element={<CareerOSLayout />}>
          <Route index element={<CareerOSOverviewPage />} />
          <Route path="profile" element={<CareerOSProfilePage />} />
          <Route path="projects" element={<CareerOSProjectsPage />} />
          <Route path="projects/:id" element={<CareerOSProjectDetailPage />} />
          <Route path="jobs" element={<CareerOSJobsPage />} />
          <Route path="applications" element={<CareerOSApplicationsPage />} />
          <Route
            path="applications/:id"
            element={<CareerOSApplicationDetailPage />}
          />
          <Route path="interviews" element={<CareerOSInterviewsPage />} />
          <Route
            path="interviews/:id"
            element={<CareerOSInterviewDetailPage />}
          />
          <Route path="support" element={<CareerOSSupportPage />} />
          <Route path="support/:id" element={<CareerOSSupportDetailPage />} />
        </Route>

        <Route path="/institutions" element={<InstitutionsPage />} />
        <Route path="/universities" element={<UniversitiesPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/os" element={<OSPage />} />
        <Route
          path="/courses"
          element={<Navigate to="/programmes" replace />}
        />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/workshops/:slug" element={<WorkshopDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/verify/:code" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />

        {/* /app is the authenticated workspace entry. Existing role-specific dashboards remain the source of truth. */}
        <Route
          path="/app"
          element={<Navigate to="/dashboard/student" replace />}
        />
        <Route
          path="/app/student"
          element={<Navigate to="/dashboard/student" replace />}
        />
        <Route
          path="/app/faculty"
          element={<Navigate to="/dashboard/faculty" replace />}
        />
        <Route
          path="/app/organisation"
          element={<Navigate to="/dashboard/organisation" replace />}
        />
        <Route
          path="/app/recruiter"
          element={<Navigate to="/dashboard/recruiter" replace />}
        />
        <Route
          path="/app/admin"
          element={<Navigate to="/dashboard/admin" replace />}
        />

        <Route
          path="/dashboard/student"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <DashboardStudentPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/dashboard/faculty"
          element={
            <RoleRouteGuard allowedRoles={["faculty"]}>
              <DashboardFacultyPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/dashboard/organisation"
          element={
            <RoleRouteGuard allowedRoles={["organisation"]}>
              <DashboardOrgPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/dashboard/recruiter"
          element={
            <RoleRouteGuard allowedRoles={["recruiter"]}>
              <DashboardRecruiterPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <RoleRouteGuard allowedRoles={["superadmin"]}>
              <DashboardAdminPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/learn/:slug"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <LearnPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/learn/:slug/:lessonId"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <LearnPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/os/labs/data-analytics/northwind"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <NorthwindLabPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/os/projects/:courseSlug/:projectType"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <NorthwindProjectPage />
            </RoleRouteGuard>
          }
        />
        <Route
          path="/os/practice/:courseSlug"
          element={
            <RoleRouteGuard allowedRoles={["student"]}>
              <PracticeWorkspacePage />
            </RoleRouteGuard>
          }
        />

        <Route path="/career" element={<Navigate to="/career-os" replace />} />
        <Route
          path="/jobs"
          element={<Navigate to="/career-os/jobs" replace />}
        />
        <Route
          path="/jobs/:id"
          element={<Navigate to="/career-os/jobs" replace />}
        />
        <Route path="/labs/:labId" element={<Navigate to="/labs" replace />} />
        <Route
          path="/labs/:labId/:experimentId"
          element={<Navigate to="/labs" replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DemoStateProvider>
          <style>{globalCSS}</style>
          <AppRoutes />
        </DemoStateProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
