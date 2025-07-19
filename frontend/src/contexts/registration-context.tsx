'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Gymnast, Coach, Judge, Tournament, Choreography, RegistrationStatus } from '@/types';
import { APIService } from '@/lib/api';

export interface RegisteredChoreography {
  id: string;
  name: string;
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  type: string;
  gymnastsCount: number;
  gymnasts: Gymnast[];
  registeredAt: Date;
  status: RegistrationStatus;
  choreographyData?: Choreography;
}

export interface RegisteredCoach {
  id: string;
  name: string;
  level: string;
  country: string;
  registeredAt: Date;
  status: RegistrationStatus;
  coachData?: Coach;
}

export interface RegisteredJudge {
  id: string;
  name: string;
  category: string;
  country: string;
  registeredAt: Date;
  status: RegistrationStatus;
  judgeData?: Judge;
}

interface RegistrationState {
  choreographies: RegisteredChoreography[];
  coaches: RegisteredCoach[];
  judges: RegisteredJudge[];
  tournament: Tournament | null;
  country: string | null;
  isSidebarOpen: boolean;
}

interface RegistrationContextType {
  state: RegistrationState;
  addChoreography: (choreography: RegisteredChoreography) => void;
  removeChoreography: (id: string) => void;
  addCoach: (coach: RegisteredCoach) => void;
  removeCoach: (id: string) => void;
  addJudge: (judge: RegisteredJudge) => void;
  removeJudge: (id: string) => void;
  clearAll: () => void;
  getTotalCount: () => number;
  canConfirmRegistration: () => boolean;
  loadExistingRegistrations: () => Promise<void>;
  syncPendingRegistrations: () => Promise<void>;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isLoading: boolean;
  // Status management methods
  submitRegistrations: () => Promise<void>;
  getRegistrationsByStatus: (status: RegistrationStatus) => {
    choreographies: RegisteredChoreography[];
    coaches: RegisteredCoach[];
    judges: RegisteredJudge[];
  };
  getPendingCount: () => number;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const STORAGE_KEY = 'pana-registration-summary';

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistrationState>({
    choreographies: [],
    coaches: [],
    judges: [],
    tournament: null,
    country: null,
    isSidebarOpen: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    const tournamentData = localStorage.getItem('selectedTournament');
    const countryData = localStorage.getItem('selectedCountry');

    if (savedState) {
      try {
        const parsedState: Partial<RegistrationState> = JSON.parse(savedState);
        // Convert date strings back to Date objects
        if (parsedState.choreographies) {
          parsedState.choreographies = parsedState.choreographies.map((c: RegisteredChoreography) => ({
            ...c,
            registeredAt: new Date(c.registeredAt),
            status: c.status || 'PENDING', // Default to PENDING for backward compatibility
          }));
        }
        if (parsedState.coaches) {
          parsedState.coaches = parsedState.coaches.map((c: RegisteredCoach) => ({
            ...c,
            registeredAt: new Date(c.registeredAt),
            status: c.status || 'PENDING', // Default to PENDING for backward compatibility
          }));
        }
        if (parsedState.judges) {
          parsedState.judges = parsedState.judges.map((j: RegisteredJudge) => ({
            ...j,
            registeredAt: new Date(j.registeredAt),
            status: j.status || 'PENDING', // Default to PENDING for backward compatibility
          }));
        }
        
        setState(prev => ({ ...prev, ...parsedState }));
      } catch (error) {
        console.error('Error loading registration state:', error);
      }
    }

    // Load tournament and country
    if (tournamentData && countryData) {
      try {
        setState(prev => ({
          ...prev,
          tournament: JSON.parse(tournamentData) as Tournament,
          country: countryData,
        }));
      } catch (error) {
        console.error('Error loading tournament/country data:', error);
      }
    }
  }, []);



  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      choreographies: state.choreographies,
      coaches: state.coaches,
      judges: state.judges,
    }));
  }, [state.choreographies, state.coaches, state.judges]);

  const addChoreography = (choreography: RegisteredChoreography) => {
    setState(prev => ({
      ...prev,
      choreographies: [...prev.choreographies, choreography],
    }));
  };

  const removeChoreography = (id: string) => {
    setState(prev => ({
      ...prev,
      choreographies: prev.choreographies.filter(c => c.id !== id),
    }));
  };

  const addCoach = (coach: RegisteredCoach) => {
    setState(prev => ({
      ...prev,
      coaches: [...prev.coaches, coach],
    }));
  };

  const removeCoach = (id: string) => {
    setState(prev => ({
      ...prev,
      coaches: prev.coaches.filter(c => c.id !== id),
    }));
  };

  const addJudge = (judge: RegisteredJudge) => {
    setState(prev => ({
      ...prev,
      judges: [...prev.judges, judge],
    }));
  };

  const removeJudge = (id: string) => {
    setState(prev => ({
      ...prev,
      judges: prev.judges.filter(j => j.id !== id),
    }));
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      choreographies: [],
      coaches: [],
      judges: [],
    }));
    localStorage.removeItem(STORAGE_KEY);
  };

  const getTotalCount = () => {
    return state.choreographies.length + state.coaches.length + state.judges.length;
  };

  const submitRegistrations = async () => {
    if (!state.tournament || !state.country) {
      throw new Error('Cannot submit registrations: missing tournament or country');
    }

    setIsLoading(true);
    try {
      // Get only PENDING registrations
      const pendingRegistrations = getRegistrationsByStatus('PENDING');
      
      if (pendingRegistrations.choreographies.length === 0 && 
          pendingRegistrations.coaches.length === 0 && 
          pendingRegistrations.judges.length === 0) {
        throw new Error('No pending registrations to submit');
      }

      // Submit pending registrations using the new API endpoint
      await APIService.submitPendingRegistrations(state.tournament.id);

      // Update local state - change PENDING to SUBMITTED
      setState(prev => ({
        ...prev,
        choreographies: prev.choreographies.map(c => 
          c.status === 'PENDING' ? { ...c, status: 'SUBMITTED' as RegistrationStatus } : c
        ),
        coaches: prev.coaches.map(c => 
          c.status === 'PENDING' ? { ...c, status: 'SUBMITTED' as RegistrationStatus } : c
        ),
        judges: prev.judges.map(j => 
          j.status === 'PENDING' ? { ...j, status: 'SUBMITTED' as RegistrationStatus } : j
        ),
      }));
    } catch (error) {
      console.error('Failed to submit registrations:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRegistrationsByStatus = (status: RegistrationStatus) => {
    return {
      choreographies: state.choreographies.filter(c => c.status === status),
      coaches: state.coaches.filter(c => c.status === status),
      judges: state.judges.filter(j => j.status === status),
    };
  };

  const getPendingCount = () => {
    const pending = getRegistrationsByStatus('PENDING');
    return pending.choreographies.length + pending.coaches.length + pending.judges.length;
  };

  const canConfirmRegistration = () => {
    // At least one PENDING item must be available for submission
    return getPendingCount() > 0;
  };

  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      isSidebarOpen: !prev.isSidebarOpen,
    }));
  };

  const closeSidebar = () => {
    setState(prev => ({
      ...prev,
      isSidebarOpen: false,
    }));
  };

  const loadExistingRegistrations = useCallback(async () => {
    if (!state.tournament || !state.country) {
      console.log('Cannot load existing registrations: missing tournament or country');
      return;
    }

    setIsLoading(true);
    try {
      const data = await APIService.getExistingRegistrations(state.country, state.tournament.id);
      
      // Transform API data to registration format
      const choreographies: RegisteredChoreography[] = data.choreographies.map(choreo => ({
        id: choreo.id,
        name: choreo.name,
        category: choreo.category,
        type: choreo.type,
        gymnastsCount: choreo.gymnasts.length,
        gymnasts: choreo.gymnasts,
        registeredAt: new Date(choreo.createdAt),
        status: 'SUBMITTED' as RegistrationStatus,
        choreographyData: choreo,
      }));

      const coaches: RegisteredCoach[] = data.coaches.map(coach => ({
        id: coach.id,
        name: coach.fullName,
        level: coach.level,
        country: coach.country,
        registeredAt: new Date(), // Use current date since backend might not have this
        status: 'SUBMITTED' as RegistrationStatus,
        coachData: coach,
      }));

      const judges: RegisteredJudge[] = data.judges.map(judge => ({
        id: judge.id,
        name: judge.fullName,
        category: judge.category,
        country: judge.country,
        registeredAt: new Date(), // Use current date since backend might not have this
        status: 'SUBMITTED' as RegistrationStatus,
        judgeData: judge,
      }));

      setState(prev => ({
        ...prev,
        choreographies,
        coaches,
        judges,
      }));
    } catch (error) {
      console.error('Failed to load existing registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.tournament, state.country]);

  const syncPendingRegistrations = useCallback(async () => {
    if (!state.tournament || !state.country) {
      console.log('Cannot sync pending registrations: missing tournament or country');
      return;
    }

    setIsLoading(true);
    try {
      // Get pending registrations from database (database is the single source of truth)
      const pendingData = await APIService.getPendingRegistrations(state.tournament.id);
      
      // Transform API data to registration format
      const pendingChoreographies: RegisteredChoreography[] = pendingData.choreographies.map(choreo => ({
        id: choreo.id,
        name: choreo.name,
        category: choreo.category,
        type: choreo.type,
        gymnastsCount: choreo.gymnasts.length,
        gymnasts: choreo.gymnasts,
        registeredAt: new Date(choreo.createdAt),
        status: 'PENDING' as RegistrationStatus,
        choreographyData: choreo,
      }));

      const pendingCoaches: RegisteredCoach[] = pendingData.coaches.map(coach => ({
        id: coach.id,
        name: coach.fullName,
        level: coach.level,
        country: coach.country,
        registeredAt: new Date(coach.createdAt || Date.now()),
        status: 'PENDING' as RegistrationStatus,
        coachData: coach,
      }));

      const pendingJudges: RegisteredJudge[] = pendingData.judges.map(judge => ({
        id: judge.id,
        name: judge.fullName,
        category: judge.category,
        country: judge.country,
        registeredAt: new Date(judge.createdAt || Date.now()),
        status: 'PENDING' as RegistrationStatus,
        judgeData: judge,
      }));

      // Replace pending registrations with database state, keep submitted ones
      setState(prev => {
        // Get existing non-pending registrations (submitted/registered)
        const existingSubmitted = prev.choreographies.filter(c => c.status !== 'PENDING');
        const existingCoachesSubmitted = prev.coaches.filter(c => c.status !== 'PENDING');
        const existingJudgesSubmitted = prev.judges.filter(j => j.status !== 'PENDING');

        return {
          ...prev,
          choreographies: [...existingSubmitted, ...pendingChoreographies],
          coaches: [...existingCoachesSubmitted, ...pendingCoaches],
          judges: [...existingJudgesSubmitted, ...pendingJudges],
        };
      });

      console.log(`Refreshed ${pendingData.totals.total} pending registrations from database`);
    } catch (error) {
      console.error('Failed to sync pending registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.tournament, state.country]);

  // Auto-sync pending registrations when tournament and country are available
  useEffect(() => {
    if (state.tournament && state.country) {
      // Always sync from database since all pending registrations are immediately persisted to DB
      // localStorage is just a cache/mirror of the database state
      console.log('Auto-refreshing pending registrations from database...');
      syncPendingRegistrations();
    }
  }, [state.tournament, state.country, syncPendingRegistrations]);

  const value: RegistrationContextType = {
    state,
    addChoreography,
    removeChoreography,
    addCoach,
    removeCoach,
    addJudge,
    removeJudge,
    clearAll,
    getTotalCount,
    canConfirmRegistration,
    loadExistingRegistrations,
    syncPendingRegistrations,
    toggleSidebar,
    closeSidebar,
    isLoading,
    // Status management methods
    submitRegistrations,
    getRegistrationsByStatus,
    getPendingCount,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
} 