import { useEffect, useRef, useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { socket } from '../utils/socket'
import { messageService } from '../services/messageService'

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// otherUserId: the User _id of the exhibitor/user this chat is with
// otherUserName, otherUserSubtitle, avatarColor, avatarInitials: for UI display only
export default function ChatModal({
  open,
  onClose,
  otherUserId,
  otherUserName = 'User',
  otherUserSubtitle = '',
  avatarColor = 'bg-blue-600',
  avatarInitials = '?',
}) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // As soon as the modal opens, fetch the full chat history with this exhibitor/user so far
  useEffect(() => {
    if (!open || !otherUserId) return

    let cancelled = false
    setLoading(true)
    setMessages([])

    messageService
      .getConversation(otherUserId)
      .then((data) => {
        if (!cancelled) setMessages(data.messages || [])
      })
      .catch(() => {
        if (!cancelled) toast('Could not load chat, please try again')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, otherUserId])

  // Live messages — whenever a new message arrives from this exhibitor (or one we
  // sent is echoed back), add it to the chat right away
  useEffect(() => {
    if (!open || !otherUserId || !user) return

    const handleReceive = (msg) => {
      const senderId = String(msg.sender?._id)
      const receiverId = String(msg.receiver?._id)
      const isThisConversation =
        (senderId === String(otherUserId) && receiverId === String(user.id)) ||
        (senderId === String(user.id) && receiverId === String(otherUserId))

      if (!isThisConversation) return

      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]))
    }

    socket.on('receiveMessage', handleReceive)
    return () => socket.off('receiveMessage', handleReceive)
  }, [open, otherUserId, user])

  // Scroll to the bottom as soon as a new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    socket.emit('sendMessage', { receiverId: otherUserId, text: trimmed }, (ack) => {
      setSending(false)
      if (!ack?.success) {
        toast('Could not send message, please try again')
        return
      }
      setText('')
      // Note: on this client the message will be added to the list only via the
      // 'receiveMessage' event (the server echoes it back into the sender's room
      // too) — so we're not doing an optimistic add here, to avoid duplicates
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg h-[600px] max-h-[85vh] rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 shrink-0">
          <span
            className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}
          >
            {avatarInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{otherUserName}</p>
            {otherUserSubtitle && <p className="text-xs text-gray-400 truncate">{otherUserSubtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
          {loading && (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading chat...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-sm text-gray-400 px-6">
              No messages yet. Send {otherUserName} a message to start the conversation.
            </div>
          )}

          {!loading &&
            messages.map((msg) => {
              const isMine = String(msg.sender?._id) === String(user?.id)
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
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
            placeholder="Write your message..."
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
    </div>
  )
}