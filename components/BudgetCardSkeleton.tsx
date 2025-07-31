/**
 * BudgetCardSkeleton Component
 * 
 * A skeleton loader component that matches the layout of BudgetCard
 * for displaying loading states with animated placeholders.
 */

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import React from 'react';

interface BudgetCardSkeletonProps {
  /** Optional size variant for the card */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom className for styling */
  className?: string;
}

/**
 * BudgetCardSkeleton displays an animated loading placeholder for BudgetCard
 */
export const BudgetCardSkeleton: React.FC<BudgetCardSkeletonProps> = ({
  size = 'lg',
  className = '',
}) => {
  return (
    <Card size={size} variant="outline" className={`mb-4 ${className}`}>
      <VStack space="sm">
        {/* Main value skeleton - larger for the primary amount */}
        <Skeleton 
          width="60%" 
          height={size === 'lg' ? 32 : size === 'md' ? 28 : 24} 
          borderRadius={6}
          className="mb-1"
        />
        
        {/* Label skeleton - smaller for the description */}
        <Skeleton 
          width="45%" 
          height={size === 'lg' ? 16 : size === 'md' ? 14 : 12} 
          borderRadius={4}
        />
      </VStack>
    </Card>
  );
};