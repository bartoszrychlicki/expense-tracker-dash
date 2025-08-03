/**
 * Toast Presets Utility
 * 
 * Provides predefined toast messages for consistent user feedback
 * across the application.
 */

interface ToastMessage {
  title: string;
  message: string;
}

/**
 * Predefined toast messages for common scenarios
 */
export const toastPresets = {
  // Goal-related toasts
  goalSaved: (amount: number, goalName: string): ToastMessage => ({
    title: 'Środki odłożone!',
    message: `Odłożono ${amount} PLN na cel: ${goalName}`,
  }),
  
  goalSet: (goalName: string): ToastMessage => ({
    title: 'Cel ustawiony!',
    message: `"${goalName}" jest teraz Twoim aktualnym celem`,
  }),
  
  goalUpdated: (): ToastMessage => ({
    title: 'Cel zaktualizowany!',
    message: 'Nowy cel został ustawiony jako aktualny',
  }),
  
  goalRealized: (goalName: string): ToastMessage => ({
    title: 'Cel zrealizowany!',
    message: `Gratulacje! Cel "${goalName}" został zrealizowany`,
  }),

  // Transaction-related toasts
  transactionCreated: (): ToastMessage => ({
    title: 'Transakcja dodana!',
    message: 'Transakcja została pomyślnie zapisana',
  }),
  
  transactionDeleted: (): ToastMessage => ({
    title: 'Transakcja usunięta',
    message: 'Transakcja została pomyślnie usunięta',
  }),

  // Error toasts
  genericError: (): ToastMessage => ({
    title: 'Błąd',
    message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
  }),
  
  goalSaveError: (): ToastMessage => ({
    title: 'Błąd',
    message: 'Nie udało się odłożyć środków na cel. Spróbuj ponownie.',
  }),
  
  goalSetError: (): ToastMessage => ({
    title: 'Błąd',
    message: 'Nie udało się ustawić celu. Spróbuj ponownie.',
  }),
  
  refreshError: (): ToastMessage => ({
    title: 'Błąd',
    message: 'Nie udało się odświeżyć danych. Spróbuj ponownie.',
  }),
  
  networkError: (): ToastMessage => ({
    title: 'Błąd połączenia',
    message: 'Sprawdź połączenie internetowe i spróbuj ponownie.',
  }),

  // Success toasts
  dataRefreshed: (): ToastMessage => ({
    title: 'Odświeżono',
    message: 'Dane zostały pomyślnie zaktualizowane',
  }),
  
  settingsSaved: (): ToastMessage => ({
    title: 'Zapisano',
    message: 'Ustawienia zostały pomyślnie zapisane',
  }),
};

/**
 * Helper function to create custom toast messages
 */
export const createToastMessage = (title: string, message: string): ToastMessage => ({
  title,
  message,
});

/**
 * Toast duration presets in milliseconds
 */
export const TOAST_DURATIONS = {
  short: 2000,
  medium: 3000,
  long: 5000,
} as const;