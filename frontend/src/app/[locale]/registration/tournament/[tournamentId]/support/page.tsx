'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tournament } from '@/types';
import { SupportRole } from '@/types';
import { useTranslations } from '@/contexts/i18n-context';
import { useRegistration, RegisteredSupportStaff } from '@/contexts/registration-context';
import { APIService } from '@/lib/api';
import { getLocalePrefix } from '@/lib/locale';
import { UserPlus, Save, Loader2, ShieldPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SupportFormRow {
  firstName: string;
  lastName: string;
  role: SupportRole;
}

export default function SupportRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const tournamentId = params.tournamentId as string;
  const currentLocale = params.locale as string;
  const { t } = useTranslations('common');
  const { addSupportStaff } = useRegistration();

  const localePrefix = getLocalePrefix(pathname || '');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [rows, setRows] = useState<SupportFormRow[]>([
    { firstName: '', lastName: '', role: SupportRole.DELEGATION_LEADER },
  ]);

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
        if (tournament.id !== tournamentId) {
          router.push(`${localePrefix}/tournament-selection`);
          return;
        }
        setSelectedTournament(tournament);
        setSelectedCountry(countryData);
        setLoading(false);
      } catch (e) {
        router.push(`${localePrefix}/tournament-selection`);
      }
    };
    if (tournamentId) loadData(); else router.push(`${localePrefix}/tournament-selection`);
  }, [tournamentId, router]);

  const handleChange = (index: number, field: keyof SupportFormRow, value: string | SupportRole) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows(prev => [...prev, { firstName: '', lastName: '', role: SupportRole.DELEGATION_LEADER }]);
  const removeRow = (index: number) => setRows(prev => prev.filter((_, i) => i !== index));

  const validate = (): boolean => {
    for (const r of rows) {
      if (!r.firstName?.trim() || !r.lastName?.trim()) return false;
    }
    return true;
  };

  const isFormValid = selectedCountry && 
    selectedTournament &&
    rows.length > 0 &&
    validate();

  // Handle registration submission - follows the same pattern as coaches/judges
  const handleSaveSelected = async () => {
    if (!validate()) {
      toast.error(t('forms.validationError') || 'Please complete required fields');
      return;
    }

    if (!selectedTournament || !selectedCountry) {
      toast.error(t('support.missingData') || 'Missing tournament or country selection');
      return;
    }

    setSubmitting(true);
    try {
      // Register support staff with backend API immediately
      const payload = rows.map(r => ({
        firstName: r.firstName.trim(),
        lastName: r.lastName.trim(),
        fullName: `${r.firstName} ${r.lastName}`.trim(),
        role: r.role,
      }));

      const response = await APIService.createSupport(selectedTournament.id, payload);

      if (response.success && response.results.length > 0) {
        // Create registration entries for local state with actual backend data
        const registrationData: RegisteredSupportStaff[] = response.results.map(supportStaff => ({
          id: supportStaff.id,
          name: supportStaff.fullName,
          role: supportStaff.role,
          country: supportStaff.country,
          registeredAt: supportStaff.createdAt ? new Date(supportStaff.createdAt) : new Date(),
          status: 'PENDING',
          supportData: supportStaff,
        }));

        // Add to registration summary
        registrationData.forEach(supportReg => addSupportStaff(supportReg));

        setRegistrationResult({
          success: true,
          message: `${t('support.registrationSuccessDescription').replace('{count}', response.results.length.toString())}`,
        });

        toast.success(t('support.registrationSuccess'), {
          description: `${t('support.registrationSuccessDescription').replace('{count}', response.results.length.toString())}`,
          duration: 5000,
        });

        // Reset form
        setRows([{ firstName: '', lastName: '', role: SupportRole.DELEGATION_LEADER }]);
      } else {
        // Handle API errors
        setRegistrationResult({
          success: false,
          message: response.errors?.join(', ') || t('support.registrationError'),
        });
        
        toast.error(t('support.registrationFailedTitle'), {
          description: response.errors?.join(', ') || t('support.registrationErrorDescription'),
        });
      }
    } catch (error: any) {
      setRegistrationResult({
        success: false,
        message: error.message || t('support.registrationError'),
      });
      
      toast.error(t('support.registrationError'), {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !selectedTournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldPlus className="w-8 h-8 text-emerald-600" />
          {t('support.title') || 'Support Registration'}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('support.description') || 'Create support personnel for tournament'} {selectedTournament.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {t('support.formTitle') || 'Create Support Personnel'}
          </CardTitle>
          <CardDescription>
            {t('support.formDescription') || 'Add one or more support personnel entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-b pb-4">
                <div className="space-y-2">
                  <Label>{t('general.firstName')}</Label>
                  <Input value={row.firstName} onChange={(e) => handleChange(index, 'firstName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('general.lastName')}</Label>
                  <Input value={row.lastName} onChange={(e) => handleChange(index, 'lastName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('support.roleLabel')}</Label>
                  <Select 
                    value={row.role} 
                    onValueChange={(value: SupportRole) => handleChange(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('support.rolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SupportRole.DELEGATION_LEADER}>
                        {t('support.roles.DELEGATION_LEADER')}
                      </SelectItem>
                      <SelectItem value={SupportRole.MEDIC}>
                        {t('support.roles.MEDIC')}
                      </SelectItem>
                      <SelectItem value={SupportRole.COMPANION}>
                        {t('support.roles.COMPANION')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 flex justify-end">
                  {rows.length > 1 && (
                    <Button variant="outline" onClick={() => removeRow(index)}>{t('general.remove')}</Button>
                  )}
                </div>
              </div>
            ))}

            {/* Registration Result */}
            {registrationResult && (
              <Card className={registrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {registrationResult.success ? (
                      <ShieldPlus className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className={`font-medium ${registrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {registrationResult.success ? t('support.registrationSuccessful') : t('support.registrationFailed')}
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
              <Button variant="outline" onClick={addRow}>{t('support.addAnother')}</Button>
              <Button
                onClick={handleSaveSelected}
                disabled={!isFormValid || submitting}
                size="lg"
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {submitting ? t('support.addingToSummary') : t('support.addToSummary')}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/dashboard`)}
              >
                {t('support.viewSummary')}
              </Button>
              
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => router.push(`${localePrefix}/registration/tournament/${tournamentId}/dashboard`)}
              >
                {t('support.backToDashboard')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


