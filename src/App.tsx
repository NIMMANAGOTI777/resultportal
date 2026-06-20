import { useState, useEffect } from 'react';
import { RouterProvider, Route, useRouter } from './components/Router';
import { dbService } from './services/db';
import type { School, User } from './services/db';
import { LandingPage } from './components/LandingPage';
import { StudentLogin } from './components/StudentLogin';
import { TeacherLogin } from './components/TeacherLogin';
import { AdminLogin } from './components/AdminLogin';
import { StudentDashboard } from './components/StudentDashboard';
import { StaffDashboard } from './components/StaffDashboard';
import { TeacherRequestPage } from './components/TeacherRequestPage';

function AppContent() {
  const { path, navigate } = useRouter();
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [school, setSchool] = useState<School | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const sch = await dbService.getSchoolSettings();
      setSchool(sch);
      const user = await dbService.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      console.error("Failed to load user session", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [path]); // Reload session when navigating to ensure guard evaluation is up to date

  // Global Route Guards
  useEffect(() => {
    if (loading) return;

    const isStudentDashboard = path === '/student/dashboard';
    const isTeacherDashboard = path === '/teacher/dashboard';
    const isAdminDashboard = path === '/admin/dashboard';

    if (!currentUser) {
      // If not logged in, block protected dashboard routes
      if (isStudentDashboard) {
        navigate('/student-login');
      } else if (isTeacherDashboard) {
        navigate('/teacher-login');
      } else if (isAdminDashboard) {
        navigate('/admin-login');
      }
    } else {
      // If logged in, enforce role authorization bounds
      if (currentUser.role === 'student') {
        // Students are restricted ONLY to /student/dashboard
        if (isTeacherDashboard || isAdminDashboard || path === '/' || path === '/student-login' || path === '/teacher-login' || path === '/admin-login' || path === '/teacher-request') {
          navigate('/student/dashboard');
        }
      } else if (currentUser.role === 'teacher') {
        // Teachers are restricted ONLY to /teacher/dashboard
        if (isStudentDashboard || isAdminDashboard || path === '/' || path === '/student-login' || path === '/teacher-login' || path === '/admin-login' || path === '/teacher-request') {
          navigate('/teacher/dashboard');
        }
      } else if (currentUser.role === 'admin') {
        // Admins are restricted ONLY to /admin/dashboard
        if (isStudentDashboard || isTeacherDashboard || path === '/' || path === '/student-login' || path === '/teacher-login' || path === '/admin-login' || path === '/teacher-request') {
          navigate('/admin/dashboard');
        }
      }
    }
  }, [path, currentUser, loading]);

  const handleLogout = async () => {
    await dbService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'te' : 'en'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Catch unmatched URLs and fallback to root home or role dashboard
  const validRoutes = ['/', '/student-login', '/teacher-login', '/admin-login', '/teacher-request', '/student/dashboard', '/teacher/dashboard', '/admin/dashboard'];
  if (!validRoutes.includes(path)) {
    if (currentUser) {
      if (currentUser.role === 'student') navigate('/student/dashboard');
      else if (currentUser.role === 'teacher') navigate('/teacher/dashboard');
      else if (currentUser.role === 'admin') navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
    return null;
  }

  return (
    <>
      <Route path="/" element={<LandingPage language={language} toggleLanguage={toggleLanguage} school={school} />} />
      <Route path="/student-login" element={<StudentLogin language={language} />} />
      <Route path="/teacher-request" element={<TeacherRequestPage language={language} />} />
      <Route path="/teacher-login" element={<TeacherLogin language={language} />} />
      <Route path="/admin-login" element={<AdminLogin language={language} />} />
      <Route path="/student/dashboard" element={<StudentDashboard language={language} />} />
      <Route path="/teacher/dashboard" element={
        currentUser && currentUser.role === 'teacher' ? (
          <StaffDashboard 
            role="teacher" 
            language={language} 
            toggleLanguage={toggleLanguage}
            currentUser={currentUser} 
            school={school} 
            onLogout={handleLogout} 
          />
        ) : null
      } />
      <Route path="/admin/dashboard" element={
        currentUser && currentUser.role === 'admin' ? (
          <StaffDashboard 
            role="admin" 
            language={language} 
            toggleLanguage={toggleLanguage}
            currentUser={currentUser} 
            school={school} 
            onLogout={handleLogout} 
            onBrandingChange={loadData}
          />
        ) : null
      } />
    </>
  );
}

function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;
