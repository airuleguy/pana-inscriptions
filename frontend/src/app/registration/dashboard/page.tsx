'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RegistrationCartSidebar } from '@/components/registration-cart-sidebar';
import { TournamentNav } from '@/components/ui/tournament-nav';
import { Trophy, Calendar, MapPin, Globe, Users, UserCheck, ClipboardList, ArrowLeft, Settings, UserPlus } from 'lucide-react';
import { Tournament } from '@/types';
import { countries } from '@/lib/countries';
import { useRegistration } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { toast } from 'sonner';

export default function RegistrationDashboard() {
  const router = useRouter();
  const { state, clearAll, getTotalCount, loadExistingRegistrations, isLoading: registrationLoading } = useRegistration();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleRegistrationSummary = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConfirmRegistration = async () => {
    if (submitting || !selectedTournament || !selectedCountry) return;
    
    setSubmitting(true);
    
    try {
      const totalItems = getTotalCount();
      
      // Prepare batch registration data
      const choreographyData = state.choreographies.map(c => c.choreographyData).filter(Boolean);
      const coachData = state.coaches.map(c => c.coachData).filter(Boolean);
      const judgeData = state.judges.map(j => j.judgeData).filter(Boolean);
      
      const registrationData = {
        choreographies: choreographyData,
        coaches: coachData,
        judges: judgeData,
        tournament: selectedTournament,
        country: selectedCountry,
      };
      
      // Call batch registration API
      const result = await APIService.submitBatchRegistration(registrationData);
      
      if (result.success) {
        toast.success(`Registration confirmed! ${totalItems} items successfully registered.`, {
          description: 'You will receive a confirmation email shortly.',
          duration: 5000,
        });

        // Clear the registration cart
        clearAll();
        
        // Close the sidebar
        setIsSidebarOpen(false);
      } else {
        throw new Error('Registration failed on server');
      }
      
    } catch (error) {
      console.error('Registration confirmation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm registration';
      toast.error(errorMessage, {
        description: 'Please try again or contact support if the problem persists.',
        duration: 7000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Load selections from localStorage
    const tournamentData = localStorage.getItem('selectedTournament');
    const countryData = localStorage.getItem('selectedCountry');

    if (!tournamentData || !countryData) {
      // Redirect back to tournament selection if no selections found
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

  // Load existing registrations when tournament and country are available
  useEffect(() => {
    if (selectedTournament && selectedCountry && !loading) {
      console.log('Loading existing registrations for:', { country: selectedCountry, tournament: selectedTournament.name });
      loadExistingRegistrations();
    }
  }, [selectedTournament, selectedCountry, loading, loadExistingRegistrations]);

  const getCountryInfo = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country || { code, name: code, flag: '🏳️' };
  };

  const handleChangeSelection = () => {
    router.push('/tournament-selection');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null; // This will be handled by the redirect in useEffect
  }

  const countryInfo = getCountryInfo(selectedCountry);
  const totalCount = getTotalCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Tournament Navigation */}
      <TournamentNav 
        currentPage="Registration Dashboard"
        showRegistrationSummary={true}
        onToggleRegistrationSummary={handleToggleRegistrationSummary}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-sm font-medium text-green-600">Tournament Selected</span>
            </div>
            <div className="w-8 h-0.5 bg-blue-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-blue-600">Registration</span>
            </div>
          </div>

          {/* Selection Summary */}
          <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Globe className="w-5 h-5" />
                Current Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-700">Tournament</h3>
                  <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{selectedTournament.name}</h4>
                      {selectedTournament.isActive && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(selectedTournament.startDate).toLocaleDateString()} - {new Date(selectedTournament.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedTournament.location || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-700">Country</h3>
                  <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{countryInfo.flag}</span>
                      <div>
                        <h4 className="font-medium">{countryInfo.name}</h4>
                        <p className="text-sm text-muted-foreground">Code: {countryInfo.code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Registrations Summary */}
          {(totalCount > 0 || registrationLoading) && (
            <Card className="shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Users className="w-5 h-5" />
                  Current Registrations Summary
                  {registrationLoading && (
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin ml-2"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {registrationLoading ? (
                  <p className="text-muted-foreground">Loading existing registrations...</p>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="w-4 h-4 text-purple-600" />
                          <h4 className="font-semibold text-purple-700">Choreographies</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-800">{state.choreographies.length}</p>
                        {state.choreographies.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {state.choreographies.slice(0, 3).map(c => (
                              <div key={c.id} className="text-xs text-muted-foreground truncate">
                                • {c.name} ({c.category})
                              </div>
                            ))}
                            {state.choreographies.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{state.choreographies.length - 3} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <h4 className="font-semibold text-green-700">Coaches</h4>
                        </div>
                        <p className="text-2xl font-bold text-green-800">{state.coaches.length}</p>
                        {state.coaches.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {state.coaches.slice(0, 3).map(c => (
                              <div key={c.id} className="text-xs text-muted-foreground truncate">
                                • {c.name} ({c.level})
                              </div>
                            ))}
                            {state.coaches.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{state.coaches.length - 3} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-700">Judges</h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-800">{state.judges.length}</p>
                        {state.judges.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {state.judges.slice(0, 3).map(j => (
                              <div key={j.id} className="text-xs text-muted-foreground truncate">
                                • {j.name} ({j.category})
                              </div>
                            ))}
                            {state.judges.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{state.judges.length - 3} more...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-semibold">Total Registrations:</span>
                        <Badge variant="default" className="bg-green-600 text-white text-lg px-3 py-1">
                          {totalCount}
                        </Badge>
                      </div>
                      {totalCount > 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ready to confirm
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Registration Options */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {totalCount > 0 ? 'Add More Registrations' : 'What would you like to register?'}
              </h2>
              <p className="text-xl text-muted-foreground">
                {totalCount > 0 
                  ? 'Continue building your registration by adding more items'
                  : 'Choose from the available registration options below'
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Choreography Registration */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    <ClipboardList className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Register Choreography</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Register your gymnasts and create choreographies for the tournament. 
                    Manage routines for Individual, Pair, Trio, and Group categories.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• Individual, Pair, Trio & Group routines</div>
                    <div>• Youth, Junior & Senior categories</div>
                    <div>• FIG-registered gymnasts only</div>
                  </div>
                  <Button asChild className="w-full font-semibold shadow-md group-hover:shadow-lg">
                    <Link href="/registration/choreography">
                      Start Registration
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Coach Registration */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-green-600 group-hover:to-emerald-600 transition-all">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Register Coach</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Register certified coaches for the tournament. 
                    Only FIG-licensed coaches are eligible to participate.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• FIG-certified coaches only</div>
                    <div>• Various coaching levels accepted</div>
                    <div>• Team and individual coaching</div>
                  </div>
                  <Button asChild className="w-full font-semibold shadow-md group-hover:shadow-lg">
                    <Link href="/registration/coaches">
                      Start Registration
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Judge Registration */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Register Judge</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Register certified judges for the tournament. 
                    Only FIG-certified judges are eligible to officiate.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• FIG-certified judges only</div>
                    <div>• International & national levels</div>
                    <div>• Various judging categories</div>
                  </div>
                  <Button asChild className="w-full font-semibold shadow-md group-hover:shadow-lg">
                    <Link href="/registration/judges">
                      Start Registration
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tournament Rules and Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Tournament Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Registration Limits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max per Category:</span>
                      <span className="font-medium">4 choreographies</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eligible Countries:</span>
                      <span className="font-medium">Americas region only</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration Status:</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Open
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Important Notes</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>• All participants must be FIG-registered</div>
                    <div>• Country restrictions apply for team representation</div>
                    <div>• Age categories determined by oldest gymnast</div>
                    <div>• Registration deadline strictly enforced</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RegistrationCartSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleRegistrationSummary}
        onConfirmRegistration={handleConfirmRegistration}
        isSubmitting={submitting}
      />
    </div>
  );
} 