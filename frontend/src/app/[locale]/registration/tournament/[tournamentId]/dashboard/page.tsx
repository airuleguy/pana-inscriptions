'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Tournament, Choreography, Coach, Judge } from '@/types';
import { useRegistration } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
import { APIService } from '@/lib/api';
import { getCountryByCode } from '@/lib/countries';
import { getLocalePrefix } from '@/lib/locale';
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
import { useAuth } from '@/contexts/auth-context';

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

// Reusable Registration Summary Card Component
interface RegistrationSummaryCardProps {
  title: string;
  count: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'pending' | 'submitted';
}

function RegistrationSummaryCard({ title, count, label, icon: Icon, variant }: RegistrationSummaryCardProps) {
  const colors = {
    pending: {
      card: 'border-orange-200 bg-orange-50',
      icon: 'text-orange-600',
      title: 'text-orange-900',
      count: 'text-orange-800',
      label: 'text-orange-700'
    },
    submitted: {
      card: 'border-green-200 bg-green-50',
      icon: 'text-green-600',
      title: 'text-green-900',
      count: 'text-green-800',
      label: 'text-green-700'
    }
  };

  const colorScheme = colors[variant];

  return (
    <Card className={colorScheme.card}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
          <h3 className={`font-semibold text-lg ${colorScheme.title}`}>{title}</h3>
        </CardTitle>
        <div className={`text-2xl font-bold ${colorScheme.count}`}>
          {count} {label}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className={`text-sm ${colorScheme.label}`}>{variant === 'pending' ? 'Pendiente' : 'Enviado'}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Reusable Individual Registration Card Components
interface ChoreographyCardProps {
  choreography: Choreography;
  status: 'pending' | 'submitted';
  t: (key: string) => string;
}

function ChoreographyCard({ choreography, status, t }: ChoreographyCardProps) {
  const colorScheme = status === 'pending' 
    ? { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'text-blue-800' }
    : { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'text-blue-800' };

  return (
    <div className={`${colorScheme.bg} rounded-lg border ${colorScheme.border} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Award className={`w-4 h-4 ${colorScheme.icon}`} />
          <div>
            <p className="font-medium">{choreography.name || choreography.category}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {choreography.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {status === 'pending' ? t('dashboard.pending').toUpperCase() : t('dashboard.submitted').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">{choreography.gymnasts.length} {t('dashboard.gymnasts')}</p>
        </div>
      </div>
      
      {/* Gymnast List */}
      {choreography.gymnasts.length > 0 && (
        <div className="space-y-2">
          {choreography.gymnasts.map((gymnast, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="font-medium">{gymnast.firstName} {gymnast.lastName}</span>
              <span className="text-gray-500">{gymnast.country}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CoachCardProps {
  coach: Coach;
  status: 'pending' | 'submitted';
  t: (key: string) => string;
  getCountryInfo: (code: string) => { code: string; name: string; flag: string };
}

function CoachCard({ coach, status, t, getCountryInfo }: CoachCardProps) {
  const colorScheme = status === 'pending' 
    ? { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' }
    : { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' };

  return (
    <div className={`flex items-center justify-between p-3 ${colorScheme.bg} rounded-lg border ${colorScheme.border}`}>
      <div className="flex items-center gap-3">
        <User className={`w-4 h-4 ${colorScheme.icon}`} />
        <div>
          <p className="font-medium">{coach.firstName} {coach.lastName}</p>
          <p className="text-sm text-gray-600">{t('dashboard.level')} {coach.level}</p>
          <Badge variant="outline" className="text-xs">
            {status === 'pending' ? t('dashboard.pending').toUpperCase() : t('dashboard.submitted').toUpperCase()}
          </Badge>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{getCountryInfo(coach.country).flag} {getCountryInfo(coach.country).name}</p>
        <span className="text-xs text-gray-500">{t('dashboard.figId')}: {coach.id}</span>
      </div>
    </div>
  );
}

interface JudgeCardProps {
  judge: Judge;
  status: 'pending' | 'submitted';
  t: (key: string) => string;
  getCountryInfo: (code: string) => { code: string; name: string; flag: string };
}

function JudgeCard({ judge, status, t, getCountryInfo }: JudgeCardProps) {
  const colorScheme = status === 'pending' 
    ? { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' }
    : { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' };

  return (
    <div className={`flex items-center justify-between p-3 ${colorScheme.bg} rounded-lg border ${colorScheme.border}`}>
      <div className="flex items-center gap-3">
        <User className={`w-4 h-4 ${colorScheme.icon}`} />
        <div>
          <p className="font-medium">{judge.firstName} {judge.lastName}</p>
          <p className="text-sm text-gray-600">{t('dashboard.category')} {judge.category}</p>
          <Badge variant="outline" className="text-xs">
            {status === 'pending' ? t('dashboard.pending').toUpperCase() : t('dashboard.submitted').toUpperCase()}
          </Badge>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-600">{getCountryInfo(judge.country).flag} {getCountryInfo(judge.country).name}</p>
        <span className="text-xs text-gray-500">{t('dashboard.figId')}: {judge.id}</span>
      </div>
    </div>
  );
}

// Reusable Registration Section Component
interface RegistrationSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  count: number;
  status: 'pending' | 'submitted';
  type?: 'choreography' | 'coach' | 'judge';
}

function RegistrationSection({ title, icon: Icon, children, count, status, type }: RegistrationSectionProps) {
  const getIconColor = () => {
    switch (type) {
      case 'choreography': return 'text-blue-600';
      case 'coach': return 'text-purple-600';
      case 'judge': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  if (count === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${getIconColor()}`} />
          {title} ({count})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TournamentRegistrationDashboard() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = params.tournamentId as string;
  const { state, canConfirmRegistration, getPendingCount, getRegistrationsByStatus } = useRegistration();
  const { t } = useTranslations('common');
  const { state: authState } = useAuth();
  
  // Get locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [pendingRegistrations, setPendingRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [submittedRegistrations, setSubmittedRegistrations] = useState<SubmittedRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  const isAdmin = authState.user?.role === 'ADMIN';
  const userCountry = authState.user?.country || '';

  // Load tournament data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const tournament = await APIService.getTournament(tournamentId);
        setSelectedTournament(tournament);
        
        // Determine country based on user role
        let countryToUse = '';
        
        if (isAdmin) {
          // Admin: Check localStorage first, then use tournament country or user country as fallback
          const storedCountry = localStorage.getItem('selectedCountry');
          countryToUse = storedCountry || userCountry || 'URU';
        } else {
          // Delegate: Always use user's assigned country
          countryToUse = userCountry;
        }
        
        setSelectedCountry(countryToUse);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament data:', error);
        router.push(`${localePrefix}/tournament-selection`);
      }
    };

    if (tournamentId && authState.user) {
      loadData();
    } else if (tournamentId && !authState.isLoading) {
      // No user available and not loading, redirect to tournament selection
      router.push(`${localePrefix}/tournament-selection`);
    }
  }, [tournamentId, router, authState.user, authState.isLoading, isAdmin, userCountry]);

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
      href: `${localePrefix}/registration/tournament/${tournamentId}/choreography`,
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
      href: `${localePrefix}/registration/tournament/${tournamentId}/coaches`,
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
      href: `${localePrefix}/registration/tournament/${tournamentId}/judges`,
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
          <RegistrationSummaryCard 
            title={t('dashboard.pendingRegistrations')} 
            count={pendingRegistrations?.totals.total || 0} 
            label={t('dashboard.itemsReadyForSubmission')} 
            icon={Clock} 
            variant="pending" 
          />

          {/* Submitted Registrations */}
          <RegistrationSummaryCard 
            title={t('dashboard.submittedRegistrations')} 
            count={submittedRegistrations?.totals.total || 0} 
            label={t('dashboard.itemsInDatabase')} 
            icon={Database} 
            variant="submitted" 
          />
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
              <div className="text-2xl font-bold text-orange-800">{pendingRegistrations?.totals.judges || 0}</div>
              <div className="text-sm text-orange-700">{t('navigation.judges')}</div>
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
              <RegistrationSection 
                title={t('dashboard.choreographies')} 
                icon={Music} 
                count={pendingRegistrations.choreographies.length} 
                status="pending"
                type="choreography"
              >
                {pendingRegistrations.choreographies.map((choreography) => (
                  <ChoreographyCard 
                    key={choreography.id} 
                    choreography={choreography} 
                    status="pending" 
                    t={t} 
                  />
                ))}
              </RegistrationSection>
            )}

            {pendingRegistrations && pendingRegistrations.coaches.length > 0 && (
              <RegistrationSection 
                title={`${t('dashboard.pendingRegistrations')} ${t('navigation.coaches')}`} 
                icon={GraduationCap} 
                count={pendingRegistrations.coaches.length} 
                status="pending"
                type="coach"
              >
                {pendingRegistrations.coaches.map((coach) => (
                  <CoachCard 
                    key={coach.id} 
                    coach={coach} 
                    status="pending" 
                    t={t} 
                    getCountryInfo={getCountryInfo} 
                  />
                ))}
              </RegistrationSection>
            )}

            {pendingRegistrations && pendingRegistrations.judges.length > 0 && (
              <RegistrationSection 
                title={`${t('dashboard.pendingRegistrations')} ${t('navigation.judges')}`} 
                icon={Scale} 
                count={pendingRegistrations.judges.length} 
                status="pending"
                type="judge"
              >
                {pendingRegistrations.judges.map((judge) => (
                  <JudgeCard 
                    key={judge.id} 
                    judge={judge} 
                    status="pending" 
                    t={t} 
                    getCountryInfo={getCountryInfo} 
                  />
                ))}
              </RegistrationSection>
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
                      onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/choreography`)}
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
            {submittedRegistrations && submittedRegistrations.choreographies.length > 0 && (
              <RegistrationSection 
                title={t('dashboard.choreographies')} 
                icon={Music} 
                count={submittedRegistrations.choreographies.length} 
                status="submitted"
                type="choreography"
              >
                {submittedRegistrations.choreographies.map((choreography) => (
                  <ChoreographyCard 
                    key={choreography.id} 
                    choreography={choreography} 
                    status="submitted" 
                    t={t} 
                  />
                ))}
              </RegistrationSection>
            )}

            {submittedRegistrations && submittedRegistrations.coaches.length > 0 && (
              <RegistrationSection 
                title={`${t('dashboard.submittedRegistrations')} ${t('navigation.coaches')}`} 
                icon={GraduationCap} 
                count={submittedRegistrations.coaches.length} 
                status="submitted"
                type="coach"
              >
                {submittedRegistrations.coaches.map((coach) => (
                  <CoachCard 
                    key={coach.id} 
                    coach={coach} 
                    status="submitted" 
                    t={t} 
                    getCountryInfo={getCountryInfo} 
                  />
                ))}
              </RegistrationSection>
            )}

            {submittedRegistrations && submittedRegistrations.judges.length > 0 && (
              <RegistrationSection 
                title={`${t('dashboard.submittedRegistrations')} ${t('navigation.judges')}`} 
                icon={Scale} 
                count={submittedRegistrations.judges.length} 
                status="submitted"
                type="judge"
              >
                {submittedRegistrations.judges.map((judge) => (
                  <JudgeCard 
                    key={judge.id} 
                    judge={judge} 
                    status="submitted" 
                    t={t} 
                    getCountryInfo={getCountryInfo} 
                  />
                ))}
              </RegistrationSection>
            )}

            {(!submittedRegistrations || (submittedRegistrations.choreographies.length === 0 && submittedRegistrations.coaches.length === 0 && submittedRegistrations.judges.length === 0)) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{t('dashboard.noRegistrationsSubmittedTitle')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('dashboard.noRegistrationsSubmittedMessage')}
                    </p>
                    <Button 
                      onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/choreography`)}
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