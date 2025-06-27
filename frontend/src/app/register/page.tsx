'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GymnastSelector } from '@/components/forms/gymnast-selector';
import { APIService } from '@/lib/api';
import { generateChoreographyName, getCountryFlag } from '@/lib/utils';
import type { Gymnast, Choreography } from '@/types';
import { Trophy, Users, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Sample countries with AER gymnasts
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

export default function RegisterPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedGymnasts, setSelectedGymnasts] = useState<Gymnast[]>([]);
  const [gymnastCount, setGymnastCount] = useState<1 | 2 | 3 | 5 | 8>(1);
  const [selectedCategory, setSelectedCategory] = useState<'YOUTH' | 'JUNIOR' | 'SENIOR'>('SENIOR');
  const [routineDescription, setRoutineDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    message: string;
    choreography?: Choreography;
  } | null>(null);

  // Generate choreography name
  const choreographyName = generateChoreographyName(selectedGymnasts);

  // Get oldest gymnast age for validation
  const oldestAge = selectedGymnasts.length > 0 
    ? Math.max(...selectedGymnasts.map(g => g.age))
    : 0;

  // Determine category from oldest gymnast
  const determinedCategory = oldestAge <= 15 ? 'YOUTH' : oldestAge <= 17 ? 'JUNIOR' : 'SENIOR';

  // Check if form is valid
  const isFormValid = selectedCountry && 
    selectedGymnasts.length === gymnastCount && 
    selectedGymnasts.length > 0;

  // Handle registration submission
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setSubmitting(true);
    setRegistrationResult(null);

    try {
      const choreographyData: Omit<Choreography, 'id' | 'registrationDate' | 'lastModified'> = {
        name: choreographyName,
        category: determinedCategory,
        countryCode: selectedCountry,
        selectedGymnasts,
        gymnastCount,
        routineDescription,
        status: 'SUBMITTED',
        notes: routineDescription,
      };

      const registeredChoreography = await APIService.createChoreography(choreographyData);

      setRegistrationResult({
        success: true,
        message: `Choreography "${choreographyName}" successfully registered!`,
        choreography: registeredChoreography,
      });

      // Reset form
      setSelectedGymnasts([]);
      setRoutineDescription('');
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      setRegistrationResult({
        success: false,
        message: error.message || 'Failed to register choreography. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href="/">
                  ← Back to Homepage
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-blue-600" />
                Choreography Registration
              </h1>
              <p className="text-gray-600 mt-1">
                Register choreographies for the Panamerican Aerobic Gymnastics Championship
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Country Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Country Selection</CardTitle>
                <CardDescription>Select your country to view available gymnasts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {getCountryFlag(country.code)} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Choreography Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choreography Setup</CardTitle>
                <CardDescription>Configure your routine details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gymnastCount">Number of Gymnasts</Label>
                  <Select value={gymnastCount.toString()} onValueChange={(value) => {
                    const count = parseInt(value) as 1 | 2 | 3 | 5 | 8;
                    setGymnastCount(count);
                    // Reset selection if current selection exceeds new limit
                    if (selectedGymnasts.length > count) {
                      setSelectedGymnasts(selectedGymnasts.slice(0, count));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GYMNAST_COUNTS.map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} {count === 1 ? 'Gymnast' : 'Gymnasts'} 
                          {count === 1 && ' (Individual)'}
                          {count === 2 && ' (Mixed Pair)'}
                          {count === 3 && ' (Trio)'}
                          {count === 5 && ' (Group)'}
                          {count === 8 && ' (Platform)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category (Auto-determined)</Label>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-sm">
                      {selectedGymnasts.length > 0 ? determinedCategory : 'Select gymnasts first'}
                    </Badge>
                    {selectedGymnasts.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on oldest gymnast age: {oldestAge}
                      </p>
                    )}
                  </div>
                </div>

                {choreographyName && (
                  <div>
                    <Label>Generated Name</Label>
                    <div className="mt-2">
                      <div className="font-mono text-sm bg-primary text-primary-foreground px-2 py-1.5 rounded-md border whitespace-normal break-all leading-relaxed">
                        {choreographyName}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Routine Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Routine Details</CardTitle>
                <CardDescription>Optional additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your routine, music, or any special requirements..."
                    value={routineDescription}
                    onChange={(e) => setRoutineDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Registration Result */}
            {registrationResult && (
              <Card className={registrationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {registrationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${registrationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                        {registrationResult.success ? 'Registration Successful!' : 'Registration Failed'}
                      </p>
                      <p className={`text-sm mt-1 ${registrationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {registrationResult.message}
                      </p>
                      {registrationResult.choreography && (
                        <p className="text-xs text-green-600 mt-2">
                          Registration ID: {registrationResult.choreography.id}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Register Choreography
                </>
              )}
            </Button>
          </div>

          {/* Gymnast Selector */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Gymnasts
                </CardTitle>
                <CardDescription>
                  Choose {gymnastCount} licensed gymnast{gymnastCount > 1 ? 's' : ''} from the FIG database
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCountry ? (
                  <GymnastSelector
                    countryCode={selectedCountry}
                    selectedGymnasts={selectedGymnasts}
                    onSelectionChange={setSelectedGymnasts}
                    maxSelection={gymnastCount}
                  />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
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