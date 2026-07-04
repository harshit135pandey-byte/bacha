import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Bookmark, History, User, CheckCircle, Clock, Eye, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const statCards = [
  { label: 'Total Bookmarks', key: 'bookmarks', icon: Bookmark, color: 'text-blue-500', bg: 'bg-blue-50', link: '/dashboard/bookmarks' },
  { label: 'Recently Watched', key: 'watched', icon: History, color: 'text-purple-500', bg: 'bg-purple-50', link: '/dashboard/history' },
  { label: 'Account Status', key: 'status', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', link: '/dashboard/profile' },
]

const quickLinks = [
  { label: 'Edit Profile', icon: User, to: '/dashboard/profile' },
  { label: 'View Bookmarks', icon: Bookmark, to: '/dashboard/bookmarks' },
  { label: 'Watch History', icon: History, to: '/dashboard/history' },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const [recentActivity, setRecentActivity] = useState([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    if (!user) return
    api
      .get('/users/watch-history', { params: { limit: 5 } })
      .then((res) => {
        const items = res.data?.data ?? []
        setRecentActivity(Array.isArray(items) ? items : [])
      })
      .catch(() => setRecentActivity([]))
      .finally(() => setLoadingActivity(false))
  }, [user])

  const stats = {
    bookmarks: user?.bookmarks?.length ?? 0,
    watched: user?.watchHistory?.length ?? 0,
    status: user?.status ?? 'Active',
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <LayoutDashboard size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Welcome back, <span className="font-semibold">{user?.name ?? 'User'}</span>!
              </p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6 relative z-10 space-y-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {statCards.map((item) => {
              const Icon = item.icon
              const value = stats[item.key]
              return (
                <Link
                  key={item.key}
                  to={item.link}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {item.key === 'status' ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${item.bg}`}>
                      <Icon size={24} className={item.color} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium group-hover:underline" style={{ color: '#4A90E2' }}>
                    View details <ArrowRight size={12} />
                  </div>
                </Link>
              )
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-md p-5 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Clock size={20} className="text-primary-400" />
                  Recent Activity
                </h2>
                <Link
                  to="/dashboard/history"
                  className="text-sm font-medium hover:underline flex items-center gap-1"
                  style={{ color: '#4A90E2' }}
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {loadingActivity ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-10">
                  <Eye size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No watch history yet.</p>
                  <Link
                    to="/students"
                    className="text-sm font-medium hover:underline mt-1 inline-block"
                    style={{ color: '#4A90E2' }}
                  >
                    Browse videos
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item) => (
                    <Link
                      key={item._id ?? item.video?._id ?? item.videoId}
                      to={`/students/${item.video?._id ?? item.videoId}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        {item.video?.thumbnail ? (
                          <img
                            src={item.video.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <Eye size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.video?.title ?? item.title ?? 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          {formatDate(item.watchedAt ?? item.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-xl shadow-md p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
              <div className="space-y-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-secondary-50 group-hover:bg-primary-100 transition-colors">
                        <Icon size={18} className="text-primary-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{link.label}</span>
                      <ArrowRight size={14} className="ml-auto text-gray-400" />
                    </Link>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email ?? ''}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
