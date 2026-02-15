import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminFacultyRecordsPage from './pages/AdminFacultyRecordsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AddNewActivityPage from './pages/AddNewActivityPage';
import ProfilePage from './pages/ProfilePage';
import PublicationsPage from './pages/PublicationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProjectsPage from './pages/ProjectsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import SettingsPage from './pages/SettingsPage';

const APP_PAGE_KEY = 'app_page';
const APP_MENU_KEY = 'app_menu';

type PageType = 'welcome' | 'login' | 'dashboard' | 'add-activity' | 'profile' | 'publications' | 'analytics' | 'projects' | 'activities' | 'settings' | 'faculty-records' | 'reports';

const FACULTY_PAGES: PageType[] = ['dashboard', 'add-activity', 'profile', 'publications', 'analytics', 'projects', 'activities', 'settings'];
const ADMIN_PAGES: PageType[] = ['dashboard', 'faculty-records', 'reports', 'analytics', 'settings'];

function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>('welcome');
  const [selectedRole, setSelectedRole] = useState<'faculty' | 'admin' | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

  // Restore session and last page on load (e.g. after refresh)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          const role = (localStorage.getItem('userRole') as 'faculty' | 'admin') || null;
          if (role === 'faculty' || role === 'admin') {
            setSelectedRole(role);
            const savedPage = sessionStorage.getItem(APP_PAGE_KEY) as PageType | null;
            const savedMenu = sessionStorage.getItem(APP_MENU_KEY) || 'dashboard';
            const allowed = role === 'admin' ? ADMIN_PAGES : FACULTY_PAGES;
            const page = savedPage && allowed.includes(savedPage) ? savedPage : 'dashboard';
            setCurrentPage(page);
            setActiveMenuItem(page === 'dashboard' ? savedMenu : (savedMenu || page));
          } else {
            setCurrentPage('welcome');
            setSelectedRole(null);
          }
        } else {
          setCurrentPage('welcome');
          setSelectedRole(null);
        }
      } catch (_) {
        if (!cancelled) {
          setCurrentPage('welcome');
          setSelectedRole(null);
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const persistPage = useCallback((page: PageType, menu: string) => {
    if (page !== 'welcome' && page !== 'login') {
      sessionStorage.setItem(APP_PAGE_KEY, page);
      sessionStorage.setItem(APP_MENU_KEY, menu);
    }
  }, []);

  const handleLoginClick = (role: 'faculty' | 'admin') => {
    setSelectedRole(role);
    setCurrentPage('login');
  };

  const handleSignIn = () => {
    setCurrentPage('dashboard');
    persistPage('dashboard', 'dashboard');
  };

  const handleBackClick = () => {
    setCurrentPage('welcome');
    setSelectedRole(null);
    sessionStorage.removeItem(APP_PAGE_KEY);
    sessionStorage.removeItem(APP_MENU_KEY);
  };

  const handleLogout = () => {
    setCurrentPage('welcome');
    setSelectedRole(null);
    setActiveMenuItem('dashboard');
    sessionStorage.removeItem(APP_PAGE_KEY);
    sessionStorage.removeItem(APP_MENU_KEY);
  };

  const handleAddActivityClick = () => {
    setCurrentPage('add-activity');
    persistPage('add-activity', activeMenuItem);
  };

  const handleCancelAddActivity = () => {
    setCurrentPage('dashboard');
    setActiveMenuItem('dashboard');
    persistPage('dashboard', 'dashboard');
  };

  const handleSidebarItemClick = (item: string) => {
    setActiveMenuItem(item);
    if (item === 'profile') {
      setCurrentPage('profile');
      persistPage('profile', item);
    } else if (item === 'publications') {
      setCurrentPage('publications');
      persistPage('publications', item);
    } else if (item === 'analytics') {
      setCurrentPage('analytics');
      persistPage('analytics', item);
    } else if (item === 'projects') {
      setCurrentPage('projects');
      persistPage('projects', item);
    } else if (item === 'activities') {
      setCurrentPage('activities');
      persistPage('activities', item);
    } else if (item === 'settings') {
      setCurrentPage('settings');
      persistPage('settings', item);
    } else if (item === 'dashboard') {
      setCurrentPage('dashboard');
      persistPage('dashboard', item);
    } else if (item === 'faculty-records') {
      setCurrentPage('faculty-records');
      persistPage('faculty-records', item);
    } else if (item === 'reports') {
      setCurrentPage('reports');
      persistPage('reports', item);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'welcome' ? (
        <WelcomePage onLoginClick={handleLoginClick} />
      ) : currentPage === 'login' ? (
        <LoginPage role={selectedRole || 'faculty'} onBack={handleBackClick} onSignIn={handleSignIn} />
      ) : currentPage === 'add-activity' ? (
        <AddNewActivityPage
          onCancel={handleCancelAddActivity}
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'profile' ? (
        <ProfilePage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'publications' ? (
        <PublicationsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'projects' ? (
        <ProjectsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'activities' ? (
        <ActivitiesPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
          onAddActivityClick={handleAddActivityClick}
        />
      ) : currentPage === 'settings' && selectedRole === 'admin' ? (
        <AdminSettingsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'settings' ? (
        <SettingsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'faculty-records' ? (
        <AdminFacultyRecordsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'reports' ? (
        <AdminReportsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : currentPage === 'analytics' && selectedRole === 'admin' ? (
        <AdminAnalyticsPage onLogout={handleLogout} activeMenuItem={activeMenuItem} onSidebarItemClick={handleSidebarItemClick} />
      ) : currentPage === 'analytics' ? (
        <AnalyticsPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : selectedRole === 'admin' ? (
        <AdminDashboardPage
          onLogout={handleLogout}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      ) : (
        <DashboardPage
          onLogout={handleLogout}
          onAddActivityClick={handleAddActivityClick}
          activeMenuItem={activeMenuItem}
          onSidebarItemClick={handleSidebarItemClick}
        />
      )}
    </>
  );
}

export default App;
