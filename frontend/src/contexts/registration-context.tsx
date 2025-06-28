'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Gymnast, Coach, Judge, Choreography, Tournament } from '@/types';

export interface RegisteredChoreography {
  id: string;
  name: string;
  category: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  type: string;
  gymnastsCount: number;
  gymnasts: Gymnast[];
  registeredAt: Date;
}

export interface RegisteredCoach {
  id: string;
  name: string;
  level: string;
  country: string;
  registeredAt: Date;
}

export interface RegisteredJudge {
  id: string;
  name: string;
  category: string;
  country: string;
  registeredAt: Date;
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