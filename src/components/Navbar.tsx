import { Bell, ChevronDown, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export default function Navbar({ onLogout, onMenuToggle }: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    onLogout?.();
  };

  return (
    <nav className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center">
      <div className="px-4 sm:px-6 flex-1 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-primary-900 truncate">
            Faculty Performance System
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                FC
              </div>
              <ChevronDown size={16} className={`text-slate-500 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg border border-slate-200 shadow-card py-1.5 z-50">
                <button type="button" className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  Profile
                </button>
                <button type="button" className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                  Account
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
