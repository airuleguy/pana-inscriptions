'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CoachDataTable } from '@/components/forms/coach-data-table';
import { APIService } from '@/lib/api';
import { countries, popularCountries, getCountryByCode, type Country } from '@/lib/countries';
import type { Coach, Tournament } from '@/types';
import { GraduationCap, Users, Save, CheckCircle, AlertCircle, Loader2, AlertTriangle, Calendar, Trophy } from 'lucide-react';

export default function CoachRegistrationPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [selectedCoaches, setSelectedCoaches] = useState<Coach[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    coaches?: Coach[];
  } | null>(null);

  // Load tournaments on component mount
  useEffect(() => {
    async function loadTournaments() {
      try {
        const tournaments = await APIService.getTournaments();
        setAvailableTournaments(tournaments);
        // Auto-select the first active tournament
        const activeTournament = tournaments.find(t => t.isActive);
        if (activeTournament) {
          setSelectedTournament(activeTournament);
        }
      } catch (error) {
        console.error('Failed to load tournaments:', error);
      } finally {
        setLoadingTournaments(false);
      }
    }

    loadTournaments();
  }, []);

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

      setRegistrationResult({
        success: true,
        message: `Successfully registered ${selectedCoaches.length} coach(es) for ${selectedTournament.name}!`,
        coaches: selectedCoaches,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href="/">
                  ← Back to Homepage
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                Coach Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Register coaches for the Panamerican Aerobic Gymnastics Championship
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Tournament Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Tournament
                </CardTitle>
                <CardDescription>
                  Select the tournament for coach registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTournaments ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading tournaments...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Tournament</Label>
                    <Select
                      value={selectedTournament?.id || ''}
                      onValueChange={(value) => {
                        const tournament = availableTournaments.find(t => t.id === value);
                        setSelectedTournament(tournament || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tournament" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTournaments.map((tournament) => (
                          <SelectItem key={tournament.id} value={tournament.id}>
                            <div className="flex items-center gap-2">
                              <span>{tournament.name}</span>
                              {tournament.isActive && (
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedTournament && (
                      <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                        <h4 className="font-medium text-sm text-foreground mb-2">
                          {selectedTournament.name}
                        </h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(selectedTournament.startDate).toLocaleDateString()} - {new Date(selectedTournament.endDate).toLocaleDateString()}
                          </div>
                          <p className="text-xs">{selectedTournament.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Country Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Country Selection
                </CardTitle>
                <CardDescription>
                  Choose your country to load eligible coaches
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country">
                        {selectedCountry && getCountryByCode(selectedCountry) && (
                          <>
                            <span className="text-lg">{getCountryByCode(selectedCountry)!.flag}</span> {getCountryByCode(selectedCountry)!.name}
                          </>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Popular Countries First */}
                      <SelectGroup>
                        <SelectLabel>Popular Countries</SelectLabel>
                        {popularCountries.map((country: Country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      
                      {/* All Countries */}
                      <SelectGroup>
                        <SelectLabel>All Countries</SelectLabel>
                        {countries.map((country: Country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && (
                  <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span className="text-lg">{getCountryByCode(selectedCountry)?.flag}</span>
                      <span>{getCountryByCode(selectedCountry)?.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Coaches will be loaded from the FIG database for this country
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
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <div className="font-medium text-foreground">Coaches</div>
                      <div className="text-muted-foreground">
                        {selectedCoaches.length} selected
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the coaches or special requirements..."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

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
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column - Coach Selection */}
          <div className="lg:col-span-2">
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
          </div>

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
    </div>
  );
} 