import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon, Globe, Share2, Search, Upload, X } from 'lucide-react'
import api from '../../services/api'

const defaultSettings = {
  siteName: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
  metaDescription: '',
  keywords: '',
}

export default function AdminSettings() {
  const [form, setForm] = useState(defaultSettings)
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/settings')
      const data = res.data?.data ?? res.data ?? {}
      setForm({
        siteName: data.siteName ?? '',
        description: data.description ?? '',
        contactEmail: data.contactEmail ?? '',
        contactPhone: data.contactPhone ?? '',
        address: data.address ?? '',
        facebook: data.facebook ?? '',
        twitter: data.twitter ?? '',
        instagram: data.instagram ?? '',
        youtube: data.youtube ?? '',
        metaDescription: data.metaDescription ?? '',
        keywords: data.keywords ?? '',
      })
      if (data.logo) setLogoPreview(data.logo)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })
      if (logo) formData.append('logo', logo)

      await api.put('/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'input-field w-full'

  if (loading) {
    return (
      <>
        <Helmet><title>Settings | Admin | Mera Bacha Meri Shan</title></Helmet>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Settings | Admin | Mera Bacha Meri Shan</title>
      </Helmet>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} className="text-primary-400" />
              General
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                <input name="siteName" value={form.siteName} onChange={handleChange} className={inputClass} placeholder="Mera Bacha Meri Shan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input name="description" value={form.description} onChange={handleChange} className={inputClass} placeholder="Site description" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Globe size={20} className="text-primary-400" />
              Logo
            </h2>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  <button type="button" onClick={removeLogo} className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                  <Upload size={24} />
                </div>
              )}
              <div>
                <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
                  <Upload size={16} />
                  Choose Logo
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} className="text-primary-400" />
              Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} className={inputClass} placeholder="contact@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className={inputClass} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} className={inputClass} rows={2} placeholder="Full address" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Share2 size={20} className="text-primary-400" />
              Social Media
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <input name="facebook" value={form.facebook} onChange={handleChange} className={inputClass} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input name="twitter" value={form.twitter} onChange={handleChange} className={inputClass} placeholder="https://twitter.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input name="instagram" value={form.instagram} onChange={handleChange} className={inputClass} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                <input name="youtube" value={form.youtube} onChange={handleChange} className={inputClass} placeholder="https://youtube.com/..." />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Search size={20} className="text-primary-400" />
              SEO
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} className={inputClass} rows={2} placeholder="SEO meta description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input name="keywords" value={form.keywords} onChange={handleChange} className={inputClass} placeholder="keyword1, keyword2, keyword3" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}
