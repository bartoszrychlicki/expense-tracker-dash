import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

function RootNavigator() {
  const { session, loading, isResettingPassword } = useAuth();
  const router = useRouter();
  
  // Check if we have reset tokens in URL (for password reset flow)
  const hasResetTokensInUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      return (accessToken && refreshToken && type === 'recovery') || 
             (hash && hash.includes('access_token') && hash.includes('type=recovery'));
    }
    return false;
  };

  // Handle navigation based on auth state
  useEffect(() => {
    console.log('Auth state in layout:', { loading, session: !!session, isResettingPassword });
    if (!loading) {
      // Add a small delay to allow reset-password screen to check URL params
      const timer = setTimeout(() => {
        // Check if we're already on reset-password screen
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        console.log('Current path:', currentPath);
        
        // Check if we have reset tokens in URL
        const hasResetTokens = hasResetTokensInUrl();
        console.log('Has reset tokens in URL:', hasResetTokens);
        
        // If we're already on reset-password screen, don't redirect
        if (currentPath === '/reset-password') {
          console.log('Already on reset-password screen, not redirecting');
          return;
        }
        
        // If we have reset tokens, redirect to reset-password screen
        if (hasResetTokens) {
          console.log('Found reset tokens in URL, redirecting to reset password...');
          router.replace('/reset-password');
          return;
        }
        
        if (isResettingPassword) {
          // User is resetting password, redirect to reset-password screen
          console.log('Redirecting to reset password...');
          router.replace('/reset-password');
        } else if (session && !isResettingPassword) {
          // User is authenticated and not resetting password, redirect to tabs
          console.log('Redirecting to tabs...');
          router.replace('/(tabs)');
        } else if (!session && !isResettingPassword) {
          // User is not authenticated and not resetting password, redirect to login
          console.log('Redirecting to login...');
          router.replace('/login');
        }
        // If user is on reset-password screen and isResettingPassword is false,
        // let the reset-password screen handle the redirect
      }, 50); // Smaller delay to allow reset-password screen to initialize

      return () => clearTimeout(timer);
    }
  }, [session, loading, isResettingPassword, router]);

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
      <Stack.Screen name="reset-password" options={{ headerShown: false }} />
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
