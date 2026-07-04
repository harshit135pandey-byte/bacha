import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ClipboardList, Filter, Trash2, Search, X } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogs() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'admin' && user?.superAdmin

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 15 }
      if (actionFilter) params.action = actionFilter
      if (resourceFilter) params.resource = resourceFilter
      if (userFilter) params.user = userFilter
      const res = await api.get('/logs', { params })
      const data = res.data?.data ?? res.data
      setLogs(Array.isArray(data) ? data : data?.logs ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch {
      toast.error('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, resourceFilter, userFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const clearAllLogs = async () => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can clear logs')
      return
    }
    if (!window.confirm('Are you sure you want to clear ALL logs? This cannot be undone.')) return
    try {
      await api.delete('/logs')
      toast.success('All logs cleared')
      fetchLogs()
    } catch {
      toast.error('Failed to clear logs')
    }
  }

  const clearFilters = () => {
    setActionFilter('')
    setResourceFilter('')
    setUserFilter('')
    setPage(1)
  }

  const hasFilters = actionFilter || resourceFilter || userFilter

  return (
    <>
      <Helmet>
        <title>Audit Logs | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList size={24} className="text-primary-400" />
            Audit Logs
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Filter size={16} />
              Filters
              {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-400" />}
            </button>
            {isSuperAdmin && (
              <button onClick={clearAllLogs} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2 text-sm">
                <Trash2 size={16} />
                Clear All
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                <select
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
                  className="input-field"
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Resource</label>
                <input
                  type="text"
                  placeholder="e.g. videos, users..."
                  value={resourceFilter}
                  onChange={(e) => { setResourceFilter(e.target.value); setPage(1) }}
                  className="input-field"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
                <input
                  type="text"
                  placeholder="User name or email"
                  value={userFilter}
                  onChange={(e) => { setUserFilter(e.target.value); setPage(1) }}
                  className="input-field"
                />
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-outline text-sm flex items-center gap-1 px-3 py-2">
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Resource</th>
                    <th className="p-3 text-left">Timestamp</th>
                    <th className="p-3 text-left">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                            {log.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate max-w-[120px]">{log.user?.name ?? 'System'}</p>
                            {log.user?.email && <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{log.user.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.action === 'create' ? 'bg-green-100 text-green-700'
                          : log.action === 'update' ? 'bg-blue-100 text-blue-700'
                          : log.action === 'delete' ? 'bg-red-100 text-red-700'
                          : log.action === 'login' ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-gray-700">
                          {log.resource}
                          {log.resourceId && <span className="text-gray-400 ml-1">#{log.resourceId.slice(-6)}</span>}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="p-3 text-xs text-gray-500 font-mono">{log.ip ?? '-'}</td>
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
    </>
  )
}
