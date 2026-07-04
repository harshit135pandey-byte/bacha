import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { Play, Eye, Clock, Bookmark, Share2, ChevronLeft, Film, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function StudentVideoDetail() {
  const { id } = useParams()
  const { user } = useAuth()

  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setVideo(null)
    setRelated([])

    api
      .get(`/videos/${id}`)
      .then((res) => {
        const data = res.data?.data ?? res.data ?? {}
        setVideo(data)
        setBookmarked(data.isBookmarked ?? false)
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load video')
      })
      .finally(() => setLoading(false))

    api
      .get(`/videos/${id}/related`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.videos ?? res.data.data ?? []
        setRelated(data)
      })
      .catch(() => {})
  }, [id])

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please sign in to bookmark videos')
      return
    }
    try {
      await api.post(`/videos/${id}/bookmark`)
      setBookmarked((prev) => !prev)
      toast.success(bookmarked ? 'Bookmark removed' : 'Video bookmarked!')
    } catch {
      toast.error('Failed to update bookmark')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4 },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10">
          <div className="animate-pulse space-y-6">
            <div className="aspect-video bg-gray-300 rounded-xl" />
            <div className="h-8 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-24 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center px-4">
          <Film size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Video not found</h2>
          <p className="text-gray-500 mb-6">{error || 'This video does not exist or has been removed.'}</p>
          <Link
            to="/students"
            className="inline-flex items-center gap-2 bg-primary-400 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-500 transition-colors"
          >
            <ChevronLeft size={18} /> Back to Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{video.title} | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
          <Link
            to="/students"
            className="inline-flex items-center gap-1 text-sm font-medium hover:underline mb-6"
            style={{ color: '#4A90E2' }}
          >
            <ChevronLeft size={16} /> Back to Videos
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black rounded-xl overflow-hidden shadow-lg">
                {video.url ? (
                  <div className="relative aspect-video">
                    {video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                      <iframe
                        src={video.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={video.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <video
                        src={video.url}
                        controls
                        className="w-full h-full"
                        poster={video.thumbnail}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {!video.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400">
                        <Play size={64} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-400">
                    <Play size={64} />
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">{video.title}</h1>
                    <p className="text-xs font-medium uppercase tracking-wide mt-1" style={{ color: '#4A90E2' }}>
                      {video.category?.name ?? video.category ?? 'General'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {user && (
                      <button
                        onClick={handleBookmark}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          bookmarked
                            ? 'bg-primary-400 text-white border-primary-400'
                            : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                        }`}
                        title={bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                      >
                        <Bookmark size={18} fill={bookmarked ? 'white' : 'none'} />
                      </button>
                    )}
                    <button
                      onClick={handleShare}
                      className="p-2.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {video.views !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye size={15} />
                      {video.views.toLocaleString()} views
                    </span>
                  )}
                  {video.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={15} />
                      {video.duration}
                    </span>
                  )}
                  {video.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar size={15} />
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {video.description && (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{video.description}</p>
                )}
              </motion.div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Film size={20} /> Related Videos
              </h2>

              {related.length === 0 ? (
                <p className="text-gray-400 text-sm">No related videos found.</p>
              ) : (
                <div className="space-y-4">
                  {related.map((v, i) => (
                    <motion.div
                      key={v._id ?? v.id ?? i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link
                        to={`/students/${v._id ?? v.id}`}
                        className="group flex gap-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="w-28 shrink-0 relative bg-gray-200">
                          {v.thumbnail ? (
                            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Film size={20} />
                            </div>
                          )}
                          {v.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded flex items-center gap-0.5">
                              <Clock size={10} />
                              {v.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-2 pr-2">
                          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-400 transition-colors">
                            {v.title}
                          </h3>
                          {v.views !== undefined && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Eye size={12} />
                              {v.views.toLocaleString()} views
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
        </div>
      </div>
    </>
  )
}
