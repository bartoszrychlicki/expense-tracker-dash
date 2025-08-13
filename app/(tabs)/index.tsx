/**
 * Main Dashboard Screen
 *
 * Displays the expense tracker dashboard with daily budget information
 * and recent transactions. Uses proper component composition and state management.
 */

import { AutomaticGoalDepositsCard } from '@/components/AutomaticGoalDepositsCard';
import { AutomaticSavingsCard } from '@/components/AutomaticSavingsCard';
import { CurrentGoalCard } from '@/components/CurrentGoalCard';
import { DailyBudgetDisplay } from '@/components/DailyBudgetDisplay';
import { TransactionsList } from '@/components/TransactionsList';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { validateEnvironmentVariables } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentGoal } from '@/hooks/useCurrentGoal';
import { useDailyBudget } from '@/hooks/useDailyBudget';
import { useToast } from '@/hooks/useToast';
import { useTransactions } from '@/hooks/useTransactions';
// import { createGoalTransaction } from '@/services/airtableService';
import { BudgetingService } from '@/services/budgetingService';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Index() {
  // Validate environment variables on component mount
  useEffect(() => {
    try {
      validateEnvironmentVariables();
    } catch (error) {
      console.error('Environment validation error:', error);
    }
  }, []);

  // Get user authentication data
  const { user, signOut } = useAuth();

  // Use custom hook for daily budget data
  const {
    dailyBudget,
    loading: budgetLoading,
    error: budgetError,
    refreshBudget,
    forceRefreshBudget,
    refreshCurrentDayBudget,
    // recalculateForVariableIncome,
  } = useDailyBudget();

  // Use custom hook for transactions data
  const {
    transactions,
    transactionsLoading,
    refreshTransactions,
  } = useTransactions();

  // Use custom hook for current goal
  const {
    currentGoal,
    goalsBalance,
    loadingState: goalLoading,
    refreshData: refreshGoalData,
  } = useCurrentGoal();

  // Use toast hook
  const toast = useToast();

  // Loading state for goal saving
  const [isSavingToGoal, setIsSavingToGoal] = React.useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Refresh all data when screen comes into focus
      Promise.all([
        refreshCurrentDayBudget(), // Refresh budget data
        refreshTransactions(),      // Refresh transactions list
        refreshGoalData(),         // Refresh goal data
      ]);
    }, [refreshCurrentDayBudget, refreshTransactions, refreshGoalData])
  );

  /**
   * Handles saving to goal
   */
  const handleSaveToGoal = async (amount: number) => {
    if (isSavingToGoal) return;

    setIsSavingToGoal(true);
    try {
      await BudgetingService.saveToGoals(amount);

      // Refresh all data after successful transaction
      await Promise.all([
        refreshCurrentDayBudget(),
        refreshTransactions(),
        refreshGoalData(),
      ]);

      toast.showSuccess(
        'Środki odłożone!',
        `Odłożono ${amount} PLN na cele`
      );
    } catch (error) {
      console.error('Error saving to goal:', error);
      toast.showError(
        'Błąd',
        'Nie udało się odłożyć środków na cel. Spróbuj ponownie.'
      );
    } finally {
      setIsSavingToGoal(false);
    }
  };

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
          {/* User Email Header */}
          {user?.email && (
            <View className="mb-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <HStack className="justify-between items-center">
                <Text className="text-primary-700 text-sm font-medium">
                  Zalogowany jako: {user.email}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await signOut();
                    } catch (error) {
                      console.error('Sign out error:', error);
                    }
                  }}
                  className="px-3 py-1 bg-red-100 rounded-lg border border-red-200"
                >
                  <Text className="text-red-700 text-xs font-medium">
                    Wyloguj
                  </Text>
                </TouchableOpacity>
              </HStack>
            </View>
          )}

          {/* Add Transaction Button */}
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/add-transaction')}
              className="bg-primary-600 py-3 rounded-lg"
            >
              <Text className="text-white font-medium text-center">
                + Dodaj transakcję
              </Text>
            </TouchableOpacity>
          </View>

          {/* Temporary Debug Button - Remove after testing */}
          <View className="mb-4">
            <TouchableOpacity
              onPress={async () => {
                console.log('🔍 Debug button clicked!');
                console.log('🔍 Current dailyBudget:', dailyBudget);
                console.log('🔍 Current budgetLoading:', budgetLoading);
                console.log('🔍 Current budgetError:', budgetError);

                try {
                  console.log('🔍 Calling forceRefreshBudget...');
                  await forceRefreshBudget();
                  console.log('🔍 forceRefreshBudget completed');
                  console.log('🔍 New dailyBudget:', dailyBudget);
                } catch (error) {
                  console.error('🔍 Error in forceRefreshBudget:', error);
                }
              }}
              className="bg-yellow-500 py-3 rounded-lg"
            >
              <Text className="text-white font-medium text-center">
                🔄 Force Refresh Budget (Debug)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Daily Budget Display */}
          <DailyBudgetDisplay
            dailyBudget={dailyBudget}
            loading={budgetLoading}
            error={budgetError}
          />

          {/* Automatic Savings and Goal Deposits Cards */}
          <HStack space="md" className="mb-4">
            <AutomaticSavingsCard
              amount={(dailyBudget?.autoSavingsAmount ?? 0).toString()}
              percentage={((dailyBudget?.autoSavingsPercent ?? 0) / 100).toString()}
              monthSum={(dailyBudget?.autoSavingsMonthSum ?? 0).toString()}
              isLoading={budgetLoading}
              className="flex-1"
            />
            <AutomaticGoalDepositsCard
              amount={(dailyBudget?.autoGoalsAmount ?? 0).toString()}
              percentage={((dailyBudget?.autoGoalsPercent ?? 0) / 100).toString()}
              monthSum={(dailyBudget?.autoGoalsMonthSum ?? 0).toString()}
              isLoading={budgetLoading}
              className="flex-1"
            />
          </HStack>

          {/* Current Goal Card */}
          <CurrentGoalCard
            goal={currentGoal}
            goalsBalance={goalsBalance}
            isLoading={goalLoading.isLoading}
            error={goalLoading.error}
            dailyBudget={dailyBudget ? Math.floor(dailyBudget.dailyBudgetLimit).toString() : "0"}
            onSaveToGoal={handleSaveToGoal}
            isSavingToGoal={isSavingToGoal}
            onGoalRealized={refreshBudget}
          />

          {/* Transactions List */}
          <TransactionsList
            transactions={transactions}
            loadingState={{
              isLoading: transactionsLoading.isLoading,
              error: transactionsLoading.error || undefined
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
