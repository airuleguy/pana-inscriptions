'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, UserPlus, Info } from 'lucide-react';
import { APIService } from '@/lib/api';
import { CreateCoachRequest, Coach } from '@/types';
import { toast } from 'sonner';
import { useTranslations } from '@/contexts/i18n-context';

interface CreateCoachFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  countryCode: string;
  onCoachCreated: (coach: Coach) => void;
  title?: string;
  description?: string;
}

export function CreateCoachForm({
  open,
  onOpenChange,
  countryCode,
  onCoachCreated,
  title,
  description
}: CreateCoachFormProps) {
  const { t } = useTranslations('forms');
  const [formData, setFormData] = useState<CreateCoachRequest>({
    figId: '',
    firstName: '',
    lastName: '',
    fullName: '',
    gender: 'FEMALE',
    country: countryCode,
    level: 'L1',
    levelDescription: 'Level 1',
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
        fullName: '',
        gender: 'FEMALE',
        country: countryCode,
        level: 'L1',
        levelDescription: 'Level 1',
      });
      setFormErrors({});
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateCoachRequest, value: string) => {
    setFormData(prev => {
      const updates = {
        ...prev,
        [field]: value
      };
      
      // Update fullName when firstName or lastName changes
      if (field === 'firstName' || field === 'lastName') {
        updates.fullName = `${field === 'firstName' ? value : prev.firstName} ${field === 'lastName' ? value : prev.lastName}`.trim();
      }
      
      return updates;
    });
    
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
      errors.figId = t('coach.validation.figIdRequired');
    } else if (formData.figId.length < 3) {
      errors.figId = t('coach.validation.figIdMinLength');
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = t('coach.validation.firstNameRequired');
    } else if (formData.firstName.length < 2) {
      errors.firstName = t('coach.validation.firstNameMinLength');
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = t('coach.validation.lastNameRequired');
    } else if (formData.lastName.length < 2) {
      errors.lastName = t('coach.validation.lastNameMinLength');
    }

    // Level validation
    if (!formData.level.trim()) {
      errors.level = t('coach.validation.levelRequired');
    }

    // Level description validation
    if (!formData.levelDescription.trim()) {
      errors.levelDescription = t('coach.validation.levelDescriptionRequired');
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
      // Create the coach via API
      const newCoach = await APIService.createLocalCoach({
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
      });
      
      // Notify parent component
      onCoachCreated(newCoach);
      
      // Close dialog
      handleOpenChange(false);
      
      // Show success message
      toast.success(t('coach.success.created'), {
        description: t('coach.success.createdDescription').replace('{name}', newCoach.fullName),
        duration: 5000,
      });
      
    } catch (error: any) {
      console.error('Failed to create coach:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        setFormErrors({ figId: t('coach.validation.figIdExists') });
      } else {
        toast.error(t('coach.errors.createFailed'), {
          description: error.message || t('coach.errors.createFailedDescription'),
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[65vw] min-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            {title || t('coach.title')}
          </DialogTitle>
          <DialogDescription>
            {description || t('coach.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">{t('coach.licenseNotice.title')}</p>
                  <p>{t('coach.licenseNotice.description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Fields Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* FIG ID */}
              <div className="space-y-2">
                <Label htmlFor="figId" className="text-sm font-medium">
                  {t('coach.labels.figIdRequired')}
                </Label>
                <Input
                  id="figId"
                  placeholder={t('coach.placeholders.figIdExample')}
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

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  {t('coach.labels.firstNameRequired')}
                </Label>
                <Input
                  id="firstName"
                  placeholder={t('coach.placeholders.firstNamePlaceholder')}
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

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  {t('coach.labels.lastNameRequired')}
                </Label>
                <Input
                  id="lastName"
                  placeholder={t('coach.placeholders.lastNamePlaceholder')}
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

            {/* Details Row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('coach.labels.genderRequired')}</Label>
                <Select value={formData.gender} onValueChange={(value: 'MALE' | 'FEMALE') => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">{t('coach.genderOptions.female')}</SelectItem>
                    <SelectItem value="MALE">{t('coach.genderOptions.male')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t('coach.labels.levelRequired')}</Label>
                <Select value={formData.level} onValueChange={(value) => {
                  handleInputChange('level', value);
                  // Update level description based on selected level
                  const descriptions: Record<string, string> = {
                    'L1': 'Level 1',
                    'L2': 'Level 2',
                    'L3': 'Level 3',
                    'LHB': 'High Performance',
                    'LBR': 'Brevet',
                  };
                  handleInputChange('levelDescription', descriptions[value] || value);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">{t('coach.levelOptions.l1')}</SelectItem>
                    <SelectItem value="L2">{t('coach.levelOptions.l2')}</SelectItem>
                    <SelectItem value="L3">{t('coach.levelOptions.l3')}</SelectItem>
                    <SelectItem value="LHB">{t('coach.levelOptions.lhb')}</SelectItem>
                    <SelectItem value="LBR">{t('coach.levelOptions.lbr')}</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.level && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.level}
                  </p>
                )}
              </div>

              {/* Club (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="club" className="text-sm font-medium">
                  {t('coach.labels.club')}
                </Label>
                <Input
                  id="club"
                  placeholder={t('coach.placeholders.clubPlaceholder')}
                  value={formData.club || ''}
                  onChange={(e) => handleInputChange('club', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('coach.buttons.cancel')}
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
            {isSubmitting ? t('coach.buttons.creating') : t('coach.buttons.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
