// src/hooks/useTransactionFilters.ts
import { useState, useMemo } from 'react';
import type { Transaction, SortField, SortOrder, FilterType } from '../utils/types';

/**
 * Custom hook for filtering and sorting transactions
 * Provides state management and memoized filtering logic
 */
export const useTransactionFilters = (transactions: Transaction[]) => {
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filters and sorts transactions based on user-selected criteria
   * Memoized to prevent unnecessary recalculations
   */
  const processedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, searchQuery, sortBy, sortOrder]);

  /**
   * Clears search query
   */
  const clearSearch = () => setSearchQuery('');

  /**
   * Resets all filters to defaults
   */
  const resetFilters = () => {
    setSortBy('date');
    setSortOrder('desc');
    setFilterType('all');
    setSearchQuery('');
  };

  return {
    // State
    sortBy,
    sortOrder,
    filterType,
    searchQuery,
    
    // Setters
    setSortBy,
    setSortOrder,
    setFilterType,
    setSearchQuery,
    
    // Processed data
    processedTransactions,
    
    // Actions
    clearSearch,
    resetFilters,
  };
};