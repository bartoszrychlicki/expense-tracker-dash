/**
 * PlannedTransactionItem Component
 * 
 * Displays a single planned transaction item with all relevant information
 * including name, value, decision status, and optional URL link.
 */

import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTransactionValue } from '@/services/airtableService';
import { PlannedTransaction } from '@/types';
import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';

interface PlannedTransactionItemProps {
  /** The planned transaction to display */
  transaction: PlannedTransaction;
}

/**
 * Component for displaying a single planned transaction
 */
export const PlannedTransactionItem: React.FC<PlannedTransactionItemProps> = ({
  transaction,
}) => {
  /**
   * Handles opening the URL link if available
   */
  const handleOpenURL = async () => {
    if (transaction.URL) {
      try {
        await Linking.openURL(transaction.URL);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  /**
   * Gets the decision status color
   */
  const getDecisionColor = (decision: string): string => {
    switch (decision.toLowerCase()) {
      case 'może kiedyś':
        return 'text-warning-600';
      case 'odrzucamy':
        return 'text-error-600';
      case 'brak decyzji':
        return 'text-info-600';
      default:
        return 'text-text-600';
    }
  };

  /**
   * Formats the decision date for display
   */
  const formatDecisionDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <Card className="mb-3 p-4">
      <VStack space="sm">
        {/* Header with name and value */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <View className="flex-1 mr-3">
            <Text className="text-lg font-semibold text-text-900 mb-1">
              {transaction.Name}
            </Text>
            {transaction.URL && (
              <TouchableOpacity onPress={handleOpenURL}>
                <Text className="text-primary-600 text-sm underline">
                  Zobacz produkt
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <VStack alignItems="flex-end">
            <Text className="text-xl font-bold text-text-900">
              {formatTransactionValue(transaction.Value)} PLN
            </Text>
            <Text className="text-sm text-text-500">
              {transaction.NumberOfHundreds} setek
            </Text>
          </VStack>
        </HStack>

        {/* Decision information */}
        <HStack justifyContent="space-between" alignItems="center">
          <VStack>
            <Text className="text-sm text-text-500">
              Data decyzji: {formatDecisionDate(transaction.Decision_date)}
            </Text>
            <Text className="text-sm text-text-500">
              Utworzono: {formatDecisionDate(transaction.Created)}
            </Text>
          </VStack>
          <View className="px-3 py-1 rounded-full bg-background-100">
            <Text className={`text-sm font-medium ${getDecisionColor(transaction.Decision)}`}>
              {transaction.Decision}
            </Text>
          </View>
        </HStack>
      </VStack>
    </Card>
  );
}; 