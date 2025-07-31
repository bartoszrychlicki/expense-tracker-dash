/**
 * PlannedTransactionsList Component
 * 
 * Displays a list of planned transactions with loading states and error handling
 */

import { PlannedTransactionItem } from '@/components/PlannedTransactionItem';
import { PlannedTransactionItemSkeleton } from '@/components/PlannedTransactionItemSkeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LoadingState, PlannedTransaction } from '@/types';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';

interface PlannedTransactionsListProps {
  /** Array of planned transactions to display */
  transactions: PlannedTransaction[];
  /** Loading state for the transactions */
  loadingState: LoadingState;
  /** Function to refresh the data */
  onRefresh?: () => void;
  /** Whether the list is currently refreshing */
  refreshing?: boolean;
}

/**
 * Component for displaying a list of planned transactions
 */
export const PlannedTransactionsList: React.FC<PlannedTransactionsListProps> = ({
  transactions,
  loadingState,
  onRefresh,
  refreshing = false,
}) => {
  // Show skeleton loading state
  if (loadingState.isLoading && !transactions.length) {
    return (
      <VStack space="md" className="mt-4">
        <Text className="text-xl font-bold text-text-900 mb-2">
          Planowane wydatki
        </Text>
        {Array.from({ length: 3 }).map((_, index) => (
          <PlannedTransactionItemSkeleton key={index} />
        ))}
      </VStack>
    );
  }

  // Show error state
  if (loadingState.error) {
    return (
      <View className="mt-4 p-6 border border-error-300 rounded-lg items-center">
        <Text className="text-error-600 text-center mb-2">
          Błąd podczas ładowania planowanych wydatków
        </Text>
        <Text className="text-error-500 text-sm text-center">
          {loadingState.error}
        </Text>
      </View>
    );
  }

  // Show empty state
  if (!transactions.length) {
    return (
      <View className="mt-4 p-6 border border-border-300 rounded-lg items-center">
        <Text className="text-text-500 text-center">
          Brak planowanych wydatków
        </Text>
      </View>
    );
  }

  return (
    <VStack space="md" className="mt-4">
      <Text className="text-xl font-bold text-text-900 mb-2">
        Planowane wydatki ({transactions.length})
      </Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          ) : undefined
        }
      >
        <VStack space="sm">
          {transactions.map((transaction) => (
            <PlannedTransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
}; 