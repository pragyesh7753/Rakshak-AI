import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    let active = true

    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (!active) return
        setIsAuthed(Boolean(data?.user))
      } catch {
        if (!active) return
        setIsAuthed(false)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" replace />
  }

  return children
}
