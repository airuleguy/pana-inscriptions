'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RegistrationLayout } from '@/components/registration-layout';
import { ProtectedRoute } from '@/components/protected-route';
import type { Tournament } from '@/types';
import { APIService } from '@/lib/api';

function TournamentRegistrationLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    const loadTournament = async () => {
      try {
        // Validate that the tournament exists
        const tournamentData = await APIService.getTournament(tournamentId);
        setTournament(tournamentData);
        
        // Store tournament data in localStorage for consistency
        localStorage.setItem('selectedTournament', JSON.stringify(tournamentData));
        
        setLoading(false);
      } catch (error) {
        console.error('Tournament not found:', error);
        // Redirect to tournament selection if invalid tournament ID
        router.push('/tournament-selection');
      }
    };

    if (tournamentId) {
      loadTournament();
    } else {
      router.push('/tournament-selection');
    }
  }, [tournamentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return null; // Will redirect in useEffect
  }

  return <RegistrationLayout>{children}</RegistrationLayout>;
}

export default function TournamentRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <TournamentRegistrationLayoutContent>
        {children}
      </TournamentRegistrationLayoutContent>
    </ProtectedRoute>
  );
} 