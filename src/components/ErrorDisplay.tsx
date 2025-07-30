/**
 * Error Display Component
 * 
 * A reusable component for displaying error messages
 * with optional retry functionality.
 */

import React from 'react';
import { View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';

interface ErrorDisplayProps {
  /** The error message to display */
  message: string;
  /** Optional retry function */
  onRetry?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * ErrorDisplay component for showing error states
 */
export function ErrorDisplay({ message, onRetry, className = '' }: ErrorDisplayProps) {
  return (
    <View className={`flex-1 justify-center items-center p-4 ${className}`}>
      <VStack space="md" className="items-center">
        <Box className="rounded-full h-16 w-16 bg-error-100 items-center justify-center">
          <Text className="text-error-600 text-2xl">⚠️</Text>
        </Box>
        <Text className="text-typography-900 text-center font-medium">
          Something went wrong
        </Text>
        <Text className="text-typography-600 text-center text-sm">
          {message}
        </Text>
        {onRetry && (
          <Box 
            className="bg-primary-500 px-4 py-2 rounded-lg"
            onTouchEnd={onRetry}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Box>
        )}
      </VStack>
    </View>
  );
}