'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Gymnast, Coach, Judge, SupportStaff, Tournament, Choreography, RegistrationStatus } from '@/types';
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

export interface RegisteredSupportStaff {
  id: string;
  name: string;
  role: string;
  country: string;
  registeredAt: Date;
  status: RegistrationStatus;
  supportData?: SupportStaff;
}

interface RegistrationState {
  choreographies: RegisteredChoreography[];
  coaches: RegisteredCoach[];
  judges: RegisteredJudge[];
  supportStaff: RegisteredSupportStaff[];
  tournament: Tournament | null;
  country: string | null;
  isSidebarOpen: boolean;
}

interface RegistrationContextType {
  state: RegistrationState;
  addChoreography: (choreography: RegisteredChoreography) => void;
  removeChoreography: (id: string) => Promise<void>;
  addCoach: (coach: RegisteredCoach) => void;
  removeCoach: (id: string) => void;
  addJudge: (judge: RegisteredJudge) => void;
  removeJudge: (id: string) => void;
  addSupportStaff: (supportStaff: RegisteredSupportStaff) => void;
  removeSupportStaff: (id: string) => void;
  clearAll: () => void;
  getTotalCount: () => number;
  canConfirmRegistration: () => boolean;
  loadExistingRegistrations: () => Promise<void>;
  syncPendingRegistrations: () => Promise<void>;
  refreshRegistrations: () => Promise<void>;
  updateTournamentAndCountry: (tournament: Tournament, country: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isLoading: boolean;
  // Status management methods
  submitRegistrations: () => Promise<void>;
  getRegistrationsByStatus: (status: RegistrationStatus) => {
    choreographies: RegisteredChoreography[];
    coaches: RegisteredCoach[];
    judges: RegisteredJudge[];
    supportStaff: RegisteredSupportStaff[];
  };
  getPendingCount: () => number;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

const getStorageKey = (tournamentId?: string) => {
  return tournamentId ? `pana-registration-summary-${tournamentId}` : 'pana-registration-summary';
};

// Clean up old tournament registration data from localStorage
const cleanupOldTournamentData = (currentTournamentId: string) => {
  const keysToRemove: string[] = [];
  
  // Find all registration summary keys in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('pana-registration-summary-') && key !== getStorageKey(currentTournamentId)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove old tournament data and legacy key
  keysToRemove.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem('pana-registration-summary'); // Remove legacy key
};

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistrationState>({
    choreographies: [],
    coaches: [],
    judges: [],
    supportStaff: [],
    tournament: null,
    country: null,
    isSidebarOpen: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previousTournamentId, setPreviousTournamentId] = useState<string | null>(null);

  // Load tournament and country first, then load tournament-specific registrations
  useEffect(() => {
    const tournamentData = localStorage.getItem('selectedTournament');
    const countryData = localStorage.getItem('selectedCountry');

    // Load tournament and country first
    if (tournamentData && countryData) {
      try {
        const tournament = JSON.parse(tournamentData) as Tournament;
        setState(prev => ({
          ...prev,
          tournament,
          country: countryData,
          supportStaff: prev.supportStaff || [], // Ensure supportStaff is initialized
        }));

        // Set the previous tournament ID to prevent unnecessary clearing on initial load
        setPreviousTournamentId(tournament.id);

        // Clean up old tournament data to prevent cross-tournament pollution
        cleanupOldTournamentData(tournament.id);

        // Now load tournament-specific registration data
        const tournamentStorageKey = getStorageKey(tournament.id);
        const savedState = localStorage.getItem(tournamentStorageKey);
        
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
            if (parsedState.supportStaff) {
              parsedState.supportStaff = parsedState.supportStaff.map((s: RegisteredSupportStaff) => ({
                ...s,
                registeredAt: new Date(s.registeredAt),
                status: s.status || 'PENDING', // Default to PENDING for backward compatibility
              }));
            }
            
            setState(prev => ({ 
              ...prev, 
              choreographies: parsedState.choreographies || [],
              coaches: parsedState.coaches || [],
              judges: parsedState.judges || [],
              supportStaff: parsedState.supportStaff || []
            }));
          } catch (error) {
            console.error('Error loading tournament-specific registration state:', error);
          }
        }
      } catch (error) {
        console.error('Error loading tournament/country data:', error);
      }
    }
  }, []);



