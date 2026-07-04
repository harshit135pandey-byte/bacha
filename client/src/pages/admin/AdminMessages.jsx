import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Mail, MailOpen, Reply, Archive, Trash2, X, ChevronDown, Filter } from 'lucide-react'
import api from '../../services/api'

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Replied', value: 'replied' },
  { label: 'Archived', value: 'archived' },
]

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 10 }
      if (filter !== 'all') params.status = filter
      const res = await api.get('/contact', { params })
      const data = res.data?.data ?? res.data
      setMessages(Array.isArray(data) ? data : data?.messages ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const markRead = async (msg) => {
    if (msg.read) return
    try {
      await api.patch(`/contact/${msg._id}`, { read: true })
      fetchMessages()
    } catch {
      // silent
    }
  }

  const toggleReplied = async (msg) => {
    try {
      const newStatus = msg.status === 'replied' ? 'unread' : 'replied'
      await api.patch(`/contact/${msg._id}`, { status: newStatus })
      toast.success(newStatus === 'replied' ? 'Marked as replied' : 'Unmarked as replied')
      fetchMessages()
    } catch {
      toast.error('Failed to update')
    }
  }

  const toggleArchived = async (msg) => {
    try {
      const newStatus = msg.status === 'archived' ? 'unread' : 'archived'
      await api.patch(`/contact/${msg._id}`, { status: newStatus })
      toast.success(newStatus === 'archived' ? 'Archived' : 'Unarchived')
      fetchMessages()
    } catch {
      toast.error('Failed to update')
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await api.delete(`/contact/${id}`)
      toast.success('Message deleted')
      setSelected(null)
      fetchMessages()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return
    try {
      setSendingReply(true)
      await api.post(`/contact/${selected._id}/reply`, { message: replyText })
      toast.success('Reply sent')
      setReplyText('')
      toggleReplied(selected)
    } catch {
      toast.error('Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const unreadCount = messages.filter((m) => m.status === 'unread' || (!m.read && m.status !== 'replied' && m.status !== 'archived')).length

  return (
    <>
      <Helmet>
        <title>Messages | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Messages
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} unread</span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); setSelected(null) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary-400 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No messages found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => { setSelected(msg); markRead(msg) }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selected?._id === msg._id ? 'bg-primary-50' : ''
                    } ${!msg.read && msg.status !== 'replied' && msg.status !== 'archived' ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {msg.read || msg.status === 'replied' ? (
                          <MailOpen size={18} className="text-gray-400" />
                        ) : (
                          <Mail size={18} className="text-primary-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                            {msg.name ?? msg.email ?? 'Unknown'}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${!msg.read ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                          {msg.subject ?? 'No subject'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{msg.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40">Prev</button>
                <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-40">Next</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md">
            {selected ? (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 truncate">{selected.subject ?? 'No Subject'}</h2>
                  <button onClick={() => setSelected(null)}>
                    <X size={18} className="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">From:</span>
                    <span className="text-gray-600">{selected.name ?? 'Unknown'}</span>
                    <span className="text-gray-400">&lt;{selected.email}&gt;</span>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-600">{selected.phone}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN') : ''}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message ?? selected.content ?? '(No content)'}</p>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => toggleReplied(selected)} className={`btn-outline text-xs flex items-center gap-1 ${selected.status === 'replied' ? 'text-green-600 border-green-300' : ''}`}>
                    <Reply size={14} />
                    {selected.status === 'replied' ? 'Replied' : 'Mark Replied'}
                  </button>
                  <button onClick={() => toggleArchived(selected)} className={`btn-outline text-xs flex items-center gap-1 ${selected.status === 'archived' ? 'text-amber-600 border-amber-300' : ''}`}>
                    <Archive size={14} />
                    {selected.status === 'archived' ? 'Archived' : 'Archive'}
                  </button>
                  <button onClick={() => deleteMessage(selected._id)} className="btn-outline text-xs text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-1">
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="input-field min-h-[80px]"
                    placeholder="Type your reply..."
                    rows={3}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="btn-primary mt-2 flex items-center gap-2"
                  >
                    <Reply size={16} />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <Mail size={48} className="text-gray-300 mb-3" />
                <p className="text-gray-500">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
