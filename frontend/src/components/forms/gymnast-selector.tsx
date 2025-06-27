'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle, Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import { generateChoreographyName, getInitials, getCategoryColor, debounce } from '@/lib/utils';
import type { Gymnast } from '@/types';

interface GymnastSelectorProps {
  countryCode: string;
  selectedGymnasts: Gymnast[];
  onSelectionChange: (gymnasts: Gymnast[]) => void;
  maxSelection: 1 | 2 | 3 | 5 | 8;
  requiredCategory?: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  disabled?: boolean;
}

export function GymnastSelector({
  countryCode,
  selectedGymnasts,
  onSelectionChange,
  maxSelection,
  requiredCategory,
  disabled = false
}: GymnastSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableGymnasts, setAvailableGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!countryCode) return;
      
      try {
        const allGymnasts = await APIService.getGymnasts(countryCode);
        const results = APIService.searchGymnasts(allGymnasts, query);
        setAvailableGymnasts(results);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to search gymnasts');
      }
    }, 300),
    [countryCode]
  );

  // Load gymnasts on component mount and country change
  useEffect(() => {
    async function loadGymnasts() {
      if (!countryCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const gymnasts = await APIService.getGymnasts(countryCode);
        setAvailableGymnasts(gymnasts);
      } catch (err: any) {
        console.error('Failed to load gymnasts:', err);
        setError('Failed to load gymnasts from FIG database');
      } finally {
        setLoading(false);
      }
    }

    loadGymnasts();
  }, [countryCode]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else if (countryCode) {
      // Reset to all gymnasts for the country
      APIService.getGymnasts(countryCode)
        .then(setAvailableGymnasts)
        .catch((err: any) => {
          console.error('Failed to reset gymnast list:', err);
          setError('Failed to load gymnasts');
        });
    }
  }, [searchQuery, countryCode, debouncedSearch]);

  // Filter gymnasts based on requirements
  const filteredGymnasts = useMemo(() => {
    let filtered = availableGymnasts;

    // Filter by category if required
    if (requiredCategory) {
      filtered = filtered.filter(g => g.category === requiredCategory);
    }

    // Sort by last name
    return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [availableGymnasts, requiredCategory]);

  // Handle gymnast selection toggle
  const handleGymnastToggle = useCallback((gymnast: Gymnast) => {
    if (disabled) return;
    
    const isSelected = selectedGymnasts.some(g => g.id === gymnast.id);
    
    if (isSelected) {
      // Remove gymnast
      onSelectionChange(selectedGymnasts.filter(g => g.id !== gymnast.id));
    } else if (selectedGymnasts.length < maxSelection) {
      // Add gymnast
      onSelectionChange([...selectedGymnasts, gymnast]);
    }
  }, [selectedGymnasts, onSelectionChange, maxSelection, disabled]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!countryCode) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Clear cache and refetch
      await APIService.clearGymnastCache();
      const gymnasts = await APIService.getGymnasts(countryCode);
      setAvailableGymnasts(gymnasts);
    } catch (err: any) {
      console.error('Refresh error:', err);
      setError('Failed to refresh gymnast data');
    } finally {
      setRefreshing(false);
    }
  }, [countryCode]);

  // Generate choreography name from selected gymnasts
  const choreographyName = useMemo(() => {
    return generateChoreographyName(selectedGymnasts);
  }, [selectedGymnasts]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading gymnasts from FIG database...</p>
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
            placeholder="Search gymnasts by name..."
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
      {selectedGymnasts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Selected: {selectedGymnasts.length}/{maxSelection}
                </span>
                {choreographyName && (
                  <div className="font-mono text-xs bg-background border border-border px-2 py-1 rounded-md whitespace-normal break-all leading-relaxed max-w-48">
                    {choreographyName}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedGymnasts.map(gymnast => (
                  <div key={gymnast.id} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(gymnast.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{gymnast.fullName}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getCategoryColor(gymnast.category)}`}
                    >
                      {gymnast.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gymnast List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredGymnasts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No gymnasts found matching your search.' : 'No gymnasts available for this country.'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredGymnasts.map(gymnast => {
            const isSelected = selectedGymnasts.some(g => g.id === gymnast.id);
            const canSelect = !isSelected && selectedGymnasts.length < maxSelection;
            const isDisabled = disabled || (!isSelected && !canSelect);
            
            return (
              <Card
                key={gymnast.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 
                  canSelect ? 'hover:bg-muted/50' : 
                  'opacity-50 cursor-not-allowed'
                } ${isDisabled ? 'pointer-events-none' : ''}`}
                onClick={() => !isDisabled && handleGymnastToggle(gymnast)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    {isSelected ? (
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(gymnast.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate mb-1">{gymnast.fullName}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Age {gymnast.age} • {gymnast.gender} • {gymnast.dateOfBirth.getFullYear()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge 
                          variant="outline"
                          className={`text-xs px-1.5 py-0.5 ${getCategoryColor(gymnast.category)}`}
                        >
                          {gymnast.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {gymnast.country}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Info Messages */}
      {maxSelection > 1 && selectedGymnasts.length === maxSelection && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ All {maxSelection} gymnasts selected for this choreography
          </p>
        </div>
      )}

      {requiredCategory && (
        <div className="text-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            Only showing {requiredCategory.toLowerCase()} category gymnasts
          </p>
        </div>
      )}
    </div>
  );
} 