import { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Camera, User, Mail, Phone, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Profile() {
  const { user, fetchUser } = useAuth()
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(user?.photo ?? null)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  })

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('phone', data.phone)
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      await api.put('/users/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await fetchUser()
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  return (
    <>
      <Helmet>
        <title>Profile | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <User size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">My Profile</h1>
              </div>
              <p className="text-blue-100 text-lg">Manage your personal information.</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto -mt-6 relative z-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-md p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <User size={36} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-400 text-white rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors shadow-md"
                >
                  <Camera size={14} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-gray-800">{user?.name ?? 'User'}</h2>
                <p className="text-sm text-gray-500">{user?.email ?? ''}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-400 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  )
}
