import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, Quote, X } from 'lucide-react'
import api from '../../services/api'

const emptyQuote = {
  content: '',
  author: '',
  active: true,
  daily: false,
  scheduledDate: '',
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()
  const activeWatch = watch('active')
  const dailyWatch = watch('daily')

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/quotes')
      const data = res.data?.data ?? res.data
      setQuotes(Array.isArray(data) ? data : data?.quotes ?? [])
    } catch {
      toast.error('Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const openCreate = () => {
    setEditing(null)
    reset(emptyQuote)
    setModalOpen(true)
  }

  const openEdit = (q) => {
    setEditing(q)
    reset({
      content: q.content ?? '',
      author: q.author ?? '',
      active: q.active ?? true,
      daily: q.daily ?? false,
      scheduledDate: q.scheduledDate ? q.scheduledDate.slice(0, 10) : '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const payload = {
        ...data,
        scheduledDate: data.scheduledDate || null,
      }
      if (editing) {
        await api.put(`/quotes/${editing._id}`, payload)
        toast.success('Quote updated')
      } else {
        await api.post('/quotes', payload)
        toast.success('Quote created')
      }
      setModalOpen(false)
      fetchQuotes()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save quote')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (q) => {
    try {
      await api.patch(`/quotes/${q._id}`, { active: !q.active })
      toast.success(q.active ? 'Deactivated' : 'Activated')
      fetchQuotes()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const toggleDaily = async (q) => {
    try {
      await api.patch(`/quotes/${q._id}`, { daily: !q.daily })
      toast.success(q.daily ? 'Removed from daily' : 'Set as daily quote')
      fetchQuotes()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const deleteQuote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote?')) return
    try {
      await api.delete(`/quotes/${id}`)
      toast.success('Quote deleted')
      fetchQuotes()
    } catch {
      toast.error('Failed to delete quote')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Quotes | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Quotes</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Quote
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12">
              <Quote size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No quotes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">Content</th>
                    <th className="p-3 text-left">Author</th>
                    <th className="p-3 text-left">Active</th>
                    <th className="p-3 text-left">Daily</th>
                    <th className="p-3 text-left">Scheduled</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 max-w-[300px]">
                        <p className="text-gray-800 truncate italic">&ldquo;{q.content}&rdquo;</p>
                      </td>
                      <td className="p-3 text-gray-600">{q.author || '-'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleActive(q)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            q.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {q.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleDaily(q)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            q.daily ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {q.daily ? 'Daily' : 'No'}
                        </button>
                      </td>
                      <td className="p-3 text-gray-600 text-xs">
                        {q.scheduledDate ? new Date(q.scheduledDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(q)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteQuote(q._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editing ? 'Edit Quote' : 'Add Quote'}
                </h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    className="input-field min-h-[80px]"
                    placeholder="Quote text"
                    rows={3}
                  />
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    {...register('author')}
                    className="input-field"
                    placeholder="Author name"
                  />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('active')} className="rounded border-gray-300" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('daily')} className="rounded border-gray-300" />
                    <span className="text-sm font-medium text-gray-700">Daily Quote</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input type="date" {...register('scheduledDate')} className="input-field" />
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
