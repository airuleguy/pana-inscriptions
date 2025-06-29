'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useRegistration } from '@/contexts/registration-context';
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
  Loader2
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
  const { state, removeChoreography, removeCoach, removeJudge, getTotalCount, canConfirmRegistration, getPendingCount, getRegistrationsByStatus } = useRegistration();
  const [expandedSections, setExpandedSections] = useState({
    choreographies: true,
    coaches: true,
    judges: true,
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
                    Registration Summary
                  </SheetTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {totalCount} total
                  </Badge>
                  {pendingCount > 0 && (
                    <Badge variant="default" className="bg-orange-100 text-orange-800">
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>
              </div>
              <SheetDescription className="text-sm text-gray-600">
                {pendingCount > 0 
                  ? `Review your ${pendingCount} pending registrations, then submit for approval`
                  : 'Review your registrations and their current status'
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
              {totalCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No registrations yet</p>
                  <p className="text-sm">Start registering choreographies, coaches, or judges</p>
                </div>
              ) : (
                <>
                  {/* Choreographies Section */}
                  {state.choreographies.length > 0 && (
                    <Card>
                      <CardHeader 
                        className="cursor-pointer pb-3" 
                        onClick={() => toggleSection('choreographies')}
                      >
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-purple-600" />
                            <span>Choreographies</span>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {state.choreographies.length}
                            </Badge>
                          </div>
                          {expandedSections.choreographies ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.choreographies && (
                        <CardContent className="space-y-3 pt-0">
                          {state.choreographies.map((choreo) => (
                            <div key={choreo.id} className="border rounded-lg p-3 bg-purple-50/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-sm truncate">{choreo.name}</h4>
                                    <Badge 
                                      variant={choreo.status === 'PENDING' ? 'default' : choreo.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                                      className={
                                        choreo.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                        choreo.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {choreo.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-purple-100 text-purple-800">
                                      {choreo.category}
                                    </Badge>
                                    <Badge variant="outline">
                                      {choreo.type}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <Users className="w-3 h-3" />
                                    <span>{choreo.gymnastsCount} gymnast{choreo.gymnastsCount !== 1 ? 's' : ''}</span>
                                    <span>•</span>
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(choreo.registeredAt)}</span>
                                  </div>
                                  {/* Gymnast List */}
                                  {choreo.gymnasts && choreo.gymnasts.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500">
                                      {choreo.gymnasts.map((gymnast, index) => (
                                        <span key={gymnast.id}>
                                          {gymnast.firstName} {gymnast.lastName}
                                          {index < choreo.gymnasts.length - 1 ? ', ' : ''}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {choreo.status === 'PENDING' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeChoreography(choreo.id)}
                                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Coaches Section */}
                  {state.coaches.length > 0 && (
                    <Card>
                      <CardHeader 
                        className="cursor-pointer pb-3" 
                        onClick={() => toggleSection('coaches')}
                      >
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span>Coaches</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {state.coaches.length}
                            </Badge>
                          </div>
                          {expandedSections.coaches ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.coaches && (
                        <CardContent className="space-y-3 pt-0">
                          {state.coaches.map((coach) => (
                            <div key={coach.id} className="border rounded-lg p-3 bg-green-50/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-sm truncate">{coach.name}</h4>
                                    <Badge 
                                      variant={coach.status === 'PENDING' ? 'default' : coach.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                                      className={
                                        coach.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                        coach.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {coach.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-green-100 text-green-800">
                                      {coach.level}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {getCountryInfo(coach.country).flag} {getCountryInfo(coach.country).name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(coach.registeredAt)}</span>
                                  </div>
                                </div>
                                {coach.status === 'PENDING' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeCoach(coach.id)}
                                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}

                  {/* Judges Section */}
                  {state.judges.length > 0 && (
                    <Card>
                      <CardHeader 
                        className="cursor-pointer pb-3" 
                        onClick={() => toggleSection('judges')}
                      >
                        <CardTitle className="flex items-center justify-between text-base">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Judges</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {state.judges.length}
                            </Badge>
                          </div>
                          {expandedSections.judges ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      {expandedSections.judges && (
                        <CardContent className="space-y-3 pt-0">
                          {state.judges.map((judge) => (
                            <div key={judge.id} className="border rounded-lg p-3 bg-blue-50/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-sm truncate">{judge.name}</h4>
                                    <Badge 
                                      variant={judge.status === 'PENDING' ? 'default' : judge.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                                      className={
                                        judge.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                                        judge.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                      }
                                    >
                                      {judge.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-blue-100 text-blue-800">
                                      Category {judge.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {getCountryInfo(judge.country).flag} {getCountryInfo(judge.country).name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(judge.registeredAt)}</span>
                                  </div>
                                </div>
                                {judge.status === 'PENDING' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeJudge(judge.id)}
                                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      )}
                    </Card>
                  )}
                </>
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
                  {isSubmitting ? 'Submitting...' : `Submit ${pendingCount} Pending Registration${pendingCount > 1 ? 's' : ''}`}
                </Button>
              ) : totalCount > 0 ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">All registrations submitted</span>
                  </div>
                  <Button disabled className="w-full" size="lg">
                    No pending registrations
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-orange-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">No items to register</span>
                  </div>
                  <Button disabled className="w-full" size="lg">
                    Add registrations first
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