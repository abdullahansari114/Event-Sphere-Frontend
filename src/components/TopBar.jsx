import { Mail, Phone } from 'lucide-react'

const socialGlyphs = {
  Facebook: 'f',
  Instagram: 'ig',
  Twitter: 'x',
  Linkedin: 'in',
}
const SocialIcon = ({ name, className = '' }) => (
  <span className={`inline-flex items-center justify-center font-bold ${className}`} style={{ fontSize: '0.65em' }}>
    {socialGlyphs[name]}
  </span>
)

const TopBar = () => {
  return (
    <div className="relative bg-gradient-to-r from-[#040814] via-[#050b1c] to-[#040814] text-gray-300 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-10 flex items-center justify-between text-xs relative">
        <div className="flex items-center gap-6">
          <a href="mailto:hello@eventsphere.com" className="flex items-center gap-2 text-gray-400 hover:text-sky-400 transition-colors duration-200">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/10">
              <Mail className="w-3 h-3 text-sky-400" />
            </span>
            <span className="hidden sm:inline tracking-wide">hello@eventsphere.com</span>
          </a>
          <a href="tel:+922135551234" className="flex items-center gap-2 text-gray-400 hover:text-sky-400 transition-colors duration-200">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-500/10">
              <Phone className="w-3 h-3 text-sky-400" />
            </span>
            <span className="tracking-wide">+92 21 3555 1234</span>
          </a>
        </div>

        <div className="flex items-center gap-5">
          <span className="hidden md:inline text-gray-500 italic tracking-wide">Where Events Come to Life</span>
          <div className="hidden sm:flex items-center gap-2 pl-5 border-l border-white/10">
            {['Facebook', 'Instagram', 'Twitter', 'Linkedin'].map((name) => (
              <a key={name} href="#" className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 bg-white/[0.03] border border-white/5 hover:text-white hover:bg-sky-500 hover:border-sky-500 hover:shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-200">
                <SocialIcon name={name} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar