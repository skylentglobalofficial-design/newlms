import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { C, Nav, Footer, globalCSS } from './components/shared'
import { PublicCanvas } from './components/foundation'
import { DashboardIndexRedirect, LegacyCareerOsRedirect, RoleRouteGuard } from './components/routing/RouteGuards'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { DemoStateProvider } from './demo/DemoStateContext'
import HomePage from './pages/HomePage'

const LabDetailPage = lazy(() => import('./pages/LabDetailPage'))
const ExperimentPage = lazy(() => import('./pages/ExperimentPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const InstitutionsPage = lazy(() => import('./pages/InstitutionsPage'))
const LabsPage = lazy(() => import('./pages/LabsPage'))
const StoriesPage = lazy(() => import('./pages/StoriesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProgramPage = lazy(() => import('./pages/ProgramPage'))
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const CoursesPage = lazy(() => import('./pages/CoursesPage'))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'))
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'))
const WorkshopDetailPage = lazy(() => import('./pages/WorkshopDetailPage'))
const CareerOSPage = lazy(() => import('./pages/CareerOSPage'))
const CareerOSLayout = lazy(() => import('./pages/career/CareerOSLayout'))
const CareerOSOverviewPage = lazy(() => import('./pages/career/CareerOSOverviewPage'))
const CareerOSProfilePage = lazy(() => import('./pages/career/CareerOSProfilePage'))
const CareerOSJobsPage = lazy(() => import('./pages/career/CareerOSJobsPage'))
const CareerOSApplicationsPage = lazy(() => import('./pages/career/CareerOSApplicationsPage'))
const CareerOSApplicationDetailPage = lazy(() => import('./pages/career/CareerOSApplicationDetailPage'))
const CareerOSInterviewsPage = lazy(() => import('./pages/career/CareerOSInterviewsPage'))
const CareerOSInterviewDetailPage = lazy(() => import('./pages/career/CareerOSInterviewDetailPage'))
const CareerOSSupportPage = lazy(() => import('./pages/career/CareerOSSupportPage'))
const CareerOSSupportDetailPage = lazy(() => import('./pages/career/CareerOSSupportDetailPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardStudentPage = lazy(() => import('./pages/DashboardStudentPage'))
const DashboardFacultyPage = lazy(() => import('./pages/DashboardFacultyPage'))
const DashboardOrgPage = lazy(() => import('./pages/DashboardOrgPage'))
const DashboardRecruiterPage = lazy(() => import('./pages/DashboardRecruiterPage'))
const DashboardAdminPage = lazy(() => import('./pages/DashboardAdminPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))

function RouteFallback() {
  return <div aria-live="polite" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 48, color: 'var(--skylent-text-muted)' }}>Loading…</div>
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<PublicCanvas themeId="general" aurora><Nav /><main id="main-content"><HomePage /></main></PublicCanvas>} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/career-os" element={<CareerOSPage />} />
        <Route path="/career-os/app" element={<CareerOSLayout />}>
          <Route index element={<CareerOSOverviewPage />} />
          <Route path="profile" element={<CareerOSProfilePage />} />
          <Route path="jobs" element={<CareerOSJobsPage />} />
          <Route path="applications" element={<CareerOSApplicationsPage />} />
          <Route path="applications/:id" element={<CareerOSApplicationDetailPage />} />
          <Route path="interviews" element={<CareerOSInterviewsPage />} />
          <Route path="interviews/:id" element={<CareerOSInterviewDetailPage />} />
          <Route path="support" element={<CareerOSSupportPage />} />
          <Route path="support/:id" element={<CareerOSSupportDetailPage />} />
        </Route>
        <Route path="/career-os/profile" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/jobs" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/applications" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/applications/:id" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/interviews" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/interviews/:id" element={<LegacyCareerOsRedirect />} />
        <Route path="/career-os/support" element={<LegacyCareerOsRedirect />} />
        <Route path="/institutions" element={<InstitutionsPage />} />
        <Route path="/os" element={<Navigate to="/login" replace />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:slug" element={<ProgramPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/workshops" element={<WorkshopsPage />} />
        <Route path="/workshops/:slug" element={<WorkshopDetailPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardIndexRedirect />} />
        <Route path="/dashboard/student" element={<RoleRouteGuard allowedRoles={["student"]}><DashboardStudentPage /></RoleRouteGuard>} />
        <Route path="/dashboard/faculty" element={<RoleRouteGuard allowedRoles={["faculty"]}><DashboardFacultyPage /></RoleRouteGuard>} />
        <Route path="/dashboard/organisation" element={<RoleRouteGuard allowedRoles={["organisation"]}><DashboardOrgPage /></RoleRouteGuard>} />
        <Route path="/dashboard/recruiter" element={<RoleRouteGuard allowedRoles={["recruiter"]}><DashboardRecruiterPage /></RoleRouteGuard>} />
        <Route path="/dashboard/admin" element={<RoleRouteGuard allowedRoles={["superadmin"]}><DashboardAdminPage /></RoleRouteGuard>} />
        <Route path="/learn/:slug/:lessonId?" element={<RoleRouteGuard allowedRoles={["student"]}><LearnPage /></RoleRouteGuard>} />
        <Route path="/career" element={<Navigate to="/career-os" replace />} />
        <Route path="/universities" element={<Navigate to="/institutions" replace />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/:labId" element={<LabDetailPage />} />
        <Route path="/labs/:labId/:experimentId" element={<ExperimentPage />} />
        <Route path="/jobs" element={<Navigate to="/career-os" replace />} />
        <Route path="/jobs/:id" element={<Navigate to="/career-os" replace />} />
        <Route path="*" element={<PublicCanvas themeId="general"><Nav /><main id="main-content"><div style={{ paddingTop: 120, textAlign: 'center', minHeight: '100vh' }}><h2 className="skylent-display-md skylent-theme-text">Page not found</h2><Link to="/" style={{ color: C.orange }}>← Back to home</Link></div><Footer /></main></PublicCanvas>} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DemoStateProvider>
            <style>{globalCSS}</style>
            <AppRoutes />
          </DemoStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}