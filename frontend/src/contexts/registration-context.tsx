'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Gymnast, Coach, Judge, Choreography, Tournament } from '@/types';
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
    countryCode: string;
    tournament: Tournament;
    selectedGymnasts: Gymnast[];
    gymnastCount: 1 | 2 | 3 | 5 | 8;
    routineDescription: string;
    status: 'SUBMITTED';
    notes: string;
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

const STORAGE_KEY = 'pana-registration-cart';

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
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        parsedState.choreographies = parsedState.choreographies?.map((c: any) => ({
          ...c,
          registeredAt: new Date(c.registeredAt),
        })) || [];
        parsedState.coaches = parsedState.coaches?.map((c: any) => ({
          ...c,
          registeredAt: new Date(c.registeredAt),
        })) || [];
        parsedState.judges = parsedState.judges?.map((j: any) => ({
          ...j,
          registeredAt: new Date(j.registeredAt),
        })) || [];
        
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
          tournament: JSON.parse(tournamentData),
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

  const loadExistingRegistrations = async () => {
    if (!state.tournament || !state.country) {
      console.log('Cannot load existing registrations: missing tournament or country');
      return;
    }

    setIsLoading(true);
    try {
      const existingRegistrations = await APIService.getExistingRegistrations(
        state.country,
        state.tournament.id
      );

      // Transform backend data to local format and merge with existing local data
      const existingChoreographies: RegisteredChoreography[] = existingRegistrations.choreographies.map(c => ({
        id: c.id,
        name: c.name,
        category: c.category,
        type: c.type,
        gymnastsCount: c.gymnastCount,
        gymnasts: c.gymnasts || [],
        registeredAt: new Date(c.createdAt),
        choreographyData: c
      }));

      const existingCoaches: RegisteredCoach[] = existingRegistrations.coaches.map(c => ({
        id: c.id,
        name: c.fullName,
        level: c.level,
        country: c.country,
        registeredAt: new Date(c.createdAt),
        coachData: c
      }));

      const existingJudges: RegisteredJudge[] = existingRegistrations.judges.map(j => ({
        id: j.id,
        name: j.fullName,
        category: j.category,
        country: j.country,
        registeredAt: new Date(j.createdAt),
        judgeData: j
      }));

      // Merge with existing local registrations (avoid duplicates)
      setState(prev => {
        const mergedChoreographies = [
          ...prev.choreographies,
          ...existingChoreographies.filter(ec => 
            !prev.choreographies.some(pc => pc.id === ec.id)
          )
        ];

        const mergedCoaches = [
          ...prev.coaches,
          ...existingCoaches.filter(ec =>
            !prev.coaches.some(pc => pc.id === ec.id)
          )
        ];

        const mergedJudges = [
          ...prev.judges,
          ...existingJudges.filter(ej =>
            !prev.judges.some(pj => pj.id === ej.id)
          )
        ];

        return {
          ...prev,
          choreographies: mergedChoreographies,
          coaches: mergedCoaches,
          judges: mergedJudges,
        };
      });

      console.log('Existing registrations loaded successfully');
    } catch (error) {
      console.error('Failed to load existing registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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