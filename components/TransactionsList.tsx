/**
 * TransactionsList Component
 * 
 * Displays a list of recent transactions with loading and error states.
 * Provides a clean, organized view of transaction history.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Divider } from '@/components/ui/divider';
import { Transaction, LoadingState } from '@/types';
import { TransactionItem } from './TransactionItem';

interface TransactionsListProps {
  /** Array of transactions to display */
  transactions: Transaction[];
  /** Loading and error state */
  loadingState: LoadingState;
  /** Title for the transactions list */
  title?: string;
  /** Optional custom className for styling */
  className?: string;
}

/**
 * TransactionsList displays a formatted list of transactions with proper states
 */
export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  loadingState,
  title = '10 ostatnich transakcji',
  className = '',
}) => {
  return (
    <VStack
      className={`border border-border-300 rounded-lg px-4 py-6 items-center justify-between ${className}`}
      space="sm"
    >
      {/* Header */}
      <Box className="self-start w-full px-4">
        <Heading size="lg" className="font-roboto text-typography-700">
          {title}
        </Heading>
      </Box>
      
      <Divider />

      {/* Content */}
      {loadingState.isLoading ? (
        <Box className="w-full px-4 py-8 items-center">
          <Text className="text-typography-500">Ładowanie transakcji...</Text>
        </Box>
      ) : loadingState.error ? (
        <Box className="w-full px-4 py-8 items-center">
          <Text className="text-error-600 text-center">
            Błąd podczas ładowania transakcji: {loadingState.error}
          </Text>
        </Box>
      ) : transactions.length === 0 ? (
        <Box className="w-full px-4 py-8 items-center">
          <Text className="text-typography-500">Brak transakcji do wyświetlenia</Text>
        </Box>
      ) : (
        transactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
          />
        ))
      )}
    </VStack>
  );
};