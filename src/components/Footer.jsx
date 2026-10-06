import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  ArrowUp, 
  Globe 
} from 'lucide-react'

// Custom SVG Icons for Social Media to avoid Lucide React import issues
const SocialFacebook = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const SocialX = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const SocialLinkedin = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const SocialInstagram = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const SocialYoutube = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-[#050b18] text-white font-sans overflow-hidden border-t border-blue-900/30">
      
      {/* --- TOP CTA BANNER SECTION --- */}
      <div className="relative border-b border-blue-900/40 py-16 px-6 sm:px-10 overflow-hidden">
        {/* Background Image / Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-[#09152a]/90 to-blue-950/80 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-blue-600/20 blur-[130px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-cyan-400 uppercase mb-2 block">
              GET STARTED
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Ready to Be Part of Something Bigger?
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/70 max-w-xl leading-relaxed">
              Join thousands of professionals, innovators and business leaders at the world's most inspiring events.
            </p>
          </div>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all hover:scale-105 shrink-0"
          >
            Join 10,000+ Professionals Today <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* --- MAIN FOOTER LINKS & NEWSLETTER --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center p-1.5 shadow-md shadow-cyan-500/30">
                <div className="w-full h-full border-2 border-white rounded-sm rotate-45" />
              </div>
              <span>EventSphere</span>
            </Link>

            <p className="text-xs text-blue-200/60 font-medium tracking-wide">
              Events <span className="mx-1.5">|</span> Connections <span className="mx-1.5">|</span> Growth
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {[
                { icon: SocialFacebook, href: '#' },
                { icon: SocialX, href: '#' },
                { icon: SocialLinkedin, href: '#' },
                { icon: SocialInstagram, href: '#' },
                { icon: SocialYoutube, href: '#' }
              ].map((social, idx) => {
                const Icon = social.icon
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className="w-8 h-8 rounded-full bg-blue-950/60 border border-blue-800/40 hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center text-blue-200 hover:text-white transition-all duration-300"
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-blue-200/70">
              {['Home', 'Events', 'Exhibitors', 'About', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`} 
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-blue-200/70">
              {['Help Center', 'Privacy Policy', 'Terms & Conditions', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">
              Newsletter
            </h4>
            <p className="text-xs text-blue-200/60 leading-relaxed">
              Get the latest events, news and updates delivered to your inbox.
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center pt-1">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-blue-950/40 border border-blue-800/50 rounded-full py-2.5 pl-4 pr-12 text-xs text-white placeholder-blue-300/40 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-white hover:brightness-110 transition shadow-md shadow-cyan-500/20"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="pt-12 mt-12 border-t border-blue-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/50">
          <p>© 2025 EventSphere. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/events" className="hover:text-cyan-400 transition-colors">Events</Link>
            <Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>

            {/* Scroll to top button */}
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition ml-2 shadow-md shadow-blue-600/30"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer