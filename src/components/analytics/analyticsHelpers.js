import { useEffect, useState } from 'react'

// Shared constants + hooks for analytics (the components live in a separate file: analyticsKit.jsx)

export const THEMES = {
  light: {
    text: '#0f172a',
    muted: '#64748b',
    axis: '#94a3b8',
    grid: '#f1f5f9',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e2e8f0',
    track: '#f1f5f9',
    line: '#3b82f6',
    fillFrom: 'rgba(59,130,246,0.35)',
  },
  dark: {
    text: '#f1f5f9',
    muted: '#94a3b8',
    axis: '#64748b',
    grid: 'rgba(148,163,184,0.12)',
    tooltipBg: '#0b1220',
    tooltipBorder: 'rgba(34,211,238,0.35)',
    track: 'rgba(148,163,184,0.16)',
    line: '#22d3ee',
    fillFrom: 'rgba(34,211,238,0.35)',
  },
}

export const PALETTE = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#f97316']
export const BOOTH_COLORS = { Available: '#3b82f6', Reserved: '#f59e0b', Occupied: '#10b981' }
export const STATUS_COLORS = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }

// ---------- hooks ----------

// Becomes true (once) when the element scrolls into view — the count-up / bars animations start from this
export const useInView = (threshold = 0.15) => {
  // Callback ref: the observer still gets attached even if the element mounts later (e.g. after data arrives)
  const [node, setNode] = useState(null)
  // If IntersectionObserver isn't available (older browser), just treat it as visible
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (!node || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [node, threshold])
  return [setNode, inView]
}

export const useCountUp = (target, active, duration = 1000) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])
  return val
}
