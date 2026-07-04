import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Users, Shield, ToggleLeft, Trash2, Edit, X, Search, Plus, UserPlus } from 'lucide-react'
import api from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      const res = await api.get('/users', { params })
      const data = res.data?.data ?? res.data
      setUsers(Array.isArray(data) ? data : data?.users ?? [])
      setTotalPages(data?.totalPages ?? res.data?.totalPages ?? 1)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openCreate = () => {
    setIsCreating(true)
    setEditing(null)
    reset({ name: '', email: '', password: '', role: 'user', active: true })
    setModalOpen(true)
  }

  const openEdit = (u) => {
    setIsCreating(false)
    setEditing(u)
    reset({
      name: u.name ?? '',
      email: u.email ?? '',
      role: u.role ?? 'user',
      active: u.isActive ?? true,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      if (isCreating) {
        await api.post('/users', { name: data.name, email: data.email, password: data.password, role: data.role })
        toast.success('User created')
      } else {
        await api.put(`/users/${editing._id}`, { name: data.name, email: data.email, role: data.role, isActive: data.active })
        toast.success('User updated')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (u) => {
    try {
      await api.patch(`/users/${u._id}`, { active: !u.active })
      toast.success(u.active ? 'User suspended' : 'User activated')
      fetchUsers()
    } catch {
      toast.error('Failed to toggle user status')
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Users | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <UserPlus size={18} />
            Create User
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="input-field pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="input-field sm:w-40"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Last Login</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[150px]">{u.name ?? 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 text-xs">{u.email}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'teacher'
                            ? 'bg-blue-100 text-blue-700'
                            : u.role === 'parent'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          <Shield size={12} />
                          {u.role ?? 'student'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${u.active !== false ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                          {u.active !== false ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => toggleActive(u)}
                            className={`p-1.5 rounded-md transition-colors ${u.active !== false ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-green-50 text-green-500'}`}
                            title={u.active !== false ? 'Suspend' : 'Activate'}
                          >
                            <ToggleLeft size={16} />
                          </button>
                          <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
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
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{isCreating ? 'Create User' : 'Edit User'}</h2>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="input-field"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="input-field"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                {isCreating && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      {...register('password', { required: isCreating ? 'Password is required' : false, minLength: { value: 8, message: 'Minimum 8 characters' } })}
                      className="input-field"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select {...register('role')} className="input-field">
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                {!isCreating && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="active" {...register('active')} className="rounded border-gray-300" />
                    <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : isCreating ? 'Create' : 'Update'}
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
