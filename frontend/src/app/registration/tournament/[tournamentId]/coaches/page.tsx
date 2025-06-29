'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CoachDataTable } from '@/components/forms/coach-data-table';
import { getCountryByCode } from '@/lib/countries';
import type { Coach, Tournament } from '@/types';
import { useRegistration, RegisteredCoach } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { GraduationCap, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CoachRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { addCoach } = useRegistration();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoaches, setSelectedCoaches] = useState<Coach[]>([]);
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
    selectedCoaches.length > 0;

  // Handle registration submission
  const handleSubmit = async () => {
    if (!isFormValid || !selectedTournament) return;

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      // Save selections to database using tournament-centric API
      const saveResult = await APIService.saveCoachSelections(
        selectedCoaches,
        tournamentId // Use tournament ID from URL
      );

      if (!saveResult.success) {
        throw new Error(saveResult.errors?.join(', ') || 'Failed to save coach selections');
      }

      // Save coaches to registration summary
      selectedCoaches.forEach(coach => {
        const selectedCoach: RegisteredCoach = {
          id: coach.id,
          name: coach.fullName,
          level: coach.levelDescription,
          country: coach.country,
          registeredAt: new Date(),
          coachData: coach, // Store original coach data for final submission
        };
        addCoach(selectedCoach);
      });

      setRegistrationResult({
        success: true,
        message: `Successfully registered ${selectedCoaches.length} coach(es) to the database and saved to summary!`,
        coaches: selectedCoaches,
      });

      // Show success toast
      toast.success(`${selectedCoaches.length} coach${selectedCoaches.length > 1 ? 'es' : ''} saved and added to summary!`, {
        description: 'Coaches have been registered in the database and saved to your summary.',
        duration: 3000,
      });

      // Reset form
      setSelectedCoaches([]);
      setAdditionalNotes('');
      
    } catch (error: unknown) {
      console.error('Coach registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register coaches. Please try again.';
      setRegistrationResult({
        success: false,
        message: errorMessage,
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
          <p className="text-muted-foreground">Loading coach registration...</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Coach Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register certified coaches for {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Coach Selection - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Coach Selection
              </CardTitle>
              <CardDescription>
                {selectedCountry 
                  ? `Select coaches from ${getCountryByCode(selectedCountry)?.name} for tournament registration`
                  : 'Select a country first to view available coaches'
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
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a Country</h3>
                  <p className="text-muted-foreground">
                    Choose your country from the dropdown above to view and select eligible coaches
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          {selectedCoaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Add any special requirements or notes for the coaching staff registration (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional information about the coaches or special requirements..."
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
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              size="lg"
              className="flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {submitting ? 'Registering...' : 'Save Coach Selections'}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push(`/registration/tournament/${tournamentId}/judges`)}
            >
              Continue to Judge Registration
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