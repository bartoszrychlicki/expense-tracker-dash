/**
 * CurrentGoalCard Component
 * 
 * Displays the currently selected goal with progress bar
 */

import { HStack } from '@/components/ui/hstack';
import { PriceInputDialog } from '@/components/ui/price-input-dialog';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatTransactionValue, realizeGoal } from '@/services/airtableService';
import { PlannedTransaction } from '@/types';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface CurrentGoalCardProps {
  /** The currently selected goal */
  goal?: PlannedTransaction;
  /** Current balance saved for goals */
  goalsBalance?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Daily budget amount for calculations */
  dailyBudget?: string;
  /** Function to handle goal savings */
  onSaveToGoal?: (amount: number) => Promise<void>;
  /** Loading state for saving to goal */
  isSavingToGoal?: boolean;
  /** Function to refresh data after goal realization */
  onGoalRealized?: () => Promise<void>;
}

/**
 * Component for displaying the current goal with progress
 */
export const CurrentGoalCard: React.FC<CurrentGoalCardProps> = ({
  goal,
  goalsBalance = '0',
  isLoading = false,
  error,
  dailyBudget,
  onSaveToGoal,
  isSavingToGoal = false,
  onGoalRealized,
}) => {
  const [isRealizingGoal, setIsRealizingGoal] = useState(false);
  const [isPriceDialogVisible, setIsPriceDialogVisible] = useState(false);
  // Calculate real progress percentage based on saved amount
  const calculateProgressPercentage = (): number => {
    if (!goal || !goalsBalance) return 0;
    const savedAmount = parseFloat(goalsBalance);
    const goalAmount = parseFloat(goal.Value);
    if (isNaN(savedAmount) || isNaN(goalAmount) || goalAmount === 0) return 0;
    return Math.min((savedAmount / goalAmount) * 100, 100); // Cap at 100%
  };
  
  const progressPercentage = Math.round(calculateProgressPercentage());

  /**
   * Calculates amount for given percentage of daily budget
   */
  const calculateAmount = (percentage: number): string => {
    if (!dailyBudget) return '0';
    const budgetValue = parseFloat(dailyBudget);
    if (isNaN(budgetValue)) return '0';
    return Math.round((budgetValue * percentage) / 100).toString();
  };

  /**
   * Handles saving to goal
   */
  const handleSaveToGoal = async (percentage: number) => {
    if (!onSaveToGoal || !goal) return;
    
    const amount = parseInt(calculateAmount(percentage));
    if (amount <= 0) return;

    try {
      await onSaveToGoal(amount);
    } catch (error) {
      console.error('Error saving to goal:', error);
    }
  };

  /**
   * Handles goal realization
   */
  const handleRealizeGoal = () => {
    if (!goal) return;
    setIsPriceDialogVisible(true);
  };

  /**
   * Handles price confirmation from dialog
   */
  const handlePriceConfirm = async (price: number) => {
    if (!goal) return;
    
    setIsPriceDialogVisible(false);
    setIsRealizingGoal(true);
    
    try {
      await realizeGoal(goal.Name, price);
      if (onGoalRealized) {
        await onGoalRealized();
      }
    } catch (error) {
      console.error('Error realizing goal:', error);
    } finally {
      setIsRealizingGoal(false);
    }
  };

  /**
   * Handles price dialog cancellation
   */
  const handlePriceCancel = () => {
    setIsPriceDialogVisible(false);
  };

  if (isLoading) {
    return (
      <VStack className="mb-4 border border-border-300 rounded-lg px-4 py-6" space="sm">
        <HStack className="justify-between items-center">
          <View className="flex-1">
            <View className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
            <View className="h-4 bg-gray-200 rounded w-1/2" />
          </View>
          <View className="h-6 bg-gray-200 rounded w-16" />
        </HStack>
        <View className="h-3 bg-gray-200 rounded-full" />
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack className="mb-4 border border-error-300 rounded-lg px-4 py-6" space="sm">
        <Text className="text-lg font-semibold text-text-900">
          Aktualny cel
        </Text>
        <Text className="text-error-600 text-center mb-2">
          Błąd podczas ładowania celu
        </Text>
        <Text className="text-error-500 text-sm text-center">
          {error}
        </Text>
      </VStack>
    );
  }

  if (!goal) {
    return (
      <VStack className="mb-4 border border-border-300 rounded-lg px-4 py-6" space="sm">
        <Text className="text-lg font-semibold text-text-900">
          Aktualny cel
        </Text>
        <Text className="text-text-500 text-center py-4">
          Brak wybranego celu
        </Text>
      </VStack>
    );
  }

  return (
    <VStack className="mb-4 border border-border-300 rounded-lg px-4 py-6" space="sm">
      {/* Header */}
      <HStack className="justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-text-900 mb-1">
            {goal.Name}
          </Text>
          <Text className="text-sm text-text-500">
            Cel do realizacji
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xl font-bold text-text-900">
            {formatTransactionValue(goal.Value)} PLN
          </Text>
          <Text className="text-sm font-medium text-primary-600 mt-1">
            Uzbierane: {formatTransactionValue(goalsBalance)} PLN
          </Text>
        </View>
      </HStack>

              {/* Progress Bar */}
        <VStack space="xs">
          <HStack className="justify-between items-center">
            <Text className="text-sm text-text-600">
              Postęp
            </Text>
            <Text className="text-sm font-medium text-text-900">
              {progressPercentage}%
            </Text>
          </HStack>
          
          {/* Progress Bar Container */}
          <View className="h-3 bg-background-200 rounded-full overflow-hidden">
            {/* Progress Bar Fill */}
            <View 
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          
          {/* Progress Amount */}
          <Text className="text-xs text-text-500 text-center">
            {formatTransactionValue(goalsBalance)} PLN z {formatTransactionValue(goal.Value)} PLN
          </Text>
        </VStack>

        {/* Realize Goal Button */}
        <TouchableOpacity 
          className={`py-3 px-4 rounded-lg items-center mt-4 ${
            progressPercentage >= 100 
              ? (isRealizingGoal ? 'bg-success-400 opacity-60' : 'bg-success-600')
              : 'bg-gray-400 opacity-50'
          }`}
          onPress={handleRealizeGoal}
          disabled={isRealizingGoal || progressPercentage < 100}
        >
          <Text className={`font-bold text-base ${
            progressPercentage >= 100 ? 'text-white' : 'text-gray-600'
          }`}>
            {isRealizingGoal ? 'Realizuję...' : '🎉 Realizuj!'}
          </Text>
          <Text className={`text-xs mt-1 ${
            progressPercentage >= 100 ? 'text-white opacity-90' : 'text-gray-500'
          }`}>
            {progressPercentage >= 100 
              ? 'Cel osiągnięty - kliknij aby zrealizować'
              : `Cel osiągnięty w ${progressPercentage}% - potrzebujesz ${100 - progressPercentage}% więcej`
            }
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <VStack space="sm" className="mt-4">
          <Text className="text-sm font-medium text-text-700 mb-2">
            Odłóż na cel:
          </Text>
          
          <HStack space="sm" className="justify-between">
            <TouchableOpacity 
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                isSavingToGoal ? 'bg-primary-400 opacity-60' : 'bg-primary-600'
              }`}
              onPress={() => handleSaveToGoal(5)}
              disabled={isSavingToGoal}
            >
              <Text className="text-white font-medium text-sm">
                {isSavingToGoal ? 'Zapisuję...' : 'Odłóż 5%'}
              </Text>
              <Text className="text-white text-xs opacity-90">
                ({calculateAmount(5)} PLN)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                isSavingToGoal ? 'bg-primary-400 opacity-60' : 'bg-primary-600'
              }`}
              onPress={() => handleSaveToGoal(10)}
              disabled={isSavingToGoal}
            >
              <Text className="text-white font-medium text-sm">
                {isSavingToGoal ? 'Zapisuję...' : 'Odłóż 10%'}
              </Text>
              <Text className="text-white text-xs opacity-90">
                ({calculateAmount(10)} PLN)
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`flex-1 py-3 px-4 rounded-lg items-center ${
                isSavingToGoal ? 'bg-primary-400 opacity-60' : 'bg-primary-600'
              }`}
              onPress={() => handleSaveToGoal(15)}
              disabled={isSavingToGoal}
            >
              <Text className="text-white font-medium text-sm">
                {isSavingToGoal ? 'Zapisuję...' : 'Odłóż 15%'}
              </Text>
              <Text className="text-white text-xs opacity-90">
                ({calculateAmount(15)} PLN)
              </Text>
            </TouchableOpacity>
          </HStack>
        </VStack>

        {/* Price Input Dialog */}
        <PriceInputDialog
          isVisible={isPriceDialogVisible}
          title="Realizacja celu"
          message={`Podaj finalną cenę dla "${goal?.Name}":`}
          onConfirm={handlePriceConfirm}
          onCancel={handlePriceCancel}
          isLoading={isRealizingGoal}
        />
    </VStack>
  );
}; 