'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw, AlertCircle, GraduationCap } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { APIService } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { useTranslations } from '@/contexts/i18n-context';
import type { Coach } from '@/types';
import { FigAvatar, useFigImagePreloader } from '@/components/fig-image';

interface CoachDataTableProps {
  countryCode: string;
  selectedCoaches: Coach[];
  onSelectionChange: (coaches: Coach[]) => void;
  maxSelection?: number;
  requiredLevel?: string;
  disabled?: boolean;
}

export function CoachDataTable({
  countryCode: country,
  selectedCoaches,
  onSelectionChange,
  maxSelection = 10,
  requiredLevel,
  disabled = false
}: CoachDataTableProps) {
  const { t } = useTranslations('common');
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Image preloading hook
  const { preloadPeopleImages } = useFigImagePreloader();

  // Load coaches on component mount and country change
  useEffect(() => {
    if (!country) return;

    const loadCoaches = async () => {
      try {
        setLoading(true);
        const coaches = await APIService.getCoaches(country);
        setAvailableCoaches(coaches);
        
        // Preload images for better UX
        await preloadPeopleImages(coaches);
      } catch (error) {
        console.error('Error loading coaches:', error);
        setError('Failed to load coaches');
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, [country]);

  // Filter coaches based on requirements
  const filteredCoaches = useMemo(() => {
    let filtered = availableCoaches;

    // Filter by level if required
    if (requiredLevel) {
      filtered = filtered.filter(c => c.level.includes(requiredLevel));
    }

    // Sort by last name
    return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [availableCoaches, requiredLevel]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!country) return;
    
    try {
      setRefreshing(true);
      await APIService.clearCoachCache();
      const coaches = await APIService.getCoaches(country);
      setAvailableCoaches(coaches);
      setError(null);
    } catch (error) {
      console.error('Error refreshing coaches:', error);
      setError('Failed to refresh coaches');
    } finally {
      setRefreshing(false);
    }
  };

  // Define columns for the data table
  const columns: ColumnDef<Coach>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              if (disabled) return;
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
            disabled={disabled}
          />
        ),
        cell: ({ row }) => {
          const isSelected = selectedCoaches.some(c => c.id === row.original.id);
          const canSelect = selectedCoaches.length < maxSelection || isSelected;
          
          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => {
                if (disabled) return;
                
                const coach = row.original;
                if (value && !isSelected && canSelect) {
                  onSelectionChange([...selectedCoaches, coach]);
                } else if (!value && isSelected) {
                  onSelectionChange(selectedCoaches.filter(c => c.id !== coach.id));
                }
              }}
              aria-label="Select row"
              disabled={disabled || (!isSelected && !canSelect)}
            />
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "fullName",
        accessorKey: "fullName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('coaches.table.coach')} />
        ),
        cell: ({ row }) => {
          const coach = row.original;
          return (
            <div className="flex items-center gap-3">
              <FigAvatar
                figId={coach.id}
                name={coach.fullName}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="font-medium">
                  {coach.lastName}, {coach.firstName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID: {coach.id}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('coaches.table.gender')} />
        ),
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string;
          return (
            <Badge variant={gender === 'MALE' ? 'default' : 'secondary'}>
              {gender === 'MALE' ? t('coaches.table.male') : t('coaches.table.female')}
            </Badge>
          );
        },
      },
      {
        accessorKey: "level",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('coaches.table.level')} />
        ),
        cell: ({ row }) => {
          const level = row.getValue("level") as string;
          return (
            <Badge variant="outline">
              {level}
            </Badge>
          );
        },
      },
      {
        accessorKey: "levelDescription",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('coaches.table.description')} />
        ),
        cell: ({ row }) => {
          const description = row.getValue("levelDescription") as string;
          return (
            <span className="text-sm text-muted-foreground">
              {description}
            </span>
          );
        },
      },
    ],
    [selectedCoaches, onSelectionChange, maxSelection, disabled, t]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t('coaches.table.loadingCoaches')}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">
            {error === 'Failed to load coaches' ? t('coaches.table.failedToLoadCoaches') : 
             error === 'Failed to refresh coaches' ? t('coaches.table.failedToRefreshCoaches') : 
             error}
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('coaches.table.tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      {selectedCoaches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {t('coaches.table.selectedCoaches')} ({selectedCoaches.length}/{maxSelection})
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={refreshing || disabled}
                  className="h-8 w-8"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedCoaches.map((coach) => (
                  <div key={coach.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <FigAvatar
                      figId={coach.id}
                      name={coach.fullName}
                      size="sm"
                      className="w-6 h-6"
                    />
                    <span className="text-sm font-medium">
                      {coach.lastName}, {coach.firstName}
                    </span>
                    <Badge variant="outline">
                      {coach.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredCoaches}
            searchKey="fullName"
            searchPlaceholder={t('coaches.table.searchPlaceholder')}
          />
        </CardContent>
      </Card>
    </div>
  );
} 