import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Search,
  X,
  Film,
  CheckCircle,
  XCircle,
  Play,
} from 'lucide-react'
import api from '../../services/api'

const emptyVideo = {
  title: '',
  description: '',
  category: '',
  thumbnail: '',
  featured: false,
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const featuredWatch = watch('featured')

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      const res = await api.get('/videos', { params })
      const data = res.data?.data ?? res.data
      setVideos(Array.isArray(data) ? data : data?.videos ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch (err) {
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories')
      const data = res.data?.data ?? res.data
      setCategories(Array.isArray(data) ? data : data?.categories ?? [])
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditing(null)
    reset(emptyVideo)
    setModalOpen(true)
  }

  const openEdit = (video) => {
    setEditing(video)
    reset({
      title: video.title ?? '',
      description: video.description ?? '',
      category: video.category?._id ?? video.category ?? '',
      thumbnail: video.thumbnail ?? '',
      featured: video.isFeatured ?? false,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('category', data.category)
      formData.append('isFeatured', data.featured)
      if (data.videoFile?.[0]) formData.append('video', data.videoFile[0])
      if (data.thumbnail) formData.append('thumbnail', data.thumbnail)

      if (editing) {
        await api.put(`/videos/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Video updated')
      } else {
        await api.post('/videos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Video created')
      }
      setModalOpen(false)
      fetchVideos()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save video')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFeatured = async (video) => {
    try {
      await api.patch(`/videos/${video._id}`)
      toast.success(video.isFeatured ? 'Removed featured' : 'Marked as featured')
      fetchVideos()
    } catch {
      toast.error('Failed to toggle featured')
    }
  }

  const deleteVideo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return
    try {
      await api.delete(`/videos/${id}`)
      toast.success('Video deleted')
      fetchVideos()
    } catch {
      toast.error('Failed to delete video')
    }
  }

  const bulkDelete = async () => {
    if (selected.length === 0) return
    if (!window.confirm(`Delete ${selected.length} selected videos?`)) return
    try {
      await Promise.all(selected.map((id) => api.delete(`/videos/${id}`)))
      toast.success(`${selected.length} videos deleted`)
      setSelected([])
      fetchVideos()
    } catch {
      toast.error('Failed to delete some videos')
    }
  }

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === videos.length) {
      setSelected([])
    } else {
      setSelected(videos.map((v) => v._id))
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Videos | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Videos</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Upload Video
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="input-field pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className="input-field sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {selected.length > 0 && (
              <button onClick={bulkDelete} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={16} />
                Delete ({selected.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Film size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No videos found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === videos.length && videos.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-3 text-left">Thumbnail</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Views</th>
                    <th className="p-3 text-left">Featured</th>
                    <th className="p-3 text-left">Published</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(video._id)}
                          onChange={() => toggleSelect(video._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3">
                        <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Film size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-gray-800 max-w-[200px] truncate">{video.title}</td>
                      <td className="p-3 text-gray-600">{video.category?.name ?? '-'}</td>
                      <td className="p-3 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye size={14} className="text-gray-400" />
                          {video.views ?? 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleFeatured(video)}
                          className={`p-1 rounded-full transition-colors ${video.isFeatured ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:text-amber-400'}`}
                        >
                          <Star size={18} fill={video.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="p-3">
                        {video.published ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={14} /> Yes</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={14} /> No</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/students/${video._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md hover:bg-green-50 text-green-500 transition-colors"
                            title="Play video"
                          >
                            <Play size={16} />
                          </a>
                          <button onClick={() => openEdit(video)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteVideo(video._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editing ? 'Edit Video' : 'Upload Video'}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    className="input-field"
                    placeholder="Video title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    className="input-field min-h-[80px]"
                    placeholder="Video description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select {...register('category', { required: 'Category is required' })} className="input-field">
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Video File *</label>
                    <input
                      type="file"
                      accept="video/*"
                      {...register('videoFile', { required: editing ? false : 'Video file is required' })}
                      className="input-field"
                    />
                    {errors.videoFile && <p className="text-red-500 text-xs mt-1">{errors.videoFile.message}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                  <input {...register('thumbnail')} className="input-field" placeholder="https://example.com/thumb.jpg" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" {...register('featured')} className="rounded border-gray-300" />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editing ? 'Update' : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
