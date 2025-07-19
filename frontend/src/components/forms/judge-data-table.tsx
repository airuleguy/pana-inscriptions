'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw, AlertCircle, Scale } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { APIService } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { useTranslations } from '@/contexts/i18n-context';
import type { Judge } from '@/types';
import { FigAvatar, useFigImagePreloader } from '@/components/fig-image';

interface JudgeDataTableProps {
  countryCode: string;
  selectedJudges: Judge[];
  onSelectionChange: (judges: Judge[]) => void;
  maxSelection?: number;
  requiredCategory?: string;
  disabled?: boolean;
}

export function JudgeDataTable({
  countryCode: country,
  selectedJudges,
  onSelectionChange,
  maxSelection = 10,
  requiredCategory,
  disabled = false
}: JudgeDataTableProps) {
  const { t } = useTranslations('common');
  const [availableJudges, setAvailableJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Image preloading hook
  const { preloadPeopleImages } = useFigImagePreloader();

  // Load judges on component mount and country change
  useEffect(() => {
    if (!country) return;

    const loadJudges = async () => {
      try {
        setLoading(true);
        const judges = await APIService.getJudges(country);
        setAvailableJudges(judges);
        
        // Preload images for better UX
        await preloadPeopleImages(judges);
      } catch (error) {
        console.error('Error loading judges:', error);
        setError('Failed to load judges');
      } finally {
        setLoading(false);
      }
    };

    loadJudges();
  }, [country]);

  // Filter judges based on requirements
  const filteredJudges = useMemo(() => {
    let filtered = availableJudges;

    // Filter by category if required
    if (requiredCategory) {
      filtered = filtered.filter(j => j.category === requiredCategory);
    }

    // Sort by last name
    return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [availableJudges, requiredCategory]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!country) return;
    
    try {
      setRefreshing(true);
      await APIService.clearJudgeCache();
      const judges = await APIService.getJudges(country);
      setAvailableJudges(judges);
      setError(null);
    } catch (error) {
      console.error('Error refreshing judges:', error);
      setError('Failed to refresh judges');
    } finally {
      setRefreshing(false);
    }
  };

  // Define columns for the data table
  const columns: ColumnDef<Judge>[] = useMemo(
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
          const isSelected = selectedJudges.some(j => j.id === row.original.id);
          const canSelect = selectedJudges.length < maxSelection || isSelected;
          
          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => {
                if (disabled) return;
                
                const judge = row.original;
                if (value && !isSelected && canSelect) {
                  onSelectionChange([...selectedJudges, judge]);
                } else if (!value && isSelected) {
                  onSelectionChange(selectedJudges.filter(j => j.id !== judge.id));
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
          <DataTableColumnHeader column={column} title={t('judges.table.judge')} />
        ),
        cell: ({ row }) => {
          const judge = row.original;
          return (
            <div className="flex items-center gap-3">
              <FigAvatar
                figId={judge.id}
                name={judge.fullName}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="font-medium">
                  {judge.lastName}, {judge.firstName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID: {judge.id}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "gender",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('judges.table.gender')} />
        ),
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string;
          return (
            <Badge variant={gender === 'MALE' ? 'default' : 'secondary'}>
              {gender === 'MALE' ? t('judges.table.male') : t('judges.table.female')}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('judges.table.category')} />
        ),
        cell: ({ row }) => {
          const category = row.getValue("category") as string;
          return (
            <Badge variant="outline">
              {category}
            </Badge>
          );
        },
      },
      {
        accessorKey: "categoryDescription",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('judges.table.description')} />
        ),
        cell: ({ row }) => {
          const description = row.getValue("categoryDescription") as string;
          return (
            <span className="text-sm text-muted-foreground">
              {description}
            </span>
          );
        },
      },
      {
        accessorKey: "age",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('judges.table.age')} />
        ),
        cell: ({ row }) => {
          const age = row.getValue("age") as number;
          return (
            <span className="text-sm">
              {age} {t('judges.table.years')}
            </span>
          );
        },
      },
    ],
    [disabled, maxSelection, onSelectionChange, selectedJudges, t]
  );

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">{t('judges.table.loadingJudges')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-red-600">
                {error === 'Failed to load judges' ? t('judges.table.failedToLoadJudges') : 
                 error === 'Failed to refresh judges' ? t('judges.table.failedToRefreshJudges') : 
                 error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-2"
              >
                {refreshing ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                {t('judges.table.tryAgain')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (filteredJudges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <Scale className="w-8 h-8 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium">{t('judges.table.noJudgesFound')}</p>
              <p className="text-xs text-muted-foreground">
                {requiredCategory
                  ? t('judges.table.noJudgesFoundWithCategory').replace('{category}', requiredCategory)
                  : t('judges.table.noJudgesFoundGeneral')
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-2"
              >
                {refreshing ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                {t('judges.table.refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <h3 className="font-medium">
              {t('judges.table.availableJudges')} ({filteredJudges.length})
            </h3>
            {requiredCategory && (
              <Badge variant="outline" className="text-xs">
                {t('judges.table.categoryBadge')} {requiredCategory}
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>
        </div>
        <DataTable columns={columns} data={filteredJudges} />
        
        {selectedJudges.length > 0 && (
          <div className="border-t p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {maxSelection > 1 ? 
                t('judges.table.selectedCountPlural').replace('{selected}', selectedJudges.length.toString()).replace('{max}', maxSelection.toString()) :
                t('judges.table.selectedCount').replace('{selected}', selectedJudges.length.toString()).replace('{max}', maxSelection.toString())
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 