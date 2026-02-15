import { LayoutDashboard, Users, FileText, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminSidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'faculty-records', label: 'Faculty Records', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ activeItem, onItemClick, onLogout, isOpen = false, onClose }: AdminSidebarProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    onLogout();
  };

  const handleItemClick = (id: string) => {
    onItemClick(id);
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-auto
          w-64 bg-white border-r border-slate-200 flex flex-col
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200">
          <span className="text-sm font-semibold text-primary-900 tracking-tight">FPMS Admin</span>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon size={18} className={isActive ? 'text-primary-600' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
