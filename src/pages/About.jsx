import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Globe2,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Target,
  Rocket,
  Award,
  CheckCircle2,
  PlusCircle,
  Mail,
  Quote,
  Star,
  Radio,
} from 'lucide-react'

// Swap this import path with wherever you save the hero photo in your project
import heroBg from '../assets/hero-expo-bg.jpg'

// ==================== CONTENT ====================
// Edit all copy from here — no numbers/text are hardcoded anywhere else inside the component.

const STATS = [
  { value: '10,000+', label: 'Professionals connected' },
  { value: '240+', label: 'Events hosted since 2021' },
  { value: '38', label: 'Cities across the region' },
  { value: '1,200+', label: 'Exhibiting companies' },
]

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Every exhibitor is vetted',
    description:
      'We review every company before they get a booth. Attendees walk in knowing the floor is worth their time, not a room full of cold pitches.',
  },
  {
    icon: Building2,
    title: 'Built for the people running it',
    description:
      'Floor plans, booth requests, registrations, and messaging live in one dashboard — so organizers spend their week on the event, not on spreadsheets.',
  },
  {
    icon: Globe2,
    title: 'One network, every city',
    description:
      'A contact made at an expo in Karachi stays in your network for the next one in Lahore or Dubai. We built EventSphere so relationships travel with you.',
  },
]

const TIMELINE = [
  {
    year: '2021',
    icon: Target,
    title: 'The Blueprint',
    description: 'Started with a simple goal: replace outdated email threads with a smart expo management tool.',
  },
  {
    year: '2023',
    icon: Rocket,
    title: 'Regional Expansion',
    description: 'Scaled across 15+ major cities, serving over 100 enterprise trade shows and technology summits.',
  },
  {
    year: '2025',
    icon: Award,
    title: 'Smart Event Ecosystem',
    description: 'Integrated real-time analytics, automated seat allocations, and interactive floor plans.',
  },
  {
    year: '2026',
    icon: CheckCircle2,
    title: 'The Next Generation',
    description: 'Empowering over 10,000 active professionals with seamless networking and instant event bookings.',
  },
]

const TEAM = [
  { initials: 'MK', name: 'Maha Khan', role: 'Head of Partnerships' },
  { initials: 'AR', name: 'Ali Raza', role: 'Platform & Engineering' },
  { initials: 'SF', name: 'Sana Farooq', role: 'Exhibitor Success' },
  { initials: 'HB', name: 'Hamza Baig', role: 'Event Operations' },
]

const TESTIMONIALS = [
  {
    quote: 'We went from a spreadsheet of exhibitor emails to a full dashboard in a week. Booth requests and approvals just happen now.',
    name: 'Bilal Sheikh',
    role: 'Event Director, Karachi Tech Week',
  },
  {
    quote: "Getting approved as an exhibitor and picking our booth took ten minutes. No back-and-forth, no phone calls.",
    name: 'Nimra Aziz',
    role: 'Marketing Lead, Orbit Solutions',
  },
  {
    quote: 'The floor plan tool alone saved our team hours before every show. Everyone can see booth availability in real time.',
    name: 'Faizan Qureshi',
    role: 'Operations Manager, ExpoWorks',
  },
]

// Live "social proof" ticker data — cycles to feel like a real-time feed
const LIVE_ACTIVITY = [
  'Bilal S. just listed Karachi Tech Week',
  'Nimra A. approved as an exhibitor',
  'Faizan Q. checked the live floor plan',
  '12 booths booked in the last hour',
  'A new organizer joined from Lahore',
]

