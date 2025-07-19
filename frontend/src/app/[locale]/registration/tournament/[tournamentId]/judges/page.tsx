'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JudgeDataTable } from '@/components/forms/judge-data-table';
import { getCountryByCode } from '@/lib/countries';
import type { Judge, Tournament } from '@/types';
import { useRegistration, RegisteredJudge } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
import { APIService } from '@/lib/api';
import { Scale, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JudgeRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { addJudge } = useRegistration();
  const { t } = useTranslations('common');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    judges?: Judge[];
  } | null>(null);


  // Load tournament and country from localStorage and URL
  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentData = localStorage.getItem('selectedTournament');
        const countryData = localStorage.getItem('selectedCountry');

        if (!tournamentData || !countryData) {
          router.push('/tournament-selection');
          return;
        }

        const tournament = JSON.parse(tournamentData);
        
        // Validate that the tournament ID from URL matches the stored one
        if (tournament.id !== tournamentId) {
          router.push('/tournament-selection');
          return;
        }

        setSelectedTournament(tournament);
        setSelectedCountry(countryData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament data:', error);
        router.push('/tournament-selection');
      }
    };

    if (tournamentId) {
      loadData();
    } else {
      router.push('/tournament-selection');
    }
  }, [tournamentId, router]);

  // Check if form is valid
  const isFormValid = selectedCountry && 
    selectedTournament &&
    selectedJudges.length > 0;

  // Handle registration submission
  const handleSaveSelected = async () => {
    if (selectedJudges.length === 0) {
      toast.error(t('judges.selectAtLeastOne'));
      return;
    }

    if (!selectedTournament || !selectedCountry) {
      toast.error(t('judges.missingData'));
      return;
    }

    setSubmitting(true);
    try {
      // Register judges with backend API immediately
      const response = await APIService.saveJudgeSelections(selectedJudges, selectedTournament.id);

      if (response.success && response.results.length > 0) {
        // Create registration entries for local state with actual backend data
        const registrationData: RegisteredJudge[] = response.results.map(judge => ({
          id: judge.id,
          name: judge.fullName,
          category: judge.category,
          country: judge.country,
          registeredAt: judge.createdAt ? new Date(judge.createdAt) : new Date(),
          status: 'PENDING',
          judgeData: judge,
        }));

        // Add to registration summary
        registrationData.forEach(judgeReg => addJudge(judgeReg));

        toast.success(t('judges.registrationSuccess'), {
          description: `${t('judges.registrationSuccessDescription').replace('{count}', response.results.length.toString())}`,
          duration: 5000,
        });

        // Reset form
        setSelectedJudges([]);
      } else {
        // Handle API errors
        const errorMessage = response.errors?.join(', ') || t('judges.registrationErrorDescription');
        
        toast.error(t('judges.registrationFailedTitle'), {
          description: errorMessage,
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('Failed to register judges:', error);
      const errorMessage = error instanceof Error ? error.message : t('judges.registrationErrorDescription');
      
      toast.error(t('judges.registrationError'), {
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
          <p className="text-muted-foreground">{t('judges.loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null;
  }

  const countryInfo = getCountryByCode(selectedCountry);

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-600" />
            {t('judges.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('judges.description')} {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Judge Selection - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                {t('judges.selectionTitle')}
              </CardTitle>
              <CardDescription>
                {selectedCountry && countryInfo
                  ? t('judges.selectionDescription').replace('{country}', countryInfo.name)
                  : t('judges.selectionDescriptionFallback')
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCountry ? (
                <JudgeDataTable
                  countryCode={selectedCountry}
                  selectedJudges={selectedJudges}
                  onSelectionChange={setSelectedJudges}
                  maxSelection={5} // Allow up to 5 judges per country
                  disabled={!selectedTournament}
                />
              ) : (
                <div className="text-center py-12">
                  <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t('judges.selectCountryTitle')}</h3>
                  <p className="text-muted-foreground">
                    {t('judges.selectCountryDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {selectedJudges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('judges.additionalNotesTitle')}</CardTitle>
                <CardDescription>
                  {t('judges.additionalNotesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('judges.notesLabel')}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t('judges.notesPlaceholder')}
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
                      {registrationResult.success ? t('judges.registrationSuccessful') : t('judges.registrationFailed')}
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
              {submitting ? t('judges.addingToSummary') : t('judges.addToSummary')}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push(`/registration/tournament/${tournamentId}/choreography`)}
            >
              {t('judges.continueToChoreography')}
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push(`/registration/tournament/${tournamentId}/dashboard`)}
            >
              {t('judges.viewSummary')}
            </Button>
          </div>
        </div>
    </div>
  );
} 