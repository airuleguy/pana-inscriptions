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
import type { Judge } from '@/types';

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
  const [availableJudges, setAvailableJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load judges on component mount and country change
  useEffect(() => {
    if (!country) return;

    const loadJudges = async () => {
      try {
        setLoading(true);
        const judges = await APIService.getJudges(country);
        setAvailableJudges(judges);
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
          <DataTableColumnHeader column={column} title="Judge" />
        ),
        cell: ({ row }) => {
          const judge = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(judge.fullName)}
                </AvatarFallback>
              </Avatar>
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
          <DataTableColumnHeader column={column} title="Gender" />
        ),
        cell: ({ row }) => {
          const gender = row.getValue("gender") as string;
          return (
            <Badge variant={gender === 'MALE' ? 'default' : 'secondary'}>
              {gender === 'MALE' ? 'Male' : 'Female'}
            </Badge>
          );
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Category" />
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
          <DataTableColumnHeader column={column} title="Description" />
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
          <DataTableColumnHeader column={column} title="Age" />
        ),
        cell: ({ row }) => {
          const age = row.getValue("age") as number;
          return (
            <span className="text-sm">
              {age} years
            </span>
          );
        },
      },
    ],
    [disabled, maxSelection, onSelectionChange, selectedJudges]
  );

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Loading judges...</span>
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
              <p className="text-sm font-medium text-red-600">{error}</p>
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
                Try Again
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
              <p className="text-sm font-medium">No judges found</p>
              <p className="text-xs text-muted-foreground">
                {requiredCategory
                  ? `No judges with category ${requiredCategory} found for this country`
                  : 'No judges found for this country'
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
                Refresh
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
              Available Judges ({filteredJudges.length})
            </h3>
            {requiredCategory && (
              <Badge variant="outline" className="text-xs">
                Category {requiredCategory}
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
              Selected {selectedJudges.length} of {maxSelection} judge{maxSelection > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 