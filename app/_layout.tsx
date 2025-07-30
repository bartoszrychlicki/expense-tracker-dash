/**
 * Root Layout Component
 * 
 * This is the root layout component that wraps the entire application.
 * It provides the Gluestack UI provider for theming and styling,
 * and sets up the navigation stack for the app.
 */

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Stack } from "expo-router";

/**
 * RootLayout Component
 * 
 * Provides the application-wide context and navigation structure.
 * 
 * Features:
 * - Gluestack UI provider for consistent theming
 * - Global CSS imports
 * - Navigation stack configuration
 * - Light mode as default theme
 */
export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Dashboard",
            headerShown: false, // Hide header for cleaner look
          }} 
        />
      </Stack>
    </GluestackUIProvider>
  );
}
