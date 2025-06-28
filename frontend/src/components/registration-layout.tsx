'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationCartSidebar } from './registration-cart-sidebar';
import { useRegistration } from '@/contexts/registration-context';
import { toast } from 'sonner';

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const router = useRouter();
  const { clearAll, getTotalCount } = useRegistration();

  const handleConfirmRegistration = async () => {
    try {
      // Here you could make API calls to confirm the registration
      // For now, we'll just show a success message and clear the cart
      
      const totalItems = getTotalCount();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Registration confirmed! ${totalItems} items successfully registered.`, {
        description: 'You will receive a confirmation email shortly.',
        duration: 5000,
      });

      // Clear the registration cart
      clearAll();
      
      // Redirect to dashboard or confirmation page
      router.push('/registration/dashboard');
      
    } catch (error) {
      console.error('Registration confirmation failed:', error);
      toast.error('Failed to confirm registration. Please try again.');
    }
  };

  return (
    <>
      {children}
    </>
  );
} 