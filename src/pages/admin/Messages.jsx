import { Search, Send } from 'lucide-react'

const THREADS = [
  { id: 1, name: 'Nova Tech', last: 'Wanted to confirm the booth...', unread: true },
  { id: 2, name: 'Sara Khan', last: 'Session slot has been confirmed', unread: false },
  { id: 3, name: 'Skyline Motors', last: 'Please send the payment receipt', unread: true },
]

const AdminMessages = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
      <p className="text-sm text-gray-500 mt-1">Conversations with exhibitors & attendees</p>
    </div>

    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[500px] overflow-hidden">
      <div className="w-72 border-r border-gray-100 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {THREADS.map((t) => (
            <button key={t.id} className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">{t.name}</span>
                {t.unread && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">{t.last}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-sm">
        Select a conversation
      </div>
    </div>
  </div>
)

export default AdminMessages