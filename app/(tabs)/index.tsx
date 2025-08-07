/**
 * Main Dashboard Screen
 *
 * Displays the expense tracker dashboard with daily budget information
 * and recent transactions. Uses proper component composition and state management.
 */

import { AutomaticGoalDepositsCard } from '@/components/AutomaticGoalDepositsCard';
import { AutomaticSavingsCard } from '@/components/AutomaticSavingsCard';
import { BudgetCard } from '@/components/BudgetCard';
import { BudgetCardSkeleton } from '@/components/BudgetCardSkeleton';
import { CurrentGoalCard } from '@/components/CurrentGoalCard';
import { TransactionsList } from '@/components/TransactionsList';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { validateEnvironmentVariables } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { useBudgetData } from '@/hooks/useBudgetData';
import { useCurrentGoal } from '@/hooks/useCurrentGoal';
import { useToast } from '@/hooks/useToast';
import { createGoalTransaction } from '@/services/airtableService';
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

  // Use custom hook for data management
  const {
    dailyBudget,
    transactions,
    budgetLoading,
    transactionsLoading,
    refreshData,
  } = useBudgetData();

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

  // Refresh current goal data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshGoalData();
    }, [refreshGoalData])
  );

  /**
   * Handles saving to goal
   */
  const handleSaveToGoal = async (amount: number) => {
    if (!currentGoal || isSavingToGoal) return;

    setIsSavingToGoal(true);
    try {
      await createGoalTransaction(currentGoal.name, amount);

      // Refresh all data after successful transaction
      await Promise.all([
        refreshData(),
        refreshGoalData(),
      ]);

      toast.showSuccess(
        'Środki odłożone!',
        `Odłożono ${amount} PLN na cel: ${currentGoal.name}`
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
              size="lg"
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

          {/* Automatic Savings and Goal Deposits Cards */}
          <HStack space="md" className="mb-4">
            <AutomaticSavingsCard
              amount={dailyBudget.automaticSavingsToday}
              percentage={dailyBudget.automaticSavingsPercentage}
              monthSum={dailyBudget.automaticSavingsMonthSum}
              isLoading={budgetLoading.isLoading}
              className="flex-1"
            />
            <AutomaticGoalDepositsCard
              amount={dailyBudget.automaticGoalDepositsToday}
              percentage={dailyBudget.automaticGoalDepositsPercentage}
              monthSum={dailyBudget.automaticGoalDepositsMonthSum}
              isLoading={budgetLoading.isLoading}
              className="flex-1"
            />
          </HStack>

          {/* Current Goal Card */}
          <CurrentGoalCard
            goal={currentGoal}
            goalsBalance={goalsBalance}
            isLoading={goalLoading.isLoading}
            error={goalLoading.error}
            dailyBudget={dailyBudget.todaysVariableDailyLimit}
            onSaveToGoal={handleSaveToGoal}
            isSavingToGoal={isSavingToGoal}
            onGoalRealized={refreshData}
          />

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
