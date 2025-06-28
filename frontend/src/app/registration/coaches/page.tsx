'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CoachDataTable } from '@/components/forms/coach-data-table';
import { TournamentNav } from '@/components/ui/tournament-nav';
import { RegistrationCartSidebar } from '@/components/registration-cart-sidebar';
import { APIService } from '@/lib/api';
import { countries, getCountryByCode } from '@/lib/countries';
import type { Coach, Tournament } from '@/types';
import { useRegistration, RegisteredCoach } from '@/contexts/registration-context';
import { GraduationCap, Users, Save, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function CoachRegistrationPage() {
  const router = useRouter();
  const { addCoach, clearAll, getTotalCount } = useRegistration();
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleRegistrationSummary = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConfirmRegistration = async () => {
    try {
      const totalItems = getTotalCount();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Registration confirmed! ${totalItems} items successfully registered.`, {
        description: 'You will receive a confirmation email shortly.',
        duration: 5000,
      });

      // Clear the registration cart
      clearAll();
      
      // Close the sidebar
      setIsSidebarOpen(false);
      
      // Redirect to dashboard or confirmation page
      router.push('/registration/dashboard');
      
    } catch (error) {
      console.error('Registration confirmation failed:', error);
      toast.error('Failed to confirm registration. Please try again.');
    }
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
    selectedCoaches.length > 0;

  // Handle registration submission
  const handleSubmit = async () => {
    if (!isFormValid || !selectedTournament) return;

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      // For now, we'll simulate a successful registration
      // In a real implementation, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Add coaches to registration cart
      selectedCoaches.forEach(coach => {
        const cartCoach: RegisteredCoach = {
          id: coach.id,
          name: coach.fullName,
          level: coach.levelDescription,
          country: coach.country,
          registeredAt: new Date(),
        };
        addCoach(cartCoach);
      });

      setRegistrationResult({
        success: true,
        message: `Successfully registered ${selectedCoaches.length} coach(es) for ${selectedTournament.name}!`,
        coaches: selectedCoaches,
      });

      // Show success toast
      toast.success(`${selectedCoaches.length} coach${selectedCoaches.length > 1 ? 'es' : ''} added to cart!`, {
        description: 'Coaches have been added to your registration cart.',
        duration: 3000,
      });

      // Reset form
      setSelectedCoaches([]);
      setAdditionalNotes('');
      
    } catch (error: unknown) {
      console.error('Registration failed:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Tournament Navigation */}
      <TournamentNav 
        currentPage="Coach Registration" 
        showRegistrationSummary={true}
        onToggleRegistrationSummary={handleToggleRegistrationSummary}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            Coach Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register certified coaches for your selected tournament
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

          {/* Registration Summary */}
          {selectedCoaches.length > 0 && (
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
                    <div className="font-medium text-foreground">Coaches Selected</div>
                    <div className="text-muted-foreground">
                      {selectedCoaches.length} coach{selectedCoaches.length !== 1 ? 'es' : ''}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the coaches or special requirements..."
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
                          Registering Coaches...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Register {selectedCoaches.length} Coach{selectedCoaches.length !== 1 ? 'es' : ''}
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
                    {registrationResult.success ? 'Registration Successful!' : 'Registration Failed'}
                  </h3>
                  <p className={`mt-1 ${registrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {registrationResult.message}
                  </p>
                  {registrationResult.success && registrationResult.coaches && (
                    <div className="mt-4">
                      <h4 className="font-medium text-green-800 mb-2">Registered Coaches:</h4>
                      <div className="space-y-1">
                        {registrationResult.coaches.map((coach) => (
                          <div key={coach.id} className="flex items-center gap-2 text-sm text-green-700">
                            <GraduationCap className="w-3 h-3" />
                            {coach.firstName} {coach.lastName} - {coach.level}
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
      />
    </div>
  );
} 