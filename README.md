# Expense Tracker Dashboard 💰

A modern React Native expense tracking application built with Expo, featuring real-time budget monitoring and transaction history integration with Airtable.

## Features

- 📊 **Real-time Budget Tracking**: Monitor daily budget, spending, and remaining funds
- 💳 **Transaction History**: View recent transactions with categorization
- 🎨 **Modern UI**: Clean, responsive design with Gluestack UI components
- 🔒 **Secure Configuration**: Environment-based API key management
- ⚡ **Performance Optimized**: Efficient data fetching with proper error handling
- 📱 **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Framework**: Expo / React Native
- **Language**: TypeScript
- **UI Library**: Gluestack UI + NativeWind (Tailwind CSS)
- **Backend**: Airtable API
- **State Management**: React Hooks
- **Routing**: Expo Router

## Project Structure

```
├── app/                    # Main application screens
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Gluestack)
│   ├── BudgetCard.tsx    # Budget display component
│   ├── TransactionItem.tsx # Individual transaction component
│   └── TransactionsList.tsx # Transaction list container
├── config/               # Configuration and constants
├── hooks/                # Custom React hooks
├── services/             # API services and business logic
├── types/                # TypeScript type definitions
└── README.md
```

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Airtable account with API access

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd expense-tracker-dash

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Required: Your Airtable configuration
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
EXPO_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here

# Optional: Custom table names (defaults provided)
EXPO_PUBLIC_AIRTABLE_DAYS_TABLE=days
EXPO_PUBLIC_AIRTABLE_TRANSACTIONS_TABLE=transactions
```

### 3. Airtable Setup

Your Airtable base should have two tables:

**Days Table** (default: "days"):
- `Daily budget left` (Number/Currency)
- `Daily spent sum` (Number/Currency)  
- `Todays variable daily limit` (Number/Currency)
- `Created at` (Date)

**Transactions Table** (default: "transactions"):
- `Name` (Single line text)
- `Ai_Category` (Single line text)
- `Value` (Number/Currency)
- `transaction date` (Date)

### 4. Start Development

```bash
# Start the Expo development server
npm start

# Or for specific platforms
npm run android  # Android
npm run ios      # iOS  
npm run web      # Web
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start web version
- `npm run lint` - Run ESLint

## Architecture

### Components

- **BudgetCard**: Reusable component for displaying budget information
- **TransactionItem**: Individual transaction display with income/expense styling
- **TransactionsList**: Container for transaction history with loading states

### Services

- **airtableService**: Handles all Airtable API interactions with proper error handling
- **constants**: Centralized configuration management

### Hooks

- **useBudgetData**: Custom hook managing budget and transaction data fetching

### Type Safety

Full TypeScript implementation with comprehensive interfaces for:
- Transaction data structures
- API responses
- Component props
- Loading states

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- API keys are managed through environment variables
- No sensitive data is committed to version control
- Proper error handling prevents data leaks

## License

This project is private and proprietary.

## Support

For support, please contact the development team or create an issue in the repository.
