import { Toast, ToastDescription, ToastTitle, useToast as useGluestackToast } from '@/components/ui/toast';
import React from 'react';

export interface ToastOptions {
  /** Toast message title */
  title?: string;
  /** Toast message description */
  description?: string;
  /** Toast action type */
  action?: 'success' | 'error' | 'warning' | 'info' | 'muted';
  /** Toast duration in milliseconds */
  duration?: number;
  /** Toast variant */
  variant?: 'solid' | 'outline';
}

export function useToast() {
  const toast = useGluestackToast();

  const show = ({
    title,
    description,
    action = 'success',
    duration = 3000,
    variant = 'solid',
  }: ToastOptions) => {
    const newId = Math.random().toString();
    
    toast.show({
      id: newId,
      placement: 'top',
      duration,
      render: ({ id }) => {
        const uniqueToastId = `toast-${id}`;
        return React.createElement(
          Toast,
          { nativeID: uniqueToastId, action, variant },
          title && React.createElement(ToastTitle, null, title),
          description && React.createElement(ToastDescription, null, description)
        );
      },
    });
  };

  const showSuccess = (title: string, description?: string) => {
    show({ title, description, action: 'success' });
  };

  const showError = (title: string, description?: string) => {
    show({ title, description, action: 'error' });
  };

  const showWarning = (title: string, description?: string) => {
    show({ title, description, action: 'warning' });
  };

  const showInfo = (title: string, description?: string) => {
    show({ title, description, action: 'info' });
  };

  return {
    show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    close: toast.close,
    closeAll: toast.closeAll,
  };
}