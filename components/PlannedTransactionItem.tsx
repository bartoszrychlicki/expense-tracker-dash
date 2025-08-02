/**
 * PlannedTransactionItem Component
 * 
 * Displays a single planned transaction item with all relevant information
 * including name, value, decision status, and optional URL link.
 */


import { Card } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useToast } from '@/hooks/useToast';
import { formatTransactionValue, setCurrentGoal } from '@/services/airtableService';
import { PlannedTransaction } from '@/types';
import React, { useState } from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';

interface PlannedTransactionItemProps {
  /** The planned transaction to display */
  transaction: PlannedTransaction;
  /** Function called when goal is set as current */
  onGoalSelected?: () => void;
}

/**
 * Component for displaying a single planned transaction
 */
export const PlannedTransactionItem: React.FC<PlannedTransactionItemProps> = ({
  transaction,
  onGoalSelected,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const toast = useToast();
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

  /**
   * Handles setting this goal as the current goal
   */
  const handleSetAsCurrent = async () => {
    setIsSettingGoal(true);
    try {
      await setCurrentGoal(transaction.id);
      setShowConfirmDialog(false);
      onGoalSelected?.();
      toast.showSuccess(
        'Cel ustawiony!',
        `"${transaction.Name}" jest teraz Twoim aktualnym celem`
      );
    } catch (error) {
      console.error('Error setting goal as current:', error);
      toast.showError(
        'Błąd',
        'Nie udało się ustawić celu. Spróbuj ponownie.'
      );
    } finally {
      setIsSettingGoal(false);
    }
  };

  return (
    <Card className="mb-3 p-4">
      <VStack space="sm">
        {/* Header with name and value */}
        <HStack className="justify-between items-start">
          <View className="flex-1 mr-3">
            <HStack space="sm" className="mb-1 items-center">
              <Text className="text-lg font-semibold text-text-900">
                {transaction.Name}
              </Text>
              {transaction.Currently_selected_goal && (
                <View className="px-2 py-1 rounded-full bg-success-100 border border-success-300">
                  <Text className="text-success-700 text-xs font-medium">
                    Aktualny cel
                  </Text>
                </View>
              )}
            </HStack>
            {transaction.URL && (
              <TouchableOpacity onPress={handleOpenURL}>
                <Text className="text-primary-600 text-sm underline">
                  Zobacz produkt
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <VStack className="items-end">
            <Text className="text-xl font-bold text-text-900">
              {formatTransactionValue(transaction.Value)} PLN
            </Text>
            <Text className="text-sm text-text-500">
              {transaction.NumberOfHundreds} setek
            </Text>
          </VStack>
        </HStack>

        {/* Decision information */}
        <HStack className="justify-between items-center">
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

        {/* Set as current goal button */}
        {!transaction.Currently_selected_goal && (
          <TouchableOpacity
            className="mt-3 py-2 px-4 rounded-lg bg-primary-100 border border-primary-300 items-center"
            onPress={() => setShowConfirmDialog(true)}
          >
            <Text className="text-primary-700 font-medium text-sm">
              Ustaw jako aktualny cel
            </Text>
          </TouchableOpacity>
        )}
      </VStack>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isVisible={showConfirmDialog}
        title="Ustaw jako aktualny cel"
        message={`Czy chcesz ustawić "${transaction.Name}" jako swój aktualny cel długoterminowy?`}
        onConfirm={handleSetAsCurrent}
        onCancel={() => setShowConfirmDialog(false)}
        isLoading={isSettingGoal}
        confirmText="Ustaw cel"
      />
    </Card>
  );
}; 