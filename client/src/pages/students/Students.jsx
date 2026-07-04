import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Film, Search, Filter, Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
]

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
}

export default function Students() {
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {})
  }, [])

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12, sort }
      if (search) params.search = search
      if (selectedCategory) params.category = selectedCategory

      const res = await api.get('/videos', { params })
      const items = res.data?.data ?? []
      setVideos(Array.isArray(items) ? items : [])
      setTotalPages(res.data?.pagination?.totalPages ?? 1)
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [page, sort, search, selectedCategory])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  useEffect(() => {
    setPage(1)
  }, [search, selectedCategory, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <>
      <Helmet>
        <title>Student Videos | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <Film size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">Video Library</h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">Explore educational videos designed for young learners.</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-4"
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-primary-400 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id ?? cat.id}
                  onClick={() => setSelectedCategory(cat._id ?? cat.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === (cat._id ?? cat.id)
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

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
            <motion.div {...fadeUp} className="text-center py-20 mt-8 bg-white rounded-xl shadow-md">
              <Film size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-500">No videos found</h3>
              <p className="text-gray-400 mt-1">Try adjusting your search or filters.</p>
            </motion.div>
          ) : (
            <>
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

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 pb-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary-400 text-white'
                          : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
