import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Eye, Save, X, ImagePlus } from 'lucide-react'
import { API_ORIGIN } from '../../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/event`

const CATEGORIES = ['Technology', 'Business', 'Commerce', 'Health', 'Education', 'Other']

const EditEvent = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // bannerFile = the actual new File object (only set when the user picks a new image) — this is what goes to Cloudinary
  // bannerPreview = for display in the UI only (existing Cloudinary URL, or a local preview of the new file)
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    startTime: '',
    endTime: '',
    theme: '',
    category: 'Technology',
    maxAttendees: '',
    status: 'draft',
  })

  // Existing event load karo aur form pre-fill karo
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to load event')
        const data = await res.json()
        setForm({
          title: data.title || '',
          description: data.description || '',
          date: data.date ? data.date.slice(0, 10) : '',
          location: data.location || '',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          theme: data.theme || '',
          category: data.category || 'Technology',
          maxAttendees: data.maxAttendees ?? '',
          status: data.status || 'draft',
        })
        if (data.banner) setBannerPreview(data.banner)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBannerFile(file) // the actual File object — this is what goes to Cloudinary

    const reader = new FileReader()
    reader.onload = () => setBannerPreview(reader.result) // for UI preview only
    reader.readAsDataURL(file)
  }

  const submitUpdate = async (status) => {
    if (!form.title || !form.date) {
      setError('Event title and date are required.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('date', form.date)
      formData.append('location', form.location)
      formData.append('startTime', form.startTime)
      formData.append('endTime', form.endTime)
      formData.append('theme', form.theme)
      formData.append('category', form.category)
      formData.append('maxAttendees', Number(form.maxAttendees) || 0)
      formData.append('status', status)

      // Only send the banner when the user has selected a NEW image — this reaches the
      // multer/Cloudinary parser as a File, not as a base64 string.
      // If no new image was selected, don't send the field at all — the backend will
      // leave the existing Cloudinary URL as it is.
      if (bannerFile) {
        formData.append('banner', bannerFile) // the field name must match the backend's parser.single('banner')
      }

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        credentials: 'include', // sends the httpOnly "token" cookie automatically
        body: formData, // don't set the Content-Type header manually — the browser sets the boundary itself
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        // backend did not return JSON
      }

      if (!res.ok) {
        throw new Error(data?.message || `Failed to update event (server error ${res.status})`)
      }

      navigate('/admin/events')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-sm text-gray-400">Loading event...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-400">
          Dashboard <span className="mx-1">›</span> Events <span className="mx-1">›</span> Edit
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Edit Event</h1>
        <p className="text-sm text-gray-500 mt-1">Update this event's details</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme</label>
              <input
                name="theme"
                value={form.theme}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Attendees</label>
              <input
                type="number"
                name="maxAttendees"
                value={form.maxAttendees}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-gray-800">Banner Image</h3>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl h-40 cursor-pointer hover:border-blue-300 transition-colors overflow-hidden">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImagePlus size={22} className="text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
              </>
            )}
            <input type="file" accept="image/png, image/jpeg" onChange={handleBannerChange} className="hidden" />
          </label>

          <button
            disabled={submitting}
            onClick={() => submitUpdate('published')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <Eye size={16} /> {submitting ? 'Publishing...' : 'Publish Event'}
          </button>
          <button
            disabled={submitting}
            onClick={() => submitUpdate('draft')}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            disabled={submitting}
            onClick={() => navigate('/admin/events')}
            className="w-full flex items-center justify-center gap-2 text-gray-500 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditEvent