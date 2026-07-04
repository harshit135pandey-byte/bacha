import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Calendar, User, Share2, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import api from '../../services/api';

export default function ParentArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/articles/slug/${slug}`);
        const item = data?.data || data?.article || data;
        if (!item) throw new Error('Article not found');
        setArticle(item);

        if (item.category || item.tags) {
          try {
            const params = { section: 'parent', limit: 3 };
            if (item.category) params.category = typeof item.category === 'object' ? item.category.slug || item.category._id : item.category;
            if (item.tags?.length) params.tags = item.tags.join(',');
            const relRes = await api.get('/articles', { params });
            const relItems = relRes.data?.data || relRes.data?.articles || relRes.data || [];
            const filtered = (Array.isArray(relItems) ? relItems : []).filter(
              (r) => (r._id || r.slug) !== (item._id || item.slug)
            );
            setRelated(filtered.slice(0, 3));
          } catch {
            // related articles are non-critical
          }
        }
      } catch (err) {
        const msg = err?.response?.status === 404 ? 'Article not found' : 'Failed to load article';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || 'Parent Resource',
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
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {error || 'Article not found'}
          </h2>
          <p className="text-gray-500 mb-6">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/parents"
            className="inline-flex items-center gap-2 text-primary-400 font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Parent Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Mera Bacha Meri Shan</title>
        <meta name="description" content={stripHtml(article.excerpt || article.content).slice(0, 160)} />
        {article.coverImage && <meta property="og:image" content={article.coverImage} />}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Back navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Link
              to="/parents"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Parent Resources
            </Link>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cover Image */}
            {(article.coverImage || article.image) && (
              <div className="relative h-56 sm:h-72 md:h-96 rounded-2xl overflow-hidden mb-8">
                <img
                  src={article.coverImage || article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {typeof article.author === 'object' ? article.author.name : article.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(article.createdAt || article.date || article.publishedAt)}
              </span>
              {article.category && (
                <span className="bg-secondary-50 text-primary-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {typeof article.category === 'object' ? article.category.name || article.category.title : article.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Share */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Content */}
            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-primary-400 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content || article.body || '' }}
            />
          </motion.div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Related Articles
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel._id || rel.slug}
                    to={`/parents/${rel.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
                  >
                    <div className="relative h-40 overflow-hidden">
                      {rel.coverImage || rel.image ? (
                        <img
                          src={rel.coverImage || rel.image}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400/10 to-blue-100 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary-400/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {rel.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {stripHtml(rel.excerpt || rel.content)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
