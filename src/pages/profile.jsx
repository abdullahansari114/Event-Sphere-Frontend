import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  Building2,
  Globe,
  MapPin,
  Tag,
  Package,
  CheckCircle2,
  Save,
  CalendarDays,
  Lock,
  Eye,
  EyeOff,
  Camera,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_ORIGIN } from '../config/api'

const PROFILE_API = `${API_ORIGIN}/api/v1/auth/profile`
const CHANGE_PASSWORD_API = `${API_ORIGIN}/api/v1/auth/change-password`
const AVATAR_API = `${API_ORIGIN}/api/v1/auth/avatar`

const ROLE_STYLES = {
  admin: 'bg-purple-50 text-purple-700',
  exhibitor: 'bg-blue-50 text-blue-700',
  attendee: 'bg-emerald-50 text-emerald-700',
}

const formatDate = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d)) return null
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

// Converts the backend's relative path ('/uploads/avatars/xxx.jpg') into a full URL
const avatarUrl = (avatar) => {
  if (!avatar) return null
  return avatar.startsWith('http') ? avatar : `${API_ORIGIN}${avatar}`
}

const FIELD_CLASS =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-colors'

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {label}
    </label>
    {children}
  </div>
)

// Password input with an eye-toggle — reused across both forms
const PasswordField = ({ label, name, value, onChange, autoComplete }) => {
  const [visible, setVisible] = useState(false)
  return (
    <Field label={label} icon={Lock}>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className={`${FIELD_CLASS} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Field>
  )
}

const Profile = () => {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    companyName: '',
    category: '',
    description: '',
    website: '',
    address: '',
    boothNumber: '',
    products: '',
  })
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [errorMsg, setErrorMsg] = useState('')

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwStatus, setPwStatus] = useState('idle') // idle | saving | saved | error
  const [pwErrorMsg, setPwErrorMsg] = useState('')

  const [avatarStatus, setAvatarStatus] = useState('idle') // idle | uploading | error
  const [avatarError, setAvatarError] = useState('')

  const isExhibitor = user?.role === 'exhibitor'

  // Logged out ho to profile page se login page bhej do
  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  // User data load hote hi form pre-fill kar do
  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name || '',
      companyName: user.companyName || '',
      category: user.category || '',
      description: user.description || '',
      website: user.website || '',
      address: user.address || '',
      boothNumber: user.boothNumber || '',
      products: Array.isArray(user.products) ? user.products.join(', ') : '',
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')

    const payload = {
      name: form.name,
      ...(isExhibitor && {
        companyName: form.companyName,
        category: form.category,
        description: form.description,
        website: form.website,
        address: form.address,
        boothNumber: form.boothNumber,
        products: form.products
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      }),
    }

    try {
      const res = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update profile')

      login(data.user)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm((f) => ({ ...f, [name]: value }))
  }

  const handlePwSubmit = async (e) => {
    e.preventDefault()
    setPwErrorMsg('')

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus('error')
      setPwErrorMsg('New password and confirm password do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwStatus('error')
      setPwErrorMsg('New password must be at least 6 characters')
      return
    }

    setPwStatus('saving')
    try {
      const res = await fetch(CHANGE_PASSWORD_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to change password')

      setPwStatus('saved')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwStatus('idle'), 2500)
    } catch (err) {
      setPwStatus('error')
      setPwErrorMsg(err.message)
    }
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setAvatarStatus('error')
      setAvatarError('Image must be under 2MB')
      e.target.value = ''
      return
    }

    setAvatarStatus('uploading')
    setAvatarError('')

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await fetch(AVATAR_API, {
        method: 'POST',
        credentials: 'include',
        body: formData, // don't set Content-Type — the browser sets the boundary itself
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to upload photo')

      login(data.user)
      setAvatarStatus('idle')
    } catch (err) {
      setAvatarStatus('error')
      setAvatarError(err.message)
    } finally {
      e.target.value = '' // same file dobara select ho sake, isliye reset
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarStatus('uploading')
    setAvatarError('')
    try {
      const res = await fetch(AVATAR_API, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to remove photo')

      login(data.user)
      setAvatarStatus('idle')
    } catch (err) {
      setAvatarStatus('error')
      setAvatarError(err.message)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading profile...</p>
      </div>
    )
  }

  const memberSince = formatDate(user.createdAt)
  const photo = avatarUrl(user.avatar)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 h-fit">
            <div className="relative w-20 h-20 mx-auto">
              {photo ? (
                <img
                  src={photo}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover shadow-md shadow-blue-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white text-2xl font-bold flex items-center justify-center shadow-md shadow-blue-200">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </div>
              )}

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={avatarStatus === 'uploading'}
                aria-label="Change photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white flex items-center justify-center shadow-md border-2 border-white transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {avatarStatus === 'uploading' && (
              <p className="text-xs text-blue-500 text-center mt-2">Uploading...</p>
            )}
            {avatarStatus === 'error' && (
              <p className="text-xs text-red-500 text-center mt-2">{avatarError}</p>
            )}
            {photo && avatarStatus !== 'uploading' && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="block mx-auto text-xs text-gray-400 hover:text-red-500 mt-2 underline"
              >
                Remove photo
              </button>
            )}

            <h2 className="mt-4 text-lg font-bold text-gray-900 text-center truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 text-center truncate">{user.email}</p>

            <div className="flex justify-center mt-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${ROLE_STYLES[user.role] || ROLE_STYLES.attendee}`}>
                {user.role}
              </span>
            </div>

            {memberSince && (
              <div className="flex items-center justify-center gap-1.5 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-400">
                <CalendarDays className="w-3.5 h-3.5" /> Member since {memberSince}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit profile form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Full name" icon={UserIcon}>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={FIELD_CLASS}
                    />
                  </Field>
                  <Field label="Email address" icon={Mail}>
                    <input
                      value={user.email}
                      disabled
                      className={`${FIELD_CLASS} bg-gray-50 text-gray-400 cursor-not-allowed`}
                    />
                  </Field>
                </div>
              </div>

              {isExhibitor && (
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-1 mt-6">Company Information</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    This information appears on your public exhibitor profile.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Company name" icon={Building2}>
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        className={FIELD_CLASS}
                      />
                    </Field>
                    <Field label="Category" icon={Tag}>
                      <input
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g. Technology"
                        className={FIELD_CLASS}
                      />
                    </Field>
                    <Field label="Website" icon={Globe}>
                      <input
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://"
                        className={FIELD_CLASS}
                      />
                    </Field>
                    <Field label="Booth number" icon={MapPin}>
                      <input
                        name="boothNumber"
                        value={form.boothNumber}
                        onChange={handleChange}
                        className={FIELD_CLASS}
                      />
                    </Field>
                    <Field label="Address" icon={MapPin}>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className={FIELD_CLASS}
                      />
                    </Field>
                    <Field label="Products / services" icon={Package}>
                      <input
                        name="products"
                        value={form.products}
                        onChange={handleChange}
                        placeholder="Comma separated, e.g. Cloud hosting, APIs"
                        className={FIELD_CLASS}
                      />
                    </Field>
                  </div>
                  <div className="mt-5">
                    <Field label="Description">
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell attendees about your company..."
                        className={`${FIELD_CLASS} resize-none`}
                      />
                    </Field>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={status === 'saving'}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {status === 'saving' ? 'Saving...' : 'Save changes'}
                  {status !== 'saving' && <Save className="w-4 h-4" />}
                </button>

                {status === 'saved' && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-sm font-medium text-red-500">{errorMsg}</span>
                )}
              </div>
            </form>

            {/* Change password form */}
            <form onSubmit={handlePwSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your current password to set a new one.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <PasswordField
                    label="Current password"
                    name="currentPassword"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    autoComplete="current-password"
                  />
                </div>
                <PasswordField
                  label="New password"
                  name="newPassword"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm new password"
                  name="confirmPassword"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  autoComplete="new-password"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={pwStatus === 'saving'}
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  {pwStatus === 'saving' ? 'Updating...' : 'Update password'}
                  {pwStatus !== 'saving' && <Lock className="w-4 h-4" />}
                </button>

                {pwStatus === 'saved' && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Password updated
                  </span>
                )}
                {pwStatus === 'error' && (
                  <span className="text-sm font-medium text-red-500">{pwErrorMsg}</span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
