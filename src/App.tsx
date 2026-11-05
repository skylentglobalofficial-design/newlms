import { lazy, Suspense, useEffect } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
} from "react-router-dom"
import { globalCSS } from "./components/shared"

import { AuthProvider } from "./context/AuthContext"
import { RoleRouteGuard } from "./components/routing/RoleRouteGuard"
import { DemoStateProvider } from "./demo/DemoStateContext"
import RouteFallback from "./components/RouteFallback"
import HomePage from "./pages/HomePage"

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory()
    } catch (err) {
      if (typeof window !== "undefined") {
        const key = "skylent_chunk_reload_v42"
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1")
          if ("caches" in window) {
            try {
              const names = await caches.keys()
              await Promise.all(names.map((n) => caches.delete(n)))
            } catch {}
          }
          window.location.reload()
        }
      }
      throw err
    }
  })
}

const DEFAULT_TITLE = "Skylent — Learn. Practise. Build."

/** Longest prefix wins. Authenticated routes stay out of the public sitemap. */
const PAGE_TITLES: Array<[string, string]> = [
  ["/dashboard/student", "Learner home"],
  ["/dashboard/faculty", "Teaching"],
  ["/dashboard/organisation", "Organisation"],
  ["/dashboard/college", "College"],
  ["/dashboard/recruiter", "Recruiter"],
  ["/dashboard/admin", "Admin"],
  ["/dashboard/curriculum", "Course builder"],
  ["/account/password", "Change password"],
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
  ["/reset-password", "Reset password"],
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

const HomeDirectionPreview = lazyWithRetry(() => import("./pages/home/HomeDirectionPreview"))
const LegalPage = lazyWithRetry(() => import("./pages/LegalPage"))
const PathPage = lazyWithRetry(() => import("./pages/path/PathPage"))
const PathResultPage = lazyWithRetry(() => import("./pages/path/PathResultPage"))
const EducationPage = lazyWithRetry(() => import("./pages/EducationPage"))
const SchoolingPage = lazyWithRetry(() => import("./pages/education/SchoolingPage"))
const DegreeDetailPage = lazyWithRetry(
  () => import("./pages/education/DegreeDetailPage"),
)
const ExamsPage = lazyWithRetry(() => import("./pages/education/ExamsPage"))
const OSPage = lazyWithRetry(() => import("./pages/OSPage"))
const InstitutionsPage = lazyWithRetry(() => import("./pages/InstitutionsPage"))
const UniversitiesPage = lazyWithRetry(() => import("./pages/UniversitiesPage"))
const LabsPage = lazyWithRetry(() => import("./pages/LabsPage"))
const StoriesPage = lazyWithRetry(() => import("./pages/StoriesPage"))
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"))
const ProgramPage = lazyWithRetry(() => import("./pages/ProgramPage"))
const ProgramsPage = lazyWithRetry(() => import("./pages/ProgramsPage"))
const SkillsPage = lazyWithRetry(() => import("./pages/SkillsPage"))
const CoursesPage = lazyWithRetry(() => import("./pages/CoursesPage"))
const CourseDetailPage = lazyWithRetry(() => import("./pages/CourseDetailPage"))
const WorkshopsPage = lazyWithRetry(() => import("./pages/WorkshopsPage"))
const WorkshopDetailPage = lazyWithRetry(() => import("./pages/WorkshopDetailPage"))
const EventsPage = lazyWithRetry(() => import("./pages/EventsPage"))
const EventDetailPage = lazyWithRetry(() => import("./pages/EventDetailPage"))
const CareerOSLayout = lazyWithRetry(() => import("./pages/career/CareerOSLayout"))
const CareerOSOverviewPage = lazyWithRetry(
  () => import("./pages/career/CareerOSOverviewPage"),
)
const CareerOSProfilePage = lazyWithRetry(
  () => import("./pages/career/CareerOSProfilePage"),
)
const CareerOSProjectsPage = lazyWithRetry(
  () => import("./pages/career/CareerOSProjectsPage"),
)
const CareerOSProjectDetailPage = lazyWithRetry(
  () => import("./pages/career/CareerOSProjectDetailPage"),
)
const CareerOSJobsPage = lazyWithRetry(() => import("./pages/career/CareerOSJobsPage"))
const CareerOSApplicationsPage = lazyWithRetry(
  () => import("./pages/career/CareerOSApplicationsPage"),
)
const CareerOSApplicationDetailPage = lazyWithRetry(
  () => import("./pages/career/CareerOSApplicationDetailPage"),
)
const CareerOSInterviewsPage = lazyWithRetry(
  () => import("./pages/career/CareerOSInterviewsPage"),
)
const CareerOSInterviewDetailPage = lazyWithRetry(
  () => import("./pages/career/CareerOSInterviewDetailPage"),
)
const CareerOSSupportPage = lazyWithRetry(
  () => import("./pages/career/CareerOSSupportPage"),
)
const CareerOSSupportDetailPage = lazyWithRetry(
  () => import("./pages/career/CareerOSSupportDetailPage"),
)
const BlogPage = lazyWithRetry(() => import("./pages/BlogPage"))
const BlogPostPage = lazyWithRetry(() => import("./pages/BlogPostPage"))
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage"))
const VerifyPage = lazyWithRetry(() => import("./pages/VerifyPage"))
const LoginPage = lazyWithRetry(() => import("./pages/LoginPage"))
const ResetPasswordPage = lazyWithRetry(() => import("./pages/ResetPasswordPage"))
const PathComingPage = lazyWithRetry(() => import("./pages/PathComingPage"))
const DashboardStudentPage = lazyWithRetry(() => import("./pages/DashboardStudentPage"))
const DashboardFacultyPage = lazyWithRetry(() => import("./pages/DashboardFacultyPage"))
const DashboardOrgPage = lazyWithRetry(() => import("./pages/DashboardOrgPage"))
const DashboardCollegePage = lazyWithRetry(() => import("./pages/DashboardCollegePage"))
const DashboardRecruiterPage = lazyWithRetry(
  () => import("./pages/DashboardRecruiterPage"),
)
const DashboardAdminPage = lazyWithRetry(() => import("./pages/DashboardAdminPage"))
const CourseBuilderPage = lazyWithRetry(() => import("./pages/CourseBuilderPage"))
const ChangePasswordPage = lazyWithRetry(() => import("./pages/ChangePasswordPage"))
const LearnPage = lazyWithRetry(() => import("./pages/LearnPage"))
const NorthwindLabPage = lazyWithRetry(() => import("./pages/NorthwindLabPage"))
const NorthwindProjectPage = lazyWithRetry(() => import("./pages/NorthwindProjectPage"))
const PracticeWorkspacePage = lazyWithRetry(
  () => import("./pages/PracticeWorkspacePage"),
)
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFoundPage"))

function CoursesIndexRedirect() {
  const [params] = useSearchParams()
  const q = params.get("q")
  if (q) return <Navigate to={`/programmes?q=${encodeURIComponent(q)}`} replace />
  return <Navigate to="/programmes" replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <DocumentTitle />
      <NativeAppShellController />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/preview/homepage" element={<HomeDirectionPreview />} />

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
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/workshops/:slug" element={<WorkshopDetailPage />} />
        <Route path="/workshop" element={<Navigate to="/workshops" replace />} />
        <Route path="/workshop/:slug" element={<WorkshopDetailPage />} />
        <Route path="/event" element={<Navigate to="/events" replace />} />
        <Route path="/event/:slug" element={<EventDetailPage />} />
        <Route path="/programme" element={<Navigate to="/programmes" replace />} />
        <Route path="/programme/:slug" element={<ProgramPage />} />
        <Route path="/program" element={<Navigate to="/programmes" replace />} />
        <Route path="/course" element={<Navigate to="/courses" replace />} />
        <Route path="/course/:slug" element={<CourseDetailPage />} />
        <Route path="/degree" element={<Navigate to="/education" replace />} />
        <Route path="/degrees" element={<Navigate to="/education" replace />} />
        <Route path="/certificate" element={<Navigate to="/verify" replace />} />
        <Route path="/certificates" element={<Navigate to="/verify" replace />} />
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
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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
          path="/dashboard/college"
          element={
            <RoleRouteGuard allowedRoles={["college"]}>
              <DashboardCollegePage />
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
          path="/dashboard/curriculum"
          element={
            <RoleRouteGuard allowedRoles={["superadmin", "admin"]}>
              <CourseBuilderPage />
            </RoleRouteGuard>
          }
        />
        <Route path="/account/password" element={<ChangePasswordPage />} />
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
