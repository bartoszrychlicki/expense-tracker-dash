/**
 * useBudgetData Hook
 *
 * Custom hook for managing budget and transaction data fetching.
 * Provides loading states, error handling, and automatic data refresh.
 */

import {
  fetchLatestDailyBudget,
  fetchRecentTransactions,
} from "@/services/supabaseService";
import { DailyBudget, LoadingState, Transaction } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseBudgetDataReturn {
  /** Daily budget information */
  dailyBudget: DailyBudget;
  /** Array of recent transactions */
  transactions: Transaction[];
  /** Loading state for budget data */
  budgetLoading: LoadingState;
  /** Loading state for transactions data */
  transactionsLoading: LoadingState;
  /** Function to manually refresh all data */
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing budget and transaction data
 */
export const useBudgetData = (): UseBudgetDataReturn => {
  // State for daily budget data
  const [dailyBudget, setDailyBudget] = useState<DailyBudget>({});
  const [budgetLoading, setBudgetLoading] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  // State for transactions data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  /**
   * Fetches daily budget data with error handling
   */
  const loadDailyBudget = useCallback(async () => {
    setBudgetLoading({ isLoading: true, error: undefined });

    try {
      const budgetData = await fetchLatestDailyBudget();
      setDailyBudget(budgetData);
      setBudgetLoading({ isLoading: false, error: undefined });
    } catch (error) {
      const errorMessage = 'Nie udało się załadować danych budżetu';

      setBudgetLoading({ isLoading: false, error: errorMessage });
      console.error('Error loading daily budget:', error);
    }
  }, []);

  /**
   * Fetches transactions data with error handling
   */
  const loadTransactions = useCallback(async () => {
    setTransactionsLoading({ isLoading: true, error: undefined });

    try {
      const transactionsData = await fetchRecentTransactions();
      setTransactions(transactionsData);
      setTransactionsLoading({ isLoading: false, error: undefined });
    } catch (error) {
      const errorMessage = 'Nie udało się załadować transakcji';

      setTransactionsLoading({ isLoading: false, error: errorMessage });
      console.error('Error loading transactions:', error);
    }
  }, []);

  /**
   * Refreshes all data (budget and transactions)
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadDailyBudget(),
      loadTransactions(),
    ]);
  }, [loadDailyBudget, loadTransactions]);

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    dailyBudget,
    transactions,
    budgetLoading,
    transactionsLoading,
    refreshData,
  };
};