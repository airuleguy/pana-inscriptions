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
import { ChoreographyCategory, AGE_LIMITS } from '@/constants/categories';

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
      errors.figId = t('gymnast.validation.figIdRequired');
    } else if (formData.figId.length < 3) {
      errors.figId = t('gymnast.validation.figIdMinLength');
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = t('gymnast.validation.firstNameRequired');
    } else if (formData.firstName.length < 2) {
      errors.firstName = t('gymnast.validation.firstNameMinLength');
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = t('gymnast.validation.lastNameRequired');
    } else if (formData.lastName.length < 2) {
      errors.lastName = t('gymnast.validation.lastNameMinLength');
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = t('gymnast.validation.dateOfBirthRequired');
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 10 || age > 50) {
        errors.dateOfBirth = t('gymnast.validation.ageRange');
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
      toast.success(t('gymnast.success.created'), {
        description: t('gymnast.success.createdDescription').replace('{name}', newGymnast.fullName),
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Failed to create gymnast:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        setFormErrors({ figId: t('gymnast.validation.figIdExists') });
      } else {
        toast.error(t('gymnast.errors.createFailed'), {
          description: error.message || t('gymnast.errors.createFailedDescription'),
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

  // Calculate category for preview using proper business rules
  const calculateCategory = (age: number): ChoreographyCategory => {
    if (age >= AGE_LIMITS[ChoreographyCategory.YOUTH].min && age <= AGE_LIMITS[ChoreographyCategory.YOUTH].max) {
      return ChoreographyCategory.YOUTH;
    }
    if (age >= AGE_LIMITS[ChoreographyCategory.JUNIOR].min && age <= AGE_LIMITS[ChoreographyCategory.JUNIOR].max) {
      return ChoreographyCategory.JUNIOR;
    }
    return ChoreographyCategory.SENIOR;
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
                  <p className="font-medium mb-1">{t('gymnast.licenseNotice.title')}</p>
                  <p>{t('gymnast.licenseNotice.description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* FIG ID */}
            <div className="space-y-2">
              <Label htmlFor="figId" className="text-sm font-medium">
                {t('gymnast.labels.figIdRequired')}
              </Label>
              <Input
                id="figId"
                placeholder={t('gymnast.placeholders.figIdExample')}
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
                  {t('gymnast.labels.firstNameRequired')}
                </Label>
                <Input
                  id="firstName"
                  placeholder={t('gymnast.placeholders.firstNamePlaceholder')}
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
                  {t('gymnast.labels.lastNameRequired')}
                </Label>
                <Input
                  id="lastName"
                  placeholder={t('gymnast.placeholders.lastNamePlaceholder')}
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
              <Label className="text-sm font-medium">{t('gymnast.labels.genderRequired')}</Label>
              <Select value={formData.gender} onValueChange={(value: 'MALE' | 'FEMALE') => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">{t('gymnast.genderOptions.female')}</SelectItem>
                  <SelectItem value="MALE">{t('gymnast.genderOptions.male')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                {t('gymnast.labels.dateOfBirthRequired')}
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
                    <p className="font-medium text-green-800 mb-2">{t('gymnast.preview.title')}</p>
                    <div className="space-y-1">
                      <p><span className="font-medium">{t('gymnast.preview.fullName')}</span> {formData.firstName} {formData.lastName}</p>
                      <p><span className="font-medium">{t('gymnast.preview.age')}</span> {previewAge} {t('gymnast.preview.years')}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('gymnast.preview.category')}</span>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {previewCategory}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{t('gymnast.preview.licenseStatus')}</span>
                        <Badge variant="outline" className="text-amber-700 border-amber-300">
                          {t('gymnast.preview.toCheck')}
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
            {t('gymnast.buttons.cancel')}
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
            {isSubmitting ? t('gymnast.buttons.creating') : t('gymnast.buttons.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 