# Expense Tracker Dashboard 📊

A modern, well-architected expense tracking dashboard built with React Native, Expo, and Gluestack UI. This application provides real-time budget monitoring and transaction tracking with a clean, responsive interface.

## 🚀 Features

- **Real-time Budget Monitoring**: Track daily budget, spending, and remaining amounts
- **Transaction History**: View recent transactions with categorization
- **Responsive Design**: Optimized for mobile and web platforms
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Smooth loading experiences with proper feedback
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Clean Architecture**: Well-structured codebase with separation of concerns

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **UI Library**: Gluestack UI with NativeWind
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **State Management**: React Hooks with custom hooks
- **API Integration**: Airtable API
- **Navigation**: Expo Router

## 📁 Project Structure

```
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout component
│   └── index.tsx          # Main dashboard screen
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── BudgetCard.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorDisplay.tsx
│   ├── constants/         # Application constants
│   │   ├── api.ts         # API configuration
│   │   └── ui.ts          # UI text and constants
│   ├── hooks/             # Custom React hooks
│   │   └── useDashboardData.ts
│   ├── services/          # API services
│   │   └── airtableService.ts
│   └── types/             # TypeScript type definitions
│       └── api.ts
├── components/ui/         # Gluestack UI components
└── assets/               # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Airtable account and API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker-dash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Airtable credentials:
   ```env
   EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
   EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Airtable Setup

1. Create a new Airtable base with two tables:
   - **Days table**: For daily budget tracking
   - **Transactions table**: For transaction records

2. Configure the following fields:

   **Days Table:**
   - `Daily budget left` (Number)
   - `Daily spent sum` (Number)
   - `Todays variable daily limit` (Number)
   - `Created at` (Date)

   **Transactions Table:**
   - `Name` (Single line text)
   - `Ai_Category` (Single line text)
   - `Value` (Number)
   - `transaction date` (Date)

## 🏗 Architecture Overview

### Component Architecture

The application follows a modular component architecture:

- **Screen Components**: Main page components (e.g., `DashboardScreen`)
- **Section Components**: Logical sections within screens (e.g., `BudgetCardsSection`)
- **UI Components**: Reusable, presentational components (e.g., `BudgetCard`, `TransactionItem`)
- **Utility Components**: Loading, error, and other utility components

### Data Flow

1. **Custom Hooks**: Manage data fetching and state (`useDashboardData`)
2. **Service Layer**: Handle API communication (`airtableService`)
3. **Type Safety**: Comprehensive TypeScript interfaces
4. **Error Handling**: Centralized error management with retry functionality

### State Management

- **Local State**: Component-specific state using React hooks
- **Custom Hooks**: Reusable state logic for data fetching
- **No External State**: Simple, predictable state management

## 🎨 UI/UX Features

### Design System

- **Consistent Theming**: Gluestack UI with custom color palette
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Proper contrast ratios and touch targets
- **Loading States**: Smooth loading experiences
- **Error States**: Clear error messages with recovery options

### Components

- **BudgetCard**: Displays budget information with consistent formatting
- **TransactionItem**: Shows transaction details with visual indicators
- **LoadingSpinner**: Provides loading feedback
- **ErrorDisplay**: Handles error states with retry functionality

## 🔧 Development

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **JSDoc**: Comprehensive documentation

### Best Practices

- **Separation of Concerns**: Clear separation between UI, logic, and data
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Performance**: Optimized re-renders and data fetching
- **Accessibility**: ARIA labels and semantic HTML
- **Testing**: Unit tests for critical functionality

### Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Lint code
npm run lint

# Reset project (development only)
npm run reset-project
```

## 🚀 Deployment

### Expo Build

1. **Configure app.json** with your app details
2. **Build for production**:
   ```bash
   eas build --platform all
   ```

### Environment Variables

Ensure all environment variables are properly configured for production:

- `EXPO_PUBLIC_AIRTABLE_BASE_ID`
- `EXPO_PUBLIC_AIRTABLE_API_KEY`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and architecture
- Add TypeScript types for new features
- Include proper error handling
- Write comprehensive documentation
- Test your changes thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Review the documentation
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [Gluestack UI](https://ui.gluestack.io/) for the component library
- [Airtable](https://airtable.com/) for the backend API
- [React Native](https://reactnative.dev/) for the mobile framework
