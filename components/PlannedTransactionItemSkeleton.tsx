/**
 * PlannedTransactionItemSkeleton Component
 * 
 * Loading skeleton for planned transaction items
 */

import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { View } from 'react-native';

/**
 * Skeleton component for planned transaction items
 */
export const PlannedTransactionItemSkeleton: React.FC = () => {
  return (
    <Card className="mb-3 p-4">
      <VStack space="sm">
        {/* Header skeleton */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <View className="flex-1 mr-3">
            <HStack alignItems="center" space="sm" className="mb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </HStack>
            <Skeleton className="h-4 w-1/3" />
          </View>
          <VStack alignItems="flex-end">
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-4 w-12" />
          </VStack>
        </HStack>

        {/* Decision information skeleton */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-4 w-28" />
          </VStack>
          <Skeleton className="h-6 w-20 rounded-full" />
        </HStack>
      </VStack>
    </Card>
  );
}; 