// --- Local styles: ambient glows, zoom, fade-in — same language as the Events hero ---
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

    @keyframes es-glow-pulse {
      0%, 100% { opacity: 0.55; }
      50% { opacity: 1; }
    }
    .es-glow-pulse { animation: es-glow-pulse 2.6s ease-in-out infinite; }

    @keyframes es-gradient-pan {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .es-gradient-text {
      background-image: linear-gradient(90deg, #38bdf8, #6366f1, #22d3ee, #38bdf8);
      background-size: 300% auto;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: es-gradient-pan 6s linear infinite;
    }
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

// Cycles through a list of strings on an interval — powers the hero's live-activity chip.
const useTicker = (items, interval = 3200) => {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [items.length, interval])
  return items[index]
}

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

// Animated constellation of drifting, connected particles that react to the cursor.
// Pure canvas — no extra dependency — and respects prefers-reduced-motion.
const ParticleField = ({ className = '', density = 55 }) => {
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
const TiltCard = ({ children, className = '', max = 7 }) => {
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

// Reusable section heading — keeps every heading on the page the same scale.
const SectionHeading = ({ eyebrow, children, className = '', center = false }) => (
  <div className={`${center ? 'text-center mx-auto' : ''} ${className}`}>
    {eyebrow && (
      <p className="text-sm font-semibold text-blue-600 mb-3">{eyebrow}</p>
    )}
    <h2 className="text-3xl md:text-5xl font-bold text-[#0a0f1e] leading-tight">{children}</h2>
  </div>
)

// ==================== PAGE ====================

const About = () => {
  const tickerText = useTicker(LIVE_ACTIVITY)

  return (
    <div className="bg-white font-sans">
      <PageStyles />

      {/* ---------- HERO — flat, direct-on-image, same height/layout as the Events hero ---------- */}
      <div className="relative overflow-hidden min-h-[480px] md:min-h-[560px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Expo hall with attendees and exhibition booths"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050B1F]/95 via-[#050B1F]/85 to-[#050B1F]" />
        </div>
        <ParticleField className="absolute inset-0 z-[1] pointer-events-none hidden sm:block mix-blend-screen" density={55} />
        <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[320px] h-[320px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center w-full es-fade-up">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200 bg-blue-500/15 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4" /> Our Story
          </p>

          {/* Live activity ticker — subtle social proof, rotates every few seconds */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-400/25 rounded-full px-3.5 py-1.5 mb-6 max-w-full">
            <Radio className="w-3 h-3 text-emerald-400 shrink-0 es-glow-pulse" />
            <span key={tickerText} className="es-fade-up truncate">{tickerText}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            We Build The Room, People <span className="es-gradient-text">Connect</span> In
          </h1>
          <p className="text-gray-200 mt-5 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
            EventSphere connects organizers, exhibitors, and attendees — from the first
            floor plan to the handshake on the show floor
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton
              as={Link}
              to="/events"
              strength={0.25}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-2xl shadow-black/30"
            >
              Explore upcoming events <ArrowRight className="w-4 h-4" />
            </MagneticButton>
            <Link
              to="/exhibitors"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-white/40 transition-colors px-6 py-3.5 text-base font-semibold text-white"
            >
              Browse exhibitors
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-8 text-gray-300 text-base flex-wrap">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                {i > 0 && <span className="w-px h-4 bg-white/20" />}
                <span className="flex items-center gap-2">
                  <span className="text-white font-semibold"><CountUp value={s.value} /></span> {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- STORY / TIMELINE ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Reveal className="max-w-2xl mb-16">
          <SectionHeading>
            Started because booking a booth shouldn't take eleven emails.
          </SectionHeading>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            The first version of EventSphere was a shared spreadsheet for one conference.
            An organizer friend was manually approving exhibitor applications by email and
            redrawing the floor plan by hand every time a booth changed hands. We built a
            small tool to fix that — and kept building as more organizers asked for the
            same thing.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIMELINE.map(({ year, icon: Icon, title, description }, i) => (
            <Reveal key={year} delay={i * 100}>
              <TiltCard max={6} className="h-full rounded-2xl">
                <div className="h-full rounded-2xl border border-slate-100 p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-shadow duration-300 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </span>
                    <span className="text-base font-bold text-blue-600">{year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0a0f1e] mb-2.5">{title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed">{description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- VALUES ---------- */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <SectionHeading className="max-w-lg">What we get right, every single event.</SectionHeading>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, description }, i) => (
              <Reveal key={title} delay={i * 100}>
                <TiltCard max={6} className="h-full rounded-2xl">
                  <div className="h-full bg-white rounded-2xl border border-slate-100 p-8 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-shadow duration-300">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-[#0a0f1e]">{title}</h3>
                    <p className="mt-3 text-base text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TEAM ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Reveal>
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-semibold">The people behind it</span>
          </div>
          <SectionHeading className="max-w-lg">A small team, closely tied to every event we host.</SectionHeading>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 80}>
              <TiltCard max={6} className="h-full rounded-2xl">
                <div className="group relative h-full bg-white rounded-2xl border border-slate-100 p-7 text-center overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-shadow duration-300">
                  {/* accent glow that appears on hover */}
                  <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-blue-100/0 group-hover:bg-blue-100/60 blur-2xl transition-colors duration-500 pointer-events-none" />

                  <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0a0f1e] to-blue-700 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-900/10 ring-4 ring-white group-hover:scale-105 transition-transform duration-300">
                    {m.initials}
                  </div>

                  <p className="relative mt-5 text-lg font-bold text-[#0a0f1e]">{m.name}</p>
                  <span className="relative inline-block mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full px-3 py-1">
                    {m.role}
                  </span>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 mb-3">TESTIMONIALS</p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0a0f1e] leading-tight">
              What organizers and exhibitors say
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <TiltCard max={5} className="h-full rounded-2xl">
                  <div className="h-full bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <Quote className="w-9 h-9 text-blue-200 mb-5" />
                    <p className="text-lg text-slate-700 leading-relaxed mb-7">{t.quote}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 shrink-0 flex items-center justify-center text-white text-sm font-bold">
                        {t.name.split(' ').map((w) => w[0]).join('')}
                      </span>
                      <div>
                        <p className="text-base font-semibold text-[#0a0f1e]">{t.name}</p>
                        <p className="text-sm text-slate-400">{t.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA — Host an event ---------- */}
      <div className="relative overflow-hidden bg-[#050B1F] py-24">
        <ParticleField className="absolute inset-0 z-[1] pointer-events-none hidden sm:block mix-blend-screen" density={45} />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-blue-500/20 blur-[130px] es-blob pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-400/10 blur-[110px] pointer-events-none" />
        <Reveal className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center mb-7">
            <PlusCircle className="w-7 h-7 text-blue-300" />
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">Have an Event to Host?</h2>
          <p className="text-gray-300 text-lg mb-9 max-w-xl mx-auto">
            Reach thousands of industry professionals. List your expo, summit, or conference on EventSphere and get discovered.
          </p>
          <MagneticButton
            as={Link}
            to="/events"
            strength={0.25}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-900/40"
          >
            Register Now <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </Reveal>
      </div>

      {/* ---------- Get in touch ---------- */}
      <div className="bg-white py-24 border-t border-gray-100">
        <Reveal className="max-w-2xl mx-auto px-6 text-center">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center mb-7">
            <Mail className="w-7 h-7 text-blue-600" />
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">Want to talk to the team?</h2>
          <p className="text-gray-500 text-lg mb-9">
            Questions about hosting, exhibiting, or partnering with EventSphere — reach out and we'll get back to you.
          </p>
          <a
            href="mailto:hello@eventsphere.com"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-7 py-4 rounded-xl transition"
          >
            Email hello@eventsphere.com <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </div>
  )
}

export default About