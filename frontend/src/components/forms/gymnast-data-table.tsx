'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, RefreshCw, AlertCircle, Users, Search, UserPlus } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table';
import { APIService } from '@/lib/api';
import { getInitials, getCategoryColor, formatDateDDMMYYYY } from '@/lib/utils';
import { ChoreographyCategory } from '@/constants/categories';
import type { Gymnast } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CreateGymnastForm } from './create-gymnast-form';
import { FigAvatar, useFigImagePreloader } from '@/components/fig-image';

interface GymnastDataTableProps {
  countryCode: string;
  gymnasts: Gymnast[];
  onSelectionChange: (gymnasts: Gymnast[]) => void;
  maxSelection?: 1 | 2 | 3 | 5 | 8;
  requiredCategory?: 'YOUTH' | 'JUNIOR' | 'SENIOR';
  disabled?: boolean;
}

export function GymnastDataTable({
  countryCode,
  gymnasts,
  onSelectionChange,
  maxSelection = 8,
  requiredCategory,
  disabled = false
}: GymnastDataTableProps) {
  const [availableGymnasts, setAvailableGymnasts] = useState<Gymnast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Image preloading hook
  const { preloadPeopleImages } = useFigImagePreloader();

  // Load gymnasts on component mount and country change
  useEffect(() => {
    async function loadGymnasts() {
      if (!countryCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Use backend API service which now includes correct license expiry dates
        const gymnasts = await APIService.getGymnasts(countryCode);
        setAvailableGymnasts(gymnasts);
        
        // Preload images for better UX
        await preloadPeopleImages(gymnasts);
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

    // Sort by last name with null safety
    return filtered.sort((a, b) => {
      const lastNameA = a.lastName || '';
      const lastNameB = b.lastName || '';
      return lastNameA.localeCompare(lastNameB);
    });
  }, [availableGymnasts, requiredCategory]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!countryCode) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Clear cache and refetch using backend API service
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

  // Handle new gymnast created
  const handleGymnastCreated = useCallback((newGymnast: Gymnast) => {
    // Add the new gymnast to the list
    setAvailableGymnasts(prev => [...prev, newGymnast]);
    
    // Automatically select the new gymnast if there's room
    if (gymnasts.length < maxSelection) {
      onSelectionChange([...gymnasts, newGymnast]);
    }
  }, [gymnasts, maxSelection, onSelectionChange]);

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
          const isSelected = gymnasts.some(g => g.figId === row.original.figId);
          const canSelect = gymnasts.length < maxSelection || isSelected;
          
          const handleToggle = () => {
            if (disabled) return;
            
            const gymnast = row.original;
            if (isSelected) {
              onSelectionChange(gymnasts.filter(g => g.figId !== gymnast.figId));
            } else {
              onSelectionChange([...gymnasts, gymnast]);
            }
          };

          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggle}
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
              <FigAvatar
                figId={gymnast.figId}
                name={gymnast.fullName || 'Unknown'}
                size="sm"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {gymnast.lastName || 'Unknown'}, {gymnast.firstName || 'Unknown'}
                  </span>
                  {gymnast.isLocal && (
                    <Badge variant="outline" className="text-xs text-blue-700 border-blue-300 bg-blue-50">
                      Local
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  FIG ID: {gymnast.figId}
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
              {gender === 'MALE' ? 'Male' : gender === 'FEMALE' ? 'Female' : 'Unknown'}
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
          return <span>{age || 'N/A'}</span>;
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
            <Badge variant="outline" className={getCategoryColor(category as ChoreographyCategory)}>
              {category || 'Unknown'}
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
          return <span>{formatDateDDMMYYYY(date)}</span>;
        },
      },
      {
        id: "license",
        header: "License",
        cell: ({ row }) => {
          const gymnast = row.original;
          
          // Handle local gymnasts differently
          if (gymnast.isLocal) {
            return (
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                  To Check
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Local gymnast
                </span>
              </div>
            );
          }
          
          // Handle FIG API gymnasts
          return (
            <div className="flex flex-col gap-1">
              <Badge variant={gymnast.licenseValid ? 'default' : 'destructive'}>
                {gymnast.licenseValid ? 'Valid' : 'Expired'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Expires: {formatDateDDMMYYYY(gymnast.licenseExpiryDate)}
              </span>
            </div>
          );
        },
      },
    ],
    [gymnasts, onSelectionChange, maxSelection, disabled]
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search gymnasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
                disabled={disabled}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={disabled}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="YOUTH">Youth</SelectItem>
                <SelectItem value="JUNIOR">Junior</SelectItem>
                <SelectItem value="SENIOR">Senior</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || disabled}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateForm(true)}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create New Gymnast
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {gymnasts.length} selected
          </div>
        </div>

        {gymnasts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                Selected Gymnasts ({gymnasts.length})
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {gymnasts.map((gymnast) => (
                <div key={gymnast.figId} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <FigAvatar
                    figId={gymnast.figId}
                    name={gymnast.fullName || 'Unknown'}
                    size="sm"
                    className="w-6 h-6"
                  />
                  <span className="text-sm font-medium">
                    {gymnast.lastName || 'Unknown'}, {gymnast.firstName || 'Unknown'}
                  </span>
                  <Badge variant="outline" className={getCategoryColor(gymnast.category as ChoreographyCategory)}>
                    {gymnast.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

      {/* Create Gymnast Form */}
      <CreateGymnastForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        countryCode={countryCode}
        onGymnastCreated={handleGymnastCreated}
      />
    </div>
  );
} 