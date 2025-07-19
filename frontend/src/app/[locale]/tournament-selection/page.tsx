'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, MapPin, Globe, ArrowRight } from 'lucide-react';
import { APIService } from '@/lib/api';
import { Tournament } from '@/types';
import { countries, popularCountries } from '@/lib/countries';
import { ProtectedRoute } from '@/components/protected-route';

function TournamentSelectionContent() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Americas countries from the popularCountries list (first 19 are Americas)
  const americasCountries = popularCountries.slice(0, 19);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await APIService.getTournaments();
      setTournaments(data);
      
      // Auto-select the first active tournament if available
      const activeTournament = data.find(t => t.isActive);
      if (activeTournament) {
        setSelectedTournament(activeTournament);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const navigate = () => {
    if (selectedTournament && selectedCountry) {
      // Store the selections in localStorage for backward compatibility
      localStorage.setItem('selectedTournament', JSON.stringify(selectedTournament));
      localStorage.setItem('selectedCountry', selectedCountry);
      
      // Navigate to the tournament-centric registration URL
      router.push(`/registration/tournament/${selectedTournament.id}/dashboard`);
    }
  };

  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-blue-600">Tournament Selection</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm text-gray-500">Registration</span>
            </div>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadTournaments} 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tournament Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Select Tournament
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tournaments available at the moment.
                </p>
              ) : (
                <div className="grid gap-4">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTournament?.id === tournament.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedTournament(tournament)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tournament.name}</h3>
                            {tournament.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{tournament.location || 'TBD'}</span>
                            </div>
                          </div>
                          {tournament.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {tournament.description}
                            </p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedTournament?.id === tournament.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTournament?.id === tournament.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Country Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Select Country
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent>
                  {americasCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Only countries from the Americas region are eligible for Panamerican championships.
              </p>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          {(selectedTournament || selectedCountry) && (
            <Card className="shadow-lg border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Selection Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedTournament && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">Tournament:</span>
                    <span className="text-blue-900">{selectedTournament.name}</span>
                  </div>
                )}
                {selectedCountry && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">Country:</span>
                    <span className="text-blue-900">{getCountryName(selectedCountry)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={navigate}
              disabled={!selectedTournament || !selectedCountry}
              className="shadow-lg font-semibold px-8"
            >
              Continue to Registration
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TournamentSelectionPage() {
  return (
    <ProtectedRoute>
      <TournamentSelectionContent />
    </ProtectedRoute>
  );
} 