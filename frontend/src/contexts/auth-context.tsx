'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, AuthState } from '@/types';
import { APIService } from '@/lib/api';

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'pana-auth-token';
const USER_KEY = 'pana-auth-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        
        if (token && userStr) {
          const user = JSON.parse(userStr) as User;
          // Convert date strings back to Date objects
          user.createdAt = new Date(user.createdAt);
          if (user.lastLoginAt) {
            user.lastLoginAt = new Date(user.lastLoginAt);
          }
          
          // Set token in API service
          APIService.setAuthToken(token);
          
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Verify token is still valid
          try {
            await APIService.verifyToken();
          } catch {
            // Token is invalid, clear auth data
            console.warn('Token verification failed, clearing auth data');
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            APIService.setAuthToken(null);
            setState({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid token/user data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        APIService.setAuthToken(null);
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await APIService.login(credentials);
      
      // Store token and user data
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setState({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Clear stored data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Clear token from API service
    APIService.setAuthToken(null);
    
    // Reset state
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    setError(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      if (!state.token) {
        throw new Error('No token available');
      }
      
      const response = await APIService.refreshToken();
      
      // Update stored token
      localStorage.setItem(TOKEN_KEY, response.accessToken);
      
      setState(prev => ({
        ...prev,
        token: response.accessToken,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, [state.token, logout]);

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    isLoading: state.isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 