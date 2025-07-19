'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, UserPlus, Info } from 'lucide-react';
import { APIService } from '@/lib/api';
import { CreateGymnastRequest, Gymnast } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from '@/contexts/i18n-context';

interface CreateGymnastFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countryCode: string;
  onGymnastCreated: (gymnast: Gymnast) => void;
  title?: string;
  description?: string;
}

export function CreateGymnastForm({
  open,
  onOpenChange,
  countryCode,
  onGymnastCreated,
  title,
  description
}: CreateGymnastFormProps) {
  const { t } = useTranslations('forms');
  const [formData, setFormData] = useState<CreateGymnastRequest>({
    figId: '',
    firstName: '',
    lastName: '',
    gender: 'FEMALE',
    country: countryCode,
    dateOfBirth: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setFormData({
        figId: '',
        firstName: '',
        lastName: '',
        gender: 'FEMALE',
        country: countryCode,
        dateOfBirth: '',
      });
      setFormErrors({});
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateGymnastRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // FIG ID validation
    if (!formData.figId.trim()) {
      errors.figId = 'FIG ID is required';
    } else if (formData.figId.length < 3) {
      errors.figId = 'FIG ID must be at least 3 characters';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 10 || age > 50) {
        errors.dateOfBirth = 'Age must be between 10 and 50 years';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the gymnast via API
      const newGymnast = await APIService.createLocalGymnast(formData);
      
      // Notify parent component
      onGymnastCreated(newGymnast);
      
      // Close dialog
      handleOpenChange(false);
      
      // Show success message
      toast.success('Gymnast created successfully!', {
        description: `${newGymnast.fullName} has been added to your country's gymnast list with "license to check" status.`,
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Failed to create gymnast:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        setFormErrors({ figId: 'A gymnast with this FIG ID already exists' });
      } else {
        toast.error('Failed to create gymnast', {
          description: error.message || 'Please check your input and try again.',
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate age for preview
  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate category for preview
  const calculateCategory = (age: number): string => {
    if (age <= 15) return 'YOUTH';
    if (age <= 17) return 'JUNIOR';
    return 'SENIOR';
  };

  const previewAge = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
  const previewCategory = previewAge ? calculateCategory(previewAge) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            {title || t('gymnast.title')}
          </DialogTitle>
          <DialogDescription>
            {description || t('gymnast.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">License Status Notice</p>
                  <p>Local gymnasts are marked as "license to check" by default. Please verify their FUG registration status before the tournament.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* FIG ID */}
            <div className="space-y-2">
              <Label htmlFor="figId" className="text-sm font-medium">
                FIG ID *
              </Label>
              <Input
                id="figId"
                placeholder="e.g. FIG123456"
                value={formData.figId}
                onChange={(e) => handleInputChange('figId', e.target.value)}
                className={formErrors.figId ? 'border-red-500' : ''}
              />
              {formErrors.figId && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.figId}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={formErrors.firstName ? 'border-red-500' : ''}
                />
                {formErrors.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={formErrors.lastName ? 'border-red-500' : ''}
                />
                {formErrors.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value: 'MALE' | 'FEMALE') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className={formErrors.dateOfBirth ? 'border-red-500' : ''}
              />
              {formErrors.dateOfBirth && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.dateOfBirth}
                </p>
              )}
            </div>

            {/* Preview */}
            {previewAge && previewCategory && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-2">Gymnast Preview:</p>
                    <div className="space-y-1">
                      <p><span className="font-medium">Full Name:</span> {formData.firstName} {formData.lastName}</p>
                      <p><span className="font-medium">Age:</span> {previewAge} years</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Category:</span>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {previewCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">License Status:</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          To Check
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Gymnast'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 