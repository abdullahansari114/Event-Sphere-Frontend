import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { API_ORIGIN } from '../config/api'

const API_BASE = import.meta.env.VITE_API_URL || `${API_ORIGIN}/api/v1/auth`

const ROLES = [
  {
    value: 'exhibitor',
    code: 'EX',
    label: 'Exhibitor',
    hint: 'You run a booth — manage your listing, leads and staff.',
  },
  {
    value: 'attendee',
    code: 'AT',
    label: 'Attendee',
    hint: 'You visit shows — save your badge, browse exhibitors, RSVP.',
  },
]

const Signup = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee',
  })
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const selectRole = (role) => setForm((prev) => ({ ...prev, role }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.email.trim()) next.email = 'Email is required'

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
    if (!agree) next.agree = 'Please accept the Terms and Privacy Policy'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        // server didn't send valid JSON (e.g. crashed and returned an HTML error page)
      }

      if (!res.ok) {
        const backendMessage = data?.message || data?.error || data?.errors?.[0]?.message
        const fallback =
          res.status === 400
            ? 'This email is already registered.'
            : `Signup failed (server error ${res.status}). Please check the backend logs.`
        throw new Error(backendMessage || fallback)
      }

      // Registration succeeded — send the user to log in instead of auto-signing-in.
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="EventSphere" className="h-12 w-12 object-contain mb-3" />
          <h1 className="text-2xl font-bold text-blue-700">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join EventSphere and get your badge</p>
        </div>

        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ROLES.map((r) => {
            const active = form.role === r.value
            return (
              <button
                type="button"
                key={r.value}
                onClick={() => selectRole(r.value)}
                className={`text-left rounded-xl border p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98] ${
                  active
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <span
                  className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-[11px] font-semibold mb-2.5 ${
                    active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {r.code}
                </span>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{r.label}</p>
                <p className="text-xs leading-snug text-gray-500">{r.hint}</p>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`${inputBase} ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
          </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`${inputBase} ${errors.password ? 'border-red-400' : ''}`}
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
              placeholder="Re-enter your password"
              className={`${inputBase} ${errors.confirmPassword ? 'border-red-400' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => {
                  setAgree(e.target.checked)
                  if (errors.agree) setErrors((prev) => ({ ...prev, agree: undefined }))
                }}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
              />
              <span>
                I agree to the <a href="#" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150">Terms</a> and{' '}
                <a href="#" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150">Privacy Policy</a>
              </span>
            </label>
            {errors.agree && <p className="mt-1.5 text-xs text-red-600">{errors.agree}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold py-3 mt-1 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors duration-150">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup