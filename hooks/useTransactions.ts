/**
 * useTransactions Hook
 *
 * Custom hook for managing transaction data fetching.
 * Provides loading states, error handling, and automatic data refresh.
 */

import { fetchRecentTransactions } from '@/services/supabaseService';
import { Transaction } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseTransactionsReturn {
  /** Array of recent transactions */
  transactions: Transaction[];
  /** Loading state for transactions data */
  transactionsLoading: {
    isLoading: boolean;
    error: string | null;
  };
  /** Function to manually refresh transactions data */
  refreshTransactions: () => Promise<void>;
}

/**
 * Custom hook for managing transaction data
 */
export const useTransactions = (): UseTransactionsReturn => {
  // State for transactions data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<{
    isLoading: boolean;
    error: string | null;
  }>({
    isLoading: true,
    error: null,
  });

  /**
   * Fetches transactions data with error handling
   */
  const loadTransactions = useCallback(async () => {
    setTransactionsLoading({ isLoading: true, error: null });

    try {
      const transactionsData = await fetchRecentTransactions();
      setTransactions(transactionsData);
      setTransactionsLoading({ isLoading: false, error: null });
    } catch (error) {
      const errorMessage = 'Nie udało się załadować transakcji';

      setTransactionsLoading({ isLoading: false, error: errorMessage });
      console.error('Error loading transactions:', error);
    }
  }, []);

  /**
   * Refreshes transactions data
   */
  const refreshTransactions = useCallback(async () => {
    console.log('🔍 refreshTransactions called in hook');
    await loadTransactions();
    console.log('🔍 Transactions refreshed');
  }, [loadTransactions]);

  // Load data on component mount
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    transactionsLoading,
    refreshTransactions,
  };
};
