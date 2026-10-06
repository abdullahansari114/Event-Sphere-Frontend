import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, User as UserIcon, LogOut, Bell } from 'lucide-react'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { API_ORIGIN } from '../config/api'


const NAV_LINKS = [
  { label: 'Home', to: '/dashboard' },
  { label: 'Events', to: '/events' },
  { label: 'Exhibitors', to: '/exhibitors' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

// Converts the backend's relative path ('/uploads/avatars/xxx.jpg') into a full URL
const avatarUrl = (avatar) => {
  if (!avatar) return null
  return avatar.startsWith('http') ? avatar : `${API_ORIGIN}${avatar}`
}

// Avatar — shows the photo if there is one, otherwise gradient initials. Size is controlled via the className.
const Avatar = ({ user, size = 'w-9 h-9', textSize = 'text-sm' }) => {
  const photo = avatarUrl(user.avatar)
  if (photo) {
    return (
      <img
        src={photo}
        alt={user.name}
        className={`${size} rounded-full object-cover shadow-sm shadow-sky-500/30 shrink-0`}
      />
    )
  }
  return (
    <span
      className={`${size} rounded-full bg-gradient-to-br from-sky-500 to-blue-700 text-white ${textSize} font-semibold flex items-center justify-center shadow-sm shadow-sky-500/30 shrink-0`}
    >
      {(user.name || user.email || '?').charAt(0).toUpperCase()}
    </span>
  )
}

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { user, logout } = useAuth()
  const { unreadTotal } = useNotifications()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  const isActive = (to) => location.pathname === to

  // Close the dropdown if a click happens outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close the dropdown/mobile menu as soon as the route changes
  useEffect(() => {
    setMenuOpen(false)
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-30 bg-[#050b18]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 font-sans">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <img
            src={logo}
            alt="EventSphere"
            className="h-12 w-12 object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />
          <span className="font-bold text-white text-2xl tracking-tight">
            Event <span className="text-sky-400">Sphere</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative text-base font-semibold py-2 transition-all duration-200 ${
                  active
                    ? 'text-sky-400'
                    : 'text-gray-300 hover:text-sky-400'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user && (
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-full hover:bg-white/5 text-gray-300 hover:text-sky-400 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadTotal > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-[#050b18]">
                  {unreadTotal > 9 ? '9+' : unreadTotal}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white/5 transition-colors duration-150 cursor-pointer"
              >
                <Avatar user={user} />
                <span className="text-base text-gray-200 font-medium">
                  {(user.name || '').split(' ')[0] || user.email}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0b1324] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-2 z-50">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <Avatar user={user} size="w-10 h-10" textSize="text-base" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{user.name}</p>
                      <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-200 hover:bg-white/5 hover:text-sky-400 transition-colors duration-150"
                  >
                    <UserIcon className="w-4 h-4" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-200 hover:bg-white/5 hover:text-red-400 transition-colors duration-150 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-base font-medium text-gray-300 hover:text-sky-400 transition-colors duration-150"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full px-5 py-2.5 shadow-md shadow-sky-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-gray-200 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-white/10 hover:text-sky-400"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-5 py-4 space-y-2 bg-[#050b18] shadow-inner">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.to)
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block text-base font-semibold px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                  active ? 'text-sky-400 bg-white/5' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <Avatar user={user} />
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-100 font-medium truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  </div>
                  <Link to="/notifications" onClick={() => setOpen(false)} className="relative shrink-0 p-1.5 -m-1.5">
                    <Bell className="w-5 h-5 text-gray-300" />
                    {unreadTotal > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none ring-2 ring-[#050b18]">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                      </span>
                    )}
                  </Link>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 text-base font-medium text-gray-200 border border-white/15 rounded-full px-4 py-2.5"
                >
                  <UserIcon className="w-4 h-4" /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 text-base font-medium text-gray-200 border border-white/15 rounded-full px-4 py-2.5"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-base font-medium text-gray-200 border border-white/15 rounded-full px-4 py-2.5"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-base font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full px-4 py-2.5"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar