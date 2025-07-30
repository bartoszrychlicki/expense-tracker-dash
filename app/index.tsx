/**
 * Dashboard Screen
 * 
 * Main dashboard component that displays budget information
 * and recent transactions with proper loading and error states.
 */

import React from 'react';
import { ScrollView, View } from 'react-native';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Divider } from '@/components/ui/divider';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

// Custom components
import { 
  BudgetCard, 
  TransactionItem, 
  LoadingSpinner, 
  ErrorDisplay 
} from '@/src/components';

// Custom hooks and services
import { useDashboardData } from '@/src/hooks/useDashboardData';

// Constants
import { UI_TEXT, UI_CONFIG } from '@/src/constants/ui';

/**
 * Main Dashboard Component
 * 
 * Displays:
 * - Daily budget information (remaining, total, spent)
 * - Recent transactions list
 * - Loading and error states
 */
export default function DashboardScreen() {
  const { data, isLoading, error, refetch } = useDashboardData();

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background-0">
        <LoadingSpinner message={UI_TEXT.LOADING.FETCHING_DATA} />
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View className="flex-1 bg-background-0">
        <ErrorDisplay 
          message={error} 
          onRetry={refetch}
        />
      </View>
    );
  }

  // Show main content
  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={true}>
        <View className="pt-8">
          {/* Dashboard Title */}
          <Heading size="md" className="mb-3">
            {UI_TEXT.DASHBOARD.TITLE}
          </Heading>

          {/* Budget Cards Section */}
          <BudgetCardsSection data={data} />

          {/* Transactions Section */}
          <TransactionsSection data={data} />
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Budget Cards Section Component
 * 
 * Displays the main budget information cards including
 * remaining budget, total budget, and spent amount.
 */
function BudgetCardsSection({ data }: { data: any }) {
  if (!data?.dailyBudget) return null;

  const { budgetLeft, totalLimit, spentSum } = data.dailyBudget;

  return (
    <>
      {/* Main Budget Card */}
      <BudgetCard
        value={budgetLeft}
        label={UI_TEXT.DASHBOARD.REMAINING_BUDGET}
        className="mb-4"
      />

      {/* Budget Summary Cards */}
      <HStack space="md" className="mb-4">
        <BudgetCard
          value={totalLimit}
          label={UI_TEXT.DASHBOARD.TOTAL_BUDGET}
          className="flex-1"
        />
        <BudgetCard
          value={spentSum}
          label={UI_TEXT.DASHBOARD.SPENT_TODAY}
          className="flex-1"
        />
      </HStack>
    </>
  );
}

/**
 * Transactions Section Component
 * 
 * Displays the list of recent transactions with
 * proper formatting and styling.
 */
function TransactionsSection({ data }: { data: any }) {
  if (!data?.transactions) return null;

  const { transactions } = data;

  return (
    <VStack
      className="border border-border-300 rounded-lg px-4 py-6 items-center justify-between"
      space="sm"
    >
      {/* Section Header */}
      <Box className="self-start w-full px-4">
        <Heading size="lg" className="font-roboto text-typography-700">
          {UI_TEXT.DASHBOARD.RECENT_TRANSACTIONS}
        </Heading>
      </Box>
      
      <Divider />

      {/* Transactions List */}
      {transactions.length > 0 ? (
        transactions.map((transaction: any) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
          />
        ))
      ) : (
        <Box className="w-full px-4 py-8 items-center">
          <Text className="text-typography-500">
            {UI_TEXT.PLACEHOLDERS.NO_TRANSACTIONS}
          </Text>
        </Box>
      )}
    </VStack>
  );
}
