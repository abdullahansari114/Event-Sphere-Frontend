import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
  FaTwitter as Twitter,
  FaLinkedin as Linkedin,
} from 'react-icons/fa'

// Swap this import path with wherever you save the hero photo in your project
import heroBg from '../assets/hero-expo-bg.jpg'
import { contactService } from '../services/contactService'

// ==================== CONTENT ====================
// Edit all contact details from here.

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email us',
    lines: ['hello@eventsphere.com', 'support@eventsphere.com'],
  },
  {
    icon: Phone,
    title: 'Call us',
    lines: ['+92 21 3555 1234', 'Mon–Fri, 9am–6pm'],
  },
  {
    icon: MapPin,
    title: 'Visit us',
    lines: ['Shahrah-e-Faisal, Karachi', 'Sindh, Pakistan'],
  },
]

const SOCIALS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter / X' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
]

// Google Maps embed — no API key needed. Swap the query to your real address.
const MAP_EMBED_SRC =
  'https://www.google.com/maps?q=Shahrah-e-Faisal,Karachi,Pakistan&output=embed'

// --- Local styles: ambient glows + fade-in, same language as the rest of the site ---
const PageStyles = () => (
  <style>{`
    @keyframes es-blob {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(25px, -20px) scale(1.08); }
    }
    .es-blob { animation: es-blob 16s ease-in-out infinite; }

    @keyframes es-fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .es-fade-up { animation: es-fade-up 0.7s ease-out both; }
  `}</style>
)

// Fires once an element scrolls into view — powers the section entrance animation.
const useInView = (threshold = 0.15) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

const Reveal = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

const SectionHeading = ({ eyebrow, children, className = '' }) => (
  <div className={className}>
    {eyebrow && <p className="text-sm font-semibold text-blue-600 mb-3">{eyebrow}</p>}
    <h2 className="text-3xl md:text-5xl font-bold text-[#0a0f1e] leading-tight">{children}</h2>
  </div>
)

const FIELD_CLASS =
  'w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-colors'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Please enter your name'
    if (!form.email.trim()) errs.email = 'Please enter your email'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.message.trim()) errs.message = 'Please write a message'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus('sending')
    try {
      await contactService.send(form)
      setStatus('sent')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="bg-white font-sans">
      <PageStyles />

      {/* ---------- HERO — flat, direct-on-image, same height/layout as the rest of the site ---------- */}
      <div className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Expo hall with attendees and exhibition booths"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1F]/95 via-[#050B1F]/85 to-[#050B1F]" />
        </div>
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center w-full es-fade-up">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 bg-blue-500/15 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4" /> Get In Touch
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            Let's Start The <span className="text-blue-400">Conversation</span>
          </h1>
          <p className="text-gray-200 mt-5 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            Questions about hosting, exhibiting, or partnering with EventSphere — our team
            replies within one business day
          </p>
        </div>
      </div>

      {/* ---------- CONTACT INFO CARDS ---------- */}
      <div className="max-w-6xl mx-auto px-6 -mt-12 relative z-10 pb-6">
        <Reveal className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CONTACT_INFO.map(({ icon: Icon, title, lines }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 p-7 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#0a0f1e]">{title}</h3>
              {lines.map((line) => (
                <p key={line} className="mt-1.5 text-base text-slate-500">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </Reveal>
      </div>

      {/* ---------- FORM + MAP ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Form */}
          <Reveal>
            <SectionHeading eyebrow="Send a message">Tell us what you need.</SectionHeading>
            <p className="mt-4 text-base text-slate-500 leading-relaxed max-w-md">
              Fill out the form and our team will get back to you shortly. For urgent matters,
              calling us directly is fastest.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Your name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Muhammad Afzal Siddique"
                    className={FIELD_CLASS}
                  />
                  {fieldErrors.name && <p className="mt-1.5 text-sm text-red-500">{fieldErrors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={FIELD_CLASS}
                  />
                  {fieldErrors.email && <p className="mt-1.5 text-sm text-red-500">{fieldErrors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Exhibitor application question"
                  className={FIELD_CLASS}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us a bit about what you're looking for..."
                  className={`${FIELD_CLASS} resize-none`}
                />
                {fieldErrors.message && <p className="mt-1.5 text-sm text-red-500">{fieldErrors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-base font-semibold px-7 py-3.5 rounded-xl transition-colors"
              >
                {status === 'sending' ? 'Sending...' : 'Send message'}
                {status !== 'sending' && <Send className="w-4 h-4" />}
              </button>

              {status === 'sent' && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 mt-2">
                  <CheckCircle2 className="w-4 h-4" /> Message sent — we'll reply within one business day.
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm font-medium text-red-500 mt-2">
                  {errorMessage || 'Something went wrong sending your message. Please try again or email us directly.'}
                </p>
              )}
            </form>
          </Reveal>

          {/* Map */}
          <Reveal delay={120} className="h-[380px] lg:h-full">
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/60 h-full">
              <iframe
                title="EventSphere office location"
                src={MAP_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- HOURS + SOCIAL STRIP ---------- */}
      <div className="relative overflow-hidden bg-[#050B1F] py-16">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />

        <Reveal className="relative max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <span className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-300" />
            </span>
            <div>
              <p className="text-white font-bold text-lg">Monday – Friday, 9am – 6pm</p>
              <p className="text-gray-400 text-base">Saturday, 10am – 2pm · Closed Sundays</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-300"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------- CTA ---------- */}
      <div className="bg-white py-20 border-t border-gray-100">
        <Reveal className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Prefer to browse first?
          </h2>
          <p className="text-gray-500 text-lg mb-9">
            See what's happening before you reach out — upcoming events and exhibitors are open to everyone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-7 py-3.5 rounded-xl transition"
            >
              View events <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/exhibitors"
              className="inline-flex items-center gap-2 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-base font-semibold px-7 py-3.5 rounded-xl transition"
            >
              Browse exhibitors
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

export default Contact