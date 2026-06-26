import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ContactRound,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserCircle,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../state/ThemeContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: ContactRound },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/follow-ups', label: 'Follow-Ups', icon: Bell },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserCircle }
];

function Sidebar({ open, setOpen }) {
  const { logout, user } = useAuth();

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={() => setOpen(false)} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <div className="text-lg font-black tracking-tight">LeadFlow</div>
            <div className="text-xs text-slate-500">Client relationship command center</div>
          </div>
          <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-brand dark:bg-blue-950 dark:text-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-3 text-sm font-semibold">{user?.name || 'Admin'}</div>
          <button className="btn-secondary w-full" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = nav.find((item) => item.to === location.pathname)?.label || 'Lead Workspace';

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{title}</h1>
          </div>
          <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 sm:flex">
            <Search size={16} />
            Search from Leads
          </div>
          <button className="btn-secondary px-3" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

