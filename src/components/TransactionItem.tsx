/**
 * Transaction Item Component
 * 
 * A reusable component for displaying individual transaction information
 * with consistent styling and formatting.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Transaction } from '../types/api';
import { formatNumber, formatDate } from '../utils/formatting';

interface TransactionItemProps {
  /** The transaction data to display */
  transaction: Transaction;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * TransactionItem component for displaying individual transactions
 */
export function TransactionItem({ transaction, className = '' }: TransactionItemProps) {
  const { name, category, value, date, isPositive } = transaction;

  return (
    <HStack space="lg" className={`w-full px-4 py-2 items-center ${className}`}>
      <Box 
        className={`rounded-full h-12 w-12 items-center justify-center ${
          isPositive ? 'bg-error-100' : 'bg-success-100'
        }`}
      >
        <Text 
          className={`text-sm font-medium ${
            isPositive ? 'text-error-800' : 'text-success-800'
          }`}
        >
          {formatNumber(value)}
        </Text>
      </Box>
      <VStack className="flex-1">
        <Text className="text-xs text-typography-500 mb-1">
          {formatDate(date)}
        </Text>
        <Text className="text-typography-900 font-roboto line-clamp-1">
          {name}
        </Text>
        <Text className="text-sm font-roboto line-clamp-1">
          {category}
        </Text>
      </VStack>
    </HStack>
  );
}