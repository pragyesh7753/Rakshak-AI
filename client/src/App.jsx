import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'

export default function App() {
	useEffect(() => {
		document.documentElement.classList.add('dark')
	}, [])

	return (
		<Routes>
			<Route path="/" element={<HomePage />} />
			<Route
				path="/login"
				element={
					<PublicOnlyRoute>
						<LoginPage />
					</PublicOnlyRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<PublicOnlyRoute>
						<RegisterPage />
					</PublicOnlyRoute>
				}
			/>
			<Route
				path="/dashboard"
				element={
					<ProtectedRoute>
						<DashboardPage />
					</ProtectedRoute>
				}
			/>
			<Route path="/auth/callback" element={<AuthCallbackPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
