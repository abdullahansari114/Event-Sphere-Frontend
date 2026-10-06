import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import logo from '../assets/logo.png'
import { API_ORIGIN } from '../config/api'

const API_BASE = import.meta.env.VITE_API_URL || `${API_ORIGIN}/api/v1/auth`

const ResetPassword = () => {
  const navigate = useNavigate()
  const { token: tokenFromPath } = useParams()
  const [searchParams] = useSearchParams()
  const token = tokenFromPath || searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.password) {
      next.password = 'Password is required'
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters'
    } else if (!/[a-z]/.test(form.password)) {
      next.password = 'Password must include a lowercase letter'
    } else if (!/[A-Z]/.test(form.password)) {
      next.password = 'Password must include an uppercase letter'
    } else if (/^\d+$/.test(form.password)) {
      next.password = 'Password cannot be numbers only'
    }
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password: form.password }),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        // server didn't send valid JSON (e.g. crashed and returned an HTML error page)
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Reset failed (server error ${res.status}). Please check the backend logs.`
        )
      }

      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <img src={logo} alt="EventSphere" className="h-12 w-12 object-contain mb-3" />
          <h1 className="text-2xl font-bold text-blue-700">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
        </div>

        {!token && !done && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            No reset token found in the link. Please open the reset link from your email again.
          </div>
        )}

        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}
        {done && !serverError && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Password reset successful. Redirecting to login…
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter new password"
              disabled={done}
              className={`${inputBase} ${errors.password ? 'border-red-400' : ''} disabled:opacity-60`}
            />
            {errors.password ? (
              <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                At least 6 characters, with an uppercase and a lowercase letter.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              disabled={done}
              className={`${inputBase} ${errors.confirmPassword ? 'border-red-400' : ''} disabled:opacity-60`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || done}
            className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold py-3 mt-1 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? 'Saving…' : done ? 'Done' : 'Submit'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150">
            Go back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword