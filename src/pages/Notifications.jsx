import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellOff } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import ChatModal from '../components/ChatModal'

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-orange-500', 'bg-emerald-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-cyan-600', 'bg-purple-500', 'bg-teal-500',
]

const colorForName = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const initialsFor = (name = '') => (name || '?').charAt(0).toUpperCase()

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Clicking the bell icon lands here — every conversation is a "notification".
// Clicking on one opens that specific chat below.
const Notifications = () => {
  const { conversations, markConversationRead } = useNotifications()
  const [chatTarget, setChatTarget] = useState(null)

  const openConversation = (conv) => {
    markConversationRead(conv.user._id)
    setChatTarget(conv.user)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>›</span>
          <span className="text-gray-700 font-medium">Notifications</span>
        </p>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <BellOff size={28} />
              <p className="text-sm">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((c) => {
                const name = c.user.companyName || c.user.name || c.user.email
                const unread = c.unreadCount > 0
                return (
                  <button
                    key={c.user._id}
                    onClick={() => openConversation(c)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 cursor-pointer ${
                      unread ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <span
                      className={`w-11 h-11 rounded-xl ${colorForName(name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {initialsFor(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unread ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>
                          {name}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0">{formatTime(c.lastMessageAt)}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${unread ? 'text-gray-700' : 'text-gray-400'}`}>
                        {c.lastSenderIsMe ? 'Aap: ' : ''}
                        {c.lastMessage}
                      </p>
                    </div>
                    {unread && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {chatTarget && (
        <ChatModal
          open={!!chatTarget}
          onClose={() => setChatTarget(null)}
          otherUserId={chatTarget._id}
          otherUserName={chatTarget.companyName || chatTarget.name || chatTarget.email}
          otherUserSubtitle={chatTarget.email}
          avatarColor={colorForName(chatTarget.companyName || chatTarget.name || '')}
          avatarInitials={initialsFor(chatTarget.companyName || chatTarget.name || chatTarget.email)}
        />
      )}
    </div>
  )
}

export default Notifications