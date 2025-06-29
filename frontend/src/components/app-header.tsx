'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { AuthHeader } from '@/components/auth-header';

// Routes that shouldn't show the header
const HEADER_EXCLUDED_ROUTES = ['/login', '/unauthorized'];

export function AppHeader() {
  const pathname = usePathname();
  const { state } = useAuth();

  // Don't show header on login or unauthorized pages
  if (HEADER_EXCLUDED_ROUTES.includes(pathname)) {
    return null;
  }

  // Don't show header if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/tournament-selection">
            <span className="font-bold text-lg">Panamerican Championship</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Space for navigation or search if needed */}
          </div>
          
          <AuthHeader />
        </div>
      </div>
    </header>
  );
} 