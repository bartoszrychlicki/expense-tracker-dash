/**
 * PriceInputDialog Component
 * 
 * Dialog for inputting price with validation
 */

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React, { useState } from 'react';
import { Modal, TextInput, TouchableOpacity, View } from 'react-native';

interface PriceInputDialogProps {
  /** Whether the dialog is visible */
  isVisible: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Function called when confirm is pressed with price value */
  onConfirm: (price: number) => void;
  /** Function called when cancel is pressed */
  onCancel: () => void;
  /** Whether the action is loading */
  isLoading?: boolean;
  /** Initial price value */
  initialPrice?: string;
}

/**
 * Component for displaying price input dialogs
 */
export const PriceInputDialog: React.FC<PriceInputDialogProps> = ({
  isVisible,
  title,
  message,
  confirmText = 'Realizuj',
  cancelText = 'Anuluj',
  onConfirm,
  onCancel,
  isLoading = false,
  initialPrice = '',
}) => {
  const [price, setPrice] = useState(initialPrice);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!price.trim()) {
      setError('Musisz podać cenę!');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Nieprawidłowa cena!');
      return;
    }

    setError('');
    onConfirm(numericPrice);
  };

  const handleCancel = () => {
    setPrice(initialPrice);
    setError('');
    onCancel();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-lg p-6 w-full max-w-sm">
          <VStack space="md">
            {/* Title */}
            <Text className="text-xl font-bold text-text-900 text-center">
              {title}
            </Text>
            
            {/* Message */}
            <Text className="text-text-600 text-center">
              {message}
            </Text>
            
            {/* Price Input */}
            <VStack space="xs">
              <Text className="text-sm font-medium text-text-700">
                Finalna cena (PLN):
              </Text>
              <TextInput
                className="border border-border-300 rounded-lg px-3 py-2 text-text-900"
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  if (error) setError('');
                }}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
                editable={!isLoading}
              />
              {error ? (
                <Text className="text-error-600 text-sm">
                  {error}
                </Text>
              ) : null}
            </VStack>
            
            {/* Buttons */}
            <HStack space="sm" className="mt-4">
              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg border border-border-300 items-center"
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text className="text-text-700 font-medium">
                  {cancelText}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg items-center ${
                  isLoading ? 'bg-success-400 opacity-60' : 'bg-success-600'
                }`}
                onPress={handleConfirm}
                disabled={isLoading}
              >
                <Text className="text-white font-medium">
                  {isLoading ? 'Realizuję...' : confirmText}
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </View>
      </View>
    </Modal>
  );
}; 