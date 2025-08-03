/**
 * LoadingWrapper Component
 * 
 * A generic wrapper component that handles loading, error, and success states
 * in a consistent manner across the application.
 */

import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import React from 'react';

interface LoadingWrapperProps {
  /** Whether the content is loading */
  isLoading: boolean;
  /** Error message if any */
  error?: string;
  /** Component to show while loading */
  skeleton: React.ReactNode;
  /** Content to show when loaded successfully */
  children: React.ReactNode;
  /** Optional custom error component */
  errorComponent?: React.ReactNode;
  /** Optional empty state component */
  emptyComponent?: React.ReactNode;
  /** Check if data is empty (for showing empty state) */
  isEmpty?: boolean;
}

/**
 * Default error message component
 */
const DefaultErrorComponent: React.FC<{ error: string }> = ({ error }) => (
  <View className="p-6 border border-error-300 rounded-lg items-center">
    <Text className="text-error-600 text-center">
      {error}
    </Text>
  </View>
);

/**
 * Wrapper component that handles loading, error, and empty states
 */
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  error,
  skeleton,
  children,
  errorComponent,
  emptyComponent,
  isEmpty = false,
}) => {
  // Show loading skeleton
  if (isLoading) {
    return <>{skeleton}</>;
  }

  // Show error state
  if (error) {
    return <>{errorComponent || <DefaultErrorComponent error={error} />}</>;
  }

  // Show empty state if provided and data is empty
  if (isEmpty && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  // Show content
  return <>{children}</>;
};

/**
 * Hook to create a memoized LoadingWrapper with preset props
 */
export const useLoadingWrapper = (
  defaultSkeleton: React.ReactNode,
  defaultErrorComponent?: React.ReactNode,
  defaultEmptyComponent?: React.ReactNode
) => {
  return React.useCallback(
    (props: Omit<LoadingWrapperProps, 'skeleton' | 'errorComponent' | 'emptyComponent'> & {
      skeleton?: React.ReactNode;
      errorComponent?: React.ReactNode;
      emptyComponent?: React.ReactNode;
    }) => (
      <LoadingWrapper
        skeleton={props.skeleton || defaultSkeleton}
        errorComponent={props.errorComponent || defaultErrorComponent}
        emptyComponent={props.emptyComponent || defaultEmptyComponent}
        {...props}
      />
    ),
    [defaultSkeleton, defaultErrorComponent, defaultEmptyComponent]
  );
};