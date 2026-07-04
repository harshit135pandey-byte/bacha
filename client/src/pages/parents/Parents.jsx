import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { BookOpen, Search, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../services/api';

const ITEMS_PER_PAGE = 9;

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

export default function Parents() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        section: 'parent',
        page,
        limit: ITEMS_PER_PAGE,
        sort: sort === 'newest' ? '-createdAt' : 'createdAt',
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;

      const { data } = await api.get('/articles', { params });
      const items = data?.data || data?.articles || data || [];
      setArticles(Array.isArray(items) ? items : []);
      if (data?.totalPages) setTotalPages(data.totalPages);
      if (data?.total) setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));

      if (page === 1 && !search && !selectedCategory) {
        const featuredArticle = Array.isArray(items) && items.length > 0
          ? items[0]
          : null;
        setFeatured(featuredArticle);
      }
    } catch (err) {
      toast.error('Failed to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, sort]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/categories', {
        params: { type: 'parent' },
      });
      const items = data?.data || data?.categories || data || [];
      setCategories(Array.isArray(items) ? items : []);
    } catch {
      // categories are non-critical
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleCategoryChange = (slug) => {
    setSelectedCategory((prev) => (prev === slug ? '' : slug));
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
  };

  const displayArticles = featured && page === 1 && !search && !selectedCategory
    ? articles.slice(1)
    : articles;

  return (
    <>
      <Helmet>
        <title>Parent Resources | Mera Bacha Meri Shan</title>
        <meta
          name="description"
          content="Articles and resources for parents on child development, education, and family well-being."
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
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-white/80" />
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Parent Resources
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Expert advice, tips, and guides to support your child&apos;s
                learning journey.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-4 sm:p-6"
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-400 outline-none transition"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button
                  type="button"
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="sm:hidden px-4 py-2.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </form>

            {/* Category filters */}
            <div className={`mt-4 ${filterOpen ? 'block' : 'hidden sm:block'}`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    !selectedCategory
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id || cat.slug || cat.name}
                    onClick={() => handleCategoryChange(cat.slug || cat.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedCategory === (cat.slug || cat.name)
                        ? 'bg-primary-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name || cat.title}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Article */}
        {featured && page === 1 && !search && !selectedCategory && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Link to={`/parents/${featured.slug}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group rounded-2xl overflow-hidden shadow-lg bg-white"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-56 sm:h-72 md:h-full min-h-[220px] overflow-hidden">
                    {featured.coverImage || featured.image ? (
                      <img
                        src={featured.coverImage || featured.image}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400/20 to-blue-200 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary-400/40" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featured.createdAt || featured.date)}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {featured.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {stripHtml(featured.excerpt || featured.content)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary-400 font-semibold group-hover:gap-3 transition-all">
                      Read More
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        {/* Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No articles found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayArticles.map((article) => (
                <motion.div key={article._id || article.slug} variants={cardVariants}>
                  <Link
                    to={`/parents/${article.slug}`}
                    className="block group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {article.coverImage || article.image ? (
                        <img
                          src={article.coverImage || article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400/10 to-blue-100 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-primary-400/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(article.createdAt || article.date)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {stripHtml(article.excerpt || article.content)}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-primary-400 font-medium mt-3 group-hover:gap-2 transition-all">
                        Read More
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    page === p
                      ? 'bg-primary-400 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
