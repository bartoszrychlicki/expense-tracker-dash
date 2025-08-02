/**
 * useCurrentGoal Hook
 * 
 * Custom hook for fetching the currently selected goal.
 * Provides loading states, error handling, and automatic data refresh.
 */

import {
    AirtableApiError,
    fetchGoalsBalance,
    fetchPlannedTransactions
} from '@/services/airtableService';
import { LoadingState, PlannedTransaction } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseCurrentGoalReturn {
  /** The currently selected goal */
  currentGoal?: PlannedTransaction;
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
  const [currentGoal, setCurrentGoal] = useState<PlannedTransaction | undefined>(undefined);
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
      const [transactionsData, balance] = await Promise.all([
        fetchPlannedTransactions(),
        fetchGoalsBalance()
      ]);
      
      // Find the currently selected goal
      const selectedGoal = transactionsData.find(
        transaction => transaction.Currently_selected_goal === true
      );
      
      setCurrentGoal(selectedGoal);
      setGoalsBalance(balance);
      setLoadingState({ isLoading: false, error: undefined });
    } catch (error) {
      const errorMessage = error instanceof AirtableApiError 
        ? error.message 
        : 'Nie udało się załadować aktualnego celu';
      
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