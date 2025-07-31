/**
 * TransactionItem Component
 * 
 * Displays a single transaction with appropriate styling based on
 * whether it's income (positive) or expense (negative).
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Transaction } from '@/types';
import { isPositiveTransaction, formatTransactionValue } from '@/services/airtableService';

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
  const isPositive = isPositiveTransaction(transaction.Value);
  const formattedValue = formatTransactionValue(transaction.Value);

  return (
    <HStack 
      space="lg" 
      key={transaction.id} 
      className={`w-full px-4 py-2 items-center ${className}`}
    >
      {/* Transaction Value Circle */}
      <Box 
        className={`rounded-full h-12 w-12 items-center justify-center ${
          isPositive ? 'bg-success-100' : 'bg-error-100'
        }`}
      >
        <VStack className="items-center justify-center" space="xs">
          <Text 
            className={`text-xs font-medium leading-tight ${
              isPositive ? 'text-success-800' : 'text-error-800'
            }`}
          >
            {isPositive ? '+' : ''}{formattedValue}
          </Text>
          <Text 
            className={`text-xs font-normal leading-tight ${
              isPositive ? 'text-success-600' : 'text-error-600'
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