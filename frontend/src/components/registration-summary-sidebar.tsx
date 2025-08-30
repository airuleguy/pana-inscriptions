'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useRegistration } from '@/contexts/registration-context';
import { useTranslations } from '@/contexts/i18n-context';
import { 
  UserPlus, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Users, 
  UserCheck, 
  ClipboardList,
  Trophy,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ShieldPlus
} from 'lucide-react';
import { countries } from '@/lib/countries';

interface RegistrationSummarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onConfirmRegistration: () => void;
  isSubmitting?: boolean;
}

export function RegistrationSummarySidebar({ 
  isOpen, 
  onToggle, 
  onConfirmRegistration,
  isSubmitting = false
}: RegistrationSummarySidebarProps) {
  const { t } = useTranslations('common');
  const { state, removeChoreography, removeCoach, removeJudge, removeSupportStaff, getTotalCount, canConfirmRegistration, getPendingCount, getRegistrationsByStatus, syncPendingRegistrations, isLoading } = useRegistration();
  const [syncingPending, setSyncingPending] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    choreographies: true,
    coaches: true,
    judges: true,
    supportStaff: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getCountryInfo = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country || { code, name: code, flag: '🏳️' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSyncPending = async () => {
    setSyncingPending(true);
    try {
      await syncPendingRegistrations();
    } catch (error) {
      console.error('Failed to sync pending registrations:', error);
    } finally {
      setSyncingPending(false);
    }
  };

  const totalCount = getTotalCount();
  const pendingCount = getPendingCount();
  const pendingRegistrations = getRegistrationsByStatus('PENDING');
  const submittedRegistrations = getRegistrationsByStatus('SUBMITTED');

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="right" className="w-96 p-0 gap-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-4 pr-12 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <SheetTitle className="text-lg font-semibold text-gray-900">
                    {t('registrationSummary.title')}
                  </SheetTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSyncPending}
                    disabled={syncingPending || isLoading || !state.tournament || !state.country}
                    className="h-8 w-8 p-0"
                    title={t('registrationSummary.refreshTooltip')}
                  >
                    <RefreshCw className={`w-4 h-4 ${syncingPending ? 'animate-spin' : ''}`} />
                  </Button>
                  {pendingCount > 0 && (
                    <Badge variant="default" className="bg-orange-100 text-orange-800">
                      {t('registrationSummary.pendingBadge').replace('{count}', pendingCount.toString())}
                    </Badge>
                  )}
                </div>
              </div>
              <SheetDescription className="text-sm text-gray-600">
                {pendingCount > 0 
                  ? t('registrationSummary.description').replace('{count}', pendingCount.toString())
                  : t('registrationSummary.descriptionAllSubmitted')
                }
              </SheetDescription>
              {state.tournament && state.country && (
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    <span className="truncate">{state.tournament.shortName || state.tournament.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{getCountryInfo(state.country).flag}</span>
                    <span>{getCountryInfo(state.country).name}</span>
                  </div>
                </div>
              )}
            </SheetHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pendingCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">{t('registrationSummary.emptyState.title')}</p>
                  <p className="text-sm">{t('registrationSummary.emptyState.description')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Choreographies Section */}
                  {pendingRegistrations.choreographies.length > 0 && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-purple-600" />
                            <span className="text-purple-800">{t('registrationSummary.sections.choreographies')}</span>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {pendingRegistrations.choreographies.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('choreographies')}
                            className="h-6 w-6 p-0"
                          >
                            {expandedSections.choreographies ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.choreographies && (
                        <CardContent className="pt-0 space-y-3">
                          {pendingRegistrations.choreographies.map((choreo) => (
                            <div key={choreo.id} className="bg-white p-3 rounded-lg border border-purple-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{choreo.name}</h4>
                                    <Badge variant="outline">
                                      {choreo.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                    <Badge variant="default">
                                      {choreo.category}
                                    </Badge>
                                                                         <span>{choreo.type}</span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>
                                        {choreo.gymnastsCount === 1 
                                          ? t('registrationSummary.choreographyCard.gymnastCount').replace('{count}', choreo.gymnastsCount.toString())
                                          : t('registrationSummary.choreographyCard.gymnastCountPlural').replace('{count}', choreo.gymnastsCount.toString())
                                        }
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {formatDate(choreo.registeredAt)}
                                    </span>
                                  </div>
                                  {/* Gymnast List */}
                                  {choreo.gymnasts && choreo.gymnasts.length > 0 && (
                                    <div className="text-sm text-gray-600">
                                      {choreo.gymnasts.map((gymnast, index) => (
                                        <span key={gymnast.figId}>
                                          {gymnast.firstName} {gymnast.lastName}
                                          {index < choreo.gymnasts.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeChoreography(choreo.id)}
                                  className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Coaches Section */}
                  {pendingRegistrations.coaches.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-800">{t('registrationSummary.sections.coaches')}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {pendingRegistrations.coaches.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('coaches')}
                            className="h-6 w-6 p-0"
                          >
                            {expandedSections.coaches ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.coaches && (
                        <CardContent className="pt-0 space-y-3">
                          {pendingRegistrations.coaches.map((coach) => (
                            <div key={coach.id} className="bg-white p-3 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{coach.name}</h4>
                                  <p className="text-sm text-gray-600">{coach.level} • {coach.country}</p>
                                  <p className="text-xs text-gray-500">{formatDate(coach.registeredAt)}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeCoach(coach.id)}
                                  className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Judges Section */}
                  {pendingRegistrations.judges.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-800">{t('registrationSummary.sections.judges')}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {pendingRegistrations.judges.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('judges')}
                            className="h-6 w-6 p-0"
                          >
                            {expandedSections.judges ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.judges && (
                        <CardContent className="pt-0 space-y-3">
                          {pendingRegistrations.judges.map((judge) => (
                            <div key={judge.id} className="bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{judge.name}</h4>
                                  <p className="text-sm text-gray-600">{judge.category} • {judge.country}</p>
                                  <p className="text-xs text-gray-500">{formatDate(judge.registeredAt)}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeJudge(judge.id)}
                                  className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Support Staff Section */}
                  {pendingRegistrations.supportStaff && pendingRegistrations.supportStaff.length > 0 && (
                    <Card className="border-emerald-200 bg-emerald-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldPlus className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-800">{t('registrationSummary.sections.support')}</span>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                              {pendingRegistrations.supportStaff.length}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('supportStaff')}
                            className="h-6 w-6 p-0"
                          >
                            {expandedSections.supportStaff ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.supportStaff && (
                        <CardContent className="pt-0 space-y-3">
                          {pendingRegistrations.supportStaff.map((supportStaff) => (
                            <div key={supportStaff.id} className="bg-white p-3 rounded-lg border border-emerald-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{supportStaff.name}</h4>
                                  <p className="text-sm text-gray-600">{supportStaff.role} • {supportStaff.country}</p>
                                  <p className="text-xs text-gray-500">{formatDate(supportStaff.registeredAt)}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeSupportStaff(supportStaff.id)}
                                  className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              {pendingCount > 0 ? (
                <Button 
                  onClick={onConfirmRegistration}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 disabled:opacity-50"
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 mr-2" />
                  )}
                  {isSubmitting 
                    ? t('registrationSummary.submitButton.submitting') 
                    : pendingCount > 1 
                      ? t('registrationSummary.submitButton.submitPlural').replace('{count}', pendingCount.toString())
                      : t('registrationSummary.submitButton.submit').replace('{count}', pendingCount.toString())
                  }
                </Button>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('registrationSummary.submitButton.allSubmitted')}</span>
                  </div>
                  <Button disabled className="w-full" size="lg">
                    {t('registrationSummary.submitButton.noRegistrations')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 