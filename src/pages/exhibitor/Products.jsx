import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_ORIGIN } from '../../config/api'
import {
  Plus, Pencil, Trash2, X, ImagePlus, Package, Wrench, Search, CalendarDays, CheckCircle2,
} from 'lucide-react'

const API = `${API_ORIGIN}/api/v1`
const PRODUCT_API = `${API}/product`
const MY_REQUESTS_API = `${API}/event-request/mine`

const CATEGORIES = [
  'Electronics',
  'Software & IT',
  'Food & Beverage',
  'Fashion & Apparel',
  'Health & Beauty',
  'Home & Lifestyle',
  'Automotive',
  'Education & Training',
  'Consulting & Services',
  'Marketing & Design',
  'Other',
]

const MAX_DESC = 600
const MAX_IMAGE_MB = 3

const EMPTY_FORM = { eventId: '', type: 'product', name: '', category: '', price: '', description: '' }

const formatPrice = (price) =>
  price === null || price === undefined ? 'Contact for price' : `PKR ${Number(price).toLocaleString('en-PK')}`

const inputClass =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500'

const TypeBadge = ({ type, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      type === 'service' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'
    } ${className}`}
  >
    {type === 'service' ? <Wrench size={11} /> : <Package size={11} />}
    {type === 'service' ? 'Service' : 'Product'}
  </span>
)

const ExhibitorProducts = () => {
  const [products, setProducts] = useState([])
  const [events, setEvents] = useState([]) // sirf approved events
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [eventFilter, setEventFilter] = useState('all')

  // add / edit modal
  const [modal, setModal] = useState(null) // { mode: 'create' } | { mode: 'edit', product }
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const flash = (message) => {
    setNotice(message)
    setTimeout(() => setNotice(''), 3000)
  }

  // Page khulte hi: meri products + meri approved events ek sath load karo
  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch(`${PRODUCT_API}/mine`, { credentials: 'include', cache: 'no-store' }),
      fetch(MY_REQUESTS_API, { credentials: 'include', cache: 'no-store' }),
    ])
      .then(async ([pRes, rRes]) => {
        if (!pRes.ok) throw new Error('Failed to load your products')
        if (!rRes.ok) throw new Error('Failed to load your events')
        return [await pRes.json(), await rRes.json()]
      })
      .then(([productData, requestData]) => {
        if (cancelled) return
        const seen = new Set()
        const approvedEvents = []
        requestData.forEach((r) => {
          if (r.status === 'approved' && r.event && !seen.has(r.event._id)) {
            seen.add(r.event._id)
            approvedEvents.push(r.event)
          }
        })
        setProducts(productData)
        setEvents(approvedEvents)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  // Escape dabane par modal band ho jaye
  useEffect(() => {
    if (!modal) return
    const onKey = (e) => e.key === 'Escape' && !saving && closeModal()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, saving])

  // ---------- modal helpers ----------
  const resetImageState = () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    setRemoveImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openCreate = () => {
    resetImageState()
    setForm({ ...EMPTY_FORM, eventId: events.length === 1 ? events[0]._id : '' })
    setFormError('')
    setModal({ mode: 'create' })
  }

  const openEdit = (product) => {
    resetImageState()
    setForm({
      eventId: product.event?._id || '',
      type: product.type,
      name: product.name,
      category: product.category || '',
      price: product.price === null || product.price === undefined ? '' : String(product.price),
      description: product.description || '',
    })
    setImagePreview(product.image || '')
    setFormError('')
    setModal({ mode: 'edit', product })
  }

  function closeModal() {
    resetImageState()
    setModal(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setFormError('Only JPG, PNG, WEBP or GIF images are allowed.')
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setFormError(`Image must be smaller than ${MAX_IMAGE_MB}MB.`)
      return
    }
    setFormError('')
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
  }

  const handleImageRemove = () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview('')
    setRemoveImage(true) // in edit mode, tell the server to remove the old image
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isEdit = modal.mode === 'edit'

    if (!isEdit && !form.eventId) return setFormError('Please select the event this product is for.')
    if (!form.name.trim()) return setFormError('Please enter a name.')
    if (form.price !== '' && (isNaN(Number(form.price)) || Number(form.price) < 0)) {
      return setFormError('Price must be a positive number (or leave it empty).')
    }

    const body = new FormData()
    body.append('type', form.type)
    body.append('name', form.name.trim())
    body.append('category', form.category)
    body.append('price', form.price)
    body.append('description', form.description.trim())
    if (!isEdit) body.append('eventId', form.eventId)
    if (imageFile) body.append('image', imageFile)
    if (isEdit && removeImage && !imageFile) body.append('removeImage', 'true')

    setSaving(true)
    setFormError('')
    try {
      const res = await fetch(isEdit ? `${PRODUCT_API}/${modal.product._id}` : PRODUCT_API, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        body, // FormData — the browser sets the Content-Type itself
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Something went wrong')

      setProducts((prev) => (isEdit ? prev.map((p) => (p._id === data._id ? data : p)) : [data, ...prev]))
      closeModal()
      flash(isEdit ? 'Changes saved' : `"${data.name}" added — attendees can now see it`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`${PRODUCT_API}/${deleteTarget._id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Failed to delete')
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      flash(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  // ---------- derived ----------
  const counts = useMemo(
    () => ({
      all: products.length,
      product: products.filter((p) => p.type === 'product').length,
      service: products.filter((p) => p.type === 'service').length,
    }),
    [products],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      if (eventFilter !== 'all' && p.event?._id !== eventFilter) return false
      if (q && !`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, search, typeFilter, eventFilter])

  const noApprovedEvents = !loading && events.length === 0

  // ---------- render ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add what you want to showcase — attendees will see these on the event page.
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={loading || noApprovedEvents}
          title={noApprovedEvents ? 'You need an approved event first' : ''}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : noApprovedEvents ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <CalendarDays size={24} />
          </div>
          <h2 className="font-semibold text-gray-800">No approved event yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Products are shown inside an event. Send a join request and once the admin approves it, you can add your products here.
          </p>
          <Link
            to="/exhibitor/events"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg bg-gray-100 p-1">
                {[
                  ['all', 'All'],
                  ['product', 'Products'],
                  ['service', 'Services'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTypeFilter(key)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      typeFilter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label} <span className="text-gray-400">{counts[key]}</span>
                  </button>
                ))}
              </div>

              {events.length > 1 && (
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All events</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                </select>
              )}

              <div className="relative ml-auto w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your products..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-200 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Package size={24} />
              </div>
              <h2 className="font-semibold text-gray-800">You haven't added anything yet</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
                Add your first product or service — attendees of your event will see it on the event page.
              </p>
              <button
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} /> Add your first product
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-sm text-gray-400">
              Nothing matches your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative h-40 bg-gradient-to-br from-blue-50 to-gray-100">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-blue-200">
                        {p.type === 'service' ? <Wrench size={36} /> : <Package size={36} />}
                      </div>
                    )}
                    <TypeBadge type={p.type} className="absolute left-3 top-3 bg-white/95 shadow-sm" />
                  </div>

                  <div className="p-4">
                    <h3 className="truncate font-semibold text-gray-900" title={p.name}>{p.name}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">{p.category || 'Uncategorized'}</p>
                    {p.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{p.description}</p>
                    )}
                    <p className="mt-2 flex items-center gap-1.5 truncate text-xs text-gray-400">
                      <CalendarDays size={12} className="shrink-0" /> {p.event?.title || 'Event'}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
                      <span className={`text-sm font-semibold ${p.price === null ? 'text-gray-400' : 'text-blue-600'}`}>
                        {formatPrice(p.price)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-1.5 hover:bg-gray-100"
                          title="Edit"
                        >
                          <Pencil size={14} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="rounded-lg p-1.5 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== Add / Edit modal ==================== */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => !saving && closeModal()}
        >
          <div
            className="relative flex max-h-full w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {modal.mode === 'edit' ? 'Edit item' : 'Add product or service'}
                </h2>
                <p className="text-xs text-gray-500">This will be visible to attendees on the event page.</p>
              </div>
              <button onClick={closeModal} disabled={saving} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-6 py-5">
              {formError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                  {formError}
                </div>
              )}

              {/* Type toggle */}
              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">What are you adding?</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['product', 'Product', Package],
                    ['service', 'Service', Wrench],
                  ].map(([key, label, Icon]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setForm((prev) => ({ ...prev, type: key }))}
                      className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                        form.type === key
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Event</label>
                <select
                  name="eventId"
                  value={form.eventId}
                  onChange={handleChange}
                  disabled={modal.mode === 'edit'}
                  className={inputClass}
                >
                  <option value="">Select an event...</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                  {/* in edit mode, show the name even if it's not in the event list */}
                  {modal.mode === 'edit' && modal.product.event && !events.some((e) => e._id === modal.product.event._id) && (
                    <option value={modal.product.event._id}>{modal.product.event.title}</option>
                  )}
                </select>
                {modal.mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-400">Event can't be changed. Add a new item for another event.</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder={form.type === 'service' ? 'e.g. Website Development' : 'e.g. Smart Watch X2'}
                  className={inputClass}
                />
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Price (PKR)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="any"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 12500"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">Leave empty to show "Contact for price".</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <span className={`text-xs ${form.description.length > MAX_DESC ? 'text-red-500' : 'text-gray-400'}`}>
                    {form.description.length}/{MAX_DESC}
                  </span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={MAX_DESC}
                  placeholder="Tell attendees what makes this special — key features, benefits, who it's for..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Image */}
              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Image <span className="font-normal text-gray-400">(optional, max {MAX_IMAGE_MB}MB)</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImagePick}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative h-44 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute right-2 top-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-white"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm hover:bg-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-500"
                  >
                    <ImagePlus size={22} />
                    <span className="text-xs font-medium">Click to upload an image</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : modal.mode === 'edit' ? 'Save Changes' : 'Add to Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== Delete confirm ==================== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Trash2 size={20} />
            </div>
            <h2 className="text-center text-lg font-bold text-gray-900">Delete this item?</h2>
            <p className="mt-1 text-center text-sm text-gray-500">
              "{deleteTarget.name}" will be removed and attendees will no longer see it.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExhibitorProducts