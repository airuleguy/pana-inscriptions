'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { GymnastSelector } from '@/components/forms/gymnast-selector';
import { APIService } from '@/lib/api';
import { generateChoreographyName, getCountryFlag } from '@/lib/utils';
import type { Gymnast } from '@/types';
import { Database, Users, Trophy, RefreshCw } from 'lucide-react';

// Sample countries with AER gymnasts (from the FIG data)
const SAMPLE_COUNTRIES = [
  { code: 'USA', name: 'United States' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'ARG', name: 'Argentina' },
  { code: 'CAN', name: 'Canada' },
  { code: 'MEX', name: 'Mexico' },
  { code: 'CHI', name: 'Chile' },
  { code: 'COL', name: 'Colombia' },
  { code: 'ESP', name: 'Spain' },
  { code: 'FRA', name: 'France' },
  { code: 'GER', name: 'Germany' },
  { code: 'ITA', name: 'Italy' },
  { code: 'RUS', name: 'Russia' },
  { code: 'CHN', name: 'China' },
  { code: 'JPN', name: 'Japan' },
  { code: 'AUS', name: 'Australia' },
];

const GYMNAST_COUNTS = [1, 2, 3, 5, 8] as const;
const CATEGORIES = ['YOUTH', 'JUNIOR', 'SENIOR'] as const;

export default function TestPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedGymnasts, setSelectedGymnasts] = useState<Gymnast[]>([]);
  const [gymnastCount, setGymnastCount] = useState<1 | 2 | 3 | 5 | 8>(1);
  const [selectedCategory, setSelectedCategory] = useState<'YOUTH' | 'JUNIOR' | 'SENIOR'>('SENIOR');
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Update cache stats on component mount
  const updateCacheStats = async () => {
    try {
      // Check if backend is healthy (basic cache status)
      const health = await APIService.checkHealth();
      setCacheStats({
        figGymnasts: {
          cached: true, // Backend always handles caching
          size: 'N/A',
          expiresAt: undefined,
        },
        backendHealth: health
      });
    } catch (error) {
      setCacheStats({
        figGymnasts: { cached: false, size: 0 },
        backendHealth: { status: 'error' }
      });
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      await APIService.clearGymnastCache();
      updateCacheStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Generate choreography name
  const choreographyName = generateChoreographyName(selectedGymnasts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-blue-600" />
                FIG API Integration Test
              </h1>
              <p className="text-gray-600 mt-1">
                Test the gymnast selector with real FIG database data
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={updateCacheStats}>
                <Database className="w-4 h-4 mr-2" />
                Check Cache
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Choreography Setup
                </CardTitle>
                <CardDescription>
                  Configure your choreography parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Country Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-2">
                            <span>{getCountryFlag(country.code)}</span>
                            <span>{country.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {country.code}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gymnast Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Gymnasts</label>
                  <Select 
                    value={gymnastCount.toString()} 
                    onValueChange={(value) => {
                      setGymnastCount(parseInt(value) as 1 | 2 | 3 | 5 | 8);
                      setSelectedGymnasts([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GYMNAST_COUNTS.map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} gymnast{count > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category Filter</label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={(value) => {
                      setSelectedCategory(value as 'YOUTH' | 'JUNIOR' | 'SENIOR');
                      setSelectedGymnasts([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            {selectedGymnasts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Choreography Name:</span>
                    </div>
                    {choreographyName && (
                      <Badge variant="outline" className="font-mono text-lg">
                        {choreographyName}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Team Members:</span>
                    {selectedGymnasts.map((gymnast, index) => (
                      <div key={gymnast.id} className="flex items-center justify-between text-sm">
                        <span>{index + 1}. {gymnast.fullName}</span>
                        <Badge variant="outline" className="text-xs">
                          {gymnast.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cache Stats */}
            {cacheStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Cache Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>FIG Data Cached:</span>
                    <Badge variant={cacheStats.figGymnasts.cached ? "default" : "secondary"}>
                      {cacheStats.figGymnasts.cached ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {cacheStats.figGymnasts.cached && (
                    <div className="flex justify-between">
                      <span>Gymnasts:</span>
                      <span>{cacheStats.figGymnasts.size}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Gymnast Selector */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>FIG Gymnast Database</CardTitle>
                <CardDescription>
                  Select gymnasts from the official FIG database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCountry ? (
                  <GymnastSelector
                    countryCode={selectedCountry}
                    selectedGymnasts={selectedGymnasts}
                    onSelectionChange={setSelectedGymnasts}
                    maxSelection={gymnastCount}
                    requiredCategory={selectedCategory}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Please select a country to view available gymnasts
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 