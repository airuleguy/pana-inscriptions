'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RegistrationSummarySidebar } from './registration-summary-sidebar';
import { useRegistration } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
import { getLocalePrefix } from '@/lib/locale';
import { toast } from 'sonner';

export function RegistrationSummaryManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, clearAll, getPendingCount, toggleSidebar, closeSidebar, submitRegistrations } = useRegistration();
  const { t } = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');

  const handleConfirmRegistration = async () => {
    setIsSubmitting(true);
    try {
      const pendingCount = getPendingCount();
      
      if (pendingCount === 0) {
        toast.error(t('registration.errors.noPendingRegistrations'));
        return;
      }

      // Submit pending registrations to backend
      await submitRegistrations();
      
      toast.success(t('registration.success.submittedSuccessfully').replace('{count}', pendingCount.toString()), {
        description: t('registration.success.submittedDescription'),
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
      const errorMessage = error instanceof Error ? error.message : t('registration.errors.submissionFailed');
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