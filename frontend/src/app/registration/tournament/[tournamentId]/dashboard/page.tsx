'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Tournament, Choreography, Coach, Judge } from '@/types';
import { useRegistration } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { getCountryByCode } from '@/lib/countries';
import { toast } from 'sonner';
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
  ArrowRight,
  RefreshCw,
  Database,
  User,
  Award
} from 'lucide-react';

interface SubmittedRegistrations {
  choreographies: Choreography[];
  coaches: Coach[];
  judges: Judge[];
  totals: {
    choreographies: number;
    coaches: number;
    judges: number;
    total: number;
  };
}

export default function TournamentRegistrationDashboard() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.tournamentId as string;
  const { state, canConfirmRegistration, getPendingCount, getRegistrationsByStatus } = useRegistration();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submittedRegistrations, setSubmittedRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('register');

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

  // Load registrations by status
  useEffect(() => {
    if (selectedTournament && selectedCountry) {
      loadRegistrationsByStatus();
    }
  }, [selectedTournament, selectedCountry]);

  const loadRegistrationsByStatus = async () => {
    if (!selectedTournament || !selectedCountry) return;

    try {
      // Load pending registrations
      const pendingData = await APIService.getRegistrationsByStatus(selectedTournament.id, 'PENDING');
      setPendingRegistrations(pendingData);

      // Load submitted registrations
      const submittedData = await APIService.getRegistrationsByStatus(selectedTournament.id, 'SUBMITTED');
      setSubmittedRegistrations(submittedData);
    } catch (error) {
      console.error('Failed to load registrations by status:', error);
      // Don't show error toast on initial load, just log the error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRegistrationsByStatus();
    setRefreshing(false);
    toast.success('Registrations refreshed successfully');
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCountryInfo = (code: string) => {
    const country = getCountryByCode(code);
    return country || { code, name: code, flag: '🏳️' };
  };

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
  const pendingCount = getPendingCount();
  const countryInfo = getCountryInfo(selectedCountry);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Registration Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  {selectedTournament.name} • {countryInfo.flag} {countryInfo.name}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Registrations */}
            <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-orange-900">Pending Registrations</h3>
                    <p className="text-orange-700 mt-1">
                      {pendingRegistrations?.totals.total || 0} item{(pendingRegistrations?.totals.total || 0) !== 1 ? 's' : ''} ready for submission
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-900">{pendingRegistrations?.totals.total || 0}</div>
                    <div className="text-sm text-orange-700">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Registrations */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-green-900">Submitted Registrations</h3>
                    <p className="text-green-700 mt-1">
                      {submittedRegistrations?.totals.total || 0} item{(submittedRegistrations?.totals.total || 0) !== 1 ? 's' : ''} in database
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-900">{submittedRegistrations?.totals.total || 0}</div>
                    <div className="text-sm text-green-700">Submitted</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Register New Items
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              View Pending ({pendingRegistrations?.totals.total || 0})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              View Submitted ({submittedRegistrations?.totals.total || 0})
            </TabsTrigger>
          </TabsList>

          {/* Registration Tab */}
          <TabsContent value="register" className="space-y-6">

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
                  {pendingCount > 0 ? (
                    <Clock className="w-5 h-5 text-orange-500" />
                  ) : canConfirmRegistration() ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  )}
                  Registration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingCount > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-800">Pending Registrations Ready</p>
                        <p className="text-orange-700 text-sm mt-1">
                          You have {pendingCount} pending registration{pendingCount > 1 ? 's' : ''} ready for submission. 
                          Review your selections in the summary sidebar and submit when ready.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : totalRegistrations > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800">All Registrations Submitted</p>
                        <p className="text-green-700 text-sm mt-1">
                          All your registrations have been submitted and are now under review. 
                          Check the "View Submitted" tab to see your submitted registrations.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">No Registrations Yet</p>
                        <p className="text-gray-700 text-sm mt-1">
                          Start by registering at least one choreography, coach, or judge using the sections above.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Registrations Tab */}
          <TabsContent value="pending" className="space-y-6">
            {pendingRegistrations && pendingRegistrations.totals.total > 0 ? (
              <div className="space-y-6">
                {/* Summary Overview */}
                <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-900">{pendingRegistrations.totals.total}</div>
                        <div className="text-sm text-orange-700">Total Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{pendingRegistrations.totals.choreographies}</div>
                        <div className="text-sm text-blue-700">Choreographies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-900">{pendingRegistrations.totals.coaches}</div>
                        <div className="text-sm text-purple-700">Coaches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-900">{pendingRegistrations.totals.judges}</div>
                        <div className="text-sm text-red-700">Judges</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Choreographies */}
                {pendingRegistrations.choreographies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-blue-600" />
                        Pending Choreographies ({pendingRegistrations.choreographies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingRegistrations.choreographies.map((choreography) => (
                          <div key={choreography.id} className="border rounded-lg p-4 bg-orange-50/50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-lg">{choreography.name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {choreography.category}
                                  </Badge>
                                  <Badge variant="outline">
                                    {choreography.type}
                                  </Badge>
                                  <Badge className="bg-orange-100 text-orange-800">
                                    PENDING
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    {choreography.gymnasts.length} gymnasts
                                  </div>
                                </div>
                              </div>
                              {choreography.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(choreography.createdAt)}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {choreography.gymnasts.map((gymnast, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm">{gymnast.fullName}</span>
                                  <Badge variant="secondary" className="ml-auto">
                                    Age {gymnast.age}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Coaches */}
                {pendingRegistrations.coaches.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        Pending Coaches ({pendingRegistrations.coaches.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {pendingRegistrations.coaches.map((coach) => (
                          <div key={coach.id} className="border rounded-lg p-4 bg-orange-50/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-lg">{coach.fullName}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-green-100 text-green-800">
                                    Level {coach.level}
                                  </Badge>
                                  <Badge className="bg-orange-100 text-orange-800">
                                    PENDING
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>{getCountryInfo(coach.country).flag}</span>
                                    <span>{getCountryInfo(coach.country).name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Award className="w-4 h-4" />
                                    <span>FIG ID: {coach.id}</span>
                                  </div>
                                </div>
                              </div>
                              {coach.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(coach.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Judges */}
                {pendingRegistrations.judges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        Pending Judges ({pendingRegistrations.judges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {pendingRegistrations.judges.map((judge) => (
                          <div key={judge.id} className="border rounded-lg p-4 bg-orange-50/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-lg">{judge.fullName}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-purple-100 text-purple-800">
                                    Category {judge.category}
                                  </Badge>
                                  <Badge className="bg-orange-100 text-orange-800">
                                    PENDING
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>{getCountryInfo(judge.country).flag}</span>
                                    <span>{getCountryInfo(judge.country).name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Award className="w-4 h-4" />
                                    <span>FIG ID: {judge.id}</span>
                                  </div>
                                </div>
                              </div>
                              {judge.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(judge.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Registrations</h3>
                    <p className="text-gray-600">
                      All your registrations have been submitted or you haven't registered anything yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submitted Registrations Tab */}
          <TabsContent value="submitted" className="space-y-6">
            {submittedRegistrations && submittedRegistrations.totals.total > 0 ? (
              <div className="space-y-6">
                {/* Summary Overview */}
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-900">{submittedRegistrations.totals.total}</div>
                        <div className="text-sm text-green-700">Total Submissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{submittedRegistrations.totals.choreographies}</div>
                        <div className="text-sm text-blue-700">Choreographies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-900">{submittedRegistrations.totals.coaches}</div>
                        <div className="text-sm text-purple-700">Coaches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-900">{submittedRegistrations.totals.judges}</div>
                        <div className="text-sm text-orange-700">Judges</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Choreographies */}
                {submittedRegistrations.choreographies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-blue-600" />
                        Submitted Choreographies ({submittedRegistrations.choreographies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {submittedRegistrations.choreographies.map((choreography) => (
                          <div key={choreography.id} className="border rounded-lg p-4 bg-blue-50/50">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-lg">{choreography.name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {choreography.category}
                                  </Badge>
                                  <Badge variant="outline">
                                    {choreography.type}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    {choreography.gymnasts.length} gymnasts
                                  </div>
                                </div>
                              </div>
                              {choreography.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(choreography.createdAt)}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {choreography.gymnasts.map((gymnast, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded-md">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm">{gymnast.fullName}</span>
                                  <Badge variant="secondary" className="ml-auto">
                                    Age {gymnast.age}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Coaches */}
                {submittedRegistrations.coaches.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        Submitted Coaches ({submittedRegistrations.coaches.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {submittedRegistrations.coaches.map((coach) => (
                          <div key={coach.id} className="border rounded-lg p-4 bg-green-50/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-lg">{coach.fullName}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-green-100 text-green-800">
                                    Level {coach.level}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>{getCountryInfo(coach.country).flag}</span>
                                    <span>{getCountryInfo(coach.country).name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Award className="w-4 h-4" />
                                    <span>FIG ID: {coach.id}</span>
                                  </div>
                                </div>
                              </div>
                              {coach.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(coach.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Judges */}
                {submittedRegistrations.judges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-purple-600" />
                        Submitted Judges ({submittedRegistrations.judges.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {submittedRegistrations.judges.map((judge) => (
                          <div key={judge.id} className="border rounded-lg p-4 bg-purple-50/50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-lg">{judge.fullName}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge className="bg-purple-100 text-purple-800">
                                    Category {judge.category}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <span>{getCountryInfo(judge.country).flag}</span>
                                    <span>{getCountryInfo(judge.country).name}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Award className="w-4 h-4" />
                                    <span>FIG ID: {judge.id}</span>
                                  </div>
                                </div>
                              </div>
                              {judge.createdAt && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatDate(judge.createdAt)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Registrations Submitted</h3>
                  <p className="text-gray-600 mb-6">
                    No registrations have been submitted to the database for this tournament yet.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('register')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Start Registering
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
} 