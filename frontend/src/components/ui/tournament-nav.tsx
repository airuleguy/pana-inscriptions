'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Globe, Settings, ArrowLeft, UserPlus } from 'lucide-react';
import { Tournament } from '@/types';
import { countries } from '@/lib/countries';
import { useRegistration } from '@/contexts/registration-context';

interface TournamentNavProps {
  currentPage?: string;
  showBackButton?: boolean;
  backHref?: string;
  showRegistrationSummary?: boolean;
  onToggleRegistrationSummary?: () => void;
}

export function TournamentNav({ 
  currentPage = 'Registration',
  showBackButton = true,
  backHref = '/registration/dashboard',
  showRegistrationSummary = false,
  onToggleRegistrationSummary
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

  if (!mounted || !selectedTournament || !selectedCountry) {
    return (
      <div className="border-b bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">{currentPage}</span>
            </div>
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            )}
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
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">{currentPage}</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{countryInfo.flag} {countryInfo.name}</span>
              </div>
              <div className="text-muted-foreground">•</div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{selectedTournament.name}</span>
                {selectedTournament.isActive && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
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
            <Button variant="ghost" size="sm" onClick={handleChangeSelection}>
              <Settings className="w-4 h-4 mr-2" />
              Change
            </Button>
            {showBackButton && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
            )}
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
              <span className="text-muted-foreground">{selectedTournament.name}</span>
              {selectedTournament.isActive && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 