import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function AuthCallbackPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-cyan-400" />
          <p className="text-gray-300">Completing sign in...</p>
        </div>
      </div>
    )
  }

  return <Navigate to={isSignedIn ? '/dashboard' : '/login'} replace />
}
