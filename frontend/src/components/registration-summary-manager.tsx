'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RegistrationSummarySidebar } from './registration-summary-sidebar';
import { useRegistration } from '@/contexts/registration-context';
import { getLocalePrefix } from '@/lib/locale';
import { toast } from 'sonner';

export function RegistrationSummaryManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, clearAll, getPendingCount, toggleSidebar, closeSidebar, submitRegistrations } = useRegistration();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      const pendingCount = getPendingCount();
      
      if (pendingCount === 0) {
        toast.error('No pending registrations to submit.');
        return;
      }

      // Submit pending registrations to backend
      await submitRegistrations();
      
      toast.success(`Registration submitted successfully! ${pendingCount} items have been submitted.`, {
        description: 'Your registrations are now in SUBMITTED status and will be reviewed by administrators.',
        duration: 5000,
      });

      // Close the sidebar
      closeSidebar();
      
      // Get tournament ID from localStorage and redirect to tournament-centric dashboard
      const tournamentData = localStorage.getItem('selectedTournament');
      if (tournamentData) {
        try {
          const tournament = JSON.parse(tournamentData);
          router.push(`${localePrefix}/registration/tournament/${tournament.id}/dashboard`);
        } catch (error) {
          console.error('Error parsing tournament data:', error);
          router.push(`${localePrefix}/tournament-selection`);
        }
      } else {
        router.push(`${localePrefix}/tournament-selection`);
      }
      
    } catch (error) {
      console.error('Registration submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit registrations. Please try again.';
      toast.error(errorMessage);
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