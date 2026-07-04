import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { History, Clock, Eye, Film } from 'lucide-react'
import api from '../../services/api'

export default function WatchHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/users/watch-history')
      .then((res) => {
        const items = res.data?.data ?? []
        setHistory(Array.isArray(items) ? items : [])
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <>
      <Helmet>
        <title>Watch History | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <History size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">Watch History</h1>
              </div>
              <p className="text-blue-100 text-lg">Videos you have watched.</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto -mt-6 relative z-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {loading ? (
              <div className="space-y-3 mt-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse flex gap-4">
                    <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20 mt-8 bg-white rounded-xl shadow-md">
                <History size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">No watch history</h3>
                <p className="text-gray-400 mt-1">Videos you watch will appear here.</p>
                <Link
                  to="/students"
                  className="inline-block mt-4 bg-primary-400 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-500 transition-colors"
                >
                  Browse Videos
                </Link>
              </div>
            ) : (
              <div className="space-y-3 mt-8">
                {history.map((item, i) => {
                  const video = item.video ?? item
                  return (
                    <motion.div
                      key={item._id ?? video._id ?? i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Link
                        to={`/students/${video._id ?? video.id ?? item.videoId}`}
                        className="flex items-center gap-4 bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Film size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-800 truncate group-hover:text-primary-400 transition-colors">
                            {video.title ?? 'Untitled'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(item.watchedAt ?? item.createdAt)}
                            </span>
                            {video.views !== undefined && (
                              <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {video.views.toLocaleString()} views
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-400 transition-colors">
                          <Eye size={18} />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
