'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw, AlertCircle, Users } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { APIService } from '@/lib/api';
import { getInitials, getCategoryColor } from '@/lib/utils';
import type { Gymnast } from '@/types';

interface GymnastDataTableProps {
  countryCode: string;
  selectedGymnasts: Gymnast[];
  onSelectionChange: (gymnasts: Gymnast[]) => void;
  maxSelection: 1 | 2 | 3 | 5 | 8;
  requiredCategory?: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  disabled?: boolean;
}

export function GymnastDataTable({
  countryCode,
  selectedGymnasts,
  onSelectionChange,
  maxSelection,
  requiredCategory,
  disabled = false
}: GymnastDataTableProps) {
  const [availableGymnasts, setAvailableGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load gymnasts on component mount and country change
  useEffect(() => {
    async function loadGymnasts() {
      if (!countryCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const gymnasts = await APIService.getGymnasts(countryCode);
        setAvailableGymnasts(gymnasts);
      } catch (err: unknown) {
        console.error('Failed to load gymnasts:', err);
        setError('Failed to load gymnasts from FIG database');
      } finally {
        setLoading(false);
      }
    }

    loadGymnasts();
  }, [countryCode]);

  // Filter gymnasts based on requirements
  const filteredGymnasts = useMemo(() => {
    let filtered = availableGymnasts;

    // Filter by category if required
    if (requiredCategory) {
      filtered = filtered.filter(g => g.category === requiredCategory);
    }

    // Sort by last name
    return filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [availableGymnasts, requiredCategory]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!countryCode) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Clear cache and refetch
      await APIService.clearGymnastCache();
      const gymnasts = await APIService.getGymnasts(countryCode);
      setAvailableGymnasts(gymnasts);
    } catch (err: unknown) {
      console.error('Refresh error:', err);
      setError('Failed to refresh gymnast data');
    } finally {
      setRefreshing(false);
    }
  }, [countryCode]);



  // Define columns for the data table
  const columns: ColumnDef<Gymnast>[] = useMemo(
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
          const isSelected = selectedGymnasts.some(g => g.id === row.original.id);
          const canSelect = selectedGymnasts.length < maxSelection || isSelected;
          
          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(value) => {
                if (disabled) return;
                
                const gymnast = row.original;
                if (value && !isSelected && canSelect) {
                  onSelectionChange([...selectedGymnasts, gymnast]);
                } else if (!value && isSelected) {
                  onSelectionChange(selectedGymnasts.filter(g => g.id !== gymnast.id));
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
          <DataTableColumnHeader column={column} title="Gymnast" />
        ),
        cell: ({ row }) => {
          const gymnast = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(gymnast.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">
                  {gymnast.lastName}, {gymnast.firstName}
                </span>
                <span className="text-xs text-muted-foreground">
                  ID: {gymnast.id}
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
        accessorKey: "age",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Age" />
        ),
        cell: ({ row }) => {
          const age = row.getValue("age") as number;
          return <span>{age}</span>;
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
            <Badge variant="outline" className={getCategoryColor(category as 'YOUTH' | 'JUNIOR' | 'SENIOR')}>
              {category}
            </Badge>
          );
        },
      },
      {
        accessorKey: "dateOfBirth",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date of Birth" />
        ),
        cell: ({ row }) => {
          const date = row.getValue("dateOfBirth") as Date;
          return <span>{date.toLocaleDateString()}</span>;
        },
      },
      {
        id: "license",
        header: "License",
        cell: ({ row }) => {
          const gymnast = row.original;
          return (
            <div className="flex flex-col gap-1">
              <Badge variant={gymnast.licenseValid ? 'default' : 'destructive'}>
                {gymnast.licenseValid ? 'Valid' : 'Expired'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Expires: {gymnast.licenseExpiryDate.toLocaleDateString()}
              </span>
            </div>
          );
        },
      },
    ],
    [selectedGymnasts, onSelectionChange, maxSelection, disabled]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading gymnasts from FIG database...</p>
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
      {selectedGymnasts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Selected Gymnasts ({selectedGymnasts.length}/{maxSelection})
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
                {selectedGymnasts.map((gymnast) => (
                  <div key={gymnast.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Avatar className="w-6 h-6">
                                           <AvatarFallback className="text-xs">
                       {getInitials(gymnast.fullName)}
                     </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {gymnast.lastName}, {gymnast.firstName}
                    </span>
                    <Badge variant="outline" className={getCategoryColor(gymnast.category)}>
                      {gymnast.category}
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
            data={filteredGymnasts}
            searchKey="fullName"
            searchPlaceholder="Search gymnasts by name..."
          />
        </CardContent>
      </Card>
    </div>
  );
} 