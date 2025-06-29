'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireRole?: 'DELEGATE' | 'ADMIN';
}

export function ProtectedRoute({ children, redirectTo = '/login', requireRole }: ProtectedRouteProps) {
  const { state, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!state.isAuthenticated || !state.user) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements if specified
    if (requireRole && state.user.role !== requireRole) {
      // Could redirect to an "unauthorized" page or back to login
      console.warn(`Access denied: required role ${requireRole}, user has ${state.user.role}`);
      router.push('/unauthorized');
      return;
    }
  }, [state.isAuthenticated, state.user, isLoading, router, redirectTo, requireRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  // Check role requirements
  if (requireRole && state.user.role !== requireRole) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="ADMIN">
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for delegate routes (default)
export function DelegateRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireRole="DELEGATE">
      {children}
    </ProtectedRoute>
  );
} 