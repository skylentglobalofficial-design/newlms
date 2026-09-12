import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { globalCSS } from './components/shared'
import { AuthProvider } from './context/AuthContext'
import { DemoStateProvider } from './demo/DemoStateContext'
import HomePage from './pages/HomePage'
import EducationPage from './pages/EducationPage'
import ExamsPage from './pages/ExamsPage'
import JuniorPage from './pages/JuniorPage'
import DegreesPage from './pages/DegreesPage'
import CertificatesPage from './pages/CertificatesPage'
import OSPage from './pages/OSPage'
import InstitutionsPage from './pages/InstitutionsPage'
import LabsPage from './pages/LabsPage'
import LabDetailPage from './pages/LabDetailPage'
import StoriesPage from './pages/StoriesPage'
import AboutPage from './pages/AboutPage'
import ProgramPage from './pages/ProgramPage'
import ProgramsPage from './pages/ProgramsPage'
import SkillsPage from './pages/SkillsPage'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import WorkshopsPage from './pages/WorkshopsPage'
import WorkshopDetailPage from './pages/WorkshopDetailPage'
import CareerOSPage from './pages/CareerOSPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import { withLazyPage } from './pages/RouteFallback'

const CareerOSLayout = withLazyPage(() => import('./pages/career/CareerOSLayout'))
const CareerOSOverviewPage = withLazyPage(() => import('./pages/career/CareerOSOverviewPage'))
const CareerOSProfilePage = withLazyPage(() => import('./pages/career/CareerOSProfilePage'))
const CareerOSJobsPage = withLazyPage(() => import('./pages/career/CareerOSJobsPage'))
const CareerOSApplicationsPage = withLazyPage(() => import('./pages/career/CareerOSApplicationsPage'))
const CareerOSApplicationDetailPage = withLazyPage(() => import('./pages/career/CareerOSApplicationDetailPage'))
const CareerOSInterviewsPage = withLazyPage(() => import('./pages/career/CareerOSInterviewsPage'))
const CareerOSInterviewDetailPage = withLazyPage(() => import('./pages/career/CareerOSInterviewDetailPage'))
const CareerOSSupportPage = withLazyPage(() => import('./pages/career/CareerOSSupportPage'))
const CareerOSSupportDetailPage = withLazyPage(() => import('./pages/career/CareerOSSupportDetailPage'))
const DashboardStudentPage = withLazyPage(() => import('./pages/DashboardStudentPage'))
const DashboardFacultyPage = withLazyPage(() => import('./pages/DashboardFacultyPage'))
const DashboardOrgPage = withLazyPage(() => import('./pages/DashboardOrgPage'))
const DashboardRecruiterPage = withLazyPage(() => import('./pages/DashboardRecruiterPage'))
const DashboardAdminPage = withLazyPage(() => import('./pages/DashboardAdminPage'))
const LearnPage = withLazyPage(() => import('./pages/LearnPage'))
const ExperimentPage = withLazyPage(() => import('./pages/ExperimentPage'))
const VirtualLabWorkspacePage = withLazyPage(() => import('./pages/VirtualLabWorkspacePage'))

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/education" element={<EducationPage />} />
      <Route path="/exams" element={<ExamsPage />} />
      <Route path="/junior" element={<JuniorPage />} />
      <Route path="/degrees" element={<DegreesPage />} />
      <Route path="/certificates" element={<CertificatesPage />} />
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
      <Route path="/career-os/profile" element={<Navigate to="/career-os/app/profile" replace />} />
      <Route path="/career-os/jobs" element={<Navigate to="/career-os/app/jobs" replace />} />
      <Route path="/career-os/applications" element={<Navigate to="/career-os/app/applications" replace />} />
      <Route path="/career-os/applications/:id" element={<Navigate to="/career-os/app/applications/:id" replace />} />
      <Route path="/career-os/interviews" element={<Navigate to="/career-os/app/interviews" replace />} />
      <Route path="/career-os/interviews/:id" element={<Navigate to="/career-os/app/interviews/:id" replace />} />
      <Route path="/career-os/support" element={<Navigate to="/career-os/app/support" replace />} />
      <Route path="/career-os/support/:id" element={<Navigate to="/career-os/app/support/:id" replace />} />
      <Route path="/institutions" element={<InstitutionsPage />} />
      <Route path="/os" element={<OSPage />} />
      <Route path="/programs" element={<ProgramsPage />} />
      <Route path="/programs/full-stack-web" element={<Navigate to="/programs/full-stack" replace />} />
      <Route path="/programs/:slug" element={<ProgramPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/full-stack" element={<Navigate to="/courses/full-stack-web" replace />} />
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
      <Route path="/dashboard/student" element={<DashboardStudentPage />} />
      <Route path="/dashboard/faculty" element={<DashboardFacultyPage />} />
      <Route path="/dashboard/organisation" element={<DashboardOrgPage />} />
      <Route path="/dashboard/recruiter" element={<DashboardRecruiterPage />} />
      <Route path="/dashboard/admin" element={<DashboardAdminPage />} />
      <Route path="/learn" element={<Navigate to="/courses" replace />} />
      <Route path="/learn/:slug" element={<LearnPage />} />
      <Route path="/learn/:slug/:lessonId" element={<LearnPage />} />
      <Route path="/career" element={<Navigate to="/career-os" replace />} />
      <Route path="/universities" element={<Navigate to="/education" replace />} />
      <Route path="/labs" element={<LabsPage />} />
      <Route path="/labs/:labId/run" element={<VirtualLabWorkspacePage />} />
      <Route path="/labs/:labId" element={<LabDetailPage />} />
      <Route path="/labs/:labId/:experimentId" element={<ExperimentPage />} />
      <Route path="/jobs" element={<Navigate to="/career-os" replace />} />
      <Route path="/jobs/:id" element={<Navigate to="/career-os" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
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
