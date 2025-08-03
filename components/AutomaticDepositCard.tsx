/**
 * AutomaticDepositCard Component
 * 
 * A unified component for displaying automatic deposits (savings or goals)
 * with consistent styling and behavior, eliminating code duplication.
 */

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatPercentage, formatWithCurrency } from '@/utils/formatters';
import React from 'react';
import { View } from 'react-native';

interface AutomaticDepositCardProps {
  /** Amount of automatic deposits made today */
  amount?: string;
  /** Percentage of daily budget deposited automatically */
  percentage?: string;
  /** Sum of automatic deposits this month */
  monthSum?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional className for styling */
  className?: string;
  /** Variant determines the visual style and text */
  variant: 'savings' | 'goals';
}

/**
 * Configuration for different card variants
 */
const VARIANT_CONFIG = {
  savings: {
    title: 'Automatyczne oszczędności dzisiaj',
    percentageLabel: 'dziennego budżetu',
    monthLabel: 'W tym miesiącu:',
    icon: '💰',
    iconBgClass: 'bg-green-100',
    iconTextClass: 'text-green-600',
  },
  goals: {
    title: 'Automatyczne wpłaty na cel dzisiaj',
    percentageLabel: 'dziennego budżetu',
    monthLabel: 'W tym miesiącu:',
    icon: '🎯',
    iconBgClass: 'bg-blue-100',
    iconTextClass: 'text-blue-600',
  },
} as const;

/**
 * Unified component for displaying automatic deposits information
 */
export const AutomaticDepositCard: React.FC<AutomaticDepositCardProps> = ({
  amount = '0',
  percentage = '0',
  monthSum = '0',
  isLoading = false,
  className = '',
  variant,
}) => {
  const config = VARIANT_CONFIG[variant];
  
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
        {config.title}
      </Text>
      
      {/* Main Content */}
      <HStack className="items-baseline justify-between">
        <VStack>
          {/* Amount */}
          <Text className="text-2xl font-bold text-text-900">
            {formatWithCurrency(amount)}
          </Text>
          
          {/* Percentage */}
          <Text className="text-sm text-text-500">
            {formatPercentage(percentage)} {config.percentageLabel}
          </Text>
          
          {/* Month Sum */}
          <Text className="text-xs text-text-400 mt-1">
            {config.monthLabel} {formatWithCurrency(monthSum)}
          </Text>
        </VStack>
        
        {/* Icon */}
        <View className={`w-8 h-8 ${config.iconBgClass} rounded-full items-center justify-center`}>
          <Text className={`${config.iconTextClass} font-bold text-lg`}>
            {config.icon}
          </Text>
        </View>
      </HStack>
    </VStack>
  );
};