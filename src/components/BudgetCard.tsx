/**
 * Budget Card Component
 * 
 * A reusable component for displaying budget information
 * with consistent styling and formatting.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { formatCurrency } from '../utils/formatting';

interface BudgetCardProps {
  /** The main value to display (e.g., amount) */
  value: number | string;
  /** The label/description for the value */
  label: string;
  /** Optional currency symbol (defaults to PLN) */
  currency?: string;
  /** Optional size variant for the card */
  size?: 'sm' | 'md' | 'lg';
  /** Optional variant for the card styling */
  variant?: 'outline' | 'filled' | 'elevated';
  /** Optional className for additional styling */
  className?: string;
}

/**
 * BudgetCard component for displaying budget information
 */
export function BudgetCard({
  value,
  label,
  currency = 'PLN',
  size = 'lg',
  variant = 'outline',
  className = '',
}: BudgetCardProps) {
  const formattedValue = typeof value === 'number' 
    ? formatCurrency(value, currency)
    : value;

  return (
    <Card size={size} variant={variant} className={className}>
      <Heading size="lg" className="mb-1">
        {formattedValue}
      </Heading>
      <Text size="sm" className="text-typography-600">
        {label}
      </Text>
    </Card>
  );
}