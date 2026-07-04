import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Trash2, Image as ImageIcon, X, Search, CheckCircle, Edit3 } from 'lucide-react'
import api from '../../services/api'

export default function AdminImages() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [uploadCategory, setUploadCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [editImage, setEditImage] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (categoryFilter) params.category = categoryFilter
      const res = await api.get('/images', { params })
      const data = res.data?.data ?? res.data
      setImages(Array.isArray(data) ? data : data?.images ?? [])
    } catch {
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

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
    fetchImages()
  }, [fetchImages])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === images.length) {
      setSelected([])
    } else {
      setSelected(images.map((img) => img._id))
    }
  }

  const uploadImages = async () => {
    if (uploadFiles.length === 0) return
    try {
      setUploading(true)
      const formData = new FormData()
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('images', uploadFiles[i])
      }
      if (uploadCategory) formData.append('category', uploadCategory)

      await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success(`${uploadFiles.length} image(s) uploaded`)
      setUploadOpen(false)
      setUploadFiles([])
      setUploadCategory('')
      fetchImages()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const deleteImages = async () => {
    if (selected.length === 0) return
    if (!window.confirm(`Delete ${selected.length} selected image(s)?`)) return
    try {
      await Promise.all(selected.map((id) => api.delete(`/images/${id}`)))
      toast.success(`${selected.length} image(s) deleted`)
      setSelected([])
      fetchImages()
    } catch {
      toast.error('Failed to delete some images')
    }
  }

  const openEdit = (img) => {
    setEditImage(img)
    setEditTitle(img.title || '')
    setEditCategory(img.category?._id || img.category || '')
  }

  const saveEdit = async () => {
    if (!editImage) return
    try {
      await api.put(`/images/${editImage._id}`, { title: editTitle, category: editCategory })
      toast.success('Image updated')
      setEditImage(null)
      fetchImages()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update image')
    }
  }

  return (
    <>
      <Helmet>
        <title>Manage Images | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Manage Images</h1>
          <button onClick={() => setUploadOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Upload Images
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                className="input-field pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {selected.length > 0 && (
              <button onClick={deleteImages} className="btn-outline text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={16} />
                Delete ({selected.length})
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No images found</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={selected.length === images.length && images.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-xs text-gray-500">Select All</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img) => (
                  <div
                    key={img._id}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                      selected.includes(img._id) ? 'border-primary-400' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelect(img._id)}
                  >
                    <img
                      src={img.url ?? img.imageUrl ?? img.path}
                      alt={img.title ?? 'Image'}
                      className="w-full h-full object-cover"
                    />
                    {selected.includes(img._id) && (
                      <div className="absolute top-2 left-2">
                        <CheckCircle size={22} className="text-primary-400 bg-white rounded-full" />
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(img); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                    >
                      <Edit3 size={14} className="text-gray-600" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{img.title ?? 'Image'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {uploadOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setUploadOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Upload Images</h2>
                <button onClick={() => setUploadOpen(false)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Images *</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                    className="input-field"
                  />
                  {uploadFiles.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{uploadFiles.length} file(s) selected</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="input-field">
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setUploadOpen(false)} className="btn-outline">Cancel</button>
                  <button
                    onClick={uploadImages}
                    disabled={uploading || uploadFiles.length === 0}
                    className="btn-primary"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Edit Image</h2>
                <button onClick={() => setEditImage(null)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {editImage?.url && (
                  <img src={editImage.url} alt="" className="w-full h-40 object-cover rounded-lg" />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="input-field"
                    placeholder="Image title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input-field">
                    <option value="">None</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setEditImage(null)} className="btn-outline">Cancel</button>
                  <button onClick={saveEdit} className="btn-primary">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
