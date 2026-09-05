import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { C, Nav, Footer, globalCSS } from './components/shared'
import { PublicCanvas } from './components/foundation'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import EducationPage from './pages/EducationPage'
import OSPage from './pages/OSPage'
import InstitutionsPage from './pages/InstitutionsPage'
import UniversitiesPage from './pages/UniversitiesPage'
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
      <Route path="/" element={<PublicCanvas themeId="general"><Nav /><HomePage /></PublicCanvas>} />
      <Route path="/education" element={<EducationPage />} />
      <Route path="/skills" element={<SkillsPage />} />
      <Route path="/career-os" element={<CareerOSPage />} />
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
      <Route path="/dashboard/student" element={<DashboardStudentPage />} />
      <Route path="/dashboard/faculty" element={<DashboardFacultyPage />} />
      <Route path="/dashboard/organisation" element={<DashboardOrgPage />} />
      <Route path="/dashboard/recruiter" element={<DashboardRecruiterPage />} />
      <Route path="/dashboard/admin" element={<DashboardAdminPage />} />
      <Route path="/learn/:slug" element={<LearnPage />} />
      <Route path="/learn/:slug/:lessonId" element={<LearnPage />} />
      <Route path="/career" element={<Navigate to="/career-os" replace />} />
      <Route path="/universities" element={<UniversitiesPage />} />
      <Route path="/labs" element={<LabsPage />} />
      <Route path="/jobs" element={<Navigate to="/career-os" replace />} />
      <Route path="/jobs/:id" element={<Navigate to="/career-os" replace />} />
      <Route path="*" element={<PublicCanvas themeId="general"><Nav /><div style={{ paddingTop: 120, textAlign: 'center', minHeight: '100vh' }}><h2 className="skylent-display-md" style={{ color: C.white }}>Page not found</h2><Link to="/" style={{ color: C.orange }}>← Back to home</Link></div><Footer /></PublicCanvas>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <style>{globalCSS}</style>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
