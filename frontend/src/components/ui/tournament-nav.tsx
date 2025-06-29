'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Globe, Settings, ArrowLeft, UserPlus, ClipboardList, Users, UserCheck } from 'lucide-react';
import { Tournament } from '@/types';
import { countries } from '@/lib/countries';
import { useRegistration } from '@/contexts/registration-context';

interface TournamentNavProps {
  currentPage?: string;
  showRegistrationSummary?: boolean;
  onToggleRegistrationSummary?: () => void;
  showQuickNav?: boolean;
}

export function TournamentNav({ 
  currentPage = 'Registration',
  showRegistrationSummary = false,
  onToggleRegistrationSummary,
  showQuickNav = true
}: TournamentNavProps) {
  const router = useRouter();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const { getTotalCount } = useRegistration();

  useEffect(() => {
    setMounted(true);
    
    // Load selections from localStorage
    const tournamentData = localStorage.getItem('selectedTournament');
    const countryData = localStorage.getItem('selectedCountry');

    if (tournamentData && countryData) {
      try {
        setSelectedTournament(JSON.parse(tournamentData));
        setSelectedCountry(countryData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);

  const getCountryInfo = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country || { code, name: code, flag: '🏳️' };
  };

  const handleChangeSelection = () => {
    router.push('/tournament-selection');
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  if (!mounted || !selectedTournament || !selectedCountry) {
    return (
      <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Tournament Registration</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const countryInfo = getCountryInfo(selectedCountry);
  const totalCount = getTotalCount();

  return (
    <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Tournament Registration</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{countryInfo.flag} {countryInfo.name}</span>
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <button
                  onClick={handleChangeSelection}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
                >
                  {selectedTournament.name}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Navigation Buttons */}
            {showQuickNav && (
              <div className="hidden md:flex items-center gap-2 border-r border-gray-200 pr-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Link href="/registration/choreography">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Choreography
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Link href="/registration/coaches">
                    <Users className="w-4 h-4 mr-1" />
                    Coaches
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Link href="/registration/judges">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Judges
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {showRegistrationSummary && onToggleRegistrationSummary && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onToggleRegistrationSummary}
                  className="relative"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Summary
                  {totalCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0 min-w-[20px]">
                      {totalCount}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile view - show selection below */}
        <div className="sm:hidden mt-3 pt-3 border-t">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{countryInfo.flag} {countryInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={handleChangeSelection}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline decoration-dotted underline-offset-4"
              >
                {selectedTournament.name}
              </button>
            </div>
            
            {/* Mobile Quick Navigation */}
            {showQuickNav && (
              <div className="flex gap-2 mt-2 pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 flex-1"
                >
                  <Link href="/registration/choreography">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Choreography
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-1"
                >
                  <Link href="/registration/coaches">
                    <Users className="w-4 h-4 mr-1" />
                    Coaches
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-1"
                >
                  <Link href="/registration/judges">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Judges
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 