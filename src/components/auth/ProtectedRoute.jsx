import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Route guard component defending Member Portal pages.
 * Verifies authentication status and redirects unauthorized visitors to /member-login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading session...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/member-login" state={{ from: location }} replace />
  }

  // Strictly enforce Member account (role: Member or User; reject Admin / Super Admin)
  const isMember = user?.role === 'Member' || user?.role === 'User'
  if (!isMember) {
    return <Navigate to="/member-login" replace />
  }

  return children
}

