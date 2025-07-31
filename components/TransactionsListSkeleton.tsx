/**
 * TransactionsListSkeleton Component
 * 
 * A skeleton component specifically designed to match the TransactionsList layout
 * during loading states.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionsListSkeletonProps {
  /** Number of skeleton items to display */
  itemCount?: number;
  /** Title for the transactions list */
  title?: string;
  /** Optional custom className for styling */
  className?: string;
}

/**
 * TransactionItemSkeleton represents a single transaction item skeleton
 */
const TransactionItemSkeleton: React.FC = () => (
  <Box className="w-full px-4 py-3 flex-row items-center justify-between">
    <Box className="flex-1">
      {/* Transaction title skeleton */}
      <Skeleton width="70%" height={16} borderRadius={4} className="mb-2" />
      {/* Transaction date skeleton */}
      <Skeleton width="40%" height={14} borderRadius={4} />
    </Box>
    {/* Transaction amount skeleton */}
    <Skeleton width="60px" height={20} borderRadius={4} />
  </Box>
);

/**
 * TransactionsListSkeleton displays a loading placeholder that matches TransactionsList layout
 */
export const TransactionsListSkeleton: React.FC<TransactionsListSkeletonProps> = ({
  itemCount = 5,
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

      {/* Skeleton Items */}
      <Box className="w-full">
        {Array.from({ length: itemCount }).map((_, index) => (
          <TransactionItemSkeleton key={index} />
        ))}
      </Box>
    </VStack>
  );
}; 