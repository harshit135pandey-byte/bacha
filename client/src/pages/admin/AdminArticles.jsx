import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, FileText, X, Eye, CheckCircle, XCircle } from 'lucide-react'
import api from '../../services/api'

const emptyArticle = {
  title: '',
  content: '',
  excerpt: '',
  section: 'parents',
  category: '',
  tags: '',
  published: false,
}

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/articles', { params: { page, limit: 10 } })
      const data = res.data?.data ?? res.data
      setArticles(Array.isArray(data) ? data : data?.articles ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }, [page])

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
    fetchArticles()
  }, [fetchArticles])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditing(null)
    reset(emptyArticle)
    setModalOpen(true)
  }

  const openEdit = (article) => {
    setEditing(article)
    reset({
      title: article.title ?? '',
      content: article.content ?? '',
      excerpt: article.excerpt ?? '',
      section: article.section ?? 'parents',
      category: article.category?._id ?? article.category ?? '',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags ?? ''),
      published: article.published ?? false,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('content', data.content)
      formData.append('excerpt', data.excerpt)
      formData.append('section', data.section)
      formData.append('category', data.category)
      formData.append('tags', data.tags)
      formData.append('published', data.published)
      if (data.coverFile?.[0]) formData.append('coverImage', data.coverFile[0])

      if (editing) {
        await api.put(`/articles/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Article updated')
      } else {
        await api.post('/articles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Article created')
      }
      setModalOpen(false)
      fetchArticles()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save article')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteArticle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return
    try {
      await api.delete(`/articles/${id}`)
      toast.success('Article deleted')
      fetchArticles()
    } catch {
      toast.error('Failed to delete article')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Articles | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Articles</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Article
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No articles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Section</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Views</th>
                    <th className="p-3 text-left">Published</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 max-w-[250px]">
                        <p className="font-medium text-gray-800 truncate">{article.title}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                          {article.section}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{article.category?.name ?? '-'}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Eye size={14} className="text-gray-400" />
                          {article.views ?? 0}
                        </span>
                      </td>
                      <td className="p-3">
                        {article.published ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={14} /> Yes</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={14} /> No</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(article)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteArticle(article._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
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
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40">Next</button>
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editing ? 'Edit Article' : 'Create Article'}
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
                    placeholder="Article title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    className="input-field min-h-[180px]"
                    placeholder="Article content (HTML or plain text)"
                    rows={8}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    {...register('excerpt')}
                    className="input-field"
                    placeholder="Short summary"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                    <select {...register('section', { required: true })} className="input-field">
                      <option value="parents">Parents</option>
                      <option value="students">Students</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select {...register('category')} className="input-field">
                      <option value="">None</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    {...register('tags')}
                    className="input-field"
                    placeholder="e.g. education, parenting, tips"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <input type="file" accept="image/*" {...register('coverFile')} className="input-field" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" {...register('published')} className="rounded border-gray-300" />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700">Published</label>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
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
