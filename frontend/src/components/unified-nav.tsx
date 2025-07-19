'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, User as UserIcon, Trophy, Users, UserCheck, ClipboardList, ChevronLeft, Menu, Calendar, MapPin, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useRegistration } from '@/contexts/registration-context';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useTranslation } from '@/lib/i18n';

export function UnifiedNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { state: authState, logout } = useAuth();
  const { state: registrationState, getPendingCount, toggleSidebar } = useRegistration();
  const { t } = useTranslation('common');

  // Determine navigation type based on current path
  const getNavType = () => {
    if (!pathname) return 'none';
    
    // No navigation for these pages
    if (['/login', '/unauthorized'].includes(pathname)) return 'none';
    
    // Landing page navigation
    if (pathname === '/') return 'landing';
    
    // Tournament selection navigation
    if (pathname === '/tournament-selection') return 'tournament-selection';
    
    // Registration navigation
    if (pathname.startsWith('/registration/tournament/')) return 'registration';
    
    // Default authenticated navigation
    if (authState.isAuthenticated) return 'authenticated';
    
    return 'none';
  };

  const navType = getNavType();

  // Don't render navigation for excluded pages
  if (navType === 'none') return null;

  // Auth helper functions
  const getInitials = (username: string) => {
    const parts = username.split('_');
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const formatDisplayName = (username: string) => {
    return username
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  // Auth component
  const renderAuthInfo = () => {
    if (!authState.isAuthenticated || !authState.user) return null;

    return (
      <>
        <div className="hidden sm:block text-sm text-gray-600">
          <span className="font-medium">{authState.user.country}</span> Delegate
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(authState.user.username)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {formatDisplayName(authState.user.username)}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {authState.user.country} • {authState.user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('navigation.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  };

  // Landing page navigation
  if (navType === 'landing') {
    return (
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Panamerican Championship
                </h1>
                <p className="text-sm text-muted-foreground">Aerobic Gymnastics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="button" className="mr-2" />
              <Button variant="ghost" size="sm" className="text-foreground hover:text-foreground">
                {t('navigation.help', 'Help')}
              </Button>
              <Button asChild className="shadow-md">
                <Link href="/login">{t('navigation.login')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Tournament selection navigation
  if (navType === 'tournament-selection') {
    return (
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Tournament Selection
                </h1>
                <p className="text-sm text-muted-foreground">Choose your tournament and country</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
              {renderAuthInfo()}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Registration navigation
  if (navType === 'registration') {
    const tournamentId = pathname?.split('/')[3];
    const pendingCount = getPendingCount();

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
                    {registrationState.tournament?.shortName || registrationState.tournament?.name || 'Tournament Registration'}
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

            {/* Right side - Summary button and Auth info */}
            <div className="flex items-center gap-4">
              {/* Summary Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSidebar}
                className="relative border-blue-200 hover:bg-blue-50 hover:border-blue-300"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('navigation.summary', 'Summary')}
                {pendingCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>

              {renderAuthInfo()}
            </div>
          </div>

          {/* Mobile tournament info */}
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>Registration Portal</span>
              </div>
              {authState.user?.country && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>{authState.user.country} Delegate</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default authenticated navigation
  if (navType === 'authenticated') {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/tournament-selection">
              <span className="font-bold text-lg">Panamerican Championship</span>
            </a>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Space for navigation or search if needed */}
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {renderAuthInfo()}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return null;
} 