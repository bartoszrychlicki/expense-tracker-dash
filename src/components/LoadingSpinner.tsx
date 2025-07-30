/**
 * Loading Spinner Component
 * 
 * A reusable loading spinner component for providing
 * visual feedback during data loading operations.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';

interface LoadingSpinnerProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Optional size for the spinner (default: 'large') */
  size?: 'small' | 'large';
  /** Optional color for the spinner */
  color?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * LoadingSpinner component for displaying loading states
 */
export function LoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color = '#6B7280',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <VStack space="md" className="items-center">
        <ActivityIndicator size={size} color={color} />
        <Text className="text-typography-600">{message}</Text>
      </VStack>
    </View>
  );
}