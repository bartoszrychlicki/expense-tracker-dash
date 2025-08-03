import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

function RootNavigator() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // Handle navigation based on auth state
  useEffect(() => {
    console.log('Auth state in layout:', { loading, session: !!session });
    if (!loading) {
      if (session) {
        // User is authenticated, redirect to tabs
        console.log('Redirecting to tabs...');
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, redirect to login
        console.log('Redirecting to login...');
        router.replace('/login');
      }
    }
  }, [session, loading, router]);

  // Show splash while loading
  if (loading) {
    return (
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false, presentation: 'transparentModal' }} />
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="splash" options={{ headerShown: false, presentation: 'transparentModal' }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GluestackUIProvider>
  );
}
