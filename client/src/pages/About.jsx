import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Target,
  Lightbulb,
  Heart,
  Shield,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  Star,
  Globe,
} from 'lucide-react'

const containerPadding = 'px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'
const sectionSpacing = 'py-16 md:py-24'

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6 },
}

export default function About() {
  const stats = [
    { icon: BookOpen, value: '10,000+', label: 'Educational Videos' },
    { icon: Users, value: '50,000+', label: 'Active Learners' },
    { icon: Award, value: '500+', label: 'Expert Educators' },
    { icon: Globe, value: '100+', label: 'Countries Reached' },
  ]

  const team = [
    { name: 'Dr. Ananya Sharma', role: 'Founder & CEO', bio: 'Education visionary with 20+ years of experience in EdTech.' },
    { name: 'Rahul Mehta', role: 'Head of Content', bio: 'Passionate about creating engaging learning materials for children.' },
    { name: 'Priya Kapoor', role: 'Community Lead', bio: 'Building bridges between parents, teachers, and students worldwide.' },
    { name: 'Vikram Singh', role: 'Technical Director', bio: 'Building scalable platforms to reach every corner of the globe.' },
  ]

  const values = [
    { icon: Heart, title: 'Inclusivity', desc: 'We believe every child deserves equal access to quality education.' },
    { icon: Shield, title: 'Safety', desc: 'A secure environment for children to learn and explore.' },
    { icon: Star, title: 'Excellence', desc: 'Committed to the highest standards of educational content.' },
    { icon: Users, title: 'Community', desc: 'Building a supportive ecosystem around every learner.' },
  ]

  return (
    <>
      <Helmet>
        <title>About Us | Mera Bacha Meri Shan</title>
      </Helmet>

      {/* Hero */}
      <section
        className="relative text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4A90E2 0%, #1a5fa8 100%)' }}
      >
        <div className={`${containerPadding} ${sectionSpacing} text-center relative z-10`}>
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">About Us</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
              Discover the story behind Mera Bacha Meri Shan and our mission to transform education for every child.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Mission & Vision */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div {...fadeUp} className="bg-secondary-50 rounded-2xl p-8 md:p-10">
              <Target size={48} style={{ color: '#4A90E2' }} className="mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To democratize education by providing every child with access to high-quality, engaging,
                and culturally relevant learning content. We strive to nurture curiosity, build confidence,
                and foster a lifelong love for learning through innovative digital tools and a supportive community.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-secondary-50 rounded-2xl p-8 md:p-10">
              <Lightbulb size={48} style={{ color: '#4A90E2' }} className="mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                A world where every child — regardless of geography, background, or economic status —
                has the opportunity to discover their potential, pursue their passions, and become a leader
                in their community. We envision a global classroom without boundaries.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-secondary-50">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md">
              <p className="text-gray-600 leading-relaxed mb-4">
                Mera Bacha Meri Shan was born from a simple yet powerful idea: every child deserves the
                opportunity to learn, grow, and shine. Founded by educators and technologists who shared a
                common vision, the platform started as a small collection of educational videos and has since
                grown into a thriving ecosystem of content, community, and tools.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                What began as a passion project in 2020 has now touched the lives of thousands of learners
                across the globe. Our team has expanded to include expert educators, content creators,
                technologists, and community managers — all united by the belief that education can change
                the world.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we continue to innovate and expand, adding new features, content, and resources to
                ensure that every child who visits our platform finds the inspiration and support they need
                to succeed. This is just the beginning.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Our Values</h2>
            <p className="text-gray-500 text-lg">The principles that guide everything we do</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <v.icon size={36} style={{ color: '#4A90E2' }} className="mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'linear-gradient(135deg, #4A90E2 0%, #1a5fa8 100%)' }} className="text-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <s.icon size={40} className="mx-auto mb-3 text-blue-200" />
                <p className="text-3xl md:text-4xl font-extrabold mb-1">{s.value}</p>
                <p className="text-blue-200 text-sm md:text-base">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white">
        <div className={`${containerPadding} ${sectionSpacing}`}>
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Meet Our Team</h2>
            <p className="text-gray-500 text-lg">The passionate people behind the platform</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 rounded-full bg-primary-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-bold text-gray-800">{member.name}</h3>
                <p className="text-sm font-medium" style={{ color: '#4A90E2' }}>{member.role}</p>
                <p className="text-sm text-gray-500 mt-2">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary-50">
        <div className={`${containerPadding} ${sectionSpacing} text-center`}>
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Join Our Mission</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Be part of a movement that's reshaping education. Whether you're a student, parent, or educator, there's a place for you here.
            </p>
            <Link
              to="/students"
              className="inline-flex items-center gap-2 bg-primary-400 text-white font-semibold px-8 py-3 rounded-full hover:bg-primary-500 transition-colors shadow-lg"
            >
              Get Started <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
