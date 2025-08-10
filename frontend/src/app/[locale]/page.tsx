'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MapPin, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/contexts/i18n-context';
import { APIService } from '@/lib/api';
import { Tournament } from '@/types';

export default function HomePage() {
  const { state, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslations('home');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // If authenticated, redirect to tournament selection
    if (state.isAuthenticated) {
      router.push('/tournament-selection');
    }
  }, [state.isAuthenticated, isLoading, router]);

  // Fetch upcoming tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setTournamentsLoading(true);
        const upcomingTournaments = await APIService.getUpcomingTournaments();
        setTournaments(upcomingTournaments);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        setTournaments([]);
      } finally {
        setTournamentsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  // If authenticated, don't show the landing page (will redirect)
  if (state.isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="secondary" className="mb-4 shadow-sm">
              <Globe className="w-4 h-4 mr-2" />
              {t('hero.badge')}
            </Badge>
            
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              {t('hero.title')}
              <span className="block text-3xl text-primary mt-2">{t('hero.year')}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
              <Button size="lg" asChild className="shadow-lg font-semibold">
                <Link href="/tournament-selection">
                  {t('hero.startRegistration')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="shadow-md border-2 font-semibold">
                <Link href="/login">
                  {t('hero.loginToDashboard')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Tournament Info */}
      <section id="tournament-info" className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              {t('tournamentInfo.title')}
            </h2>
            
            {tournamentsLoading ? (
              <div className="text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4" role="status" aria-label="Loading">
                  <span className="sr-only">Loading tournaments...</span>
                </div>
                <p className="text-muted-foreground">Loading tournament information...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center">
                <Trophy className="mx-auto w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No upcoming tournaments found.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon for new tournament announcements.</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Trophy className="w-5 h-5" />
                        {tournament.shortName}
                      </CardTitle>
                      <Badge variant="secondary" className="w-fit">
                        {tournament.type.replace('_', ' ')}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{tournament.location}</span>
                        </div>
                      </div>
                      {tournament.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {tournament.description}
                        </p>
                      )}
                      <div className="pt-2">
                        <Button asChild size="sm" className="w-full">
                          <Link href="/tournament-selection">
                            {t('hero.startRegistration')}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100 leading-relaxed">
            {t('cta.description')}
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" variant="secondary" asChild className="shadow-lg font-semibold">
              <Link href="/tournament-selection">
                {t('cta.startRegistration')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg font-semibold" asChild>
              <Link href="#tournament-info">
                {t('cta.learnMore')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 