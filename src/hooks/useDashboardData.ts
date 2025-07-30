/**
 * Custom Hook for Dashboard Data Management
 * 
 * This hook handles the fetching, caching, and state management
 * for dashboard data including daily budget and transactions.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData } from '../services/airtableService';
import { Transaction, DailyBudget, LoadingState } from '../types/api';

interface DashboardData {
  dailyBudget: DailyBudget;
  transactions: Transaction[];
}

interface UseDashboardDataReturn extends LoadingState {
  data: DashboardData | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing dashboard data
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches dashboard data and updates state
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refetch function for manual data refresh
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}