'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, MapPin, Globe, ArrowRight } from 'lucide-react';
import { APIService } from '@/lib/api';
import { Tournament } from '@/types';
import { countries, popularCountries } from '@/lib/countries';
import { ProtectedRoute } from '@/components/protected-route';
import { useTranslations } from '@/contexts/i18n-context';
import { useAuth } from '@/contexts/auth-context';
import { getLocalePrefix } from '@/lib/locale';

function TournamentSelectionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations('common');
  const { state: authState } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Americas countries from the popularCountries list (first 19 are Americas)
  const americasCountries = popularCountries.slice(0, 19);

  // Get current locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');

  // Format "YYYY-MM-DD" safely in local time to avoid UTC off-by-one
  const formatLocalDate = (isoDate: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return date.toLocaleDateString();
  };

  // Check if user is admin and can select any country
  const isAdmin = authState.user?.role === 'ADMIN';
  const userCountry = authState.user?.country || '';

  useEffect(() => {
    loadTournaments();
  }, []);

  // Auto-set user's country for delegates
  useEffect(() => {
    if (authState.user && !isAdmin && userCountry) {
      setSelectedCountry(userCountry);
    }
  }, [authState.user, isAdmin, userCountry]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await APIService.getUpcomingTournaments();
      setTournaments(data);
      
      // Auto-select the first active tournament if available
      const activeTournament = data.find(t => t.isActive);
      if (activeTournament) {
        setSelectedTournament(activeTournament);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const navigate = () => {
    if (selectedTournament && selectedCountry) {
      // Store the selections in localStorage for backward compatibility
      localStorage.setItem('selectedTournament', JSON.stringify(selectedTournament));
      localStorage.setItem('selectedCountry', selectedCountry);
      
      // Navigate to the tournament-centric registration URL with locale prefix
      router.push(`${localePrefix}/registration/tournament/${selectedTournament.id}/dashboard`);
    }
  };

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('tournamentSelection.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-blue-600">{t('tournamentSelection.steps.tournamentSelection')}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-gray-500">{t('tournamentSelection.steps.registration')}</span>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadTournaments} 
                  className="mt-4"
                >
                  {t('tournamentSelection.selectTournament.tryAgain')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tournament Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                {t('tournamentSelection.selectTournament.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('tournamentSelection.selectTournament.emptyState')}
                </p>
              ) : (
                <div className="grid gap-4">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTournament?.id === tournament.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tournament.name}</h3>
                            {tournament.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {t('tournamentSelection.selectTournament.active')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatLocalDate(tournament.startDate)} - {formatLocalDate(tournament.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tournament.location || t('tournamentSelection.selectTournament.locationTbd')}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t(`tournamentSelection.tournaments.${tournament.type}.description`)}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTournament?.id === tournament.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTournament?.id === tournament.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Country Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                {isAdmin ? t('tournamentSelection.selectCountry.title') : t('tournamentSelection.selectCountry.assignedCountry', 'Your Assigned Country')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedCountry} 
                onValueChange={setSelectedCountry}
                disabled={!isAdmin}
              >
                <SelectTrigger className={`w-full ${!isAdmin ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder={
                    isAdmin 
                      ? t('tournamentSelection.selectCountry.placeholder') 
                      : getCountryName(userCountry)
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin ? (
                    // Admin can select any Americas country
                    americasCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    // Delegate sees only their country
                    <SelectItem value={userCountry}>
                      <div className="flex items-center gap-2">
                        <span>{countries.find(c => c.code === userCountry)?.flag}</span>
                        <span>{countries.find(c => c.code === userCountry)?.name}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                {isAdmin 
                  ? t('tournamentSelection.selectCountry.eligibilityNote')
                  : t('tournamentSelection.selectCountry.delegateNote', 'Country selection is based on your user account permissions.')
                }
              </p>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          {(selectedTournament || selectedCountry) && (
            <Card className="shadow-lg border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">{t('tournamentSelection.selectionSummary.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTournament && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">{t('tournamentSelection.selectionSummary.tournament')}</span>
                    <span className="text-blue-900">{selectedTournament.name}</span>
                  </div>
                )}
                {selectedCountry && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">{t('tournamentSelection.selectionSummary.country')}</span>
                    <span className="text-blue-900">{getCountryName(selectedCountry)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={navigate}
              disabled={!selectedTournament || !selectedCountry}
              className="shadow-lg font-semibold px-8"
            >
              {t('tournamentSelection.continueButton')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentSelectionPage() {
  return (
    <ProtectedRoute>
      <TournamentSelectionContent />
    </ProtectedRoute>
  );
} 