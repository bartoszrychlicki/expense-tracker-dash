/**
 * TransactionItem Component
 *
 * Displays a single transaction with appropriate styling based on
 * whether it's income (positive) or expense (negative).
 */

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTransactionValue, isPositiveTransaction } from '@/services/airtableService';
import { Transaction } from '@/types';
import React from 'react';

interface TransactionItemProps {
  /** The transaction data to display */
  transaction: Transaction;
  /** Optional custom className for styling */
  className?: string;
}

/**
 * TransactionItem displays a single transaction with appropriate visual styling
 */
export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  className = '',
}) => {
  const isExpense = isPositiveTransaction(transaction.Value);
  const formattedValue = formatTransactionValue(transaction.Value);

  // For display: expenses (positive values) show as red with minus
  // income (negative values) show as green with plus
  const displayValue = isExpense ? `-${formattedValue}` : `+${Math.abs(parseFloat(transaction.Value)).toString()}`;

  return (
    <HStack
      space="lg"
      className={`w-full px-4 py-2 items-center ${className}`}
    >
      {/* Transaction Value Circle */}
      <Box
        className={`rounded-full h-12 w-12 items-center justify-center ${
          isExpense ? 'bg-error-100' : 'bg-success-100'
        }`}
      >
        <VStack className="items-center justify-center" space="xs">
          <Text
            className={`text-xs font-medium leading-tight ${
              isExpense ? 'text-error-800' : 'text-success-800'
            }`}
          >
            {displayValue}
          </Text>
          <Text
            className={`text-xs font-normal leading-tight ${
              isExpense ? 'text-error-600' : 'text-success-600'
            }`}
          >
            PLN
          </Text>
        </VStack>
      </Box>

      {/* Transaction Details */}
      <VStack className="flex-1">
        <Text className="text-xs text-typography-500 mb-1">
          {transaction.Date}
        </Text>
        <Text className="text-typography-900 font-roboto line-clamp-1">
          {transaction.Name}
        </Text>
        <Text className="text-sm font-roboto line-clamp-1 text-typography-600">
          {transaction.Ai_Category}
        </Text>
      </VStack>
    </HStack>
  );
};