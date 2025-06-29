'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Gymnast, Coach, Judge, Tournament } from '@/types';
import { APIService } from '@/lib/api';

export interface RegisteredChoreography {
  id: string;
  name: string;
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  type: string;
  gymnastsCount: number;
  gymnasts: Gymnast[];
  registeredAt: Date;
  choreographyData?: {
    name: string;
    category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
    type: string;
    country: string;
    tournament: Tournament;
    gymnasts: Gymnast[];
    gymnastCount: 1 | 2 | 3 | 5 | 8;
    notes?: string;
    status?: 'SUBMITTED';
    musicFile?: File;
    musicFileName?: string;
    submittedBy?: string;
  };
}

export interface RegisteredCoach {
  id: string;
  name: string;
  level: string;
  country: string;
  registeredAt: Date;
  coachData?: Coach;
}

export interface RegisteredJudge {
  id: string;
  name: string;
  category: string;
  country: string;
  registeredAt: Date;
  judgeData?: Judge;
}

interface RegistrationState {
  choreographies: RegisteredChoreography[];
  coaches: RegisteredCoach[];
  judges: RegisteredJudge[];
  tournament: Tournament | null;
  country: string | null;
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
  isLoading: boolean;
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
          }));
        }
        if (parsedState.coaches) {
          parsedState.coaches = parsedState.coaches.map((c: RegisteredCoach) => ({
            ...c,
            registeredAt: new Date(c.registeredAt),
          }));
        }
        if (parsedState.judges) {
          parsedState.judges = parsedState.judges.map((j: RegisteredJudge) => ({
            ...j,
            registeredAt: new Date(j.registeredAt),
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

  const canConfirmRegistration = () => {
    // At least one item must be registered
    return getTotalCount() > 0;
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
        choreographyData: choreo,
      }));

      const coaches: RegisteredCoach[] = data.coaches.map(coach => ({
        id: coach.id,
        name: coach.fullName,
        level: coach.level,
        country: coach.country,
        registeredAt: new Date(), // Use current date since backend might not have this
        coachData: coach,
      }));

      const judges: RegisteredJudge[] = data.judges.map(judge => ({
        id: judge.id,
        name: judge.fullName,
        category: judge.category,
        country: judge.country,
        registeredAt: new Date(), // Use current date since backend might not have this
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
    isLoading,
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