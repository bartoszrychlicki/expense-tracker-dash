/**
 * useAirtableData Hook
 * 
 * Generic hook for managing Airtable data fetching with consistent
 * loading states, error handling, and refresh functionality.
 */

import { AirtableApiError } from '@/services/airtableService';
import { LoadingState } from '@/types';
import { useCallback, useEffect, useState } from 'react';

interface UseAirtableDataReturn<T> {
  /** The fetched data */
  data: T | undefined;
  /** Loading state for the data */
  loadingState: LoadingState;
  /** Function to manually refresh data */
  refreshData: () => Promise<void>;
}

/**
 * Generic hook for fetching data from Airtable with consistent error handling
 * 
 * @param fetchFunction - Function that fetches the data
 * @param defaultValue - Default value to use when data is undefined
 * @param errorMessage - Error message to display on failure
 */
export function useAirtableData<T>(
  fetchFunction: () => Promise<T>,
  defaultValue: T,
  errorMessage: string
): UseAirtableDataReturn<T> {
  const [data, setData] = useState<T>(defaultValue);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: undefined,
  });

  /**
   * Loads data with error handling
   */
  const loadData = useCallback(async () => {
    setLoadingState({ isLoading: true, error: undefined });
    
    try {
      const result = await fetchFunction();
      setData(result);
      setLoadingState({ isLoading: false, error: undefined });
    } catch (error) {
      const message = error instanceof AirtableApiError 
        ? error.message 
        : errorMessage;
      
      setLoadingState({ isLoading: false, error: message });
      console.error(`Error loading data: ${errorMessage}`, error);
    }
  }, [fetchFunction, errorMessage]);

  /**
   * Refresh data alias for consistency
   */
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loadingState,
    refreshData,
  };
}

/**
 * Specialized hook for fetching multiple data sources concurrently
 */
export function useAirtableMultiData<T extends Record<string, any>>(
  fetchFunctions: { [K in keyof T]: () => Promise<T[K]> },
  defaultValues: T,
  errorMessages: { [K in keyof T]: string }
): {
  data: T;
  loadingStates: { [K in keyof T]: LoadingState };
  refreshData: () => Promise<void>;
  isAnyLoading: boolean;
  errors: string[];
} {
  const [data, setData] = useState<T>(defaultValues);
  const [loadingStates, setLoadingStates] = useState<{ [K in keyof T]: LoadingState }>(
    Object.keys(fetchFunctions).reduce((acc, key) => ({
      ...acc,
      [key]: { isLoading: true, error: undefined }
    }), {} as { [K in keyof T]: LoadingState })
  );

  /**
   * Loads all data sources concurrently
   */
  const loadAllData = useCallback(async () => {
    const keys = Object.keys(fetchFunctions) as (keyof T)[];
    
    // Set all to loading
    setLoadingStates(
      keys.reduce((acc, key) => ({
        ...acc,
        [key]: { isLoading: true, error: undefined }
      }), {} as { [K in keyof T]: LoadingState })
    );

    // Fetch all data concurrently
    const promises = keys.map(async (key) => {
      try {
        const result = await fetchFunctions[key]();
        return { key, result, error: null };
      } catch (error) {
        const message = error instanceof AirtableApiError 
          ? error.message 
          : errorMessages[key];
        console.error(`Error loading ${String(key)}:`, error);
        return { key, result: defaultValues[key], error: message };
      }
    });

    const results = await Promise.all(promises);

    // Update data and loading states
    const newData = { ...defaultValues };
    const newLoadingStates = { ...loadingStates };

    results.forEach(({ key, result, error }) => {
      newData[key] = result;
      newLoadingStates[key] = { isLoading: false, error: error || undefined };
    });

    setData(newData);
    setLoadingStates(newLoadingStates);
  }, [fetchFunctions, defaultValues, errorMessages]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Computed properties
  const isAnyLoading = Object.values(loadingStates).some(state => state.isLoading);
  const errors = Object.values(loadingStates)
    .filter(state => state.error)
    .map(state => state.error as string);

  return {
    data,
    loadingStates,
    refreshData: loadAllData,
    isAnyLoading,
    errors,
  };
}