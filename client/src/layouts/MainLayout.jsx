import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X, Facebook, Twitter, Instagram, Youtube, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Students', path: '/students' },
  { label: 'Parents', path: '/parents' },
  { label: 'Community', path: '/community' },
  { label: 'About', path: '/about' },
];

const footerQuickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Students', path: '/students' },
  { label: 'Parents', path: '/parents' },
  { label: 'Community', path: '/community' },
  { label: 'About', path: '/about' },
];

const socialLinks = [
  { icon: Facebook, href: '#' },
  { icon: Twitter, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Youtube, href: '#' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-primary-400">
              Mera Bacha Meri Shan
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-700 hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-400 transition-colors"
                  >
                    <span>{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        {['admin', 'superadmin'].includes(user?.role) && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-primary-400 font-medium hover:bg-gray-100"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-bold text-primary-400">
                  Mera Bacha Meri Shan
                </span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gray-700 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="border-gray-200" />
                {user ? (
                  <>
                    <div className="text-gray-900 font-medium">{user.name}</div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-700 hover:text-primary-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="block text-gray-700 hover:text-primary-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block btn-outline text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block btn-primary text-center"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-primary-400 mb-4">
                Mera Bacha Meri Shan
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering young minds through quality education. Join us in building a brighter
                future for every child with accessible learning resources and a supportive community.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerQuickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>contact@merabachamerishan.com</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Education Lane, Knowledge City, EC 10001</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-3">
                Subscribe to get updates on new content and events.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-gray-900 rounded-l-md focus:outline-none text-sm"
                />
                <button className="bg-primary-400 hover:bg-primary-500 px-4 py-2 rounded-r-md text-sm font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Mera Bacha Meri Shan. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
