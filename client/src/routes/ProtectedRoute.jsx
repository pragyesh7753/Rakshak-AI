import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createTokenGetter, verifyBackendSession } from '@/features/auth/services/backend-auth.service'

export function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [backendVerified, setBackendVerified] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function verifyWithBackend() {
      if (!isLoaded || !isSignedIn) {
        setVerifying(false)
        return
      }

      try {
        const getBackendToken = createTokenGetter(getToken)
        await verifyBackendSession(getBackendToken)
        setBackendVerified(true)
      } catch (err) {
        console.error('Backend verification failed:', err)
        setError(true)
      } finally {
        setVerifying(false)
      }
    }

    verifyWithBackend()
  }, [isLoaded, isSignedIn, getToken])

  if (!isLoaded || verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">Backend server is not running</p>
          <p className="text-gray-400 text-sm">Please start the backend server to continue</p>
        </div>
      </div>
    )
  }

  if (!backendVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  return children
}
