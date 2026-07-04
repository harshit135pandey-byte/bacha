import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Lock, Key, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '../../services/api'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (data) => {
    try {
      await api.put('/auth/update-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password updated successfully')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password')
    }
  }

  return (
    <>
      <Helmet>
        <title>Change Password | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen bg-secondary-50">
        <div className="bg-primary-400 text-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-3 mb-3">
                <Lock size={32} />
                <h1 className="text-3xl md:text-4xl font-bold">Change Password</h1>
              </div>
              <p className="text-blue-100 text-lg">Update your account password.</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 max-w-xl mx-auto -mt-6 relative z-10 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-md p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    {...register('currentPassword')}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    {...register('newPassword')}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    {...register('confirmNewPassword')}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.confirmNewPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-primary-400 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  )
}
