/**
 * Skeleton Loader Preview App
 * 
 * Demonstrates all skeleton loading states for the expense tracker components.
 * Shows BudgetCard, TransactionItem, and TransactionsList skeleton variants.
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { BudgetCardSkeleton } from '@/components/BudgetCardSkeleton';
import { TransactionItemSkeleton } from '@/components/TransactionItemSkeleton';
import { TransactionsList } from '@/components/TransactionsList';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonLoaderApp() {
  // Mock loading state for TransactionsList
  const mockLoadingState = {
    isLoading: true,
    error: undefined,
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={true}>
        <VStack space="lg" className="pt-8">
          
          {/* Header */}
          <Heading size="xl" className="text-typography-900 mb-4">
            Skeleton Loader Preview
          </Heading>
          
          {/* Budget Card Skeletons Section */}
          <VStack space="md">
            <Heading size="lg" className="text-typography-700">
              Budget Card Skeletons
            </Heading>
            
            {/* Large Budget Card Skeleton */}
            <Text className="text-typography-600 text-sm">Large Size:</Text>
            <BudgetCardSkeleton size="lg" />
            
            {/* Medium Budget Cards in HStack */}
            <Text className="text-typography-600 text-sm">Medium Size (Side by Side):</Text>
            <HStack space="md">
              <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
              <BudgetCardSkeleton size="md" className="flex-1 mb-0" />
            </HStack>
            
            {/* Small Budget Card Skeleton */}
            <Text className="text-typography-600 text-sm">Small Size:</Text>
            <BudgetCardSkeleton size="sm" />
          </VStack>

          <Divider />

          {/* Transaction Item Skeletons Section */}
          <VStack space="md">
            <Heading size="lg" className="text-typography-700">
              Transaction Item Skeletons
            </Heading>
            
            <Text className="text-typography-600 text-sm">Individual Transaction Items:</Text>
            <Box className="border border-border-300 rounded-lg">
              <TransactionItemSkeleton />
              <Divider />
              <TransactionItemSkeleton />
              <Divider />
              <TransactionItemSkeleton />
            </Box>
          </VStack>

          <Divider />

          {/* Transactions List Skeleton Section */}
          <VStack space="md">
            <Heading size="lg" className="text-typography-700">
              Transactions List Skeleton
            </Heading>
            
            <Text className="text-typography-600 text-sm">Complete List with Loading State:</Text>
            <TransactionsList
              transactions={[]}
              loadingState={mockLoadingState}
              title="Recent Transactions (Loading)"
            />
          </VStack>

          <Divider />

          {/* Basic Skeleton Components Section */}
          <VStack space="md">
            <Heading size="lg" className="text-typography-700">
              Basic Skeleton Components
            </Heading>
            
            <Text className="text-typography-600 text-sm">Shimmer Animation:</Text>
            <VStack space="sm">
              <Skeleton width="100%" height={20} borderRadius={4} animationType="shimmer" />
              <Skeleton width="75%" height={16} borderRadius={4} animationType="shimmer" />
              <Skeleton width="50%" height={14} borderRadius={4} animationType="shimmer" />
            </VStack>
            
            <Text className="text-typography-600 text-sm">Pulse Animation:</Text>
            <VStack space="sm">
              <Skeleton width="100%" height={20} borderRadius={4} animationType="pulse" />
              <Skeleton width="75%" height={16} borderRadius={4} animationType="pulse" />
              <Skeleton width="50%" height={14} borderRadius={4} animationType="pulse" />
            </VStack>
            
            <Text className="text-typography-600 text-sm">Different Shapes:</Text>
            <HStack space="md" className="items-center">
              <Skeleton width={40} height={40} borderRadius={20} animationType="shimmer" />
              <Skeleton width={60} height={30} borderRadius={8} animationType="shimmer" />
              <Skeleton width={80} height={12} borderRadius={6} animationType="shimmer" />
            </HStack>
          </VStack>

        </VStack>
      </ScrollView>
    </Box>
  );
}