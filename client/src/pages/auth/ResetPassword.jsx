import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema) })

  const onSubmit = async ({ password }) => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password })
      toast.success('Password reset successfully! Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Reset Password | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 mt-1">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-400 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            <Link to="/login" className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: '#4A90E2' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
