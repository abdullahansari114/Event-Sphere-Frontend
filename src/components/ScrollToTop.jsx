import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Whenever the route (path) changes, jump the window back to the top.
// Without this, React Router keeps the browser's natural scroll position,
// so navigating to a new page can open scrolled halfway down instead of
// starting at the top.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
