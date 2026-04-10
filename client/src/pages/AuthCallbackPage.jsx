import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const code = searchParams.get('code')
  const nextPath = useMemo(() => {
    const requested = searchParams.get('next') ?? '/dashboard'
    return requested.startsWith('/') ? requested : '/dashboard'
  }, [searchParams])

  useEffect(() => {
    let active = true

    async function completeAuth() {
      if (!code) {
        navigate('/login?error=auth_callback_failed', { replace: true })
        return
      }

      const supabase = createClient()
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!active) {
        return
      }

      if (exchangeError) {
        setError(exchangeError.message)
        return
      }

      navigate(nextPath, { replace: true })
    }

    completeAuth()

    return () => {
      active = false
    }
  }, [code, navigate, nextPath])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-center">
        <div>
          <p className="text-red-400">Authentication failed: {error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-gray-900"
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-cyan-400" />
        <p className="text-gray-300">Completing sign in...</p>
      </div>
    </div>
  )
}
