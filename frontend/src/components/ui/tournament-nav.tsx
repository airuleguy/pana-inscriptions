'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useRegistration } from '@/contexts/registration-context';
import { Trophy, Users, UserCheck, ClipboardList, ChevronLeft, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface TournamentNavProps {
  currentPage?: string;
  showRegistrationSummary?: boolean;
  onToggleRegistrationSummary?: () => void;
}

export function TournamentNav({ 
  showRegistrationSummary = false,
  onToggleRegistrationSummary 
}: TournamentNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, getTotalCount } = useRegistration();
  const totalCount = getTotalCount();

  // Extract tournament ID from current path
  const tournamentId = pathname?.split('/')[3]; // /registration/tournament/[tournamentId]/...

  const navigationItems = [
    {
      id: 'choreography',
      label: 'Choreography',
      icon: ClipboardList,
      href: `/registration/tournament/${tournamentId}/choreography`,
      description: 'Register gymnastic routines'
    },
    {
      id: 'coaches',
      label: 'Coaches',
      icon: UserCheck,
      href: `/registration/tournament/${tournamentId}/coaches`,
      description: 'Register coaching staff'
    },
    {
      id: 'judges',
      label: 'Judges',
      icon: Users,
      href: `/registration/tournament/${tournamentId}/judges`,
      description: 'Register judging panel'
    }
  ];

  const handleTournamentNameClick = () => {
    router.push('/tournament-selection');
  };

  const handleSummaryClick = () => {
    if (onToggleRegistrationSummary) {
      onToggleRegistrationSummary();
    }
  };

  return (
    <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Tournament info and navigation */}
          <div className="flex items-center gap-4">
            {/* Tournament name - clickable to go back */}
            <button 
              onClick={handleTournamentNameClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground text-sm">
                  {state.tournament?.shortName || state.tournament?.name || 'Tournament Registration'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Click to change tournament
                </div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              {navigationItems.map((item) => {
                const isActive = pathname?.includes(item.id);
                const Icon = item.icon;
                
                return (
                  <Link key={item.id} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center gap-2 ${
                        isActive 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "hover:bg-blue-50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="mt-6 space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = pathname?.includes(item.id);
                      const Icon = item.icon;
                      
                      return (
                        <Link key={item.id} href={item.href}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            className={`w-full justify-start gap-2 ${
                              isActive 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "hover:bg-blue-50"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs opacity-70">{item.description}</div>
                            </div>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Right side - Summary button */}
          <div className="flex items-center gap-4">
            {showRegistrationSummary && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSummaryClick}
                className="relative border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Summary
                {totalCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {totalCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile tournament info */}
        <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-4 h-4" />
              <span>Registration Portal</span>
            </div>
            {state.country && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span>{state.country}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 