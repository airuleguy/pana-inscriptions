'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MapPin, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useTranslations } from '@/contexts/i18n-context';

export default function HomePage() {
  const { state, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslations('home');

  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isLoading) return;

    // If authenticated, redirect to tournament selection
    if (state.isAuthenticated) {
      router.push('/tournament-selection');
    }
  }, [state.isAuthenticated, isLoading, router]);

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
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              {t('tournamentInfo.title')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-5 h-5" />
                    {t('tournamentInfo.importantDates.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.importantDates.registrationOpens')}</span>
                    <span className="text-muted-foreground">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.importantDates.registrationCloses')}</span>
                    <span className="text-muted-foreground">March 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.importantDates.championshipDates')}</span>
                    <span className="text-muted-foreground">April 20-25, 2024</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-5 h-5" />
                    {t('tournamentInfo.locationLimits.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.locationLimits.hostCity')}</span>
                    <span className="text-muted-foreground">{t('tournamentInfo.locationLimits.tbd')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.locationLimits.maxPerCategory')}</span>
                    <span className="text-muted-foreground">{t('tournamentInfo.locationLimits.fourChoreographies')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">{t('tournamentInfo.locationLimits.eligibleCountries')}</span>
                    <span className="text-muted-foreground">{t('tournamentInfo.locationLimits.allAmericas')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
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