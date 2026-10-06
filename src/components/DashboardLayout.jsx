import { useState } from 'react'
import { Bell, ChevronDown, Menu } from 'lucide-react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const DashboardLayout = () => {
  const { user } = useAuth()
  const { unreadTotal } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Exhibitors have a real chat/messages system, so the bell takes
  // them straight to the Messages page. Admins don't have a matching
  // route yet, so for them it only shows the badge, with no click.
  const bellLinkTo = user?.role === 'exhibitor' ? '/exhibitor/messages' : null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-50 shrink-0"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src={logo} alt="EventSphere" className="h-7 w-7 object-contain shrink-0" />
              <span className="font-bold text-gray-900 text-sm truncate">
                Event<span className="text-blue-600">Sphere</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-auto">
            {bellLinkTo ? (
              <Link to={bellLinkTo} className="relative p-2 rounded-lg hover:bg-gray-50">
                <Bell size={20} className="text-gray-600" />
                {unreadTotal > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </Link>
            ) : (
              <button className="relative p-2 rounded-lg hover:bg-gray-50">
                <Bell size={20} className="text-gray-600" />
                {unreadTotal > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </button>
            )}
            <Link to={`/${user?.role}/profile`} className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-sky-400 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {(user?.name || '?').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:block text-sm font-medium text-gray-800">
                {(user?.name || '').split(' ')[0] || user?.email}
              </span>
              <ChevronDown size={16} className="hidden sm:block text-gray-400" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
