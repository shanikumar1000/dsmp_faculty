import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Navbar from '../components/Navbar';
import AdminStatsSection from '../components/AdminStatsSection';
import FacultyRecordsSection from '../components/FacultyRecordsSection';
import RecentActivitySection from '../components/RecentActivitySection';

interface AdminDashboardPageProps {
  onLogout: () => void;
  activeMenuItem?: string;
  onSidebarItemClick?: (item: string) => void;
}

export default function AdminDashboardPage({
  onLogout,
  activeMenuItem = 'dashboard',
  onSidebarItemClick = () => { }
}: AdminDashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeItem={activeMenuItem}
        onItemClick={onSidebarItemClick}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onLogout={onLogout} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Overview of faculty performance and activities</p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <AdminStatsSection />
              <FacultyRecordsSection />
              <RecentActivitySection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