  // Save state to localStorage whenever it changes (tournament-specific)
  useEffect(() => {
    if (state.tournament) {
      const tournamentStorageKey = getStorageKey(state.tournament.id);
      localStorage.setItem(tournamentStorageKey, JSON.stringify({
        choreographies: state.choreographies,
        coaches: state.coaches,
        judges: state.judges,
        supportStaff: state.supportStaff,
      }));
    }
  }, [state.choreographies, state.coaches, state.judges, state.supportStaff, state.tournament]);

  const addChoreography = (choreography: RegisteredChoreography) => {
    setState(prev => ({
      ...prev,
      choreographies: [...prev.choreographies, choreography],
    }));
  };

  const removeChoreography = async (id: string) => {
    try {
      // Only remove from backend if it's a PENDING registration
      const choreography = state.choreographies.find(c => c.id === id);
      if (choreography && choreography.status === 'PENDING' && state.tournament) {
        await APIService.deleteChoreography(id, state.tournament.id);
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        choreographies: prev.choreographies.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove choreography:', error);
      // Still remove from local state even if API call fails
      setState(prev => ({
        ...prev,
        choreographies: prev.choreographies.filter(c => c.id !== id),
      }));
      throw error;
    }
  };

  const addCoach = (coach: RegisteredCoach) => {
    setState(prev => ({
      ...prev,
      coaches: [...prev.coaches, coach],
    }));
  };

  const removeCoach = async (id: string) => {
    try {
      // Only remove from backend if it's a PENDING registration
      const coach = state.coaches.find(c => c.id === id);
      if (coach && coach.status === 'PENDING' && state.tournament) {
        await APIService.deleteCoach(id, state.tournament.id);
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        coaches: prev.coaches.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove coach:', error);
      // Still remove from local state even if API call fails
      setState(prev => ({
        ...prev,
        coaches: prev.coaches.filter(c => c.id !== id),
      }));
      throw error;
    }
  };

  const addJudge = (judge: RegisteredJudge) => {
    setState(prev => ({
      ...prev,
      judges: [...prev.judges, judge],
    }));
  };

  const removeJudge = async (id: string) => {
    try {
      // Only remove from backend if it's a PENDING registration
      const judge = state.judges.find(j => j.id === id);
      if (judge && judge.status === 'PENDING' && state.tournament) {
        await APIService.deleteJudge(id, state.tournament.id);
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        judges: prev.judges.filter(j => j.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove judge:', error);
      // Still remove from local state even if API call fails
      setState(prev => ({
        ...prev,
        judges: prev.judges.filter(j => j.id !== id),
      }));
      throw error;
    }
  };

  const addSupportStaff = (supportStaff: RegisteredSupportStaff) => {
    setState(prev => ({
      ...prev,
      supportStaff: [...prev.supportStaff, supportStaff],
    }));
  };

  const removeSupportStaff = async (id: string) => {
    try {
      // Only remove from backend if it's a PENDING registration
      const supportStaff = state.supportStaff.find(s => s.id === id);
      if (supportStaff && supportStaff.status === 'PENDING' && state.tournament) {
        await APIService.deleteSupportStaff(id, state.tournament.id);
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        supportStaff: prev.supportStaff.filter(s => s.id !== id),
      }));
    } catch (error) {
      console.error('Failed to remove support staff:', error);
      // Still remove from local state even if API call fails
      setState(prev => ({
        ...prev,
        supportStaff: prev.supportStaff.filter(s => s.id !== id),
      }));
      throw error;
    }
  };

  const clearAll = () => {
    setState(prev => ({
      ...prev,
      choreographies: [],
      coaches: [],
      judges: [],
      supportStaff: [],
    }));
    
    // Remove tournament-specific storage
    if (state.tournament) {
      const tournamentStorageKey = getStorageKey(state.tournament.id);
      localStorage.removeItem(tournamentStorageKey);
    }
    
    // Also remove legacy storage key for backward compatibility
    localStorage.removeItem('pana-registration-summary');
  };

  const getTotalCount = () => {
    return state.choreographies.length + state.coaches.length + state.judges.length + state.supportStaff.length;
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
          pendingRegistrations.judges.length === 0 &&
          pendingRegistrations.supportStaff.length === 0) {
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
        supportStaff: prev.supportStaff.map(s => 
          s.status === 'PENDING' ? { ...s, status: 'SUBMITTED' as RegistrationStatus } : s
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
      supportStaff: state.supportStaff.filter(s => s.status === status),
    };
  };

  const getPendingCount = () => {
    const pending = getRegistrationsByStatus('PENDING');
    return pending.choreographies.length + pending.coaches.length + pending.judges.length + pending.supportStaff.length;
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

      const supportStaff: RegisteredSupportStaff[] = (data.supportStaff || []).map(support => ({
        id: support.id,
        name: support.fullName,
        role: support.role,
        country: support.country,
        registeredAt: new Date(), // Use current date since backend might not have this
        status: 'SUBMITTED' as RegistrationStatus,
        supportData: support,
      }));

      setState(prev => ({
        ...prev,
        choreographies,
        coaches,
        judges,
        supportStaff,
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

      const pendingSupportStaff: RegisteredSupportStaff[] = (pendingData.supportStaff || []).map(support => ({
        id: support.id,
        name: support.fullName,
        role: support.role,
        country: support.country,
        registeredAt: new Date(support.createdAt || Date.now()),
        status: 'PENDING' as RegistrationStatus,
        supportData: support,
      }));

      // Replace pending registrations with database state, keep submitted ones
      setState(prev => {
        // Get existing non-pending registrations (submitted/registered)
        const existingSubmitted = prev.choreographies.filter(c => c.status !== 'PENDING');
        const existingCoachesSubmitted = prev.coaches.filter(c => c.status !== 'PENDING');
        const existingJudgesSubmitted = prev.judges.filter(j => j.status !== 'PENDING');
        const existingSupportSubmitted = prev.supportStaff.filter(s => s.status !== 'PENDING');

        return {
          ...prev,
          choreographies: [...existingSubmitted, ...pendingChoreographies],
          coaches: [...existingCoachesSubmitted, ...pendingCoaches],
          judges: [...existingJudgesSubmitted, ...pendingJudges],
          supportStaff: [...existingSupportSubmitted, ...pendingSupportStaff],
        };
      });

      console.log(`Refreshed ${pendingData.totals.total} pending registrations from database`);
    } catch (error) {
      console.error('Failed to sync pending registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [state.tournament, state.country]);

  // Auto-sync pending registrations when tournament or country changes
  useEffect(() => {
    if (state.tournament && state.country) {
      // Always sync from database since all pending registrations are immediately persisted to DB
      // localStorage is just a cache/mirror of the database state
      console.log('Auto-refreshing pending registrations from database...');
      syncPendingRegistrations();
    }
  }, [state.tournament, state.country, syncPendingRegistrations]);

  // Manual refresh method for pageview or user-triggered refreshes
  const refreshRegistrations = useCallback(async () => {
    if (!state.tournament || !state.country) {
      console.log('Cannot refresh registrations: missing tournament or country');
      return;
    }

    console.log('Manually refreshing registrations from database...');
    // Only sync pending registrations since syncPendingRegistrations already handles 
    // merging with existing submitted registrations correctly
    await syncPendingRegistrations();
  }, [state.tournament, state.country, syncPendingRegistrations]);

  // Method to update tournament and country (used by pages to sync context)
  const updateTournamentAndCountry = useCallback((tournament: Tournament, country: string) => {
    setState(prev => {
      // Check if tournament is actually changing
      const isTournamentChanging = prev.tournament?.id !== tournament.id;
      
      if (isTournamentChanging) {
        console.log(`Tournament changing from ${prev.tournament?.id} to ${tournament.id}. Clearing registrations...`);
        // Clear registrations when tournament changes
        return {
          ...prev,
          tournament,
          country,
          choreographies: [],
          coaches: [],
          judges: [],
          supportStaff: [],
        };
      } else {
        // Just update tournament and country if no change
        return {
          ...prev,
          tournament,
          country,
        };
      }
    });
    
    // Update previous tournament ID to reflect the change
    setPreviousTournamentId(tournament.id);
    
    // Update localStorage as well for consistency
    localStorage.setItem('selectedTournament', JSON.stringify(tournament));
    localStorage.setItem('selectedCountry', country);
  }, []);

  const value: RegistrationContextType = {
    state,
    addChoreography,
    removeChoreography,
    addCoach,
    removeCoach,
    addJudge,
    removeJudge,
    addSupportStaff,
    removeSupportStaff,
    clearAll,
    getTotalCount,
    canConfirmRegistration,
    loadExistingRegistrations,
    syncPendingRegistrations,
    refreshRegistrations,
    updateTournamentAndCountry,
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