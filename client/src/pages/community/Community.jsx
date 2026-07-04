import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Calendar, Image, Megaphone, MapPin, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const TABS = [
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'gallery', label: 'Gallery', icon: Image },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Community() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [images, setImages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState({
    events: false,
    gallery: false,
    announcements: false,
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, events: true }));
      const { data } = await api.get('/events', {
        params: { limit: 12, sort: 'date' },
      });
      const items = data?.data || data?.events || data || [];
      setEvents(Array.isArray(items) ? items : []);
    } catch {
      toast.error('Failed to load events');
      setEvents([]);
    } finally {
      setLoading((prev) => ({ ...prev, events: false }));
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, gallery: true }));
      const { data } = await api.get('/images', {
        params: { section: 'community', limit: 24 },
      });
      const items = data?.data || data?.images || data || [];
      setImages(Array.isArray(items) ? items : []);
    } catch {
      // images are non-critical
      setImages([]);
    } finally {
      setLoading((prev) => ({ ...prev, gallery: false }));
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, announcements: true }));
      const { data } = await api.get('/articles', {
        params: { section: 'community', limit: 12, sort: '-createdAt' },
      });
      const items = data?.data || data?.articles || data || [];
      setAnnouncements(Array.isArray(items) ? items : []);
    } catch {
      // announcements are non-critical
      setAnnouncements([]);
    } finally {
      setLoading((prev) => ({ ...prev, announcements: false }));
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchImages();
    fetchAnnouncements();
  }, [fetchEvents, fetchImages, fetchAnnouncements]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const getDateParts = (dateStr) => {
    if (!dateStr) return { month: '', day: '' };
    const d = new Date(dateStr);
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      day: d.getDate(),
    };
  };

  return (
    <>
      <Helmet>
        <title>Community | Mera Bacha Meri Shan</title>
        <meta
          name="description"
          content="Join our community events, view galleries, and stay updated with announcements."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-400 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-white/80" />
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Community
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Connect, learn, and grow together. Explore events, memories, and
                updates from our community.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex border-b border-gray-100">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors relative ${
                      activeTab === tab.key
                        ? 'text-primary-400'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.key && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {/* Events Tab */}
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading.events ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse space-y-3">
                          <div className="flex gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gray-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                      ))}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No upcoming events at this time.</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {events.map((event) => {
                        const { month, day } = getDateParts(event.date || event.startDate);
                        return (
                          <motion.div key={event._id || event.id} variants={cardVariants}>
                            <Link
                              to={`/community/events/${event._id || event.id}`}
                              className="block group bg-gray-50 hover:bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all"
                            >
                              <div className="flex gap-4">
                                {/* Date Badge */}
                                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary-400 text-white flex flex-col items-center justify-center">
                                  <span className="text-[10px] font-semibold uppercase leading-none">
                                    {month}
                                  </span>
                                  <span className="text-xl font-bold leading-none mt-0.5">
                                    {day}
                                  </span>
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
                                    {event.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span>{formatDate(event.date || event.startDate)}</span>
                                    {event.time && <span> at {event.time}</span>}
                                  </p>
                                  {(event.location || event.venue) && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3 flex-shrink-0" />
                                      <span>{event.location || event.venue}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {event.type && (
                                <div className="mt-3">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-400 bg-secondary-50 px-2 py-0.5 rounded-full">
                                    {event.type}
                                  </span>
                                </div>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <motion.div
                  key="gallery"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading.gallery ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : images.length === 0 ? (
                    <div className="text-center py-12">
                      <Image className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No gallery images available yet.</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                    >
                      {images.map((img) => (
                        <motion.div
                          key={img._id || img.id || img.url}
                          variants={cardVariants}
                          className="aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
                        >
                          <img
                            src={img.url || img.image || img.src}
                            alt={img.alt || img.title || 'Community gallery image'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <motion.div
                  key="announcements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {loading.announcements ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                          <div className="h-3 bg-gray-200 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-12">
                      <Megaphone className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No announcements at this time.</p>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {announcements.map((item) => (
                        <motion.div
                          key={item._id || item.slug}
                          variants={cardVariants}
                          className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.title}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">
                                {formatDate(item.createdAt || item.date || item.publishedAt)}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {stripHtml(item.excerpt || item.content)}
                              </p>
                            </div>
                            {item.slug && (
                              <Link
                                to={`/parents/${item.slug}`}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-400 hover:bg-secondary-50 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
