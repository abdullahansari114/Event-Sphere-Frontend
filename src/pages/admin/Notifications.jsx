import { Building2, CalendarDays, ClipboardList } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 1, icon: ClipboardList, text: 'Nova Tech submitted a booth application', time: '2 hours ago', color: 'text-blue-600 bg-blue-50' },
  { id: 2, icon: CalendarDays, text: '50 new registrations for Tech Expo 2026', time: '5 hours ago', color: 'text-green-600 bg-green-50' },
  { id: 3, icon: Building2, text: 'Skyline Motors completed their payment', time: '1 day ago', color: 'text-orange-600 bg-orange-50' },
]

const AdminNotifications = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      <p className="text-sm text-gray-500 mt-1">Recent platform activity</p>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {NOTIFICATIONS.map((n) => (
        <div key={n.id} className="flex items-start gap-3 p-4">
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}>
            <n.icon size={16} />
          </span>
          <div>
            <p className="text-sm text-gray-800">{n.text}</p>
            <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default AdminNotifications