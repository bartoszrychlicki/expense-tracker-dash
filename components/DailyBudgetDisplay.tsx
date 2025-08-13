/**
 * DailyBudgetDisplay Component
 *
 * Displays daily budget information using the BudgetingService.
 * Shows the daily budget limit, remaining budget, and days remaining.
 */

import { BudgetCard } from '@/components/BudgetCard';
import { BudgetCardSkeleton } from '@/components/BudgetCardSkeleton';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DailyBudgetInfo } from '@/types';
import React from 'react';
import { View } from 'react-native';

interface DailyBudgetDisplayProps {
  /** Daily budget data */
  dailyBudget: DailyBudgetInfo | null;
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Additional className for styling */
  className?: string;
}

/**
 * Component for displaying daily budget information
 */
export const DailyBudgetDisplay: React.FC<DailyBudgetDisplayProps> = ({
  dailyBudget,
  loading,
  error,
  className = '',
}) => {
  if (loading) {
    return (
      <VStack className={className}>
        <BudgetCardSkeleton size="lg" />
        <HStack space="md" className="mb-4">
          <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
          <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
        </HStack>
      </VStack>
    );
  }

  if (error) {
    return (
      <View className={`mb-4 p-6 border border-error-300 rounded-lg items-center ${className}`}>
        <Text className="text-error-600 text-center">
          Błąd: {error}
        </Text>
      </View>
    );
  }

  if (!dailyBudget) {
    return (
      <View className={`mb-4 p-6 border border-warning-300 rounded-lg items-center ${className}`}>
        <Text className="text-warning-600 text-center">
          Brak danych budżetu
        </Text>
      </View>
    );
  }

      // The service now provides both values correctly:
  // - dailyBudgetLimit: the daily budget limit
  // - todaysExpenses: sum of today's variable expenses
  // - dailyBudgetLeft: remaining budget for today (but we'll calculate it ourselves to be sure)

  const todaysExpenses = dailyBudget.todaysExpenses;
  const remainingBudget = dailyBudget.dailyBudgetLimit - dailyBudget.todaysExpenses;

  // Debug logging to see what we're getting
  console.log('🔍 DailyBudgetDisplay values:', {
    dailyBudgetLimit: dailyBudget.dailyBudgetLimit,
    todaysExpenses: dailyBudget.todaysExpenses,
    dailyBudgetLeft: dailyBudget.dailyBudgetLeft,
    calculatedRemaining: remainingBudget
  });

  return (
    <VStack className={className}>
      {/* Main Budget Card - Daily Budget Left */}
      <BudgetCard
        value={Math.floor(remainingBudget).toString()}
        label="Zostało na dzisiaj"
        size="lg"
      />

      {/* Budget Summary Cards */}
      <HStack space="md" className="mb-4">
        <BudgetCard
          value={Math.floor(dailyBudget.dailyBudgetLimit).toString()}
          label="Dzienny limit budżetu"
          className="flex-1 mb-0"
        />
        <BudgetCard
          value={Math.floor(todaysExpenses).toString()}
          label="Wydałem dzisiaj"
          className="flex-1 mb-0"
        />
      </HStack>

      {/* Additional Budget Info */}
      <VStack className="mb-4 p-4 bg-background-50 rounded-lg border border-border-200">
        <HStack className="justify-between items-center mb-2">
          <Text className="text-sm font-medium text-text-600">
            Informacje o budżecie
          </Text>
        </HStack>

        <HStack className="justify-between items-center mb-2">
          <Text className="text-sm text-text-500">Dni pozostało w miesiącu:</Text>
          <Text className="text-sm font-medium text-text-700">
            {dailyBudget.daysRemaining}
          </Text>
        </HStack>

        <HStack className="justify-between items-center mb-2">
          <Text className="text-sm text-text-500">Całkowity dostępny budżet:</Text>
          <Text className="text-sm font-medium text-text-700">
            {Math.floor(dailyBudget.totalAvailableIncome)} PLN
          </Text>
        </HStack>

                {/* Auto-Goals Information */}
        {dailyBudget.autoGoalsAmount && dailyBudget.autoGoalsAmount > 0 && (
          <HStack className="justify-between items-center">
            <Text className="text-sm text-text-500">Automatyczne cele oszczędnościowe:</Text>
            <Text className="text-sm font-medium text-success-600">
              {Math.floor(dailyBudget.autoGoalsAmount)} PLN
            </Text>
          </HStack>
        )}
      </VStack>
    </VStack>
  );
};
