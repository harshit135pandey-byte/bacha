import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
})

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(forgotSchema) })

  const onSubmit = async ({ email }) => {
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password | Mera Bacha Meri Shan</title>
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
              <Mail size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
            <p className="text-gray-500 mt-1">
              {sent
                ? 'Check your email for the reset link'
                : 'Enter your email and we will send you a reset link'}
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-6 text-sm">
                If an account with that email exists, we have sent a password reset link. Please check your
                inbox and follow the instructions.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: '#4A90E2' }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-gray-800 placeholder-gray-400"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-400 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center text-gray-500 text-sm mt-6">
              <Link to="/login" className="font-semibold hover:underline inline-flex items-center gap-1" style={{ color: '#4A90E2' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </>
  )
}
