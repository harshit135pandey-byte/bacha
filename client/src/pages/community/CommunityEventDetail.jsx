import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, Share2, ArrowLeft, ExternalLink } from 'lucide-react';
import api from '../../services/api';

export default function CommunityEventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/events/${id}`);
        const item = data?.data || data?.event || data;
        if (!item) throw new Error('Event not found');
        setEvent(item);
      } catch (err) {
        const msg = err?.response?.status === 404 ? 'Event not found' : 'Failed to load event';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title || 'Community Event',
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-72 bg-gray-200 rounded-xl" />
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {error || 'Event not found'}
          </h2>
          <p className="text-gray-500 mb-6">
            The event you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 text-primary-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.title} | Community Event - Mera Bacha Meri Shan</title>
        <meta
          name="description"
          content={stripHtml(event.description || event.excerpt || event.content || '').slice(0, 160)}
        />
        {(event.image || event.coverImage) && (
          <meta property="og:image" content={event.image || event.coverImage} />
        )}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Back navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              to="/community"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Event Image */}
            {(event.image || event.coverImage) && (
              <div className="relative h-56 sm:h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
                <img
                  src={event.image || event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {event.type && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {event.type}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {event.title}
            </h1>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(event.date || event.startDate)}
                  </p>
                </div>
              </div>

              {(event.time || event.startTime) && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">
                      {event.time || formatTime(event.startTime)}
                      {event.endTime && (
                        <> - {typeof event.endTime === 'string' ? event.endTime : formatTime(event.endTime)}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {(event.location || event.venue) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {event.location || event.venue}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this Event</h2>
                <div
                  className="prose prose-gray max-w-none prose-a:text-primary-400"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {event.content && !event.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this Event</h2>
                <div
                  className="prose prose-gray max-w-none prose-a:text-primary-400"
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              {event.registrationLink && (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-400 text-white rounded-lg text-sm font-semibold hover:bg-primary-500 transition shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Register Now
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
