/**
 * Add Transaction Screen
 *
 * Allows users to add new transactions to Supabase with name, amount, and is_fixed fields
 */

import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';
import { useDailyBudget } from '@/hooks/useDailyBudget';
import { useToast } from '@/hooks/useToast';
import { useTransactions } from '@/hooks/useTransactions';
import { addTransaction } from '@/services/supabaseService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddTransactionScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const { refreshCurrentDayBudget } = useDailyBudget();
  const { refreshTransactions } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    is_fixed: false,
    isIncome: false, // New field to distinguish between income and expense
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.amount.trim()) {
      toast.showError('Błąd', 'Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.showError('Błąd', 'Kwota musi być liczbą większą od 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        name: formData.name.trim(),
        value: formData.isIncome ? -amount : amount, // Negative for income, positive for expense
        date: new Date().toISOString().split('T')[0],
        is_fixed: formData.is_fixed,
      });

      toast.showSuccess('Sukces', 'Transakcja została dodana pomyślnie');

      // Refresh data to show the new transaction
      await Promise.all([
        refreshCurrentDayBudget(), // Refresh budget data (amount left, expenses today)
        refreshTransactions(),      // Refresh transactions list
      ]);

      // Reset form
      setFormData({
        name: '',
        amount: '',
        is_fixed: false,
        isIncome: false,
      });

      // Navigate back to dashboard
      router.back();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.showError('Błąd', 'Nie udało się dodać transakcji. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="pt-8">
          {/* Header */}
          <VStack space="md" className="mb-6">
            <Heading size="xl" className="text-center">
              Dodaj transakcję
            </Heading>
            <Text className="text-center text-gray-600">
              Wypełnij formularz aby dodać nową transakcję
            </Text>
          </VStack>

          {/* Form Card */}
          <Card className="p-6 mb-6">
            <VStack space="lg">
              {/* Name Field */}
              <VStack space="sm">
                <Text className="text-sm font-medium text-gray-700">
                  Nazwa transakcji *
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="np. Zakupy w sklepie"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  autoCapitalize="words"
                />
              </VStack>

              {/* Transaction Type Field */}
              <VStack space="sm">
                <Text className="text-sm font-medium text-gray-700">
                  Typ transakcji
                </Text>
                <HStack space="md">
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, isIncome: false }))}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      !formData.isIncome
                        ? 'bg-red-100 border-red-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      !formData.isIncome ? 'text-red-700' : 'text-gray-600'
                    }`}>
                      Wydatek (+)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, isIncome: true }))}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      formData.isIncome
                        ? 'bg-green-100 border-green-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      formData.isIncome ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      Przychód (-)
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </VStack>

              {/* Amount Field */}
              <VStack space="sm">
                <Text className="text-sm font-medium text-gray-700">
                  Kwota (PLN) *
                </Text>
                <TextInput
                  value={formData.amount}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                  placeholder="0.00"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  keyboardType="numeric"
                />
              </VStack>

              {/* Is Fixed Field */}
              <VStack space="sm">
                <Text className="text-sm font-medium text-gray-700">
                  Typ transakcji
                </Text>
                <HStack space="md">
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, is_fixed: false }))}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      !formData.is_fixed
                        ? 'bg-primary-100 border-primary-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      !formData.is_fixed ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      Zmienna
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, is_fixed: true }))}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      formData.is_fixed
                        ? 'bg-primary-100 border-primary-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      formData.is_fixed ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      Stała
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Action Buttons */}
          <VStack space="md">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary-600 py-4 rounded-lg"
            >
              <Text className="text-white font-medium text-center">
                {isSubmitting ? 'Dodawanie...' : 'Dodaj transakcję'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              disabled={isSubmitting}
              className="py-4 px-6 rounded-lg border border-gray-300"
            >
              <Text className="text-gray-700 font-medium text-center">
                Anuluj
              </Text>
            </TouchableOpacity>
          </VStack>
        </View>
      </ScrollView>
    </View>
  );
}