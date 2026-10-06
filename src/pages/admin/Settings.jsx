import { useState, useEffect } from 'react'
import { ImagePlus, Save, Check } from 'lucide-react'
import { settingsService } from '../../services/settingsService'

const Settings = () => {
  const [currentImage, setCurrentImage] = useState(null) // whatever is currently set on the backend
  const [previewFile, setPreviewFile] = useState(null)   // the newly selected file (for preview)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await settingsService.get()
      setCurrentImage(data.heroImage || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewFile(file)
    setSuccess(false)

    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result) // for UI preview only
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!previewFile) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const data = await settingsService.updateHeroImage(previewFile)
      setCurrentImage(data.heroImage) // this is now what shows on the home page banner
      setPreviewFile(null)
      setPreviewUrl(null)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Show the preview if one is available, otherwise whatever is already saved on Cloudinary
  const displayedImage = previewUrl || currentImage

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Change the home page's hero banner (the large image at the top) from here.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3">
          <Check size={16} /> Hero banner updated — go check the home page.
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Hero Banner Image</label>

        {loading ? (
          <div className="w-full h-56 rounded-xl bg-gray-100 animate-pulse" />
        ) : (
          <label
            htmlFor="hero-upload"
            className="relative block w-full h-56 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-400 cursor-pointer bg-gray-50 transition-colors"
          >
            {displayedImage ? (
              <img src={displayedImage} alt="Hero banner preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImagePlus size={26} />
                <span className="text-xs font-medium">No image set — click here to upload one</span>
              </div>
            )}

            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
              Change Image
            </span>
          </label>
        )}
        <input
          id="hero-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <p className="text-xs text-gray-400 mt-3">
          Best size: a wide (landscape), high-resolution image — it automatically fits the screen,
          so any image size works and cropping/resizing happens on its own.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!previewFile || saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Banner'}
          </button>

          {previewFile && (
            <button
              type="button"
              onClick={() => { setPreviewFile(null); setPreviewUrl(null) }}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
