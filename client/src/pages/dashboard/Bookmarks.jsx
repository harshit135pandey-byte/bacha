import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Bookmark, Film, Clock, Eye } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Bookmarks() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  const bookmarkIds = user?.bookmarks ?? []

  useEffect(() => {
    if (bookmarkIds.length === 0) {
      setVideos([])
      setLoading(false)
      return
    }

    setLoading(true)
    api
      .get('/videos', { params: { ids: bookmarkIds.join(',') } })
      .then((res) => {
        const items = res.data?.data ?? []
        setVideos(Array.isArray(items) ? items : [])
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false))
  }, [bookmarkIds.join(',')])

  return (
    <>
      <Helmet>
        <title>Bookmarks | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <Bookmark size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">My Bookmarks</h1>
              </div>
              <p className="text-blue-100 text-lg">Videos you have saved for later.</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6 relative z-10 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 mt-8 bg-white rounded-xl shadow-md"
            >
              <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No bookmarks yet</h3>
              <p className="text-gray-400 mt-1">Start exploring videos and save your favourites.</p>
              <Link
                to="/students"
                className="inline-block mt-4 bg-primary-400 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-500 transition-colors"
              >
                Browse Videos
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {videos.map((video, i) => (
                <motion.div
                  key={video._id ?? video.id ?? i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 12) * 0.05 }}
                >
                  <Link
                    to={`/students/${video._id ?? video.id}`}
                    className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Film size={40} />
                        </div>
                      )}
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock size={12} />
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: '#4A90E2' }}>
                        {video.category?.name ?? video.category ?? 'General'}
                      </p>
                      <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {video.title}
                      </h3>
                      {video.views !== undefined && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <Eye size={14} />
                          {video.views.toLocaleString()} views
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
