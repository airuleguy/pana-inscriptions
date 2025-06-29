'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GymnastDataTable } from '@/components/forms/gymnast-data-table';
import { getCountryByCode } from '@/lib/countries';
import type { Gymnast, ChoreographyType, Tournament, Choreography } from '@/types';
import { ChoreographyCategory } from '@/constants/categories';
import { useRegistration, RegisteredChoreography } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { generateChoreographyName, calculateAge, calculateCategory, determineChoreographyType } from '@/lib/utils';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const choreographyTypes = [
  { value: 'MIND', label: "Men's Individual", count: 1 },
  { value: 'WIND', label: "Women's Individual", count: 1 },
  { value: 'MXP', label: 'Mixed Pair', count: 2 },
  { value: 'TRIO', label: 'Trio', count: 3 },
  { value: 'GRP', label: 'Group', count: 5 },
  { value: 'DNCE', label: 'Dance', count: 8 },
] as const;

export default function ChoreographyRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { addChoreography } = useRegistration();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Form state
  const [choreographyName, setChoreographyName] = useState('');
  const [choreographyType, setChoreographyType] = useState<ChoreographyType | ''>('');
  const [category, setCategory] = useState<ChoreographyCategory | ''>('');
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    choreography?: Choreography;
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

  // Get expected gymnast count for selected type
  const expectedGymnastCount = choreographyTypes.find(t => t.value === choreographyType)?.count || 1;

  // Automatic detection effect - runs when gymnasts are selected
  useEffect(() => {
    if (gymnasts.length > 0) {
      // Auto-generate choreography name from gymnast surnames (always works)
      const autoName = generateChoreographyName(gymnasts);
      setChoreographyName(autoName);

      // Try to determine choreography type - handle invalid counts gracefully
      try {
        const autoType = determineChoreographyType(gymnasts.length, gymnasts);
        setChoreographyType(autoType as ChoreographyType);

        // Auto-calculate category based on oldest gymnast age
        const ages = gymnasts.map(gymnast => calculateAge(gymnast.dateOfBirth));
        const oldestAge = Math.max(...ages);
        const autoCategory = calculateCategory(oldestAge);
        setCategory(autoCategory as ChoreographyCategory);

        // Show success message for valid combinations
        const typeDisplayName = autoType === 'MIND' ? "Men's Individual" : 
                                autoType === 'WIND' ? "Women's Individual" :
                                autoType === 'MXP' ? "Mixed Pair" :
                                autoType === 'TRIO' ? "Trio" :
                                autoType === 'GRP' ? "Group" : "Dance";
        
        toast.success('Choreography details auto-detected!', {
          description: `${autoName} | ${typeDisplayName} | ${autoCategory}`,
          duration: 2000,
        });
      } catch (error) {
        // Invalid count - keep last valid type/category, only update name
        // Show informative message about valid counts
        const validCounts = [1, 2, 3, 5, 8];
        const nextValidCount = validCounts.find(count => count > gymnasts.length) || 8;
        const prevValidCount = validCounts.reverse().find(count => count < gymnasts.length) || 1;
        
        toast.info(`${gymnasts.length} gymnasts selected`, {
          description: `Valid counts: 1, 2, 3, 5, or 8 gymnasts. Continue to ${nextValidCount} or go back to ${prevValidCount}.`,
          duration: 3000,
        });
      }
    } else {
      // Reset fields when no gymnasts selected
      setChoreographyName('');
      setChoreographyType('');
      setCategory('');
    }
  }, [gymnasts]);

  // Check if form is valid
  const isValidGymnastCount = [1, 2, 3, 5, 8].includes(gymnasts.length);
  const isFormValid = selectedCountry && 
    selectedTournament &&
    choreographyName.trim() &&
    choreographyType &&
    category &&
    gymnasts.length > 0 &&
    isValidGymnastCount;

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedTournament || !selectedCountry) {
      setRegistrationResult({
        success: false,
        message: 'Missing tournament or country selection',
      });
      return;
    }

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      // Create choreography data object for API call
      const choreographyData: Omit<Choreography, 'id' | 'createdAt' | 'updatedAt'> = {
        name: choreographyName,
        category: category as ChoreographyCategory,
        type: choreographyType as ChoreographyType,
        country: selectedCountry,
        tournament: selectedTournament,
        gymnasts: gymnasts,
        gymnastCount: expectedGymnastCount as 1 | 2 | 3 | 5 | 8,
        oldestGymnastAge: Math.max(...gymnasts.map(g => g.age)),
        notes: '',
      };

      // Register choreography with backend API immediately
      const response = await APIService.registerChoreographyForTournament(choreographyData, selectedTournament.id);

      if (response.success && response.results.length > 0) {
        const registeredChoreography = response.results[0];
        
        // Create registration entry for local state with actual backend data
        const registrationData: RegisteredChoreography = {
          id: registeredChoreography.id,
          name: registeredChoreography.name,
          category: registeredChoreography.category,
          type: registeredChoreography.type,
          gymnastsCount: registeredChoreography.gymnasts.length,
          gymnasts: registeredChoreography.gymnasts,
          registeredAt: new Date(registeredChoreography.createdAt),
          status: 'PENDING',
          choreographyData: registeredChoreography,
        };

        // Add to registration summary
        addChoreography(registrationData);

        setRegistrationResult({
          success: true,
          message: 'Choreography successfully registered in PENDING status!',
          choreography: registeredChoreography,
        });

        toast.success('Choreography registered!', {
          description: 'Your choreography has been registered with PENDING status in the backend.',
          duration: 3000,
        });
      } else {
        // Handle API errors
        const errorMessage = response.errors?.join(', ') || 'Failed to register choreography';
        setRegistrationResult({
          success: false,
          message: errorMessage,
        });

        toast.error('Registration failed', {
          description: errorMessage,
          duration: 5000,
        });
      }

      // Reset form
      setChoreographyName('');
      setChoreographyType('');
      setCategory('');
      setGymnasts([]);
      
    } catch (err) {
      console.error('Choreography registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to register choreography with backend. Please try again.';
      setRegistrationResult({
        success: false,
        message: errorMessage,
      });
      
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
          <p className="text-muted-foreground">Loading choreography registration...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Choreography Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Register your gymnastic routine for {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* Gymnast Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                Gymnast Selection {gymnasts.length > 0 && `(${gymnasts.length} selected)`}
              </CardTitle>
              <CardDescription>
                {gymnasts.length === 0 
                  ? `Select gymnasts from ${getCountryByCode(selectedCountry)?.name} to automatically detect choreography details`
                  : `Selected ${gymnasts.length} gymnast${gymnasts.length > 1 ? 's' : ''} from ${getCountryByCode(selectedCountry)?.name}${choreographyType ? ` - Detected as ${choreographyType.toLowerCase()} routine` : ''}`
                }
              </CardDescription>
              {gymnasts.length > 0 && ![1, 2, 3, 5, 8].includes(gymnasts.length) && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm text-amber-800">
                    ⚠️ <strong>{gymnasts.length} gymnasts</strong> is not a valid count for competition. 
                    Valid counts are: <strong>1, 2, 3, 5, or 8</strong> gymnasts.
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <GymnastDataTable
                countryCode={selectedCountry}
                gymnasts={gymnasts}
                onSelectionChange={setGymnasts}
                disabled={submitting}
              />
            </CardContent>
          </Card>

          {/* Basic Information - Auto-detected details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Basic details are automatically detected from your selected gymnasts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Choreography Name</Label>
                  <Input
                    id="name"
                    placeholder="Auto-generated from gymnast surnames"
                    value={choreographyName}
                    onChange={(e) => setChoreographyName(e.target.value)}
                    className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}
                  />
                  {gymnasts.length > 0 && (
                    <p className="text-xs text-green-600">✓ Auto-generated from selected gymnasts</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={choreographyType} onValueChange={(value) => setChoreographyType(value as ChoreographyType)} disabled={gymnasts.length > 0}>
                    <SelectTrigger className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}>
                      <SelectValue placeholder="Auto-detected from gymnast count" />
                    </SelectTrigger>
                    <SelectContent>
                      {choreographyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.count} gymnast{type.count > 1 ? 's' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {gymnasts.length > 0 && (
                    <p className="text-xs text-green-600">✓ Auto-detected from gymnast count and gender</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ChoreographyCategory)} disabled={gymnasts.length > 0}>
                  <SelectTrigger className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}>
                    <SelectValue placeholder="Auto-detected from gymnast ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YOUTH">Youth (≤15 years)</SelectItem>
                    <SelectItem value="JUNIOR">Junior (16-17 years)</SelectItem>
                    <SelectItem value="SENIOR">Senior (18+ years)</SelectItem>
                  </SelectContent>
                </Select>
                {gymnasts.length > 0 && (
                  <p className="text-xs text-green-600">✓ Auto-detected from oldest gymnast age</p>
                )}
              </div>
            </CardContent>
          </Card>

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
              {submitting ? 'Adding to summary...' : 'Add to Summary'}
            </Button>
            
            {!isValidGymnastCount && gymnasts.length > 0 && (
              <p className="text-sm text-amber-600 self-center">
                Select 1, 2, 3, 5, or 8 gymnasts to enable registration
              </p>
            )}
            
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