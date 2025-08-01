/**
 * Goals Screen
 * 
 * Displays the planned transactions (goals) with proper loading states
 * and error handling. Uses the usePlannedTransactions hook for data management.
 */

import { PlannedTransactionsList } from '@/components/PlannedTransactionsList';
import { validateEnvironmentVariables } from '@/config/constants';
import { usePlannedTransactions } from '@/hooks/usePlannedTransactions';
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

  // Use custom hook for planned transactions data management
  const {
    plannedTransactions,
    loadingState,
    refreshData,
  } = usePlannedTransactions();

  // State for refresh control
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
          {/* Page Header */}
          <View className="mb-6">
            <View className="text-3xl font-bold text-text-900 mb-2">
              Cele
            </View>
            <View className="text-text-600">
              Twoje planowane duże wydatki
            </View>
          </View>

          {/* Planned Transactions List */}
          <PlannedTransactionsList
            transactions={plannedTransactions}
            loadingState={loadingState}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </View>
      </ScrollView>
    </View>
  );
} 