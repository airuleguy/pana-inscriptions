'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
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
import { useTranslations } from '@/contexts/i18n-context';
import { APIService } from '@/lib/api';
import { generateChoreographyName, calculateAge, calculateCategory, calculateCompetitionYearAge, determineChoreographyType } from '@/lib/utils';
import { getLocalePrefix } from '@/lib/locale';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const choreographyTypes = [
  { value: 'MIND', count: 1 },
  { value: 'WIND', count: 1 },
  { value: 'MXP', count: 2 },
  { value: 'TRIO', count: 3 },
  { value: 'GRP', count: 5 },
  { value: 'DNCE', count: 8 },
] as const;

export default function ChoreographyRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = params.tournamentId as string;
  const { addChoreography } = useRegistration();
  const { t } = useTranslations('common');
  
  // Get locale prefix for navigation
  const localePrefix = getLocalePrefix(pathname || '');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Form state
  const [choreographyName, setChoreographyName] = useState('');
  const [choreographyType, setChoreographyType] = useState<ChoreographyType | ''>('');
  const [category, setCategory] = useState<ChoreographyCategory | ''>('');
  const [gymnasts, setGymnasts] = useState<Gymnast[]>([]);
  const [clubName, setClubName] = useState('');
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    choreography?: Choreography;
  } | null>(null);

  // Get the first gymnast's category for filtering
  const firstGymnastCategory = gymnasts.length > 0 ? gymnasts[0].category : undefined;

  // Load tournament and country from localStorage and URL
  useEffect(() => {
    const loadData = async () => {
      try {
        const tournamentData = localStorage.getItem('selectedTournament');
        const countryData = localStorage.getItem('selectedCountry');

        if (!tournamentData || !countryData) {
          router.push(`${localePrefix}/tournament-selection`);
          return;
        }

        const tournament = JSON.parse(tournamentData);
        
        // Validate that the tournament ID from URL matches the stored one
        if (tournament.id !== tournamentId) {
          router.push(`${localePrefix}/tournament-selection`);
          return;
        }

        setSelectedTournament(tournament);
        setSelectedCountry(countryData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tournament data:', error);
        router.push(`${localePrefix}/tournament-selection`);
      }
    };

    if (tournamentId) {
      loadData();
    } else {
      router.push(`${localePrefix}/tournament-selection`);
    }
  }, [tournamentId, router]);

  // Get expected gymnast count for selected type
  const expectedGymnastCount = choreographyTypes.find(t => t.value === choreographyType)?.count || 1;

  // Automatic detection effect - runs when gymnasts are selected
  // Note: First gymnast's category is used to filter subsequent gymnast selections
  useEffect(() => {
    if (gymnasts.length > 0) {
      // Auto-generate choreography name from gymnast surnames (always works)
      const autoName = generateChoreographyName(gymnasts);
      setChoreographyName(autoName);

      // Try to determine choreography type - handle invalid counts gracefully
      try {
        const autoType = determineChoreographyType(gymnasts.length, gymnasts);
        setChoreographyType(autoType as ChoreographyType);

        // Auto-calculate category based on oldest gymnast's competition year age
        const competitionAges = gymnasts.map(gymnast => calculateCompetitionYearAge(gymnast.dateOfBirth));
        const oldestCompetitionAge = Math.max(...competitionAges);
        const autoCategory = calculateCategory(oldestCompetitionAge);
        setCategory(autoCategory as ChoreographyCategory);

        // Show success message for valid combinations
        const typeDisplayName = t(`choreography.types.${autoType}`);
        
        toast.success(t('choreography.autoDetectedSuccess'), {
          description: `${autoName} | ${typeDisplayName} | ${autoCategory}`,
          duration: 2000,
        });
      } catch (error) {
        // Invalid count - keep last valid type/category, only update name
        // Show informative message about valid counts
        const validCounts = [1, 2, 3, 5, 8];
        const nextValidCount = validCounts.find(count => count > gymnasts.length) || 8;
        const prevValidCount = validCounts.reverse().find(count => count < gymnasts.length) || 1;
        
        toast.info(t('choreography.invalidCountInfo').replace('{count}', gymnasts.length.toString()), {
          description: t('choreography.invalidCountDetails')
            .replace('{next}', nextValidCount.toString())
            .replace('{prev}', prevValidCount.toString()),
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
        message: t('choreography.missingData'),
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
        club: clubName.trim() || undefined,
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
          message: t('choreography.choreographyRegisteredMessage'),
          choreography: registeredChoreography,
        });

        toast.success(t('choreography.registrationSuccess'), {
          description: t('choreography.registrationSuccessDescription'),
          duration: 3000,
        });
      } else {
        // Handle API errors
        const errorMessage = response.errors?.join(', ') || t('choreography.registrationFailedDescription');
        setRegistrationResult({
          success: false,
          message: errorMessage,
        });

        toast.error(t('choreography.registrationFailedTitle'), {
          description: errorMessage.includes('FIG ID') 
            ? t('choreography.registrationFailedDescription')
            : errorMessage,
          duration: 8000,
        });
      }

      // Reset form
      setChoreographyName('');
      setChoreographyType('');
      setCategory('');
      setClubName('');
      setGymnasts([]);
      
    } catch (err) {
      console.error('Choreography registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : t('choreography.registrationFailedDescription');
      setRegistrationResult({
        success: false,
        message: errorMessage,
      });
      
      toast.error(t('choreography.registrationError'), {
        description: errorMessage.includes('FIG ID') 
          ? t('choreography.registrationFailedDescription')
          : errorMessage,
        duration: 8000,
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
          <p className="text-muted-foreground">{t('choreography.loadingMessage')}</p>
        </div>
      </div>
    );
  }

  if (!selectedTournament || !selectedCountry) {
    return null;
  }

  const countryInfo = getCountryByCode(selectedCountry);
  const countryName = countryInfo?.name || selectedCountry;

  // Build gymnast selection description dynamically
  const getGymnastSelectionDescription = () => {
    if (gymnasts.length === 0) {
      return t('choreography.gymnastSelectionEmpty').replace('{country}', countryName);
    }
    
    let description = t('choreography.gymnastSelectionWithCount')
      .replace('{count}', gymnasts.length.toString())
      .replace('{plural}', gymnasts.length > 1 ? 's' : '')
      .replace('{country}', countryName);
    
    if (choreographyType) {
      const typeDisplayName = t(`choreography.types.${choreographyType}`);
      description += t('choreography.typeDetected').replace('{type}', typeDisplayName.toLowerCase());
    }
    
    if (firstGymnastCategory) {
      description += t('choreography.categoryFilterActive').replace('{category}', firstGymnastCategory);
    }
    
    return description;
  };

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('choreography.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('choreography.description')} {selectedTournament.name}
          </p>
        </div>

        <div className="space-y-6">
          {/* Gymnast Selection */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('choreography.gymnastSelection')} {gymnasts.length > 0 && `(${gymnasts.length} ${t('gymnasts.table.selected')})`}
              </CardTitle>
              <CardDescription>
                {getGymnastSelectionDescription()}
              </CardDescription>
              {firstGymnastCategory && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    {t('choreography.categoryFilterNotice').replace('{category}', firstGymnastCategory)}
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
                requiredCategory={firstGymnastCategory}
              />
            </CardContent>
          </Card>

          {/* Basic Information - Auto-detected details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('choreography.basicInformation')}</CardTitle>
              <CardDescription>
                {t('choreography.basicInformationDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('choreography.choreographyName')}</Label>
                  <Input
                    id="name"
                    placeholder={t('choreography.choreographyNamePlaceholder')}
                    value={choreographyName}
                    onChange={(e) => setChoreographyName(e.target.value)}
                    className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}
                  />
                  {gymnasts.length > 0 && (
                    <p className="text-xs text-green-600">{t('choreography.autoGeneratedFromGymnasts')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('choreography.type')}</Label>
                  <Select value={choreographyType} onValueChange={(value) => setChoreographyType(value as ChoreographyType)} disabled={gymnasts.length > 0}>
                    <SelectTrigger className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}>
                      <SelectValue placeholder={t('choreography.typePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {choreographyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(`choreography.types.${type.value}`)} ({type.count} {t('gymnasts.table.gymnast')}{type.count > 1 ? 's' : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {gymnasts.length > 0 && (
                    <p className="text-xs text-green-600">{t('choreography.autoDetectedFromCount')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t('choreography.category')}</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ChoreographyCategory)} disabled={gymnasts.length > 0}>
                  <SelectTrigger className={gymnasts.length > 0 ? "bg-green-50 border-green-200" : ""}>
                    <SelectValue placeholder={t('choreography.categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATDEV">{t('choreography.natdevCategory')}</SelectItem>
                    <SelectItem value="YOUTH">{t('choreography.youthCategory')}</SelectItem>
                    <SelectItem value="JUNIOR">{t('choreography.juniorCategory')}</SelectItem>
                    <SelectItem value="SENIOR">{t('choreography.seniorCategory')}</SelectItem>
                  </SelectContent>
                </Select>
                {gymnasts.length > 0 && (
                  <p className="text-xs text-green-600">{t('choreography.autoDetectedFromAge')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="club">{t('fields.club.name')}</Label>
                <Input
                  id="club"
                  placeholder={t('fields.club.placeholder')}
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{t('fields.club.description')}</p>
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
                      {registrationResult.success ? t('choreography.registrationSuccessful') : t('choreography.registrationFailed')}
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
              {submitting ? t('choreography.addingToSummary') : t('choreography.addToSummary')}
            </Button>
            
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/dashboard`)}
            >
              {t('choreography.viewSummary')}
            </Button>
          </div>
        </div>
    </div>
  );
}