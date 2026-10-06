import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { API_ORIGIN } from '../config/api'

const API_BASE = `${API_ORIGIN}/api/v1/auth`

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const justRegistered = Boolean(location.state?.registered)

  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        // server didn't send valid JSON
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Login failed (server error ${res.status}). Please check the backend logs.`
        )
      }
      if (!data) {
        throw new Error('No response received from the server. Please check the backend.')
      }

      // NEW: localStorage ki jagah AuthContext update karo
      login(data.user)

      const destinations = {
        admin: '/admin/dashboard',
        exhibitor: '/exhibitor/dashboard',
        attendee: '/dashboard',
      }
      navigate(destinations[data.user.role] || '/dashboard')
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
          <h1 className="text-2xl font-bold text-blue-700">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to manage your badge and booth</p>
        </div>

        {justRegistered && !serverError && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created successfully. Please log in.
          </div>
        )}

        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`${inputBase} ${errors.email ? 'border-red-400' : ''}`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`${inputBase} ${errors.password ? 'border-red-400' : ''}`}
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold py-3 mt-2 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150">
            Create one
          </Link>
          
        </p>
       <div className="flex justify-center mt-3">
  <Link
    to={`${API_ORIGIN}/auth/google`}
    className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150"
  >
    Sign in with Google
  </Link>
</div>
      </div>
    </div>
    
  )
}

export default Login
