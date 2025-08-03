/**
 * Goals Screen
 * 
 * Displays the planned transactions (goals) with proper loading states
 * and error handling. Uses the usePlannedTransactions hook for data management.
 */

import { PlannedTransactionsList } from '@/components/PlannedTransactionsList';
import { Text } from '@/components/ui/text';
import { validateEnvironmentVariables } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { usePlannedTransactions } from '@/hooks/usePlannedTransactions';
import { useToast } from '@/hooks/useToast';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

export default function Goals() {
  // Validate environment variables on component mount
  useEffect(() => {
    try {
      validateEnvironmentVariables();
    } catch (error) {
      console.error('Environment validation error:', error);
    }
  }, []);

  // Get user authentication data
  const { user } = useAuth();

  // Use custom hook for planned transactions data management
  const {
    plannedTransactions,
    loadingState,
    refreshData,
  } = usePlannedTransactions();

  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);

  // Use toast for notifications
  const toast = useToast();

  /**
   * Handles the refresh action
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Handles when a goal is selected as current
   */
  const handleGoalSelected = async () => {
    try {
      await refreshData();
      toast.showSuccess(
        'Cel zaktualizowany!',
        'Nowy cel został ustawiony jako aktualny'
      );
    } catch (error) {
      console.error('Error refreshing after goal selection:', error);
      toast.showError(
        'Błąd',
        'Nie udało się odświeżyć listy celów'
      );
    }
  };

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
          {/* User Email Header */}
          {user?.email && (
            <View className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <Text className="text-primary-700 text-sm font-medium">
                Zalogowany jako: {user.email}
              </Text>
            </View>
          )}

          {/* Page Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-text-900 mb-2">
              Cele
            </Text>
            <Text className="text-text-600">
              Twoje planowane duże wydatki
            </Text>
          </View>

          {/* Planned Transactions List */}
          <PlannedTransactionsList
            transactions={plannedTransactions}
            loadingState={loadingState}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onGoalSelected={handleGoalSelected}
          />
        </View>
      </ScrollView>
    </View>
  );
} 