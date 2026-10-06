import { useEffect, useRef, useState } from 'react'
import { Search, Send, Loader2, MessageCircle, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useNotifications } from '../../context/NotificationContext'
import { socket } from '../../utils/socket'
import { messageService } from '../../services/messageService'

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-600',
  'bg-purple-500',
  'bg-teal-500',
]

const colorFor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

const initialsFor = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?'

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const formatThreadTime = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  return sameDay
    ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ExhibitorMessages = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  // The conversations list doesn't come from here anymore — it comes from the
  // shared NotificationContext, which the bell (DashboardLayout) also uses. So
  // the list and the bell now always stay in sync, no matter where a message is read
  const { conversations, refresh, markConversationRead } = useNotifications()
  const [search, setSearch] = useState('')

  const [selectedUser, setSelectedUser] = useState(null) // { _id, name, email, ... }
  const [messages, setMessages] = useState([])
  const [loadingChat, setLoadingChat] = useState(false)

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const selectedUserRef = useRef(null) // to avoid a stale closure inside the socket handler

  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

  // Refresh the list once as soon as the page opens (the context already loads
  // it on login, this is just extra safety)
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load the full chat history when a thread is selected
  const openConversation = async (otherUser) => {
    setSelectedUser(otherUser)
    setMessages([])
    setLoadingChat(true)
    try {
      const data = await messageService.getConversation(otherUser._id)
      setMessages(data.messages || [])
      // It's already marked read on the backend (via the getConversation call) — now
      // tell the shared context too, so both the bell and the list update right away
      markConversationRead(otherUser._id)
    } catch {
      toast('Could not load chat')
    } finally {
      setLoadingChat(false)
    }
  }

  // Close the chat and go back to the "select a conversation" placeholder
  const closeConversation = () => {
    setSelectedUser(null)
    setMessages([])
  }

  // Live messages — if a new message arrives for the thread that's currently open,
  // add it straight into the chat (the list/unread update is now handled by
  // NotificationContext itself, no need to redo it here)
  useEffect(() => {
    if (!user) return

    const handleReceive = (msg) => {
      const senderId = String(msg.sender?._id)
      const receiverId = String(msg.receiver?._id)
      const otherId = senderId === String(user.id) ? receiverId : senderId
      const isOpenThread = String(selectedUserRef.current?._id) === otherId

      if (isOpenThread) {
        setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]))
        // The thread is open, so treat this message as "read" right away too
        markConversationRead(otherId)
      }
    }

    socket.on('receiveMessage', handleReceive)
    return () => socket.off('receiveMessage', handleReceive)
  }, [user, markConversationRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending || !selectedUser) return

    setSending(true)
    socket.emit('sendMessage', { receiverId: selectedUser._id, text: trimmed }, (ack) => {
      setSending(false)
      if (!ack?.success) {
        toast('Could not send message')
        return
      }
      setText('')
      // Added to the list/chat only via the 'receiveMessage' event (it's echoed into the sender's room too)
    })
  }

  const filteredConversations = conversations.filter((c) => {
    const name = c.user?.name || ''
    const email = c.user?.email || ''
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">Attendees ke sath aapki conversations</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
        {/* Threads list */}
        <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                No messages yet.
              </div>
            )}

            {filteredConversations.map((c) => {
                const name = c.user?.name || 'User'
                const isActive = selectedUser?._id === c.user._id
                return (
                  <button
                    key={c.user._id}
                    onClick={() => openConversation(c.user)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center gap-3 ${
                      isActive ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full ${colorFor(name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                    >
                      {initialsFor(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">{name}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatThreadTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {c.lastSenderIsMe ? 'You: ' : ''}
                        {c.lastMessage}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 shrink-0 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
          </div>
        </div>

        {/* Conversation panel */}
        {!selectedUser && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 text-sm gap-2">
            <MessageCircle size={28} className="text-gray-200" />
            Select a conversation
          </div>
        )}

        {selectedUser && (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 shrink-0">
              <span
                className={`w-9 h-9 rounded-full ${colorFor(selectedUser.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
              >
                {initialsFor(selectedUser.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedUser.name}</p>
                <p className="text-xs text-gray-400 truncate">{selectedUser.email}</p>
              </div>
              <button
                onClick={closeConversation}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 shrink-0 cursor-pointer"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
              {loadingChat && (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading chat...
                </div>
              )}

              {!loadingChat && messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">
                  No messages yet.
                </div>
              )}

              {!loadingChat &&
                messages.map((msg) => {
                  const isMine = String(msg.sender?._id) === String(user?.id)
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-100 p-3 shrink-0">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply likhein..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="w-10 h-10 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExhibitorMessages
