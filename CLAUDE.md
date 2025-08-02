# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator with DARK_MODE=media
- `npm run ios` - Start on iOS simulator with DARK_MODE=media  
- `npm run web` - Start web version with DARK_MODE=media
- `npm run lint` - Run ESLint for code quality checks
- `npm run reset-project` - Reset project to initial state (removes example files)

## Project Architecture

This is a React Native Expo application built with TypeScript that serves as an expense tracker dashboard with Airtable integration.

### Core Technologies
- **Framework**: Expo ~53.0.20 with React Native 0.79.5 and React 19.0.0
- **Routing**: Expo Router for file-based navigation
- **UI Library**: Gluestack UI components with NativeWind (Tailwind CSS)
- **State Management**: Custom React hooks with local state
- **Backend**: Airtable API for data persistence
- **Styling**: Tailwind CSS via NativeWind and React Native CSS Interop

### Application Structure

The app follows Expo Router's file-based routing with the main structure:

```
app/
├── (tabs)/           # Tab-based navigation
│   ├── index.tsx     # Main dashboard (expense tracker)
│   └── goals.tsx     # Goals management screen
└── _layout.tsx       # Root layout configuration
```

### Key Components Architecture

**Data Flow Pattern**: The application uses a centralized data fetching pattern with custom hooks:

1. **Custom Hooks** (`hooks/`):
   - `useBudgetData`: Manages daily budget and transactions data with loading states
   - `useCurrentGoal`: Handles goal-related data fetching and state
   - `usePlannedTransactions`: Manages planned transactions
   - `useToast`: Provides toast notifications

2. **Service Layer** (`services/airtableService.ts`):
   - Centralized Airtable API interactions with proper error handling
   - Custom `AirtableApiError` class for consistent error handling
   - Functions: `fetchLatestDailyBudget()`, `fetchRecentTransactions()`, `fetchGoalsBalance()`, `createGoalTransaction()`

3. **UI Components** (`components/`):
   - **BudgetCard**: Reusable budget display component with size variants
   - **TransactionsList/TransactionItem**: Transaction display with income/expense styling
   - **CurrentGoalCard**: Goal management with saving functionality
   - **AutomaticSavingsCard/AutomaticGoalDepositsCard**: Automatic savings displays
   - Skeleton components for loading states
   - `ui/` folder contains Gluestack UI component wrappers

### Configuration Management

**Environment Variables** (required in `.env`):
- `EXPO_PUBLIC_AIRTABLE_BASE_ID` - Airtable base identifier
- `EXPO_PUBLIC_AIRTABLE_API_KEY` - Airtable API key
- Optional table name overrides available

**Constants** (`config/constants.ts`):
- Centralized configuration with `AIRTABLE_CONFIG`, `API_CONFIG`, `UI_CONFIG`
- Environment validation function `validateEnvironmentVariables()`

### Airtable Data Structure

The application expects specific Airtable tables:

**Days Table**: Daily budget tracking with fields like `Daily budget left`, `Daily spent sum`, `Todays variable daily limit`, automatic savings/goal fields

**Transactions Table**: Transaction records with `Name`, `Value`, `Ai_Category`, `transaction date`, `category_type`

**Goals Table**: Planned transactions/goals with decision tracking

**Accounts Table**: Account balances (e.g., "Goals", "Checking")

### TypeScript Integration

Comprehensive type definitions in `types/index.ts`:
- `Transaction`, `DailyBudget`, `PlannedTransaction` interfaces
- `AirtableResponse<T>`, `AirtableRecord<T>` for API responses  
- `LoadingState` for async operation states
- Raw Airtable field interfaces for type safety

### Error Handling Strategy

- Custom `AirtableApiError` class with status codes and details
- Loading states with error messages in Polish
- Request timeouts (10 seconds) and abort controllers
- Graceful fallbacks for missing data

### Styling Approach

- NativeWind for Tailwind CSS in React Native
- Gluestack UI component system with custom styling
- Platform-specific optimizations
- Responsive design with flexbox layouts

## Development Notes

- The app supports iOS, Android, and Web platforms
- Uses Polish language for user-facing messages
- Implements proper loading skeletons for better UX
- Features toast notifications for user feedback
- Double-click prevention on goal saving actions
- Environment validation on app startup