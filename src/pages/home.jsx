import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  ArrowUpRight, 
  Play, 
  Sparkles, 
  CalendarDays, 
  Users, 
  TrendingUp, 
  Star, 
  MapPin, 
  Building2, 
  Globe2, 
  ShieldCheck, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  Quote,
  Search,
  UserPlus,
  Handshake,
  Plus,
  Minus,
  Timer,
  Radio
} from 'lucide-react'

// Naye image imports — apne assets folder mein save kar ke path set karo
import eventCard1 from '../assets/event-tech-expo.jpg'
import eventCard2 from '../assets/event-business-summit.jpg'
import eventCard3 from '../assets/event-health-pharma.jpg'
import impactBg from '../assets/impact-globe-crowd.jpg'

// Swap this import path with wherever you save the hero photo in your project
import heroBg from '../assets/hero-expo-bg.jpg'
import { settingsService } from '../services/settingsService'

const WHY_FEATURES = [
  { icon: CalendarDays, title: 'Explore Industry', body: 'Discover the latest trends, innovations and solutions from top brands.' },
  { icon: Users, title: 'Build Connections', body: 'Meet industry leaders, partners and potential investors.' },
  { icon: TrendingUp, title: 'Grow Your Business', body: 'Find new opportunities, collaborate and take your business forward.' },
  { icon: Star, title: 'World-Class Events', body: 'From expos to conferences, we host events that create real value.' },
]

const EVENTS = [
  { img: eventCard1, date: '12 – 14 Nov 2025', title: 'Tech Innovation Expo', location: 'Dubai, UAE' },
  { img: eventCard2, date: '20 – 22 Jan 2026', title: 'Business Summit', location: 'London, UK' },
  { img: eventCard3, date: '10 – 12 Mar 2026', title: 'Health & Pharma Expo', location: 'Singapore' },
]

const IMPACT_STATS = [
  { icon: Users, value: '10K+', label: 'Attendees' },
  { icon: Building2, value: '500+', label: 'Exhibitors' },
  { icon: CalendarDays, value: '100+', label: 'Events' },
  { icon: Globe2, value: '50+', label: 'Countries' },
]

// Testimonial Data
const TESTIMONIALS = [
  {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    quote: '"EventSphere gave me the opportunity to meet amazing people and explore new business opportunities. It was a truly valuable experience."',
    name: 'Sarah Ahmed',
    role: 'Marketing Director, TechVision'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    quote: '"The organization, speakers and networking opportunities were outstanding. I highly recommend EventSphere to anyone in the industry."',
    name: 'James Carter',
    role: 'CEO, InnovateLabs'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    quote: '"A must-attended event for anyone serious about growth. The quality of connections and insights was beyond my expectations."',
    name: 'Ayesha Khan',
    role: 'Product Manager, FutureTech'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    quote: '"From booth setup to lead capture, everything on EventSphere just worked. Our best-performing expo to date."',
    name: 'Daniel Osei',
    role: 'Head of Growth, NovaWorks'
  },
  {
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    quote: '"The platform made networking effortless — we booked more qualified meetings in two days than in a full quarter."',
    name: 'Maria Lopez',
    role: 'Partnerships Lead, Horizon Group'
  }
]

// How It Works Data
const HOW_IT_WORKS = [
  {
    icon: Search,
    step: '01',
    title: 'Discover an Event',
    body: 'Browse expos, summits and conferences filtered by industry, city or date.',
  },
  {
    icon: UserPlus,
    step: '02',
    title: 'Register in Seconds',
    body: 'Create your free profile and reserve your spot — no paperwork, no hassle.',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Connect & Grow',
    body: 'Meet exhibitors, attend sessions and turn conversations into real opportunities.',
  },
]

// FAQ Data
const FAQS = [
  {
    q: 'Is it free to create an EventSphere account?',
    a: 'Yes. Creating an account and browsing events is completely free. Some premium sessions or booths may have their own ticket price set by the organizer.',
  },
  {
    q: 'Can exhibitors apply for a booth online?',
    a: 'Absolutely. Exhibitors can apply directly from an event page, choose a booth from the interactive floor plan, and track their application status from their dashboard.',
  },
  {
    q: 'Will I get a reminder before an event starts?',
    a: 'Yes — once you register, EventSphere sends you notifications and email reminders as the event date approaches, plus live updates on the day.',
  },
  {
    q: 'Can I attend events from anywhere in the world?',
    a: 'EventSphere lists both in-person and hybrid events across 50+ countries, so you can filter by location or join select sessions remotely.',
  },
]

