import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { C, Nav, Footer, globalCSS } from './components/shared'
import { PublicCanvas } from './components/foundation'
import { DashboardIndexRedirect, LegacyCareerOsRedirect } from './components/routing/RouteGuards'
import LabDetailPage from './pages/LabDetailPage'
import ExperimentPage from './pages/ExperimentPage'
import { AuthProvider } from './context/AuthContext'
import { DemoStateProvider } from './demo/DemoStateContext'
import HomePage from './pages/HomePage'
import EducationPage from './pages/EducationPage'
import InstitutionsPage from './pages/InstitutionsPage'
import LabsPage from './pages/LabsPage'
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
import CareerOSLayout from './pages/career/CareerOSLayout'
import CareerOSOverviewPage from './pages/career/CareerOSOverviewPage'
import CareerOSProfilePage from './pages/career/CareerOSProfilePage'
import CareerOSJobsPage from './pages/career/CareerOSJobsPage'
import CareerOSApplicationsPage from './pages/career/CareerOSApplicationsPage'
import CareerOSApplicationDetailPage from './pages/career/CareerOSApplicationDetailPage'
import CareerOSInterviewsPage from './pages/career/CareerOSInterviewsPage'
import CareerOSInterviewDetailPage from './pages/career/CareerOSInterviewDetailPage'
import CareerOSSupportPage from './pages/career/CareerOSSupportPage'
import CareerOSSupportDetailPage from './pages/career/CareerOSSupportDetailPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import DashboardStudentPage from './pages/DashboardStudentPage'
import DashboardFacultyPage from './pages/DashboardFacultyPage'
import DashboardOrgPage from './pages/DashboardOrgPage'
import DashboardRecruiterPage from './pages/DashboardRecruiterPage'
import DashboardAdminPage from './pages/DashboardAdminPage'
import LearnPage from './pages/LearnPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicCanvas themeId="general"><Nav /><main id="main-content"><HomePage /></main></PublicCanvas>} />
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
      <Route path="/career-os/support/:id" element={<LegacyCareerOsRedirect />} />
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
      <Route path="/dashboard/student" element={<DashboardStudentPage />} />
      <Route path="/dashboard/faculty" element={<DashboardFacultyPage />} />
      <Route path="/dashboard/organisation" element={<DashboardOrgPage />} />
      <Route path="/dashboard/recruiter" element={<DashboardRecruiterPage />} />
      <Route path="/dashboard/admin" element={<DashboardAdminPage />} />
      <Route path="/learn/:slug" element={<LearnPage />} />
      <Route path="/learn/:slug/:lessonId" element={<LearnPage />} />
      <Route path="/career" element={<Navigate to="/career-os" replace />} />
      <Route path="/universities" element={<Navigate to="/institutions" replace />} />
      <Route path="/labs" element={<LabsPage />} />
      <Route path="/labs/:labId" element={<LabDetailPage />} />
      <Route path="/labs/:labId/:experimentId" element={<ExperimentPage />} />
      <Route path="/jobs" element={<Navigate to="/career-os" replace />} />
      <Route path="/jobs/:id" element={<Navigate to="/career-os" replace />} />
      <Route path="*" element={<PublicCanvas themeId="general"><Nav /><main id="main-content"><div style={{ paddingTop: 120, textAlign: 'center', minHeight: '100vh' }}><h2 className="skylent-display-md" style={{ color: C.white }}>Page not found</h2><Link to="/" style={{ color: C.orange }}>← Back to home</Link></div><Footer /></main></PublicCanvas>} />
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
