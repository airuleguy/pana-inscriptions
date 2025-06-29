'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { GymnastDataTable } from '@/components/forms/gymnast-data-table';
import { TournamentNav } from '@/components/ui/tournament-nav';
import { RegistrationCartSidebar } from '@/components/registration-cart-sidebar';
import { 
  generateChoreographyName, 
  determineChoreographyType, 
  getChoreographyTypeDisplayName,
  getChoreographyTypeColor,
  isValidGymnastCount
} from '@/lib/utils';
import type { Gymnast, Choreography, ChoreographyType, Tournament } from '@/types';
import { useRegistration, RegisteredChoreography } from '@/contexts/registration-context';
import { Trophy, Users, Save, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChoreographyRegistrationPage() {
  const router = useRouter();
  const { addChoreography } = useRegistration();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGymnasts, setSelectedGymnasts] = useState<Gymnast[]>([]);
  const [routineDescription, setRoutineDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    choreography?: Choreography;
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
      // Generate a temporary ID for the cart
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Add to registration cart (no backend API call)
      const cartChoreography: RegisteredChoreography = {
        id: tempId,
        name: choreographyName,
        category: determinedCategory,
        type: getChoreographyTypeDisplayName(determinedType),
        gymnastsCount: gymnastCount,
        gymnasts: selectedGymnasts,
        registeredAt: new Date(),
        // Store additional data needed for final submission
        choreographyData: {
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
        },
      };

      addChoreography(cartChoreography);

      setRegistrationResult({
        success: true,
        message: `Choreography "${choreographyName}" added to registration cart!`,
      });

      // Show success toast
      toast.success('Choreography added to cart!', {
        description: `${choreographyName} has been added to your registration cart. Use the cart to complete registration.`,
        duration: 3000,
      });

      // Reset form
      setSelectedGymnasts([]);
      setRoutineDescription('');
      
    } catch (error: unknown) {
      console.error('Adding choreography to cart failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add choreography to cart. Please try again.';
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
          <p className="text-muted-foreground">Loading choreography registration...</p>
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
        currentPage="Choreography Registration" 
        showRegistrationSummary={true}
        onToggleRegistrationSummary={handleToggleRegistrationSummary}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-blue-600" />
            Choreography Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Create and register choreographies for your selected tournament
          </p>
        </div>

        <div className="space-y-6">

          {/* Gymnast Selector - Full Width */}
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
                <GymnastDataTable
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

          {/* Choreography Configuration */}
          {selectedGymnasts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Routine Details</CardTitle>
                  <CardDescription>Optional additional information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        Add Choreography to Cart
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

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
                      {registrationResult.success ? 'Added to Cart Successfully!' : 'Failed to Add to Cart'}
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

        </div>
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