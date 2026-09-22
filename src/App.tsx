import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { globalCSS } from './components/shared'

import { AuthProvider } from './context/AuthContext'
import { RoleRouteGuard } from './components/routing/RoleRouteGuard'
import { DemoStateProvider } from './demo/DemoStateContext'
import RouteFallback from './components/RouteFallback'

const HomePage = lazy(() => import('./pages/HomePage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const SchoolingPage = lazy(() => import('./pages/education/SchoolingPage'))
const UndergraduatePage = lazy(() => import('./pages/education/UndergraduatePage'))
const PostgraduatePage = lazy(() => import('./pages/education/PostgraduatePage'))
const ExamsPage = lazy(() => import('./pages/education/ExamsPage'))
const OSPage = lazy(() => import('./pages/OSPage'))
const InstitutionsPage = lazy(() => import('./pages/InstitutionsPage'))
const UniversitiesPage = lazy(() => import('./pages/UniversitiesPage'))
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
const CareerOSLayout = lazy(() => import('./pages/career/CareerOSLayout'))
const CareerOSOverviewPage = lazy(() => import('./pages/career/CareerOSOverviewPage'))
const CareerOSProfilePage = lazy(() => import('./pages/career/CareerOSProfilePage'))
const CareerOSProjectsPage = lazy(() => import('./pages/career/CareerOSProjectsPage'))
const CareerOSProjectDetailPage = lazy(() => import('./pages/career/CareerOSProjectDetailPage'))
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
const PathComingPage = lazy(() => import('./pages/PathComingPage'))
const DashboardStudentPage = lazy(() => import('./pages/DashboardStudentPage'))
const DashboardFacultyPage = lazy(() => import('./pages/DashboardFacultyPage'))
const DashboardOrgPage = lazy(() => import('./pages/DashboardOrgPage'))
const DashboardRecruiterPage = lazy(() => import('./pages/DashboardRecruiterPage'))
const DashboardAdminPage = lazy(() => import('./pages/DashboardAdminPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const NorthwindLabPage = lazy(() => import('./pages/NorthwindLabPage'))
const NorthwindProjectPage = lazy(() => import('./pages/NorthwindProjectPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/education/schooling" element={<SchoolingPage />} />
        <Route path="/education/undergraduate" element={<UndergraduatePage />} />
        <Route path="/education/postgraduate" element={<PostgraduatePage />} />
        <Route path="/education/exams" element={<ExamsPage />} />
        <Route path="/exams" element={<Navigate to="/education/exams" replace />} />
        <Route path="/exams/:slug" element={<PathComingPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/career-os" element={<CareerOSLayout />}>
          <Route index element={<CareerOSOverviewPage />} />
          <Route path="profile" element={<CareerOSProfilePage />} />
          <Route path="projects" element={<CareerOSProjectsPage />} />
          <Route path="projects/:id" element={<CareerOSProjectDetailPage />} />
          <Route path="jobs" element={<CareerOSJobsPage />} />
          <Route path="applications" element={<CareerOSApplicationsPage />} />
          <Route path="applications/:id" element={<CareerOSApplicationDetailPage />} />
          <Route path="interviews" element={<CareerOSInterviewsPage />} />
          <Route path="interviews/:id" element={<CareerOSInterviewDetailPage />} />
          <Route path="support" element={<CareerOSSupportPage />} />
          <Route path="support/:id" element={<CareerOSSupportDetailPage />} />
        </Route>
        <Route path="/institutions" element={<InstitutionsPage />} />
        <Route path="/os" element={<OSPage />} />
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
        <Route path="/dashboard/student" element={<RoleRouteGuard allowedRoles={['student']}><DashboardStudentPage /></RoleRouteGuard>} />
        <Route path="/dashboard/faculty" element={<RoleRouteGuard allowedRoles={['faculty']}><DashboardFacultyPage /></RoleRouteGuard>} />
        <Route path="/dashboard/organisation" element={<RoleRouteGuard allowedRoles={['organisation']}><DashboardOrgPage /></RoleRouteGuard>} />
        <Route path="/dashboard/recruiter" element={<RoleRouteGuard allowedRoles={['recruiter']}><DashboardRecruiterPage /></RoleRouteGuard>} />
        <Route path="/dashboard/admin" element={<RoleRouteGuard allowedRoles={['superadmin']}><DashboardAdminPage /></RoleRouteGuard>} />
        <Route path="/learn/:slug" element={<RoleRouteGuard allowedRoles={['student']}><LearnPage /></RoleRouteGuard>} />
        <Route path="/learn/:slug/:lessonId" element={<RoleRouteGuard allowedRoles={['student']}><LearnPage /></RoleRouteGuard>} />
        <Route path="/os/labs/data-analytics/northwind" element={<RoleRouteGuard allowedRoles={['student']}><NorthwindLabPage /></RoleRouteGuard>} />
        <Route path="/os/projects/:courseSlug/:projectType" element={<RoleRouteGuard allowedRoles={['student']}><NorthwindProjectPage /></RoleRouteGuard>} />
        <Route path="/career" element={<Navigate to="/career-os" replace />} />
        <Route path="/universities" element={<UniversitiesPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/:labId" element={<Navigate to="/labs" replace />} />
        <Route path="/labs/:labId/:experimentId" element={<Navigate to="/labs" replace />} />
        <Route path="/jobs" element={<Navigate to="/career-os/jobs" replace />} />
        <Route path="/jobs/:id" element={<Navigate to="/career-os/jobs" replace />} />
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
