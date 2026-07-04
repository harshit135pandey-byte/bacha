import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, Calendar, X, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../services/api'

const emptyEvent = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  type: 'online',
  published: false,
}

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
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

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/events', { params: { page, limit: 10 } })
      const data = res.data?.data ?? res.data
      setEvents(Array.isArray(data) ? data : data?.events ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const openCreate = () => {
    setEditing(null)
    reset(emptyEvent)
    setModalOpen(true)
  }

  const openEdit = (ev) => {
    setEditing(ev)
    reset({
      title: ev.title ?? '',
      description: ev.description ?? '',
      date: ev.date ? ev.date.slice(0, 10) : '',
      time: ev.time ?? '',
      location: ev.location ?? '',
      type: ev.type ?? 'online',
      published: ev.published ?? false,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('date', data.date)
      formData.append('time', data.time)
      formData.append('location', data.location)
      formData.append('type', data.type)
      formData.append('published', data.published)
      if (data.imageFile?.[0]) formData.append('image', data.imageFile[0])

      if (editing) {
        await api.put(`/events/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Event updated')
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Event created')
      }
      setModalOpen(false)
      fetchEvents()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    try {
      await api.delete(`/events/${id}`)
      toast.success('Event deleted')
      fetchEvents()
    } catch {
      toast.error('Failed to delete event')
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <Helmet>
        <title>Manage Events | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Event
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Published</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3 max-w-[200px]">
                        <p className="font-medium text-gray-800 truncate">{ev.title}</p>
                      </td>
                      <td className="p-3 text-gray-600 text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(ev.date)}
                        </span>
                        {ev.time && <span className="ml-2 text-gray-400">{ev.time}</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                          {ev.type}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 text-xs max-w-[150px] truncate">
                        {ev.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            {ev.location}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3">
                        {ev.published ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={14} /> Yes</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 text-xs"><XCircle size={14} /> No</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(ev)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteEvent(ev._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
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
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editing ? 'Edit Event' : 'Create Event'}
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
                    placeholder="Event title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    className="input-field min-h-[80px]"
                    placeholder="Event description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      {...register('date', { required: 'Date is required' })}
                      className="input-field"
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      {...register('time')}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    {...register('location')}
                    className="input-field"
                    placeholder="Event location or link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select {...register('type', { required: true })} className="input-field">
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input type="file" accept="image/*" {...register('imageFile')} className="input-field" />
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
