import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, List, X, GripVertical } from 'lucide-react'
import api from '../../services/api'

const emptyCategory = {
  name: '',
  description: '',
  type: 'student',
  order: 0,
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories', { params: { sort: 'order' } })
      const data = res.data?.data ?? res.data
      setCategories(Array.isArray(data) ? data : data?.categories ?? [])
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditing(null)
    reset(emptyCategory)
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    reset({
      name: cat.name ?? '',
      description: cat.description ?? '',
      type: cat.type ?? 'video',
      order: cat.order ?? 0,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      if (editing) {
        await api.put(`/categories/${editing._id}`, data)
        toast.success('Category updated')
      } else {
        await api.post('/categories', data)
        toast.success('Category created')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      fetchCategories()
    } catch {
      toast.error('Failed to delete category')
    }
  }

  const updateOrder = async (id, newOrder) => {
    try {
      await api.patch(`/categories/${id}`, { order: newOrder })
      fetchCategories()
    } catch {
      toast.error('Failed to update order')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Categories | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Category
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md">
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <List size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No categories found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                    <th className="p-3 text-left w-10"></th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Order</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <GripVertical size={16} className="text-gray-300 cursor-grab" />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{cat.description}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                          {cat.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={cat.order ?? 0}
                          onChange={(e) => updateOrder(cat._id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center border border-gray-300 rounded-md text-sm py-1"
                          min={0}
                        />
                      </td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1 text-xs font-medium ${cat.active !== false ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.active !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                          {cat.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteCategory(cat._id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors">
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
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editing ? 'Edit Category' : 'Create Category'}
                </h2>
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
                    placeholder="Category name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    className="input-field min-h-[60px]"
                    placeholder="Short description"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select {...register('type', { required: true })} className="input-field">
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="community">Community</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    {...register('order')}
                    className="input-field"
                    min={0}
                  />
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
