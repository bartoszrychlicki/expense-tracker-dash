/**
 * Main Dashboard Screen
 * 
 * Displays the expense tracker dashboard with daily budget information
 * and recent transactions. Uses proper component composition and state management.
 */

import { BudgetCard } from '@/components/BudgetCard';
import { BudgetCardSkeleton } from '@/components/BudgetCardSkeleton';
import { TransactionsList } from '@/components/TransactionsList';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { validateEnvironmentVariables } from '@/config/constants';
import { useBudgetData } from '@/hooks/useBudgetData';
import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

export default function Index() {
  // Validate environment variables on component mount
  useEffect(() => {
    try {
      validateEnvironmentVariables();
    } catch (error) {
      console.error('Environment validation error:', error);
    }
  }, []);

  // Use custom hook for data management
  const {
    dailyBudget,
    transactions,
    budgetLoading,
    transactionsLoading,
  } = useBudgetData();

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
          {/* Page Header */}

          {/* Main Budget Card */}
          {budgetLoading.isLoading ? (
            <BudgetCardSkeleton />
          ) : budgetLoading.error ? (
            <View className="mb-4 p-6 border border-error-300 rounded-lg items-center">
              <Text className="text-error-600 text-center">
                Błąd: {budgetLoading.error}
              </Text>
            </View>
          ) : (
            <BudgetCard
              value={dailyBudget.dailyBudgetLeft}
              label="Zostało na dzisiaj"
            />
          )}

          {/* Budget Summary Cards */}
          <HStack space="md" className="mb-4">
            {budgetLoading.isLoading ? (
              <>
                <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
                <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
              </>
            ) : (
              <>
                <BudgetCard
                  value={dailyBudget.todaysVariableDailyLimit}
                  label="Całkowity budżet na dziś"
                  className="flex-1 mb-0"
                />
                <BudgetCard
                  value={dailyBudget.dailySpentSum}
                  label="Wydałem dzisiaj"
                  className="flex-1 mb-0"
                />
              </>
            )}
          </HStack>

          {/* Transactions List */}
          <TransactionsList
            transactions={transactions}
            loadingState={transactionsLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
