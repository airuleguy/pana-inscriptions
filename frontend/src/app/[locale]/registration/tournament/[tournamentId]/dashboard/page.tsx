'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Tournament, Choreography, Coach, Judge } from '@/types';
import { useRegistration } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
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
  const { t } = useTranslations('common');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [pendingRegistrations, setPendingRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [submittedRegistrations, setSubmittedRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load tournament data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const tournament = await APIService.getTournament(tournamentId);
        setSelectedTournament(tournament);
        
        // Get country from localStorage or default to tournament country
        const authData = localStorage.getItem('auth');
        let userCountry = '';
        if (authData) {
          const { country } = JSON.parse(authData);
          userCountry = country;
        }
        
        // Use user's country or default to Uruguay
        const countryToUse = userCountry || 'URU';
        setSelectedCountry(countryToUse);
        
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
          <p className="text-muted-foreground">{t('dashboard.loadingMessage')}</p>
        </div>
      </div>
    );
  }

  const registrationSections = [
    {
      id: 'choreography',
      title: t('dashboard.choreographyRegistration'),
      description: t('dashboard.choreographyDescription'),
      icon: Music,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      href: `/registration/tournament/${tournamentId}/choreography`,
      count: state.choreographies.length,
      isCompleted: state.choreographies.length > 0
    },
    {
      id: 'coaches',
      title: t('dashboard.coachRegistration'),
      description: t('dashboard.coachDescription'),
      icon: GraduationCap,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      href: `/registration/tournament/${tournamentId}/coaches`,
      count: state.coaches.length,
      isCompleted: state.coaches.length > 0
    },
    {
      id: 'judges',
      title: t('dashboard.judgeRegistration'),
      description: t('dashboard.judgeDescription'),
      icon: Scale,
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
      iconColor: 'text-red-600',
      href: `/registration/tournament/${tournamentId}/judges`,
      count: state.judges.length,
      isCompleted: state.judges.length > 0
    }
  ];

  const pendingCount = getPendingCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-2">
              {selectedTournament?.name} • {getCountryInfo(selectedCountry).flag} {getCountryInfo(selectedCountry).name}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? t('dashboard.refreshing') : t('dashboard.refreshData')}
          </Button>
        </div>

        {/* Registration Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Registrations */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-lg text-orange-900">{t('dashboard.pendingRegistrations')}</h3>
              </CardTitle>
              <div className="text-2xl font-bold text-orange-800">
                {pendingRegistrations?.totals.total || 0} {t('dashboard.itemsReadyForSubmission')}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-orange-700">{t('dashboard.pending')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Submitted Registrations */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg text-green-900">{t('dashboard.submittedRegistrations')}</h3>
              </CardTitle>
              <div className="text-2xl font-bold text-green-800">
                {submittedRegistrations?.totals.total || 0} {t('dashboard.itemsInDatabase')}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-green-700">{t('dashboard.submitted')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.registerNewItems')}
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('dashboard.viewPending')} ({pendingRegistrations?.totals.total || 0})
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('dashboard.viewSubmitted')} ({submittedRegistrations?.totals.total || 0})
          </Button>
        </div>

        {/* Registration Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {registrationSections.map((section) => (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all duration-200 ${section.color}`}
              onClick={() => router.push(section.href)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                    <div>
                      <h3 className="font-semibold">{section.title}</h3>
                      <p className="text-sm text-gray-600 font-normal mt-1">
                        {section.count} {t('dashboard.registered')}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                <Button 
                  variant={section.isCompleted ? "outline" : "default"}
                  size="sm" 
                  className="w-full"
                >
                  {section.isCompleted ? t('dashboard.viewAndEdit') : t('dashboard.startRegistration')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('dashboard.registrationStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingCount > 0 ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-medium text-orange-800">{t('dashboard.pendingRegistrationsReady')}</p>
                    <p className="text-orange-700 text-sm mt-1">
                      {pendingCount} {pendingCount > 1 ? t('dashboard.pendingRegistrationsMessagePlural') : t('dashboard.pendingRegistrationsMessage')}
                    </p>
                  </div>
                </div>
              </div>
            ) : state.choreographies.length > 0 || state.coaches.length > 0 || state.judges.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-green-800">{t('dashboard.allRegistrationsSubmitted')}</p>
                    <p className="text-green-700 text-sm mt-1">
                      {t('dashboard.allRegistrationsMessage')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">{t('dashboard.noRegistrationsYet')}</p>
                    <p className="text-gray-700 text-sm mt-1">
                      {t('dashboard.noRegistrationsMessage')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-800">{pendingRegistrations?.totals.total || 0}</div>
              <div className="text-sm text-orange-700">{t('dashboard.totalPending')}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-800">{pendingRegistrations?.totals.choreographies || 0}</div>
              <div className="text-sm text-blue-700">{t('dashboard.choreographies')}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-800">{pendingRegistrations?.totals.coaches || 0}</div>
              <div className="text-sm text-purple-700">{t('navigation.coaches')}</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-800">{pendingRegistrations?.totals.judges || 0}</div>
              <div className="text-sm text-red-700">{t('navigation.judges')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              {t('dashboard.pendingRegistrations')} {t('dashboard.choreographies')} ({pendingRegistrations?.choreographies.length || 0})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              {t('dashboard.submittedRegistrations')} ({submittedRegistrations?.totals.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRegistrations && pendingRegistrations.choreographies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-blue-600" />
                    {t('dashboard.choreographies')} ({pendingRegistrations.choreographies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRegistrations.choreographies.map((choreography) => (
                      <div key={choreography.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <Award className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium">{choreography.category}</p>
                            <Badge variant="outline" className="text-xs">
                              {t('dashboard.pending').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{choreography.gymnasts.length} {t('dashboard.gymnasts')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {pendingRegistrations && pendingRegistrations.coaches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-purple-600" />
                    {t('dashboard.pendingRegistrations')} {t('navigation.coaches')} ({pendingRegistrations.coaches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRegistrations.coaches.map((coach) => (
                      <div key={coach.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-medium">{coach.firstName} {coach.lastName}</p>
                            <p className="text-sm text-gray-600">{t('dashboard.level')} {coach.level}</p>
                            <Badge variant="outline" className="text-xs">
                              {t('dashboard.pending').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{getCountryInfo(coach.country).flag} {getCountryInfo(coach.country).name}</p>
                          <span className="text-xs text-gray-500">{t('dashboard.figId')}: {coach.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {pendingRegistrations && pendingRegistrations.judges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-red-600" />
                    {t('dashboard.pendingRegistrations')} {t('navigation.judges')} ({pendingRegistrations.judges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRegistrations.judges.map((judge) => (
                      <div key={judge.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-red-600" />
                          <div>
                            <p className="font-medium">{judge.firstName} {judge.lastName}</p>
                            <p className="text-sm text-gray-600">{t('dashboard.category')} {judge.category}</p>
                            <Badge variant="outline" className="text-xs">
                              {t('dashboard.pending').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{getCountryInfo(judge.country).flag} {getCountryInfo(judge.country).name}</p>
                          <span className="text-xs text-gray-500">{t('dashboard.figId')}: {judge.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(!pendingRegistrations || (pendingRegistrations.choreographies.length === 0 && pendingRegistrations.coaches.length === 0 && pendingRegistrations.judges.length === 0)) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('dashboard.pendingRegistrations')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('dashboard.noRegistrationsMessage')}
                    </p>
                    <Button 
                      onClick={() => router.push(`/registration/tournament/${tournamentId}/choreography`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {t('dashboard.startRegistering')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedRegistrations && submittedRegistrations.totals.total > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{submittedRegistrations.totals.total} {t('dashboard.submittedRegistrations')}</h3>
                  </CardTitle>
                  <p className="text-gray-600">
                    {submittedRegistrations.totals.total} {t('dashboard.itemsInDatabase')}
                  </p>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('dashboard.noRegistrationsSubmittedTitle')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('dashboard.noRegistrationsSubmittedMessage')}
                    </p>
                    <Button 
                      onClick={() => router.push(`/registration/tournament/${tournamentId}/choreography`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {t('dashboard.startRegistering')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 