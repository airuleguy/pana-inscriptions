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
import { APIService } from '@/lib/api';
import { Scale, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JudgeRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { addJudge } = useRegistration();
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
      toast.error('Please select at least one judge to register.');
      return;
    }

    if (!selectedTournament || !selectedCountry) {
      toast.error('Missing tournament or country selection.');
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

        toast.success('Judges registered!', {
          description: `Successfully registered ${response.results.length} judge(s) with PENDING status in the backend.`,
          duration: 5000,
        });

        // Reset form
        setSelectedJudges([]);
      } else {
        // Handle API errors
        const errorMessage = response.errors?.join(', ') || 'Failed to register judges';
        
        toast.error('Registration failed', {
          description: errorMessage,
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('Failed to register judges:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register judges with backend. Please try again.';
      
      toast.error('Registration error', {
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
          <p className="text-muted-foreground">Loading judge registration...</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null;
  }

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-purple-600" />
            Judge Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register certified judges for {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Judge Selection - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Judge Selection
              </CardTitle>
              <CardDescription>
                {selectedCountry 
                  ? `Select judges from ${getCountryByCode(selectedCountry)?.name} for tournament registration`
                  : 'Select a country first to view available judges'
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
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a Country</h3>
                  <p className="text-muted-foreground">
                    Choose your country from the dropdown above to view and select eligible judges
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {selectedJudges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Add any special requirements or notes for the judging panel registration (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional information about the judges or special requirements..."
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
                      {registrationResult.success ? 'Registration Successful!' : 'Registration Failed'}
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
              {submitting ? 'Adding to summary...' : 'Add to Summary'}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push(`/registration/tournament/${tournamentId}/choreography`)}
            >
              Continue to Choreography Registration
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push(`/registration/tournament/${tournamentId}/dashboard`)}
            >
              View Registration Summary
            </Button>
          </div>
        </div>
    </div>
  );
} 