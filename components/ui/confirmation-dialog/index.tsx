/**
 * ConfirmationDialog Component
 * 
 * Simple confirmation dialog for user actions
 */

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';

interface ConfirmationDialogProps {
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
  /** Function called when confirm is pressed */
  onConfirm: () => void;
  /** Function called when cancel is pressed */
  onCancel: () => void;
  /** Whether the action is loading */
  isLoading?: boolean;
}

/**
 * Component for displaying confirmation dialogs
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isVisible,
  title,
  message,
  confirmText = 'Tak',
  cancelText = 'Anuluj',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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
            
            {/* Buttons */}
            <HStack space="sm" className="mt-4">
              <TouchableOpacity
                className="flex-1 py-3 px-4 rounded-lg border border-border-300 items-center"
                onPress={onCancel}
                disabled={isLoading}
              >
                <Text className="text-text-700 font-medium">
                  {cancelText}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg items-center ${
                  isLoading ? 'bg-primary-400 opacity-60' : 'bg-primary-600'
                }`}
                onPress={onConfirm}
                disabled={isLoading}
              >
                <Text className="text-white font-medium">
                  {isLoading ? 'Ładowanie...' : confirmText}
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>
        </View>
      </View>
    </Modal>
  );
};