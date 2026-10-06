import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardList, Mic2, MapPin, Clock, Users, Plus, X, Pencil, Trash2, Search,
} from 'lucide-react'
import SessionRequestsPanel from '../../components/sessions/SessionRequestsPanel'
import { API_ORIGIN } from '../../config/api'

const SESSION_API = `${API_ORIGIN}/api/v1/session`
const SESSION_REQUEST_API = `${API_ORIGIN}/api/v1/session-registration`

const emptyForm = {
  title: '', speaker: '', speakerTitle: '', hall: '', location: '', date: '', startTime: '', endTime: '', totalSeats: 50, description: '',
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminSessions() {
  const [view, setView] = useState('sessions')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [speakerQuery, setSpeakerQuery] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(SESSION_API, { credentials: 'include', cache: 'no-store' })
      setSessions(res.ok ? await res.json() : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSessions() }, [])

  useEffect(() => {
    fetch(SESSION_REQUEST_API, { credentials: 'include', cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setPendingCount((data || []).filter((r) => r.status === 'pending').length))
      .catch(() => {})
  }, [view])

  // All the speaker names entered so far (from loaded sessions) — used for dropdown suggestions
  const speakerSuggestions = useMemo(
    () => Array.from(new Set(sessions.map((s) => s.speaker).filter(Boolean))).sort(),
    [sessions],
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (s) => {
    setEditingId(s._id)
    setForm({
      title: s.title, speaker: s.speaker, speakerTitle: s.speakerTitle || '', hall: s.hall,
      location: s.location || '', date: s.date, startTime: s.startTime, endTime: s.endTime || '',
      totalSeats: s.totalSeats, description: s.description || '',
    })
    setFormError('')
    setShowForm(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const url = editingId ? `${SESSION_API}/${editingId}` : SESSION_API
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save session')

      setSessions((prev) =>
        editingId ? prev.map((s) => (s._id === editingId ? data : s)) : [...prev, data],
      )
      setShowForm(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this session? All its seat requests will be deleted too.')) return
    try {
      const res = await fetch(`${SESSION_API}/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to delete session')
      setSessions((prev) => prev.filter((s) => s._id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredSessions = useMemo(() => {
    const term = speakerQuery.trim().toLowerCase()
    if (!term) return sessions
    return sessions.filter((s) => s.speaker.toLowerCase().includes(term))
  }, [sessions, speakerQuery])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage guest speakers, halls, and seat requests</p>
        </div>

        <div className="relative inline-grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
          <span
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-transform duration-200 ease-out"
            style={{ transform: view === 'requests' ? 'translateX(calc(100% + 4px))' : 'translateX(0)' }}
          />
          <button
            type="button"
            onClick={() => setView('sessions')}
            className={`relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              view === 'sessions' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Mic2 size={15} /> Sessions
          </button>
          <button
            type="button"
            onClick={() => setView('requests')}
            className={`relative z-10 flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
              view === 'requests' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList size={15} /> Seat Requests
            {pendingCount > 0 && (
              <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {view === 'requests' ? (
        <SessionRequestsPanel />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={speakerQuery}
                onChange={(e) => setSpeakerQuery(e.target.value)}
                placeholder="Filter by speaker..."
                className="w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              {speakerQuery && (
                <button onClick={() => setSpeakerQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={15} /> Add Session
            </button>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-gray-400">
              No sessions created yet. Use "Add Session" to create your first one.
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-gray-400">
              No sessions found for a speaker named "{speakerQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((s) => {
                const fillPct = Math.min(100, Math.round((s.bookedSeats / s.totalSeats) * 100))
                return (
                  <div key={s._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{s.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {s.speaker}{s.speakerTitle && <span className="text-gray-400"> · {s.speakerTitle}</span>}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-blue-600">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm text-gray-600">
                      <p className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" /> {formatDate(s.date)} · {s.startTime}{s.endTime && ` - ${s.endTime}`}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> {s.hall}{s.location && ` · ${s.location}`}</p>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="flex items-center gap-1"><Users size={12} /> Seats</span>
                        <span className="font-medium text-gray-700">{s.bookedSeats} / {s.totalSeats} booked</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${fillPct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Session' : 'Add Session'}</h3>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && <div className="bg-red-50 text-red-600 text-sm px-3.5 py-2.5 rounded-lg border border-red-100">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Future of AI in Retail"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Guest Speaker</label>
                  {/* list={} = type a name or pick a previously entered one from the dropdown */}
                  <input
                    name="speaker" value={form.speaker} onChange={handleChange} required
                    placeholder="Type or pick a speaker" list="speaker-suggestions"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                  <datalist id="speaker-suggestions">
                    {speakerSuggestions.map((name) => <option key={name} value={name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Speaker Title <span className="text-gray-400">(optional)</span></label>
                  <input name="speakerTitle" value={form.speakerTitle} onChange={handleChange} placeholder="CEO, Acme Inc."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Hall / Stage</label>
                  <input name="hall" value={form.hall} onChange={handleChange} required placeholder="Hall A - Stage 1"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location / Venue <span className="text-gray-400">(optional)</span></label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="Expo Center, Karachi"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} required
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Seats</label>
                <input type="number" min={1} name="totalSeats" value={form.totalSeats} onChange={handleChange} required
                  className="w-32 px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  placeholder="What will this session cover?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}