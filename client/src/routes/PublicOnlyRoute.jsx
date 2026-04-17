import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function PublicOnlyRoute({ children, redirectTo = '/dashboard' }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (isSignedIn) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
