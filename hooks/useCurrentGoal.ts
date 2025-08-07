/**
 * useCurrentGoal Hook
 *
 * Custom hook for fetching the currently selected goal.
 * Provides loading states, error handling, and automatic data refresh.
 */

import {
  fetchCurrentGoal
} from '@/services/supabaseService';
import { Goal, LoadingState } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseCurrentGoalReturn {
  /** The currently selected goal */
  currentGoal: Goal | null;
  /** Current balance saved for goals */
  goalsBalance: string;
  /** Loading state for the goal data */
  loadingState: LoadingState;
  /** Function to manually refresh data */
  refreshData: () => Promise<void>;
}

/**
 * Custom hook for managing current goal data
 */
export const useCurrentGoal = (): UseCurrentGoalReturn => {
  // State for current goal data
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [goalsBalance, setGoalsBalance] = useState<string>('0');
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  /**
   * Fetches current goal data with error handling
   */
  const loadCurrentGoal = useCallback(async () => {
    setLoadingState({ isLoading: true, error: undefined });

    try {
      const currentGoal = await fetchCurrentGoal();

      setCurrentGoal(currentGoal);
      setGoalsBalance(currentGoal?.current_amount.toString() || '0');
      setLoadingState({ isLoading: false, error: undefined });
    } catch (error) {
      const errorMessage = 'Nie udało się załadować aktualnego celu';

      setLoadingState({ isLoading: false, error: errorMessage });
      console.error('Error loading current goal:', error);
    }
  }, []);

  /**
   * Refreshes the data
   */
  const refreshData = useCallback(async () => {
    await loadCurrentGoal();
  }, [loadCurrentGoal]);

  // Load data on component mount
  useEffect(() => {
    loadCurrentGoal();
  }, [loadCurrentGoal]);

  return {
    currentGoal,
    goalsBalance,
    loadingState,
    refreshData,
  };
};