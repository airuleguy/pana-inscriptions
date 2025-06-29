'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Tournament } from '@/types';
import { useRegistration } from '@/contexts/registration-context';
import { 
  Trophy, 
  Users, 
  GraduationCap, 
  Scale, 
  Music, 
  Plus, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function TournamentRegistrationDashboard() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { state, canConfirmRegistration } = useRegistration();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load tournament and country data
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading registration dashboard...</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null;
  }

  const registrationSections = [
    {
      id: 'choreography',
      title: 'Choreography Registration',
      description: 'Register your gymnastic routines and compositions',
      icon: Music,
      path: `/registration/tournament/${tournamentId}/choreography`,
      count: state.choreographies.length,
      color: 'blue',
      isCompleted: state.choreographies.length > 0,
    },
    {
      id: 'coaches',
      title: 'Coach Registration',
      description: 'Register certified coaches for your team',
      icon: GraduationCap,
      path: `/registration/tournament/${tournamentId}/coaches`,
      count: state.coaches.length,
      color: 'green',
      isCompleted: state.coaches.length > 0,
    },
    {
      id: 'judges',
      title: 'Judge Registration',
      description: 'Register qualified judges for the tournament',
      icon: Scale,
      path: `/registration/tournament/${tournamentId}/judges`,
      count: state.judges.length,
      color: 'purple',
      isCompleted: state.judges.length > 0,
    },
  ];

  const totalRegistrations = state.choreographies.length + state.coaches.length + state.judges.length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registration Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {selectedTournament.name} • {selectedCountry}
              </p>
            </div>
          </div>
          
          {/* Progress Overview */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-blue-900">Registration Progress</h3>
                  <p className="text-blue-700 mt-1">
                    {totalRegistrations} total registrations across all categories
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">{totalRegistrations}</div>
                  <div className="text-sm text-blue-700">Total Entries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Sections */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {registrationSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  section.isCompleted ? 'border-green-200 bg-green-50' : 'hover:border-gray-300'
                }`}
                onClick={() => router.push(section.path)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        section.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        section.color === 'green' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <Badge variant={section.isCompleted ? "default" : "secondary"} className="mt-1">
                          {section.count} registered
                        </Badge>
                      </div>
                    </div>
                    {section.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Plus className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {section.description}
                  </CardDescription>
                  <Button 
                    variant={section.isCompleted ? "outline" : "default"} 
                    className="w-full"
                  >
                    {section.isCompleted ? 'View & Edit' : 'Start Registration'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Final Registration Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {canConfirmRegistration() ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
              Final Registration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canConfirmRegistration() ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Ready for Final Submission</p>
                    <p className="text-green-700 text-sm mt-1">
                      You have registered entries across categories. Review your selections and submit when ready.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button size="lg" variant="outline" onClick={() => router.push('/tournament-selection')}>
                    Change Tournament
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Registration Incomplete</p>
                    <p className="text-orange-700 text-sm mt-1">
                      Please complete at least one registration category before final submission.
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Click on any registration section above to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
} 