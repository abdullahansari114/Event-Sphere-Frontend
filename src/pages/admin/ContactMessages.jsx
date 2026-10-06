import { useEffect, useMemo, useState } from 'react'
import { Search, Mail, Trash2, Inbox, RefreshCw, Loader2 } from 'lucide-react'
import { contactService } from '../../services/contactService'

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?'

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await contactService.getAll()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return messages
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.subject || '').toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    )
  }, [messages, query])

  const selected = messages.find((m) => m._id === selectedId) || null
  const unreadCount = messages.filter((m) => !m.read).length

  const handleSelect = async (msg) => {
    setSelectedId(msg._id)
    if (msg.read) return
    // Optimistically mark read locally, then confirm with the server
    setMessages((prev) => prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m)))
    try {
      await contactService.markRead(msg._id)
    } catch {
      // if it fails, reload the list so the state stays correct
      load()
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await contactService.remove(id)
      setMessages((prev) => prev.filter((m) => m._id !== id))
      if (selectedId === id) setSelectedId(null)
    } catch (err) {
      setError(err.message || 'Failed to delete message')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Submissions from the public Contact page
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2.5 py-0.5">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex h-[560px] overflow-hidden">
        {/* List */}
        <div className="w-full sm:w-80 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, message..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2 px-6 text-center">
                <Inbox className="w-7 h-7" />
                <p className="text-xs text-gray-400">
                  {messages.length === 0 ? 'No messages yet' : 'No messages match your search'}
                </p>
              </div>
            )}

            {!loading &&
              filtered.map((m) => (
                <button
                  key={m._id}
                  onClick={() => handleSelect(m)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedId === m._id ? 'bg-blue-50/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${m.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                      {m.name}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(m.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{m.subject || m.message}</p>
                  {!m.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />}
                </button>
              ))}
          </div>
        </div>

        {/* Detail */}
        <div className="flex-1 hidden sm:flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
              Select a message to read it
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {initials(selected.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selected.name}</p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Mail size={12} /> {selected.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(selected._id)}
                  disabled={deletingId === selected._id}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors disabled:opacity-60 shrink-0"
                >
                  <Trash2 size={14} /> {deletingId === selected._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {selected.subject && (
                  <p className="text-sm font-semibold text-gray-800 mb-3">{selected.subject}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                <p className="text-xs text-gray-400 mt-6">{timeAgo(selected.createdAt)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminContactMessages