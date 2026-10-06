import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { socket } from '../utils/socket'
import { API_ORIGIN } from '../config/api'

const AUTH_ME_API = `${API_ORIGIN}/api/v1/auth/me`
const LOGOUT_API = `${API_ORIGIN}/api/v1/auth/logout`

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function that always fetches the fresh status from the backend (via the cookie) —
  // this is the "source of truth" for the whole app, not localStorage.
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(AUTH_ME_API, { credentials: 'include' })
      if (!res.ok) {
        setUser(null)
        return null
      }
      const data = await res.json()
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      return null
    }
  }, [])

  // Check once as soon as the app loads — if the user is already logged in
  // (valid cookie), connect the chat socket right away too
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const loggedInUser = await refreshUser()
      if (loggedInUser) socket.connect()
      setLoading(false)
    }
    init()

    // Disconnect the socket too when the app closes / unmounts
    return () => {
      socket.disconnect()
    }
  }, [refreshUser])

  // The login page calls this after a successful login
  const login = (userData) => {
    setUser(userData)
    socket.connect() // now authenticated for live chat too
  }

  // Logout — clears the backend cookie, then clears both local state and the socket
  const logout = async () => {
    try {
      await fetch(LOGOUT_API, { method: 'POST', credentials: 'include' })
    } catch {
      // clear local state even if the network request fails
    }
    socket.disconnect()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
