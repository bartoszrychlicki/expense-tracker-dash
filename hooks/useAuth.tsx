import { supabase } from '@/services/supabaseService';
import { Session, User } from '@supabase/supabase-js';
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Platform } from 'react-native';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isResettingPassword: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setResettingPassword: (isResetting: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    // Helper to validate current session with Supabase
    const loadSession = async () => {
      try {
        console.log('Loading session...');
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        console.log('Session loaded:', currentSession ? 'User logged in' : 'No session');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession ? 'User logged in' : 'No session');
      console.log('Current isResettingPassword state:', isResettingPassword);
      
      // Check if user is coming from password reset
      if (event === 'PASSWORD_RECOVERY' && newSession?.user) {
        console.log('User is resetting password - setting isResettingPassword to true');
        setIsResettingPassword(true);
      } else if (event === 'SIGNED_IN' && newSession?.user) {
        // Check if this is a password recovery sign in by checking URL
        console.log('User signed in, checking if from password recovery...');
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const hash = window.location.hash;
          const hasRecoveryTokens = (urlParams.get('type') === 'recovery' && urlParams.get('access_token')) ||
                                   (hash && hash.includes('type=recovery') && hash.includes('access_token'));
          
          if (hasRecoveryTokens) {
            console.log('User signed in from password recovery - setting isResettingPassword to true');
            setIsResettingPassword(true);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // Reset the password reset state when user signs out
        console.log('User signed out, resetting password reset state');
        setIsResettingPassword(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Don't reset password reset state on token refresh
        console.log('Token refreshed, keeping password reset state');
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Platform.OS === 'web' 
        ? `${window.location.origin}/reset-password`
        : 'expensetrackerdash://reset-password',
    });
    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      isResettingPassword,
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      setResettingPassword: setIsResettingPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
