'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const { state } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldX className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You don&apos;t have permission to access this resource.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {state.user && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p><strong>Current Role:</strong> {state.user.role}</p>
                <p><strong>Country:</strong> {state.user.country}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              If you believe this is an error, please contact the system administrator.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/tournament-selection">
                  Go to Tournament Selection
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/login">
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 