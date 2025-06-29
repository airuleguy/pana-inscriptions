'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationSummarySidebar } from './registration-summary-sidebar';
import { useRegistration } from '@/contexts/registration-context';
import { toast } from 'sonner';

export function RegistrationSummaryManager() {
  const router = useRouter();
  const { state, clearAll, getTotalCount, toggleSidebar, closeSidebar } = useRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      // Here you could make API calls to confirm the registration
      // For now, we'll just show a success message and clear the summary
      
      const totalItems = getTotalCount();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Registration confirmed! ${totalItems} items successfully registered.`, {
        description: 'You will receive a confirmation email shortly.',
        duration: 5000,
      });

      // Clear the registration summary
      clearAll();
      
      // Close the sidebar
      closeSidebar();
      
      // Get tournament ID from localStorage and redirect to tournament-centric dashboard
      const tournamentData = localStorage.getItem('selectedTournament');
      if (tournamentData) {
        try {
          const tournament = JSON.parse(tournamentData);
          router.push(`/registration/tournament/${tournament.id}/dashboard`);
        } catch (error) {
          console.error('Error parsing tournament data:', error);
          router.push('/tournament-selection');
        }
      } else {
        router.push('/tournament-selection');
      }
      
    } catch (error) {
      console.error('Registration confirmation failed:', error);
      toast.error('Failed to confirm registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegistrationSummarySidebar
      isOpen={state.isSidebarOpen}
      onToggle={toggleSidebar}
      onConfirmRegistration={handleConfirmRegistration}
      isSubmitting={isSubmitting}
    />
  );
} 