'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CoachDataTable } from '@/components/forms/coach-data-table';
import { getCountryByCode } from '@/lib/countries';
import type { Coach, Tournament } from '@/types';
import { useRegistration, RegisteredCoach } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
import { APIService } from '@/lib/api';
import { getLocalePrefix } from '@/lib/locale';
import { GraduationCap, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CoachRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = params.tournamentId as string;
  const { addCoach } = useRegistration();
  const { t } = useTranslations('common');
  
  // Get locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoaches, setSelectedCoaches] = useState<Coach[]>([]);
  const [clubName, setClubName] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    coaches?: Coach[];
  } | null>(null);


  // Load tournament and country from localStorage and URL
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get tournament data from localStorage (set by layout)
        const tournamentData = localStorage.getItem('selectedTournament');
        const countryData = localStorage.getItem('selectedCountry');

        if (!tournamentData || !countryData) {
          // Redirect to tournament selection if no selections found
          router.push(`${localePrefix}/tournament-selection`);
          return;
        }

        const tournament = JSON.parse(tournamentData);
        
        // Validate that the tournament ID from URL matches the stored one
        if (tournament.id !== tournamentId) {
          router.push(`${localePrefix}/tournament-selection`);
          return;
        }

        setSelectedTournament(tournament);
        setSelectedCountry(countryData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament data:', error);
        router.push(`${localePrefix}/tournament-selection`);
      }
    };

    if (tournamentId) {
      loadData();
    } else {
      router.push(`${localePrefix}/tournament-selection`);
    }
  }, [tournamentId, router]);

  // Check if form is valid
  const isFormValid = selectedCountry && 
    selectedTournament &&
    selectedCoaches.length > 0;

  // Handle registration submission
  const handleSaveSelected = async () => {
    if (selectedCoaches.length === 0) {
      toast.error(t('coaches.selectAtLeastOne'));
      return;
    }

    if (!selectedTournament || !selectedCountry) {
      toast.error(t('coaches.missingData'));
      return;
    }

    setSubmitting(true);
    try {
      // Add club information to selected coaches
      const coachesWithClub = selectedCoaches.map(coach => ({
        ...coach,
        club: clubName.trim() || undefined
      }));
      
      // Register coaches with backend API immediately
      const response = await APIService.saveCoachSelections(coachesWithClub, selectedTournament.id);

      if (response.success && response.results.length > 0) {
        // Create registration entries for local state with actual backend data
        const registrationData: RegisteredCoach[] = response.results.map(coach => ({
          id: coach.id,
          name: coach.fullName,
          level: coach.level,
          country: coach.country,
          registeredAt: coach.createdAt ? new Date(coach.createdAt) : new Date(),
          status: 'PENDING',
          coachData: coach,
        }));

        // Add to registration summary
        registrationData.forEach(coachReg => addCoach(coachReg));

        toast.success(t('coaches.registrationSuccess'), {
          description: `${t('coaches.registrationSuccessDescription').replace('{count}', response.results.length.toString())}`,
          duration: 5000,
        });

        // Reset form
        setSelectedCoaches([]);
        setClubName('');
      } else {
        // Handle API errors
        const errorMessage = response.errors?.join(', ') || t('coaches.registrationErrorDescription');
        
        toast.error(t('coaches.registrationFailedTitle'), {
          description: errorMessage,
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('Failed to register coaches:', error);
      const errorMessage = error instanceof Error ? error.message : t('coaches.registrationErrorDescription');
      
      toast.error(t('coaches.registrationError'), {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('coaches.loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null; // This will be handled by the redirect in useEffect
  }

  const countryInfo = getCountryByCode(selectedCountry);

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            {t('coaches.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('coaches.description')} {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Coach Selection - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                {t('coaches.selectionTitle')}
              </CardTitle>
              <CardDescription>
                {selectedCountry && countryInfo
                  ? t('coaches.selectionDescription').replace('{country}', countryInfo.name)
                  : t('coaches.selectionDescriptionFallback')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCountry ? (
                <CoachDataTable
                  countryCode={selectedCountry}
                  selectedCoaches={selectedCoaches}
                  onSelectionChange={setSelectedCoaches}
                  maxSelection={5} // Allow up to 5 coaches per country
                  disabled={!selectedTournament}
                />
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t('coaches.selectCountryTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('coaches.selectCountryDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Club Information */}
          {selectedCoaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Club Information (Optional)</CardTitle>
                <CardDescription>
                  Specify club name for all selected coaches. Leave empty for country-level tournaments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="club">{t('fields.club.name')}</Label>
                  <Input
                    id="club"
                    placeholder={t('fields.club.placeholder')}
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{t('fields.club.descriptionBulk')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {selectedCoaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('coaches.additionalNotesTitle')}</CardTitle>
                <CardDescription>
                  {t('coaches.additionalNotesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('coaches.notesLabel')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('coaches.notesPlaceholder')}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Result */}
          {registrationResult && (
            <Card className={registrationResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {registrationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${registrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {registrationResult.success ? t('coaches.registrationSuccessful') : t('coaches.registrationFailed')}
                    </p>
                    <p className={`text-sm mt-1 ${registrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {registrationResult.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6">
            <Button
              onClick={handleSaveSelected}
              disabled={!isFormValid || submitting}
              size="lg"
              className="flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {submitting ? t('coaches.addingToSummary') : t('coaches.addToSummary')}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/judges`)}
            >
              {t('coaches.continueToJudges')}
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/dashboard`)}
            >
              {t('coaches.viewSummary')}
            </Button>
          </div>
        </div>
    </div>
  );
} 