/**
 * AutomaticGoalDepositsCard Component
 * 
 * Displays automatic goal deposits made today with amount and percentage
 */

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UI_CONFIG } from '@/config/constants';
import { formatTransactionValue } from '@/services/airtableService';
import React from 'react';
import { View } from 'react-native';

interface AutomaticGoalDepositsCardProps {
  /** Amount of automatic goal deposits made today */
  amount?: string;
  /** Percentage of daily budget deposited to goals automatically */
  percentage?: string;
  /** Sum of automatic goal deposits this month */
  monthSum?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional className for styling */
  className?: string;
}

/**
 * Component for displaying automatic goal deposits information
 */
export const AutomaticGoalDepositsCard: React.FC<AutomaticGoalDepositsCardProps> = ({
  amount = '0',
  percentage = '0',
  monthSum = '0',
  isLoading = false,
  className = '',
}) => {
  // Format amount for display
  const formattedAmount = formatTransactionValue(amount || '0');
  const formattedMonthSum = formatTransactionValue(monthSum || '0');
  const formattedPercentage = percentage 
    ? `${Math.round(parseFloat(percentage) * 100)}%` 
    : '0%';

  if (isLoading) {
    return (
      <VStack className={`bg-background-50 p-4 rounded-lg border border-border-200 shadow-sm ${className}`}>
        {/* Loading skeleton */}
        <View className="h-4 bg-background-200 rounded mb-2 w-3/4" />
        <View className="h-8 bg-background-200 rounded mb-1 w-1/2" />
        <View className="h-3 bg-background-200 rounded mb-1 w-1/3" />
        <View className="h-3 bg-background-200 rounded w-2/3" />
      </VStack>
    );
  }

  return (
    <VStack className={`bg-background-50 p-4 rounded-lg border border-border-200 shadow-sm ${className}`}>
      {/* Header */}
      <Text className="text-sm font-medium text-text-600 mb-2">
        Automatyczne wpłaty na cel dzisiaj
      </Text>
      
      {/* Main Content */}
      <HStack className="items-baseline justify-between">
        <VStack>
          {/* Amount */}
          <Text className="text-2xl font-bold text-text-900">
            {formattedAmount} {UI_CONFIG.CURRENCY}
          </Text>
          
          {/* Percentage */}
          <Text className="text-sm text-text-500">
            {formattedPercentage} dziennego budżetu
          </Text>
          
          {/* Month Sum */}
          <Text className="text-xs text-text-400 mt-1">
            W tym miesiącu: {formattedMonthSum} {UI_CONFIG.CURRENCY}
          </Text>
        </VStack>
        
        {/* Icon or indicator */}
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
          <Text className="text-blue-600 font-bold text-lg">🎯</Text>
        </View>
      </HStack>
    </VStack>
  );
};