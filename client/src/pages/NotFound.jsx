import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SearchX, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Mera Bacha Meri Shan</title>
      </Helmet>

      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <SearchX size={80} style={{ color: '#4A90E2' }} className="mx-auto mb-6" />
          <h1 className="text-6xl font-extrabold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary-400 text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-500 transition-colors shadow-lg"
          >
            <Home size={20} /> Go Home
          </Link>
        </motion.div>
      </div>
    </>
  )
}
