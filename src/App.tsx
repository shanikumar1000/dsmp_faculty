import { useState } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'login' | 'dashboard' | 'add-activity' | 'profile' | 'publications' | 'analytics' | 'projects' | 'activities' | 'settings' | 'faculty-records' | 'reports'>('welcome');
  const [selectedRole, setSelectedRole] = useState<'faculty' | 'admin' | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

  const handleLoginClick = (role: 'faculty' | 'admin') => {
    setSelectedRole(role);
    setCurrentPage('login');
  };

  const handleSignIn = () => {
    setCurrentPage('dashboard');
  };

  const handleBackClick = () => {
    setCurrentPage('welcome');
    setSelectedRole(null);
  };

  const handleLogout = () => {
    setCurrentPage('welcome');
    setSelectedRole(null);
    setActiveMenuItem('dashboard');
  };

  const handleAddActivityClick = () => {
    setCurrentPage('add-activity');
  };

  const handleCancelAddActivity = () => {
    setCurrentPage('dashboard');
  };

  const handleSidebarItemClick = (item: string) => {
    setActiveMenuItem(item);
    if (item === 'profile') {
      setCurrentPage('profile');
    } else if (item === 'publications') {
      setCurrentPage('publications');
    } else if (item === 'analytics') {
      setCurrentPage('analytics');
    } else if (item === 'projects') {
      setCurrentPage('projects');
    } else if (item === 'activities') {
      setCurrentPage('activities');
    } else if (item === 'settings') {
      setCurrentPage('settings');
    } else if (item === 'dashboard') {
      setCurrentPage('dashboard');
    } else if (item === 'faculty-records') {
      setCurrentPage('faculty-records');
    } else if (item === 'reports') {
      setCurrentPage('reports');
    }
  };

  return (
    <>
      {currentPage === 'welcome' ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <WelcomePage onLoginClick={handleLoginClick} />
        </div>
      ) : currentPage === 'login' ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <LoginPage role={selectedRole || 'faculty'} onBack={handleBackClick} onSignIn={handleSignIn} />
        </div>
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
