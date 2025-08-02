/**
 * BudgetCard Component
 * 
 * A reusable card component for displaying budget-related information
 * with consistent styling and proper TypeScript typing.
 */

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { UI_CONFIG } from '@/config/constants';
import { formatTransactionValue } from '@/services/airtableService';
import React from 'react';

interface BudgetCardProps {
  /** The main value to display (e.g., budget amount) */
  value?: string;
  /** Label/description for the value */
  label: string;
  /** Optional size variant for the card */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom className for styling */
  className?: string;
}

/**
 * BudgetCard displays budget information in a consistent card format
 */
export const BudgetCard: React.FC<BudgetCardProps> = ({
  value,
  label,
  size = 'lg',
  className = '',
}) => {
  // Format the value only if it's not the default placeholder and is a valid number
  const displayValue = value ? formatTransactionValue(value) : UI_CONFIG.DEFAULT_PLACEHOLDER;
  
  return (
    <Card size={size} variant="outline" className={`mb-4 ${className}`}>
      <Heading size="lg" className="mb-1">
        {displayValue} {UI_CONFIG.CURRENCY}
      </Heading>
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
    </Card>
  );
};