import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, MapPin, Award, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Panamerican Championship
                </h1>
                <p className="text-sm text-gray-600">Aerobic Gymnastics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Help
              </Button>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Globe className="w-4 h-4 mr-2" />
              Official FIG Tournament Registration
            </Badge>
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Panamerican Aerobic Gymnastics Championship
              <span className="block text-3xl text-blue-600 mt-2">2024</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Register your choreographies for the most prestigious aerobic gymnastics 
              tournament in the Americas. Connected to the official FIG athlete database.
            </p>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/register">
                  Register as Representative
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">
                  Login to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tournament Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our system provides everything needed for professional championship registration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Multi-Gymnast Teams</CardTitle>
                <CardDescription>
                  Register choreographies with 1, 2, 3, 5, or 8 gymnasts per routine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Individual routines (1 gymnast)</li>
                  <li>• Pair routines (2 gymnasts)</li>
                  <li>• Trio routines (3 gymnasts)</li>
                  <li>• Group routines (5 gymnasts)</li>
                  <li>• Team routines (8 gymnasts)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Three Categories</CardTitle>
                <CardDescription>
                  Compete in Youth, Junior, or Senior divisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Youth</span>
                    <Badge variant="outline">≤14 years</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Junior</span>
                    <Badge variant="outline">15-17 years</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Senior</span>
                    <Badge variant="outline">18+ years</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>FIG Integration</CardTitle>
                <CardDescription>
                  Direct access to official FIG athlete database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time license validation</li>
                  <li>• Automatic age verification</li>
                  <li>• Official gymnast records</li>
                  <li>• Up-to-date eligibility status</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tournament Info */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Tournament Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Registration Opens:</span>
                    <span className="text-muted-foreground">January 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Registration Closes:</span>
                    <span className="text-muted-foreground">March 15, 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Championship Dates:</span>
                    <span className="text-muted-foreground">April 20-25, 2024</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location & Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Host City:</span>
                    <span className="text-muted-foreground">TBD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Max per Category:</span>
                    <span className="text-muted-foreground">4 choreographies</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Eligible Countries:</span>
                    <span className="text-muted-foreground">All Americas</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Register Your Team?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join the most prestigious aerobic gymnastics championship in the Americas
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start Registration
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 