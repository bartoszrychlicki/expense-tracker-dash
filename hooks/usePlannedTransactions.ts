/**
 * usePlannedTransactions Hook
 * 
 * Custom hook for managing planned transactions data fetching.
 * Provides loading states, error handling, and automatic data refresh.
 */

import {
    AirtableApiError,
    fetchPlannedTransactions
} from '@/services/airtableService';
import { LoadingState, PlannedTransaction } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UsePlannedTransactionsReturn {
  /** Array of planned transactions */
  plannedTransactions: PlannedTransaction[];
  /** Loading state for planned transactions data */
  loadingState: LoadingState;
  /** Function to manually refresh data */
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing planned transactions data
 */
export const usePlannedTransactions = (): UsePlannedTransactionsReturn => {
  // State for planned transactions data
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  /**
   * Fetches planned transactions data with error handling
   */
  const loadPlannedTransactions = useCallback(async () => {
    setLoadingState({ isLoading: true, error: undefined });
    
    try {
      const transactionsData = await fetchPlannedTransactions();
      setPlannedTransactions(transactionsData);
      setLoadingState({ isLoading: false, error: undefined });
    } catch (error) {
      const errorMessage = error instanceof AirtableApiError 
        ? error.message 
        : 'Nie udało się załadować planowanych wydatków';
      
      setLoadingState({ isLoading: false, error: errorMessage });
      console.error('Error loading planned transactions:', error);
    }
  }, []);

  /**
   * Refreshes the data
   */
  const refreshData = useCallback(async () => {
    await loadPlannedTransactions();
  }, [loadPlannedTransactions]);

  // Load data on component mount
  useEffect(() => {
    loadPlannedTransactions();
  }, [loadPlannedTransactions]);

  return {
    plannedTransactions,
    loadingState,
    refreshData,
  };
}; 