import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Quote,
  BookOpen,
  Users,
  Globe,
  Play,
  Eye,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  Target,
  Heart,
  Star,
  MessageCircle,
  Award,
  Lightbulb,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const containerPadding = 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
const sectionSpacing = 'py-16 md:py-24'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

export default function Home() {
  const [quote, setQuote] = useState(null)
  const [featuredVideos, setFeaturedVideos] = useState([])
  const [latestVideos, setLatestVideos] = useState([])
  const [faqOpen, setFaqOpen] = useState(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quoteRes, featuredRes, latestRes] = await Promise.all([
          api.get('/quotes/daily').catch(() => null),
          api.get('/videos/featured').catch(() => null),
          api.get('/videos', { params: { limit: 6, sort: 'newest' } }).catch(() => null),
        ])
        if (quoteRes?.data?.data) setQuote(quoteRes.data.data)
        if (featuredRes?.data?.data) setFeaturedVideos(Array.isArray(featuredRes.data.data) ? featuredRes.data.data : [])
        if (latestRes?.data?.data) setLatestVideos(Array.isArray(latestRes.data.data) ? latestRes.data.data : [])
      } catch {
        // silent
      }
    }
    fetchData()
  }, [])

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    try {
      await api.post('/newsletter', { email })
      toast.success('Subscribed successfully!')
      setEmail('')
    } catch {
      toast.error('Subscription failed. Try again.')
    }
  }

  const faqs = [
    { q: 'What is Mera Bacha Meri Shan?', a: 'A platform dedicated to empowering young minds through quality educational content, interactive learning, and community support.' },
    { q: 'Is the platform free to use?', a: 'Yes, most of our content is free. We also offer premium features for advanced learning paths.' },
    { q: 'How can parents get involved?', a: 'Parents can track progress, access resources, and participate in community events through our dedicated parent portal.' },
    { q: 'What age groups do you cover?', a: 'We cater to children aged 4–16 with age-appropriate content across various subjects.' },
    { q: 'How do I join the community?', a: 'Simply sign up as a student, parent, or community member and start exploring.' },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'Parent', text: 'This platform has transformed my child\'s learning journey. Highly recommended!' },
    { name: 'Amit Verma', role: 'Teacher', text: 'An incredible resource for educators. The video library is top-notch.' },
    { name: 'Neha Gupta', role: 'Student', text: 'Learning has never been this fun! I love the interactive lessons.' },
  ]

  const VideoCard = ({ video }) => (
    <Link
      to={`/students/${video._id ?? video.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-video bg-gray-200 overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Play size={48} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={40} className="text-white" fill="white" />
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Clock size={12} />
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
        {video.views !== undefined && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Eye size={14} />
            {video.views.toLocaleString()} views
          </p>
        )}
      </div>
    </Link>
  )

  return (
    <>
      <Helmet>
        <title>Mera Bacha Meri Shan | Empowering Young Minds</title>
      </Helmet>

      {/* 1. Hero */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4A90E2 0%, #1a5fa8 100%)' }}
      >
        <div className={`${containerPadding} ${sectionSpacing} text-center relative z-10`}>
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Mera Bacha Meri Shan
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
              Empowering young minds with quality education, inspiring content, and a thriving community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/students" className="bg-white text-primary-400 font-semibold px-8 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2">
                <BookOpen size={20} /> Students
              </Link>
              <Link to="/parents" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-all inline-flex items-center gap-2">
                <Users size={20} /> Parents
              </Link>
              <Link to="/community" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/30 transition-all inline-flex items-center gap-2">
                <Globe size={20} /> Community
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* 2. Daily Quote */}
      <section className={`${containerPadding} ${sectionSpacing}`}>
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <div className="bg-secondary-50 rounded-2xl p-8 md:p-12 text-center relative">
            <Quote size={40} style={{ color: '#4A90E2' }} className="mx-auto mb-4 opacity-40" />
            {quote ? (
              <>
                <blockquote className="text-xl md:text-2xl text-gray-800 italic font-medium leading-relaxed">
                  "{quote.content}"
                </blockquote>
                <p className="mt-4 font-semibold" style={{ color: '#4A90E2' }}>
                  — {quote.author ?? 'Unknown'}
                </p>
              </>
            ) : (
              <>
                <blockquote className="text-xl md:text-2xl text-gray-800 italic font-medium leading-relaxed">
                  "Education is the most powerful weapon which you can use to change the world."
                </blockquote>
                <p className="mt-4 font-semibold" style={{ color: '#4A90E2' }}>
                  — Nelson Mandela
                </p>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* 3. Featured Videos */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Featured Videos</h2>
            <p className="text-gray-500 mb-10 text-lg">Handpicked content for young learners</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVideos.length > 0 ? (
              featuredVideos.map((video, i) => (
                <motion.div key={video._id ?? video.id ?? i} {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <VideoCard video={video} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <motion.div key={`fv-skel-${i}`} {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. Latest Videos */}
      <section className="bg-secondary-50">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Latest Uploads</h2>
            <p className="text-gray-500 mb-10 text-lg">Fresh content added regularly</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestVideos.length > 0 ? (
              latestVideos.map((video, i) => (
                <motion.div key={video._id ?? video.id ?? i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <VideoCard video={video} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={`lv-skel-${i}`} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 5. About */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Mission & Vision</h2>
            <p className="text-gray-600 text-lg">
              We believe every child deserves access to quality education that nurtures curiosity, creativity, and confidence.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div {...fadeUp} className="bg-secondary-50 rounded-2xl p-8 text-center">
              <Target size={48} style={{ color: '#4A90E2' }} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To provide accessible, engaging, and high-quality educational content that empowers children to reach their full potential.
              </p>
            </motion.div>
            <motion.div {...fadeUp} className="bg-secondary-50 rounded-2xl p-8 text-center">
              <Lightbulb size={48} style={{ color: '#4A90E2' }} className="mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                A world where every child, regardless of background, has the tools and support to become a lifelong learner and leader.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="bg-secondary-50">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">What People Say</h2>
            <p className="text-gray-500 text-lg">Hear from our community</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <Star size={20} style={{ color: '#4A90E2' }} className="mb-3" fill="#4A90E2" />
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Everything you need to know</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.08 }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between bg-secondary-50 hover:bg-secondary-50/80 rounded-xl px-6 py-4 text-left transition-colors"
                >
                  <span className="font-semibold text-gray-800 pr-4">{faq.q}</span>
                  {faqOpen === i ? (
                    <ChevronUp size={20} style={{ color: '#4A90E2' }} className="shrink-0" />
                  ) : (
                    <ChevronDown size={20} style={{ color: '#4A90E2' }} className="shrink-0" />
                  )}
                </button>
                {faqOpen === i && (
                  <div className="px-6 py-4 text-gray-600 leading-relaxed">{faq.a}</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact CTA */}
      <section className="bg-secondary-50">
        <div className={`${containerPadding} ${sectionSpacing} text-center`}>
          <motion.div {...fadeUp}>
            <MessageCircle size={48} style={{ color: '#4A90E2' }} className="mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Have Questions?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              We'd love to hear from you. Get in touch with our team for any queries, suggestions, or feedback.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-primary-400 text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-500 transition-colors shadow-lg"
            >
              <Mail size={20} /> Get in Touch
            </a>
          </motion.div>
        </div>
      </section>

      {/* 9. Newsletter */}
      <section id="contact" className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing} text-center`}>
          <motion.div {...fadeUp}>
            <Mail size={40} style={{ color: '#4A90E2' }} className="mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Stay Updated</h2>
            <p className="text-gray-500 text-lg mb-8">
              Subscribe to our newsletter for the latest content and updates.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-400 text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-primary-400 text-white font-semibold px-6 py-3 rounded-full hover:bg-primary-500 transition-colors whitespace-nowrap"
              >
                <Send size={18} /> Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  )
}