// Countdown target — swap this for a real upcoming event date from your backend
const NEXT_EVENT_DATE = new Date('2026-12-15T09:00:00')

const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(() => targetDate.getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(targetDate.getTime() - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const clamped = Math.max(timeLeft, 0)
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24))
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((clamped / (1000 * 60)) % 60)
  const seconds = Math.floor((clamped / 1000) % 60)

  return { days, hours, minutes, seconds }
}

// Live "social proof" ticker data — cycles to feel like a real-time feed
const LIVE_ACTIVITY = [
  'Sarah A. just registered for Tech Innovation Expo',
  'InnovateLabs booked a booth for Business Summit',
  'Ayesha K. connected with 3 exhibitors',
  'NovaWorks confirmed attendance — Dubai, UAE',
  'Daniel O. joined the Health & Pharma Expo waitlist',
  '48 professionals registered in the last hour',
]

const useTicker = (items, interval = 3200) => {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [items.length, interval])
  return items[index]
}

// Brand Logos Data
const BRANDS = [
  { name: 'Microsoft', font: 'font-semibold tracking-tight' },
  { name: 'Google', font: 'font-bold' },
  { name: 'amazon', font: 'font-bold lowercase tracking-tighter' },
  { name: 'IBM.', font: 'font-black tracking-widest' },
  { name: 'Deloitte.', font: 'font-bold tracking-tight' },
  { name: 'Linked in', font: 'font-bold tracking-tight' },
  { name: 'intel', font: 'font-extrabold lowercase' }
]

// Local styles for animations
const PageStyles = () => (
  <style>{`
    html {
      scroll-behavior: smooth;
    }

    @keyframes eshpere-fade-up {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .eshpere-fade-up { animation: eshpere-fade-up 0.7s ease-out both; }

    @keyframes eshpere-bounce-sm {
      0%, 100% { transform: translateY(0); opacity: 1; }
      50% { transform: translateY(6px); opacity: 0.4; }
    }
    .eshpere-bounce-sm { animation: eshpere-bounce-sm 1.6s ease-in-out infinite; }

    @keyframes eshpere-draw {
      from { stroke-dashoffset: 900; }
      to { stroke-dashoffset: 0; }
    }
    .eshpere-draw path {
      stroke-dasharray: 900;
      animation: eshpere-draw 2.6s ease-out forwards;
    }

    @keyframes eshpere-marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .eshpere-marquee-track {
      animation: eshpere-marquee 28s linear infinite;
    }
    .eshpere-marquee-track:hover {
      animation-play-state: paused;
    }

    @keyframes eshpere-glow-pulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .eshpere-glow-pulse { animation: eshpere-glow-pulse 2.6s ease-in-out infinite; }

    @keyframes eshpere-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .eshpere-float { animation: eshpere-float 4.5s ease-in-out infinite; }

    @keyframes eshpere-gradient-pan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .eshpere-gradient-text {
      background-image: linear-gradient(90deg, #38bdf8, #6366f1, #22d3ee, #38bdf8);
      background-size: 300% auto;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: eshpere-gradient-pan 6s linear infinite;
    }
  `}</style>
)

// Animates a numeric value upward once its wrapper scrolls into view
const CountUp = ({ value, duration = 1600 }) => {
  const match = String(value).match(/^([\d,.]+)(.*)$/)
  const numericPart = match ? parseFloat(match[1].replace(/,/g, '')) : 0
  const suffix = match ? match[2] : ''
  const [ref, inView] = useInView(0.4)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(numericPart * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>
}

// Two-digit padded countdown unit block
const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl w-14 sm:w-16 py-2">
    <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] uppercase tracking-widest text-blue-100/70">{label}</span>
  </div>
)

