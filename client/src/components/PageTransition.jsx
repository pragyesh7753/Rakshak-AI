import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Wraps page content with a fade-in animation on every route change
 * and automatically scrolls to the top of the page.
 */
export function PageTransition({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  )
}
