'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GymnastSelector } from '@/components/forms/gymnast-selector';
import { APIService } from '@/lib/api';
import { 
  generateChoreographyName, 
  getCountryFlag, 
  determineChoreographyType, 
  getChoreographyTypeDisplayName,
  getChoreographyTypeColor,
  isValidGymnastCount
} from '@/lib/utils';
import type { Gymnast, Choreography, ChoreographyType, Tournament } from '@/types';
import { Trophy, Users, Save, CheckCircle, AlertCircle, Loader2, AlertTriangle, Calendar } from 'lucide-react';

// Sample countries with AER gymnasts
const SAMPLE_COUNTRIES = [
  { code: 'USA', name: 'United States' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'CAN', name: 'Canada' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'CHI', name: 'Chile' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ESP', name: 'Spain' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'ITA', name: 'Italy' },
  { code: 'RUS', name: 'Russia' },
  { code: 'CHN', name: 'China' },
  { code: 'JPN', name: 'Japan' },
  { code: 'AUS', name: 'Australia' },
];

export default function RegisterPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [availableTournaments, setAvailableTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [selectedGymnasts, setSelectedGymnasts] = useState<Gymnast[]>([]);
  const [routineDescription, setRoutineDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    choreography?: Choreography;
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

  // Infer gymnast count from selected gymnasts
  const gymnastCount = selectedGymnasts.length;

  // Check if gymnast count is valid
  const isValidCount = isValidGymnastCount(gymnastCount);

  // Generate choreography name
  const choreographyName = generateChoreographyName(selectedGymnasts);

  // Get oldest gymnast age for validation
  const oldestAge = selectedGymnasts.length > 0 
    ? Math.max(...selectedGymnasts.map(g => g.age))
    : 0;

  // Determine category from oldest gymnast
  const determinedCategory = oldestAge <= 15 ? 'YOUTH' : oldestAge <= 17 ? 'JUNIOR' : 'SENIOR';

  // Determine choreography type from gymnast count and gender composition
  let determinedType: ChoreographyType | null = null;
  if (selectedGymnasts.length > 0 && isValidCount) {
    try {
      determinedType = determineChoreographyType(gymnastCount as 1 | 2 | 3 | 5 | 8, selectedGymnasts);
    } catch (error) {
      console.error('Error determining choreography type:', error);
    }
  }

  // Generate error message for invalid gymnast count
  const getInvalidCountMessage = (count: number): string => {
    if (count === 0) return '';
    if (count === 4) return 'Invalid number of gymnasts. Choreographies cannot have 4 gymnasts. Valid options: 1 (Individual), 2 (Mixed Pair), 3 (Trio), 5 (Group), or 8 (Dance).';
    if (count === 6) return 'Invalid number of gymnasts. Choreographies cannot have 6 gymnasts. Valid options: 1 (Individual), 2 (Mixed Pair), 3 (Trio), 5 (Group), or 8 (Dance).';
    if (count === 7) return 'Invalid number of gymnasts. Choreographies cannot have 7 gymnasts. Valid options: 1 (Individual), 2 (Mixed Pair), 3 (Trio), 5 (Group), or 8 (Dance).';
    if (count > 8) return 'Too many gymnasts selected. Maximum allowed is 8 gymnasts for Dance choreographies. Valid options: 1 (Individual), 2 (Mixed Pair), 3 (Trio), 5 (Group), or 8 (Dance).';
    return '';
  };

  const invalidCountMessage = getInvalidCountMessage(gymnastCount);

  // Check if form is valid
  const isFormValid = selectedCountry && 
    selectedTournament &&
    selectedGymnasts.length > 0 &&
    isValidCount &&
    determinedType !== null;

  // Handle registration submission
  const handleSubmit = async () => {
    if (!isFormValid || !determinedType || !selectedTournament) return;

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      const choreographyData: Omit<Choreography, 'id' | 'registrationDate' | 'lastModified'> = {
        name: choreographyName,
        category: determinedCategory,
        type: determinedType,
        countryCode: selectedCountry,
        tournament: selectedTournament,
        selectedGymnasts,
        gymnastCount: gymnastCount as 1 | 2 | 3 | 5 | 8,
        routineDescription,
        status: 'SUBMITTED',
        notes: routineDescription,
        musicFile: undefined,
        musicFileName: undefined,
        submittedBy: undefined,
      };

      const registeredChoreography = await APIService.createChoreography(choreographyData);

      setRegistrationResult({
        success: true,
        message: `Choreography "${choreographyName}" successfully registered!`,
        choreography: registeredChoreography,
      });

      // Reset form
      setSelectedGymnasts([]);
      setRoutineDescription('');
      
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register choreography. Please try again.';
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
                <Trophy className="w-8 h-8 text-blue-600" />
                Choreography Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Register choreographies for the Panamerican Aerobic Gymnastics Championship
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Tournament Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tournament Selection
                </CardTitle>
                <CardDescription>Select the tournament for registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tournament">Tournament</Label>
                  {loadingTournaments ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading tournaments...</span>
                    </div>
                  ) : (
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
                        {availableTournaments.map(tournament => (
                          <SelectItem key={tournament.id} value={tournament.id}>
                            <div className="flex flex-col">
                              <span>{tournament.shortName}</span>
                              <span className="text-xs text-muted-foreground">
                                {tournament.location} • {tournament.startDate}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Country Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Country Selection</CardTitle>
                <CardDescription>Select your country to view available gymnasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryFlag(country.code)} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Choreography Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choreography Details</CardTitle>
                <CardDescription>Auto-determined from selected gymnasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error message for invalid gymnast count */}
                {invalidCountMessage && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200">   
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Invalid Gymnast Count</p>
                        <p className="text-xs text-red-700 mt-1">{invalidCountMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-sm">
                      {selectedGymnasts.length > 0 ? determinedCategory : 'Select gymnasts first'}
                    </Badge>
                    {selectedGymnasts.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on oldest gymnast age: {oldestAge}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <div className="mt-2">
                    {determinedType ? (
                      <Badge 
                        variant="outline" 
                        className={`text-sm ${getChoreographyTypeColor(determinedType)}`}
                      >
                        {getChoreographyTypeDisplayName(determinedType)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-sm">
                        {selectedGymnasts.length === 0 
                          ? 'Select gymnasts first'
                          : !isValidCount
                          ? 'Invalid gymnast count'
                          : 'Determining type...'}
                      </Badge>
                    )}
                    {determinedType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on {gymnastCount} gymnast{gymnastCount > 1 ? 's' : ''} 
                        {gymnastCount === 1 && selectedGymnasts.length > 0 && ` (${selectedGymnasts[0].gender.toLowerCase()})`}
                      </p>
                    )}
                  </div>
                </div>

                {choreographyName && (
                  <div>
                    <Label>Generated Name</Label>
                    <div className="mt-2">
                      <div className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1.5 rounded-md border whitespace-normal break-all leading-relaxed">
                        {choreographyName}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Routine Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Routine Details</CardTitle>
                <CardDescription>Optional additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your routine, music, or any special requirements..."
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Registration Result */}
            {registrationResult && (
              <Card className={registrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {registrationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${registrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {registrationResult.success ? 'Registration Successful!' : 'Registration Failed'}
                      </p>
                      <p className={`text-sm mt-1 ${registrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {registrationResult.message}
                      </p>
                      {registrationResult.choreography && (
                        <p className="text-xs text-green-600 mt-2">
                          Registration ID: {registrationResult.choreography.id}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Register Choreography
                </>
              )}
            </Button>
          </div>

          {/* Gymnast Selector */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Gymnasts
                </CardTitle>
                <CardDescription>
                  Choose gymnasts from the FIG database. Valid counts: 1 (Individual), 2 (Mixed Pair), 3 (Trio), 5 (Group), or 8 (Dance)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCountry ? (
                  <GymnastSelector
                    countryCode={selectedCountry}
                    selectedGymnasts={selectedGymnasts}
                    onSelectionChange={setSelectedGymnasts}
                    maxSelection={8} // Set to 8 as maximum possible, but validation will handle invalid counts
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    Please select a country to view available gymnasts
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 