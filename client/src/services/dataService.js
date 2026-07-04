import api from './api';

export const videoService = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  getFeatured: () => api.get('/videos/featured'),
  getRelated: (id) => api.get(`/videos/${id}/related`),
  create: (data) => api.post('/videos', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/videos/${id}`, data),
  delete: (id) => api.delete(`/videos/${id}`),
  toggleFeatured: (id) => api.patch(`/videos/${id}/featured`),
  bulkDelete: (ids) => api.post('/videos/bulk-delete', { ids }),
};

export const categoryService = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (items) => api.put('/categories/reorder', { items }),
};

export const quoteService = {
  getAll: (params) => api.get('/quotes', { params }),
  getDaily: () => api.get('/quotes/daily'),
  getById: (id) => api.get(`/quotes/${id}`),
  create: (data) => api.post('/quotes', data),
  update: (id, data) => api.put(`/quotes/${id}`, data),
  delete: (id) => api.delete(`/quotes/${id}`),
};

export const articleService = {
  getAll: (params) => api.get('/articles', { params }),
  getById: (id) => api.get(`/articles/${id}`),
  getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`),
};

export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/events/${id}`),
};

export const imageService = {
  getAll: (params) => api.get('/images', { params }),
  getById: (id) => api.get(`/images/${id}`),
  create: (data) => api.post('/images', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/images/${id}`),
  bulkDelete: (ids) => api.post('/images/bulk-delete', { ids }),
};

export const contactService = {
  getAll: (params) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  create: (data) => api.post('/contact', data),
  markReplied: (id) => api.patch(`/contact/${id}/replied`),
  archive: (id) => api.patch(`/contact/${id}/archive`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  suspend: (id) => api.patch(`/users/${id}/suspend`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  updateProfile: (data) => api.put('/users/profile/update', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getStats: () => api.get('/users/stats'),
};

export const settingService = {
  getAll: () => api.get('/settings'),
  getByKey: (key) => api.get(`/settings/${key}`),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
  updateAll: (data) => api.put('/settings', data),
};

export const logService = {
  getAll: (params) => api.get('/logs', { params }),
  clear: () => api.delete('/logs/clear'),
};
