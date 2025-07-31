/**
 * TransactionItemSkeleton Component
 * 
 * A skeleton loader component that matches the layout of TransactionItem
 * for displaying loading states with animated placeholders.
 */

import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionItemSkeletonProps {
  /** Optional custom className for styling */
  className?: string;
}

/**
 * TransactionItemSkeleton displays an animated loading placeholder for TransactionItem
 */
export const TransactionItemSkeleton: React.FC<TransactionItemSkeletonProps> = ({
  className = '',
}) => {
  return (
    <HStack 
      space="lg" 
      className={`w-full px-4 py-2 items-center ${className}`}
    >
      {/* Transaction Value Circle Skeleton */}
      <Box className="shrink-0 rounded-full h-12 w-12 items-center justify-center">
        <VStack className="items-center justify-center" space="xs">
          <Skeleton 
            width="70%" 
            height={10} 
            borderRadius={4}
            className="mb-1"
          />
          <Skeleton 
            width="50%" 
            height={8} 
            borderRadius={4}
          />
        </VStack>
      </Box>

      {/* Transaction Details Skeleton */}
      <VStack className="flex-1" space="xs">
        {/* Date skeleton */}
        <Skeleton 
          width="30%" 
          height={12} 
          borderRadius={4}
          className="mb-1"
        />
        
        {/* Transaction name skeleton */}
        <Skeleton 
          width="75%" 
          height={16} 
          borderRadius={4}
          className="mb-1"
        />
        
        {/* Category skeleton */}
        <Skeleton 
          width="50%" 
          height={14} 
          borderRadius={4}
        />
      </VStack>
    </HStack>
  );
};