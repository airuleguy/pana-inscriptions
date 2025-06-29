'use client';

import React, { useState } from 'react';
import { TournamentNav } from '@/components/ui/tournament-nav';
import { useRouter } from 'next/navigation';
import { RegistrationSummarySidebar } from './registration-summary-sidebar';
import { useRegistration } from '@/contexts/registration-context';
import { toast } from 'sonner';

interface RegistrationLayoutProps {
  children: React.ReactNode;
}

export function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const router = useRouter();
  const { clearAll, getTotalCount } = useRegistration();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      setIsSidebarOpen(false);
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TournamentNav 
        showRegistrationSummary={true}
        onToggleRegistrationSummary={handleToggleSidebar}
      />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Registration Summary Sidebar */}
      <RegistrationSummarySidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onConfirmRegistration={handleConfirmRegistration}
        isSubmitting={isSubmitting}
      />
    </div>
  );
} 