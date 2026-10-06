import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles, Bot, Loader2, RotateCcw, Clock } from 'lucide-react'
import { chatService } from '../services/chatService'

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the EventSphere assistant 👋 Ask me about upcoming events, how registration works, or how to become an exhibitor.",
}

const SUGGESTIONS = [
  'What events are coming up?',
  'How do I become an exhibitor?',
  'Is it free to register?',
]

// mm:ss formatter for the countdown
const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  // Rate-limit lock: null when chat is open, a Date when it's locked until
  const [limitedUntil, setLimitedUntil] = useState(null)
  const [now, setNow] = useState(Date.now())

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Sync with the backend's real lock state whenever the widget opens
  // (covers page refreshes — the countdown isn't just a client-side guess)
  useEffect(() => {
    if (!open) return

    chatService.getStatus().then(({ limited, retryAt }) => {
      if (limited && retryAt) {
        setLimitedUntil(new Date(retryAt))
      }
    })
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  // Tick every second while the chat is locked, and auto-unlock when time's up
  useEffect(() => {
    if (!limitedUntil) return

    const tick = () => setNow(Date.now())
    const interval = setInterval(tick, 1000)
    tick()

    return () => clearInterval(interval)
  }, [limitedUntil])

  useEffect(() => {
    if (limitedUntil && now >= limitedUntil.getTime()) {
      setLimitedUntil(null)
    }
  }, [now, limitedUntil])

  const isLocked = !!limitedUntil && now < limitedUntil.getTime()
  const remainingMs = isLocked ? limitedUntil.getTime() - now : 0

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sending || isLocked) return

    const history = messages
    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setSending(true)

    try {
      const data = await chatService.send(
        trimmed,
        history.map(({ role, content }) => ({ role, content }))
      )

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])

      if (data.limited && data.retryAt) {
        setLimitedUntil(new Date(data.retryAt))
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleReset = () => {
    setMessages([GREETING])
    setError('')
    setLimitedUntil(null)
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[calc(100vw-2.5rem)] max-w-sm h-[520px] max-h-[70vh] bg-white rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 flex flex-col overflow-hidden es-fade-up-chat">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">EventSphere Assistant</p>
                <p className="text-[11px] text-blue-100">Ask me anything about events</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleReset}
                aria-label="Restart conversation"
                title="Restart conversation"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[78%] text-sm leading-relaxed rounded-2xl px-3.5 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </span>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 text-center px-4">{error}</p>
            )}

            {/* Quick suggestions — only before the conversation gets going */}
            {messages.length === 1 && !sending && !isLocked && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Locked banner */}
          {isLocked && (
            <div className="flex items-center gap-2 justify-center text-xs font-medium text-amber-700 bg-amber-50 border-t border-amber-100 px-4 py-2 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              Chat available in {formatCountdown(remainingMs)}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 flex items-center gap-2 shrink-0 bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLocked ? `Available in ${formatCountdown(remainingMs)}` : 'Type your question...'}
              disabled={sending || isLocked}
              className="flex-1 text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={sending || isLocked || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        className="fixed bottom-5 right-5 z-[70] w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <style>{`
        @keyframes es-fade-up-chat {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .es-fade-up-chat { animation: es-fade-up-chat 0.2s ease-out both; }
      `}</style>
    </>
  )
}

export default ChatWidget
