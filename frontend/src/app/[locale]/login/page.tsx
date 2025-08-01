'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoginCredentials } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslations } from '@/contexts/i18n-context';

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error } = useAuth();
  const router = useRouter();
  const { t } = useTranslations('auth');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error(t('login.errors.emptyFields'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(credentials);
      toast.success(t('login.success.loginSuccessful'));
      // Redirect to tournament selection or dashboard
      router.push('/tournament-selection');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('login.errors.loginFailed');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {t('login.title')}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('login.username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  placeholder="Enter your username"
                  disabled={isSubmitting}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !credentials.username.trim() || !credentials.password.trim()}
              >
                {isSubmitting ? t('login.loggingIn') : t('login.loginButton')}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>This system is restricted to authorized country delegates only.</p>
          <p className="mt-1">
            For technical support, contact the tournament organizers.
          </p>
        </div>
      </div>
    </div>
  );
} 