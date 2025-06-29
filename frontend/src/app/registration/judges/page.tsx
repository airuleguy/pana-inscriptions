'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JudgeDataTable } from '@/components/forms/judge-data-table';
import { TournamentNav } from '@/components/ui/tournament-nav';
import { RegistrationCartSidebar } from '@/components/registration-cart-sidebar';
import { getCountryByCode } from '@/lib/countries';
import type { Judge, Tournament } from '@/types';
import { useRegistration, RegisteredJudge } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { Scale, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JudgeRegistrationPage() {
  const router = useRouter();
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleRegistrationSummary = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConfirmRegistration = async () => {
    // Redirect to dashboard for final registration
    router.push('/registration/dashboard');
  };

  // Load tournament and country from localStorage
  useEffect(() => {
    const tournamentData = localStorage.getItem('selectedTournament');
    const countryData = localStorage.getItem('selectedCountry');

    if (!tournamentData || !countryData) {
      // Redirect to tournament selection if no selections found
      router.push('/tournament-selection');
      return;
    }

    try {
      setSelectedTournament(JSON.parse(tournamentData));
      setSelectedCountry(countryData);
    } catch (error) {
      console.error('Error parsing stored data:', error);
      router.push('/tournament-selection');
      return;
    }

    setLoading(false);
  }, [router]);

  // Check if form is valid
  const isFormValid = selectedCountry && 
    selectedTournament &&
    selectedJudges.length > 0;

  // Handle registration submission
  const handleSubmit = async () => {
    if (!isFormValid || !selectedTournament) return;

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      // Save selections to database first
      const saveResult = await APIService.saveJudgeSelections(
        selectedJudges,
        selectedTournament.id,
        selectedCountry
      );

      if (!saveResult.success) {
        throw new Error(saveResult.errors?.join(', ') || 'Failed to save judge selections');
      }

      // Add judges to registration cart
      selectedJudges.forEach(judge => {
        const cartJudge: RegisteredJudge = {
          id: judge.id,
          name: judge.fullName,
          category: judge.categoryDescription,
          country: judge.country,
          registeredAt: new Date(),
          judgeData: judge, // Store original judge data for final submission
        };
        addJudge(cartJudge);
      });

      setRegistrationResult({
        success: true,
        message: `Successfully registered ${selectedJudges.length} judge(s) to the database and added to cart!`,
        judges: selectedJudges,
      });

      // Show success toast
      toast.success(`${selectedJudges.length} judge${selectedJudges.length > 1 ? 's' : ''} saved and added to cart!`, {
        description: 'Judges have been registered in the database and added to your cart.',
        duration: 3000,
      });

      // Reset form
      setSelectedJudges([]);
      setAdditionalNotes('');
      
    } catch (error: unknown) {
      console.error('Judge registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register judges. Please try again.';
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
          <p className="text-muted-foreground">Loading judge registration...</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Tournament Navigation */}
      <TournamentNav 
        currentPage="Judge Registration" 
        showRegistrationSummary={true}
        onToggleRegistrationSummary={handleToggleRegistrationSummary}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-blue-600" />
            Judge Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register certified judges for your selected tournament
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

          {/* Registration Summary */}
          {selectedJudges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Registration Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-foreground">Tournament</div>
                    <div className="text-muted-foreground">
                      {selectedTournament?.name || 'Not selected'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Country</div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      {selectedCountry && getCountryByCode(selectedCountry)?.flag}
                      {getCountryByCode(selectedCountry)?.name || 'Not selected'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Judges Selected</div>
                    <div className="text-muted-foreground">
                      {selectedJudges.length} judge{selectedJudges.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the judges or special requirements..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={handleSubmit}
                      disabled={!isFormValid || submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding to Cart...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Add {selectedJudges.length} Judge{selectedJudges.length !== 1 ? 's' : ''} to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Registration Result */}
        {registrationResult && (
          <Card className={`mt-6 border-2 ${registrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {registrationResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-medium ${registrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {registrationResult.success ? 'Added to Cart Successfully!' : 'Failed to Add to Cart'}
                  </h3>
                  <p className={`mt-1 ${registrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {registrationResult.message}
                  </p>
                  {registrationResult.success && registrationResult.judges && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-800 mb-2">Added to Cart:</h4>
                      <div className="space-y-1">
                        {registrationResult.judges.map((judge) => (
                          <div key={judge.id} className="flex items-center gap-2 text-sm text-green-700">
                            <Scale className="w-3 h-3" />
                            {judge.firstName} {judge.lastName} - Category {judge.category}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <RegistrationCartSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleRegistrationSummary}
        onConfirmRegistration={handleConfirmRegistration}
        isSubmitting={false}
      />
    </div>
  );
}