/**
 * Global TypeScript Declarations
 * 
 * This file contains global type declarations and interfaces
 * that are used throughout the application.
 */

declare global {
  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_AIRTABLE_BASE_ID: string;
      EXPO_PUBLIC_AIRTABLE_API_KEY: string;
      EXPO_PUBLIC_APP_NAME?: string;
      EXPO_PUBLIC_APP_VERSION?: string;
      EXPO_PUBLIC_API_TIMEOUT?: string;
      EXPO_PUBLIC_MAX_RETRIES?: string;
    }
  }

  // Global utility types
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };

  // API response types
  interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
  }

  // Error types
  interface AppError {
    code: string;
    message: string;
    details?: any;
  }
}

export {};