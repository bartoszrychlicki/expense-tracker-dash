/**
 * useDailyBudget Hook
 *
 * Custom hook for managing daily budget data using the BudgetingService.
 * Provides real-time daily budget information with automatic calculations.
 */

import { BudgetingService } from '@/services/budgetingService';
import { DailyBudgetInfo } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseDailyBudgetReturn {
  /** Daily budget information */
  dailyBudget: DailyBudgetInfo | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to manually refresh budget data */
  refreshBudget: () => Promise<void>;
  /** Function to force refresh budget data by recalculating from scratch */
  forceRefreshBudget: () => Promise<void>;
  /** Function to refresh current day's budget data (useful when transactions are added) */
  refreshCurrentDayBudget: () => Promise<void>;
  /** Function to recalculate budget when variable income is added */
  recalculateForVariableIncome: (incomeAmount: number) => Promise<void>;
}

/**
 * Custom hook for managing daily budget data
 */
export const useDailyBudget = (): UseDailyBudgetReturn => {
  const [dailyBudget, setDailyBudget] = useState<DailyBudgetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads the current day's budget
   */
  const loadDailyBudget = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const budgetData = await BudgetingService.getCurrentDayBudget();
      setDailyBudget(budgetData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować budżetu dziennego';
      setError(errorMessage);
      console.error('Error loading daily budget:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refreshes the budget data
   */
  const refreshBudget = useCallback(async () => {
    await loadDailyBudget();
  }, [loadDailyBudget]);

  /**
   * Force refresh the budget data by recalculating from scratch
   */
  const forceRefreshBudget = useCallback(async () => {
    console.log('🔍 forceRefreshBudget called in hook');
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Calling BudgetingService.refreshCurrentDayBudget...');
      const budgetData = await BudgetingService.refreshCurrentDayBudget();
      console.log('🔍 Got budget data:', budgetData);
      setDailyBudget(budgetData);
      console.log('🔍 Updated dailyBudget state');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się odświeżyć budżetu';
      setError(errorMessage);
      console.error('Error force refreshing budget:', err);
    } finally {
      setLoading(false);
      console.log('🔍 Loading set to false');
    }
  }, []);

  /**
   * Refresh the current day's budget data (useful when transactions are added)
   */
  const refreshCurrentDayBudget = useCallback(async () => {
    console.log('🔍 refreshCurrentDayBudget called in hook');
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Calling BudgetingService.refreshCurrentDayBudgetData...');
      const budgetData = await BudgetingService.refreshCurrentDayBudgetData();
      console.log('🔍 Got refreshed budget data:', budgetData);
      setDailyBudget(budgetData);
      console.log('🔍 Updated dailyBudget state');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się odświeżyć budżetu';
      setError(errorMessage);
      console.error('Error refreshing current day budget:', err);
    } finally {
      setLoading(false);
      console.log('🔍 Loading set to false');
    }
  }, []);

  /**
   * Recalculates budget when variable income is added
   */
  const recalculateForVariableIncome = useCallback(async (incomeAmount: number) => {
    try {
      await BudgetingService.recalculateBudgetForVariableIncome(incomeAmount);
      // Refresh the budget data after recalculation
      await loadDailyBudget();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się przeliczyć budżetu';
      setError(errorMessage);
      console.error('Error recalculating budget:', err);
    }
  }, [loadDailyBudget]);

  // Load budget on component mount
  useEffect(() => {
    loadDailyBudget();
  }, [loadDailyBudget]);

  return {
    dailyBudget,
    loading,
    error,
    refreshBudget,
    forceRefreshBudget,
    refreshCurrentDayBudget,
    recalculateForVariableIncome,
  };
};
