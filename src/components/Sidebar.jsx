import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, X } from 'lucide-react'
import logo from '../assets/logo.png'
import { adminNav, exhibitorNav } from '../config/navLinks'
import { useAuth } from '../context/AuthContext'

const NAV_BY_ROLE = {
  admin: adminNav,
  exhibitor: exhibitorNav,
}

const BOTTOM_LINKS = (role) => {
  const links = [{ to: `/${role}/profile`, label: 'Profile', icon: User }]
  // Exhibitors don't have a site-wide "Settings" page — password/photo changes
  // happen right on the Profile page, so this link is only shown to admins.
  if (role === 'admin') {
    links.push({ to: `/${role}/settings`, label: 'Settings', icon: Settings })
  }
  return links
}

const Sidebar = ({ open = false, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const role = user?.role // 'admin' | 'exhibitor'
  const mainLinks = NAV_BY_ROLE[role] || []
  const bottomLinks = role ? BOTTOM_LINKS(role) : []

  const isActive = (to) => location.pathname === to

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavItem = ({ to, label, icon: Icon }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        onClick={() => onClose?.()}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          active
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-300 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icon size={18} strokeWidth={2} />
        {label}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 shrink-0 bg-gray-950 flex flex-col transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:sticky lg:top-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 h-20 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EventSphere" className="h-9 w-9 object-contain" />
            <span className="font-bold text-white text-lg tracking-tight">
              Event<span className="text-blue-500">Sphere</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {role}
          </p>
          <nav className="space-y-1">
            {mainLinks.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          {bottomLinks.length > 0 && (
            <>
              <div className="my-4 border-t border-white/5" />
              <nav className="space-y-1">
                {bottomLinks.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </nav>
            </>
          )}
        </div>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-700 to-sky-400 text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors duration-150"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
