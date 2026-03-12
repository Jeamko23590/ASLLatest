import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { TeacherSidebar } from '@/app/components/TeacherSidebar';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { TeacherTopBar } from '@/app/components/TeacherTopBar';
import { AIChatPanel } from '@/app/components/AIChatPanel';
import { LandingPage } from '@/app/pages/LandingPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { TeacherDashboardPage } from '@/app/pages/TeacherDashboardPage';
import { TeacherStudentsPage } from '@/app/pages/TeacherStudentsPage';
import { TeacherProgressPage } from '@/app/pages/TeacherProgressPage';
import { TeacherReportsPage } from '@/app/pages/TeacherReportsPage';
import { AdminOverviewPage } from '@/app/pages/AdminOverviewPage';
import { AdminAccountsPage } from '@/app/pages/AdminAccountsPage';
import { AdminClassesPage } from '@/app/pages/AdminClassesPage';
import { AdminReportsPage } from '@/app/pages/AdminReportsPage';
import { SettingsPage } from '@/app/pages/SettingsPage';
import CanvasCursor from '@/app/components/CanvasCursor';
import { DataProvider } from '@/app/contexts/DataContext';
import { Toaster } from '@/app/components/ui/sonner';
import { Menu } from 'lucide-react';

type UserRole = 'teacher' | 'admin' | null;

// Auth context for managing authentication state
const AuthContext = React.createContext<{
  userRole: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
}>({
  userRole: null,
  login: () => {},
  logout: () => {},
});

// Hook to use auth context
export const useAuth = () => React.useContext(AuthContext);

// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = React.useState<UserRole>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('senyamatikard_user_role');
    return (stored as UserRole) || null;
  });

  const login = React.useCallback((role: UserRole) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('senyamatikard_user_role', role);
    }
  }, []);

  const logout = React.useCallback(() => {
    setUserRole(null);
    localStorage.removeItem('senyamatikard_user_role');
  }, []);

  return (
    <AuthContext.Provider value={{ userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected route component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const { userRole } = useAuth();

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Login page wrapper
function LoginPageWrapper() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [preselectedRole, setPreselectedRole] = React.useState<UserRole>(null);

  const handleLogin = (role: UserRole) => {
    login(role);
    if (role === 'teacher') {
      navigate('/teacher/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/overview');
    }
  };

  const handleNavigateBack = () => {
    navigate('/');
  };

  // Check if there's a preselected role from URL params
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') as UserRole;
    if (role === 'teacher' || role === 'admin') {
      setPreselectedRole(role);
    }
  }, []);

  return (
    <>
      <CanvasCursor />
      <LoginPage
        onLogin={handleLogin}
        onNavigateBack={handleNavigateBack}
        preselectedRole={preselectedRole}
      />
    </>
  );
}

// Landing page wrapper
function LandingPageWrapper() {
  const navigate = useNavigate();

  const handleNavigateToLogin = (role?: UserRole) => {
    if (role) {
      navigate(`/login?role=${role}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <CanvasCursor />
      <LandingPage onNavigateToLogin={handleNavigateToLogin} />
    </>
  );
}

// Teacher layout wrapper
function TeacherLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isAIPanelOpen, setIsAIPanelOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [pageContext, setPageContext] = React.useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewChange = (view: string) => {
    navigate(`/teacher/${view}`);
  };

  // Get active view from current pathname
  const pathname = window.location.pathname;
  const activeView = pathname.split('/').pop() || 'dashboard';

  return (
    <div className="h-screen bg-background flex overflow-hidden relative z-10">
      <TeacherSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TeacherTopBar
          teacherName="Teacher Maria"
          onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
          isAIPanelOpen={isAIPanelOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {React.cloneElement(children as React.ReactElement, { setPageContext })}
          </div>
          <AIChatPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
            currentPage={activeView}
            pageContext={pageContext}
          />
        </div>
      </div>
    </div>
  );
}

// Admin layout wrapper
function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewChange = (view: string) => {
    navigate(`/admin/${view}`);
  };

  // Get active view from current pathname
  const pathname = window.location.pathname;
  const activeView = pathname.split('/').pop() || 'overview';

  return (
    <div className="h-screen bg-background flex overflow-hidden relative z-10">
      <AdminSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden h-16 bg-[var(--card)] border-b-2 border-[var(--border)] flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--accent)] transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 font-bold text-lg text-[var(--primary)]">Admin Panel</h1>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPageWrapper />} />
            <Route path="/login" element={<LoginPageWrapper />} />

            {/* Teacher routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherDashboardPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherStudentsPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/progress"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherProgressPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/reports"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout>
                    <TeacherReportsPage />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/overview"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminOverviewPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminAccountsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminClassesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminReportsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <SettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect /teacher and /admin to their default pages */}
            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}