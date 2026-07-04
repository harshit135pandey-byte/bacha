import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Users,
  Video,
  Image,
  MessageSquare,
  FolderOpen,
  Activity,
  UserPlus,
  ArrowRight,
  Film,
  Eye,
  Clock,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const statCards = [
  { label: 'Total Users', key: 'totalUsers', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Active Users', key: 'activeUsers', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Total Videos', key: 'totalVideos', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Total Photos', key: 'totalPhotos', icon: Image, color: 'text-pink-500', bg: 'bg-pink-50' },
  { label: 'Total Categories', key: 'totalCategories', icon: FolderOpen, color: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Unread Messages', key: 'unreadMessages', icon: MessageSquare, color: 'text-red-500', bg: 'bg-red-50' },
]

const quickActions = [
  { label: 'Manage Videos', to: '/admin/videos', icon: Video },
  { label: 'Manage Categories', to: '/admin/categories', icon: FolderOpen },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Messages', to: '/admin/messages', icon: MessageSquare },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentVideos, setRecentVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, videosRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/users', { params: { limit: 5, sort: '-createdAt' } }),
          api.get('/videos', { params: { limit: 5, sort: 'newest' } }),
        ])
        setStats(statsRes.data?.data ?? statsRes.data)
        const usersData = usersRes.data?.data ?? usersRes.data ?? []
        setRecentUsers(Array.isArray(usersData) ? usersData : [])
        const videosData = videosRes.data?.data ?? videosRes.data ?? []
        setRecentVideos(Array.isArray(videosData) ? videosData : [])
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name ?? 'Admin'}</p>
        </div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((item) => {
            const Icon = item.icon
            const value = stats?.[item.key]
            return (
              <div key={item.key} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                    {loading ? (
                      <div className="h-8 w-16 bg-gray-200 rounded mt-1 animate-pulse" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${item.bg}`}>
                    <Icon size={22} className={item.color} />
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Film size={20} className="text-purple-500" />
                Recent Videos
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentVideos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Video size={40} className="mx-auto text-gray-300 mb-2" />
                  <p>No videos uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentVideos.map((v) => (
                    <div key={v._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {v.thumbnail ? (
                          <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400"><Film size={16} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Eye size={12} />{v.views ?? 0}</span>
                          {v.duration && <span className="flex items-center gap-1"><Clock size={12} />{v.duration}</span>}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.isPublished !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {v.isPublished !== false ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/admin/videos"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium hover:underline"
                style={{ color: '#4A90E2' }}
              >
                View All Videos <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary-400" />
              Recent Users
            </h2>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No users yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{u.name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium hover:underline"
              style={{ color: '#4A90E2' }}
            >
              View All Users <ArrowRight size={14} />
            </Link>
          </motion.div>
          </div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-primary-100 transition-colors">
                      <Icon size={18} className="text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    <ArrowRight size={14} className="ml-auto text-gray-400" />
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Analytics Snapshot</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Video Views (30d)</span>
                    <span>{stats?.monthlyViews ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-400 h-2 rounded-full" style={{ width: `${Math.min((stats?.monthlyViews ?? 0) / 100, 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>New Registrations (30d)</span>
                    <span>{stats?.monthlyRegistrations ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((stats?.monthlyRegistrations ?? 0) / 50, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}