const useInView = (threshold = 0.2) => {
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
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

// Animated constellation of drifting, connected particles that react to the cursor.
// Pure canvas — no extra dependency — and respects prefers-reduced-motion.
const ParticleField = ({ className = '', density = 60 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let particles = []
    let rafId = null
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * window.devicePixelRatio
      canvas.height = height * window.devicePixelRatio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)

      const count = Math.round((width * height) / 18000)
      particles = Array.from({ length: Math.min(count, density) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.6,
      }))
    }

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const handleMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) {
          const force = (110 - dist) / 110
          p.x += (dx / dist) * force * 0.6
          p.y += (dy / dist) * force * 0.6
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(125, 211, 252, 0.55)'
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.18 * (1 - dist / 130)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(draw)
    } else {
      draw()
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [density])

  return <canvas ref={canvasRef} className={className} />
}

// Wraps a card and gives it a subtle 3D tilt that follows the cursor
const TiltCard = ({ children, className = '', max = 8 }) => {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    node.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`
  }
  const handleMouseLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  )
}

// A button that gently drifts toward the cursor within its own bounds — a premium micro-interaction
const MagneticButton = ({ children, className = '', strength = 0.3, as: Component = 'button', ...props }) => {
  const ref = useRef(null)

  const handleMouseMove = (e) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    node.style.transform = `translate(${x}px, ${y}px)`
  }
  const handleMouseLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'translate(0, 0)'
  }

  return (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

const Home = () => {
  // Whatever image the admin dashboard has set will show here.
  // Until it loads from the backend (or nothing has been set), a
  // default image from assets is shown as a fallback — the page is never left empty.
  const [heroImage, setHeroImage] = useState(heroBg)

  useEffect(() => {
    settingsService
      .get()
      .then((data) => {
        if (data?.heroImage) setHeroImage(data.heroImage)
      })
      .catch(() => {
        // if the fetch fails, the default hero image keeps showing
      })
  }, [])

  const scrollToNext = (e) => {
    e.preventDefault()
    document.getElementById('why-eventsphere')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Countdown to the next featured event
  const countdown = useCountdown(NEXT_EVENT_DATE)

  // Testimonials carousel — shows 3 at a time, autoplays, and supports manual arrows
  const VISIBLE_TESTIMONIALS = 3
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const maxTestimonialIndex = TESTIMONIALS.length - VISIBLE_TESTIMONIALS
  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i >= maxTestimonialIndex ? 0 : i + 1))
  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i <= 0 ? maxTestimonialIndex : i - 1))
  const visibleTestimonials = useMemo(
    () => TESTIMONIALS.slice(testimonialIndex, testimonialIndex + VISIBLE_TESTIMONIALS),
    [testimonialIndex]
  )

  useEffect(() => {
    const id = setInterval(nextTestimonial, 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // FAQ accordion
  const [openFaq, setOpenFaq] = useState(0)

  // Live social-proof ticker text
  const tickerText = useTicker(LIVE_ACTIVITY)

  // One-time branded intro reveal (per browser session, not on every navigation)
  const [introDone, setIntroDone] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('eshpere_intro_shown') === '1'
  )
  useEffect(() => {
    if (introDone) return
    const id = setTimeout(() => {
      setIntroDone(true)
      sessionStorage.setItem('eshpere_intro_shown', '1')
    }, 1100)
    return () => clearTimeout(id)
  }, [introDone])

  return (
    <div className="min-h-screen bg-[#030712] overflow-x-hidden font-sans">
      <PageStyles />

      {/* Branded intro reveal — plays once per browser session */}
      <div
        className={`fixed inset-0 z-[999] bg-[#030712] flex items-center justify-center transition-opacity duration-700 ${
          introDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl eshpere-float shadow-[0_0_40px_rgba(59,130,246,0.5)]">
            ES
          </span>
          <span className="text-blue-200/70 text-xs tracking-[0.3em] uppercase">EventSphere</span>
        </div>
      </div>

      {/* Hero */}
      <section
        className="relative overflow-hidden min-h-[680px] lg:min-h-[760px] flex items-center"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Expo hall with attendees and exhibition booths"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/55 to-[#030712]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/70 via-transparent to-[#030712]/30" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030712] to-transparent" />
        </div>

        <ParticleField className="absolute inset-0 z-[2] pointer-events-none hidden sm:block mix-blend-screen" density={70} />

        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[130px] eshpere-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-20 lg:py-28 w-full">
          <div className="eshpere-fade-up max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 bg-blue-500/15 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-4 shadow-lg shadow-blue-950/30">
              <Sparkles className="w-3.5 h-3.5" /> The Ultimate Event Platform
            </p>

            {/* Live activity ticker — subtle social proof, rotates every few seconds */}
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-3.5 py-1.5 mb-6 max-w-full">
              <Radio className="w-3 h-3 text-emerald-400 shrink-0 eshpere-glow-pulse" />
              <span key={tickerText} className="eshpere-fade-up truncate">{tickerText}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)]">
              Bringing People, Ideas &amp; Opportunities{' '}
              <span className="eshpere-gradient-text">Together</span>
            </h1>
            <p className="text-gray-200 text-lg max-w-lg mb-9 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              EventSphere connects industry leaders, innovators, and professionals through world-class expos,
              conferences, and networking events. Discover, connect, and grow — all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <MagneticButton
                as={Link}
                to="/events"
                strength={0.25}
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/40"
              >
                Explore Upcoming Events <ArrowRight className="w-4 h-4" />
              </MagneticButton>
              <button className="inline-flex items-center gap-3 text-white font-semibold">
                <span className="w-11 h-11 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm flex items-center justify-center transition hover:bg-white/15">
                  <Play className="w-4 h-4 fill-white" />
                </span>
                Watch Video
              </button>
            </div>
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full pl-2 pr-5 py-2 w-fit">
              <div className="flex -space-x-3">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="w-9 h-9 rounded-full border-2 border-[#030712] bg-gradient-to-br from-blue-400 to-blue-700" />
                ))}
              </div>
              <p className="text-sm text-gray-200">
                Trusted by <span className="text-white font-semibold">10,000+</span> Professionals Worldwide
              </p>
            </div>

            {/* Live countdown to the next flagship event */}
            <div className="mt-8 inline-flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold shrink-0">
                <Timer className="w-4 h-4 eshpere-glow-pulse" />
                Next Event Starts In
              </div>
              <div className="flex items-center gap-2">
                <CountdownUnit value={countdown.days} label="Days" />
                <CountdownUnit value={countdown.hours} label="Hrs" />
                <CountdownUnit value={countdown.minutes} label="Min" />
                <CountdownUnit value={countdown.seconds} label="Sec" />
              </div>
            </div>
          </div>
        </div>

        <a
          href="#why-eventsphere"
          onClick={scrollToNext}
          className="hidden lg:flex absolute z-10 bottom-8 right-10 items-center gap-2 text-gray-200 text-xs cursor-pointer"
        >
          <span className="w-6 h-9 rounded-full border border-white/30 flex items-start justify-center p-1">
            <span className="w-1 h-2 rounded-full bg-white/70 eshpere-bounce-sm" />
          </span>
          Scroll Down
        </a>
      </section>

      {/* Why EventSphere */}
      <section id="why-eventsphere" className="relative bg-white py-28 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-blue-50 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-blue-50 blur-[110px] pointer-events-none" />

        <svg
          className="absolute bottom-0 right-0 w-[520px] h-[260px] text-blue-200 pointer-events-none eshpere-draw"
          viewBox="0 0 520 260"
          fill="none"
        >
          <path d="M0 200 C 120 140, 200 260, 320 190 S 500 120, 520 160" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 230 C 120 170, 200 260, 320 220 S 500 150, 520 190" stroke="currentColor" strokeWidth="1.5" />
          <path d="M0 170 C 120 110, 200 230, 320 160 S 500 90, 520 130" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 items-start">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 mb-4">
              <span className="w-6 h-px bg-blue-600" /> WHY EVENTSPHERE
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Everything You Need for a Successful Expo
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-md">
              From discovering new opportunities to building valuable connections, EventSphere gives you the tools,
              resources, and environment to make every event count.
            </p>
            <Link
              to="/features"
              className="group inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Learn More
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
            {WHY_FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 120} className={i === 3 ? 'sm:col-start-1' : ''}>
                <div className="group relative h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-100 hover:border-blue-200">
                  <span className="relative w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="w-5 h-5 text-blue-600 transition-colors duration-300 group-hover:text-white" />
                  </span>
                  <h3 className="text-gray-900 font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  <span className="absolute bottom-0 left-6 right-6 h-px bg-blue-100 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative bg-slate-50 py-24 px-6 sm:px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center max-w-xl mx-auto mb-16">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 mb-4 justify-center">
              <span className="w-6 h-px bg-blue-600" /> HOW IT WORKS <span className="w-6 h-px bg-blue-600" />
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Three Steps to Your Next Big Opportunity
            </h2>
          </Reveal>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            <div
              className="hidden sm:block absolute top-9 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"
              aria-hidden="true"
            />
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, body }, i) => (
              <Reveal key={step} delay={i * 150} className="relative text-center flex flex-col items-center">
                <div className="relative z-10 w-[72px] h-[72px] rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-100/60 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-blue-600" />
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 1: Featured Events & OUR IMPACT */}
      <div className="relative bg-[#030712] text-white overflow-hidden py-24">
        
        {/* 1. SEAMLESS BACKGROUND GLOBE IMAGE */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <img
            src={impactBg}
            alt="Cosmic Network Background"
            className="w-full h-full object-cover opacity-20 mix-blend-screen scale-110"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-[#030712]/80 to-[#030712]" />
        </div>

        {/* Decorative Glow Dots */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 space-y-28">

          {/* --- PART 1: FEATURED EVENTS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-4">
              <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mb-3 block">
                FEATURED EVENTS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                Upcoming Expos <br className="hidden sm:inline" />&amp; Summits
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
                Explore a range of industry-leading events, from technology and business to healthcare and education. Find the perfect event for your goals.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-semibold px-6 py-3 rounded-full hover:brightness-125 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                View All Events <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {EVENTS.map((event, i) => (
                <Reveal key={event.title} delay={i * 120}>
                  <TiltCard max={6} className="h-full rounded-2xl shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between h-full group">
                    <div className="relative h-44 overflow-hidden bg-[#030712]">
                      <img
                        src={event.img}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between bg-white text-slate-900">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">{event.date}</p>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{event.title}</h3>
                        <p className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-4">
                          <MapPin className="w-3 h-3 text-slate-400" /> {event.location}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <Link
                          to="/events"
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          Register Now &rarr;
                        </Link>
                        <button className="w-7 h-7 rounded-full bg-[#030712] flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>

          {/* --- PART 2: OUR IMPACT --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <Reveal className="lg:col-span-5">
              <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mb-3 block">
                OUR IMPACT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                Connecting <br className="hidden sm:inline" />Expos &amp; Markets
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
                We bring together thousands of professionals, exhibitors and businesses, creating opportunities that drive real growth and innovation.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-semibold px-6 py-3 rounded-full hover:brightness-125 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                About EventSphere <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {IMPACT_STATS.map(({ icon: Icon, value, label }, i) => (
                <Reveal key={label} delay={i * 100}>
                  <div className="rounded-2xl bg-[#081329]/70 backdrop-blur-md border border-cyan-500/20 p-6 text-center flex flex-col items-center justify-center transition-all duration-300 hover:border-cyan-400/50 hover:bg-[#0b1b3a]/80 hover:-translate-y-1">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-extrabold text-white tracking-tight mb-1">
                      <CountUp value={value} />
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 tracking-wide">{label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: More Than Just an Expo */}
      <section className="relative bg-white py-20 px-6 sm:px-10 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-slate-900">
          
          <div className="lg:col-span-6 relative pr-10 sm:pr-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[320px] sm:h-[360px] bg-[#030712]">
              <img
                src={eventCard1}
                alt="Connecting Expos & Conferences"
                className="w-full h-full object-cover brightness-90 contrast-105 saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/80 via-[#030712]/40 to-blue-900/20 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-transparent to-blue-950/40" />

              <div className="absolute top-8 left-6 sm:top-10 sm:left-8 z-10 max-w-[240px] sm:max-w-[280px]">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
                  Connecting Expos &amp; Conferences
                </h3>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all hover:brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  About Events <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-0 sm:right-2 z-20">
              <Reveal className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl max-w-[240px] sm:max-w-[260px] w-full border border-slate-100">
                <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1 block">
                  Next Event
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mb-2">
                  Tech Innovation Expo
                </h4>
                <div className="space-y-1 mb-4 text-[11px] sm:text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" /> 12 – 14 Nov 2025
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Dubai, UAE
                  </p>
                </div>
                <Link
                  to="/events"
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-full transition shadow-md shadow-blue-500/20"
                >
                  Register Now <ArrowRight className="w-3 h-3" />
                </Link>
              </Reveal>
            </div>
          </div>

          <Reveal className="lg:col-span-6 pl-0 lg:pl-4">
            <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-2 block">
              DON'T MISS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              More Than Just an Expo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-8">
              EventSphere is more than an event — it’s an experience. Get inspired by industry leaders, explore cutting-edge innovations, and be part of something bigger.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Meet Experts</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Attend Workshops</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Access Exclusive Content</p>
              </div>

              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                  <Building2 className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">Build Lasting Connections</p>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* SECTION 4: TESTIMONIALS */}
      <section className="relative bg-white pt-16 pb-28 px-6 sm:px-10 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-12 bg-white rounded-t-[40px] sm:rounded-t-[60px] -translate-y-6 shadow-sm pointer-events-none" />

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <Reveal>
              <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-2 block">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                What Our Attendees Say
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                Real stories from real people. See how EventSphere has helped professionals and businesses achieve more.
              </p>
            </Reveal>

            <Reveal delay={100} className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={prevTestimonial}
                aria-label="Previous testimonials"
                className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 shadow-sm transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextTestimonial}
                aria-label="Next testimonials"
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((item) => (
              <Reveal key={item.name} className="eshpere-fade-up">
                <div className="relative bg-slate-50/80 hover:bg-white rounded-2xl p-7 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <Quote className="w-8 h-8 text-blue-200 fill-blue-100 group-hover:text-blue-500 transition-colors" />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-8">
                      {item.quote}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">{item.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium mb-3">{item.role}</p>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star key={starIdx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: maxTestimonialIndex + 1 }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setTestimonialIndex(dotIdx)}
                aria-label={`Show testimonial set ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === testimonialIndex ? 'w-7 bg-blue-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* UPDATED SECTION 5: TRUSTED BY GLOBAL BRANDS (HERO BANNER BLUE BACKGROUND) */}
      {/* ========================================================================= */}
      <section className="relative bg-[#09152a] text-white py-20 px-6 sm:px-10 overflow-hidden border-t border-blue-500/20">
        
        {/* Banner Matching Vibrant Blue Glowing Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto z-10 text-center">
          
          <Reveal>
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mb-3 block">
              TRUSTED BY GLOBAL BRANDS
            </span>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-lg mx-auto leading-relaxed mb-12">
              Leading companies and organizations choose EventSphere for meaningful connections and business growth.
            </p>
          </Reveal>

          {/* Infinite Logo Marquee */}
          <div
            className="relative overflow-hidden"
            style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
          >
            <div className="eshpere-marquee-track flex items-center gap-16 w-max">
              {[...BRANDS, ...BRANDS].map((brand, i) => (
                <span
                  key={`${brand.name}-${i}`}
                  className={`text-xl sm:text-2xl text-blue-200/70 hover:text-white transition-all duration-300 cursor-pointer drop-shadow-sm hover:scale-105 shrink-0 ${brand.font}`}
                >
                  {brand.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="relative bg-white py-24 px-6 sm:px-10 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-600 mb-4 justify-center">
              <span className="w-6 h-px bg-blue-600" /> FAQ <span className="w-6 h-px bg-blue-600" />
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Frequently Asked Questions
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <Reveal key={item.q} delay={i * 80}>
                  <div className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${isOpen ? 'border-blue-200 bg-blue-50/40' : 'border-slate-100 bg-white'}`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? -1 : i)}
                      className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{item.q}</span>
                      <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
