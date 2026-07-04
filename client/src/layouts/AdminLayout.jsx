import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  FolderTree,
  Quote,
  FileText,
  Calendar,
  Image,
  Users,
  MessageSquare,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Videos', path: '/admin/videos', icon: Video },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Quotes', path: '/admin/quotes', icon: Quote },
  { label: 'Articles', path: '/admin/articles', icon: FileText },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Images', path: '/admin/images', icon: Image },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Logs', path: '/admin/logs', icon: ScrollText },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-40 lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-bold text-primary-400">Admin</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-400 transition-colors text-sm"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Link to="/admin" className="text-lg font-bold text-primary-400">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-400 transition-colors text-sm"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.name}
                </span>
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                  Admin
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
