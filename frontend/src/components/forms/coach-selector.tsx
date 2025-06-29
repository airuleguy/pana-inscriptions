'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Search, Loader2, RefreshCw, AlertCircle, GraduationCap, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { APIService } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import type { Coach } from '@/types';

// Simple debounce implementation
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface CoachSelectorProps {
  countryCode: string;
  selectedCoaches: Coach[];
  onSelectionChange: (coaches: Coach[]) => void;
  maxSelection?: number;
  requiredLevel?: string;
  disabled?: boolean;
}

export function CoachSelector({
  countryCode: country,
  selectedCoaches,
  onSelectionChange,
  maxSelection = 10,
  requiredLevel,
  disabled = false
}: CoachSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!country) return;
      
      try {
        const allCoaches = await APIService.getCoaches(country);
        const results = APIService.searchCoachesLocal(allCoaches, query);
        setAvailableCoaches(results);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to search coaches');
      }
    }, 300),
    [country]
  );

  // Load coaches on component mount and country change
  useEffect(() => {
    async function loadCoaches() {
      if (!country) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const coaches = await APIService.getCoaches(country);
        setAvailableCoaches(coaches);
      } catch (error) {
        console.error('Failed to load coaches:', error);
        setError('Failed to load coaches from FIG database');
      } finally {
        setLoading(false);
      }
    }

    loadCoaches();
  }, [country]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else if (country) {
      // Reset to all coaches for the country
      APIService.getCoaches(country)
        .then(setAvailableCoaches)
        .catch((error) => {
          console.error('Error loading coaches:', error);
          setError('Failed to load coaches');
        });
    }
  }, [searchQuery, country, debouncedSearch]);

  // Filter coaches based on requirements
  const filteredCoaches = useMemo(() => {
    let filtered = availableCoaches;

    // Filter by level if required
    if (requiredLevel) {
      filtered = filtered.filter(c => c.level.includes(requiredLevel));
    }

    // Sort by last name
    return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [availableCoaches, requiredLevel]);

  // Handle coach selection toggle
  const handleCoachToggle = useCallback((coach: Coach) => {
    if (disabled) return;
    
    const isSelected = selectedCoaches.some(c => c.id === coach.id);
    
    if (isSelected) {
      // Remove coach
      onSelectionChange(selectedCoaches.filter(c => c.id !== coach.id));
    } else if (selectedCoaches.length < maxSelection) {
      // Add coach
      onSelectionChange([...selectedCoaches, coach]);
    }
  }, [selectedCoaches, onSelectionChange, maxSelection, disabled]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!country) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Clear cache and refetch
      await APIService.clearCoachCache();
      const coaches = await APIService.getCoaches(country);
      setAvailableCoaches(coaches);
    } catch (error) {
      console.error('Refresh error:', error);
      setError('Failed to refresh coach data');
    } finally {
      setRefreshing(false);
    }
  }, [country]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading coaches from FIG database...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches by name or level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing || disabled}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Selection Summary */}
      {selectedCoaches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Selected Coaches ({selectedCoaches.length}/{maxSelection})
                </h4>
                {selectedCoaches.length === maxSelection && (
                  <Badge variant="secondary">Max reached</Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {selectedCoaches.map((coach) => (
                  <div key={coach.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(coach.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{coach.fullName}</p>
                        <p className="text-xs text-muted-foreground">{coach.levelDescription}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCoachToggle(coach)}
                      disabled={disabled}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coach List */}
      <Card>
        <CardContent className="p-0">
          {filteredCoaches.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery.trim() ? 'No coaches found matching your search' : 'No coaches found for this country'}
              </p>
              {requiredLevel && (
                <p className="text-xs text-muted-foreground mt-2">
                  Filtering for level: {requiredLevel}
                </p>
              )}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredCoaches.map((coach) => {
                const isSelected = selectedCoaches.some(c => c.id === coach.id);
                const canSelect = selectedCoaches.length < maxSelection;
                const isClickable = !disabled && (isSelected || canSelect);
                
                return (
                  <div
                    key={coach.id}
                    className={`
                      flex items-center gap-3 p-4 border-b last:border-b-0 transition-colors
                      ${isClickable ? 'hover:bg-muted cursor-pointer' : 'cursor-not-allowed opacity-50'}
                      ${isSelected ? 'bg-primary/5 border-primary/20' : ''}
                    `}
                    onClick={() => isClickable && handleCoachToggle(coach)}
                  >
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(coach.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{coach.fullName}</p>
                        <Badge variant="outline" className="text-xs">
                          {coach.gender === 'MALE' ? 'M' : 'F'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GraduationCap className="w-3 h-3" />
                        <span className="truncate">{coach.levelDescription}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredCoaches.length} of {availableCoaches.length} coaches
        {requiredLevel && ` (filtered by level: ${requiredLevel})`}
      </div>
    </div>
  );
} 