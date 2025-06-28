'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import type { Coach } from '@/types';

interface CoachDataTableProps {
  countryCode: string;
  selectedCoaches: Coach[];
  onSelectionChange: (coaches: Coach[]) => void;
  maxSelection: 1 | 2 | 3 | 5;
  requiredLevel?: string;
  disabled?: boolean;
}

export function CoachDataTable({
  countryCode,
  selectedCoaches,
  onSelectionChange,
  maxSelection,
  requiredLevel,
  disabled = false
}: CoachDataTableProps) {
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load coaches on component mount and country change
  useEffect(() => {
    async function loadCoaches() {
      if (!countryCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const coaches = await APIService.getCoaches(countryCode);
        setAvailableCoaches(coaches);
      } catch (err: unknown) {
        console.error('Failed to load coaches:', err);
        setError('Failed to load coaches from FIG database');
      } finally {
        setLoading(false);
      }
    }

    loadCoaches();
  }, [countryCode]);

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
  const handleRefresh = useCallback(async () => {
    if (!countryCode) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Clear cache and refetch
      await APIService.clearCoachCache();
      const coaches = await APIService.getCoaches(countryCode);
      setAvailableCoaches(coaches);
    } catch (err: unknown) {
      console.error('Refresh error:', err);
      setError('Failed to refresh coach data');
    } finally {
      setRefreshing(false);
    }
  }, [countryCode]);

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
          <DataTableColumnHeader column={column} title="Coach" />
        ),
        cell: ({ row }) => {
          const coach = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(coach.fullName)}
                </AvatarFallback>
              </Avatar>
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
        accessorKey: "level",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Level" />
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
          <DataTableColumnHeader column={column} title="Description" />
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
    [selectedCoaches, onSelectionChange, maxSelection, disabled]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading coaches from FIG database...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
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
                  Selected Coaches ({selectedCoaches.length}/{maxSelection})
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
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(coach.fullName)}
                      </AvatarFallback>
                    </Avatar>
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
            searchPlaceholder="Search coaches by name or level..."
          />
        </CardContent>
      </Card>
    </div>
  );
} 