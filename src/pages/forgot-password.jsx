import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { API_ORIGIN } from '../config/api'

const API_BASE = import.meta.env.VITE_API_URL || `${API_ORIGIN}/api/v1/auth`

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [serverError, setServerError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        // server didn't send valid JSON (e.g. crashed and returned an HTML error page)
      }

      if (!res.ok) {
        throw new Error(
          data?.message || `Request failed (server error ${res.status}). Please check the backend logs.`
        )
      }

      setSent(true)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <img src={logo} alt="EventSphere" className="h-12 w-12 object-contain mb-3" />
          <h1 className="text-2xl font-bold text-blue-700">Forgot password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email to reset your password
          </p>
        </div>

        {serverError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}
        {sent && !serverError && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            If that email has an account, a reset link is on its way.
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
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={sent}
              className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60 ${
                error ? 'border-red-400' : ''
              }`}
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || sent}
            className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white text-sm font-semibold py-3 mt-1 shadow-md shadow-blue-500/20 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed"
          >
            {loading ? 'Sending…' : sent ? 'Link sent' : 'Submit'}
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

export default ForgotPassword