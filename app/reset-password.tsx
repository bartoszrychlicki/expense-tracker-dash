import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/services/supabaseService';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const toast = useToast();
  const { setResettingPassword, isResettingPassword, session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasResetTokens, setHasResetTokens] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check URL params immediately when component mounts
  useEffect(() => {
    console.log('Reset password screen mounted - checking URL params immediately');
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const accessToken = urlParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token');
      const type = urlParams.get('type');
      
      console.log('Initial URL check:', { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        type,
        hash: hash ? hash.substring(0, 50) + '...' : 'none'
      });
      
      // If user has tokens from password reset link, they should be able to reset password
      if ((accessToken && refreshToken && type === 'recovery') || 
          (hash && hash.includes('access_token') && hash.includes('type=recovery'))) {
        console.log('User has password reset tokens, setting isResettingPassword to true immediately');
        setResettingPassword(true);
        setHasResetTokens(true); // Remember that we had reset tokens
      }
    }
  }, []); // Empty dependency array - run only once on mount

  const validateForm = () => {
    if (!password.trim()) {
      toast.showError('Błąd', 'Nowe hasło jest wymagane');
      return false;
    }
    if (password.length < 6) {
      toast.showError('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    if (password !== confirmPassword) {
      toast.showError('Błąd', 'Hasła nie są identyczne');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast.showSuccess(
        'Sukces!',
        'Twoje hasło zostało zmienione. Możesz się teraz zalogować.'
      );
      
      // Przekieruj po krótkiej chwili
      setTimeout(async () => {
        // Reset the password reset state and sign out
        setResettingPassword(false);
        await supabase.auth.signOut();
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.showError('Błąd', error?.message || 'Nie udało się zmienić hasła');
    } finally {
      setLoading(false);
    }
  };

  // If user is not in password reset mode, redirect to login
  useEffect(() => {
    console.log(
      'Reset password screen - isResettingPassword:',
      isResettingPassword,
      'session:',
      !!session,
      'hasResetTokens:',
      hasResetTokens
    );
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

    // Clear any pending redirect if we now have tokens or are in reset mode
    if (isResettingPassword || hasResetTokens) {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    }

    // If we already detected reset tokens on mount or are resetting password, allow access
    if (hasResetTokens || isResettingPassword) {
      console.log('Already detected reset tokens or in reset mode, allowing access');
      return;
    }

    // Check if user came from password reset link by checking URL params
    const checkPasswordResetAccess = () => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        console.log('URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        console.log('Full URL params:', Object.fromEntries(urlParams.entries()));

        // If user has tokens from password reset link, they should be able to reset password
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('User has password reset tokens, setting isResettingPassword to true');
          setResettingPassword(true);
          setHasResetTokens(true);
          return;
        }

        // Also check for hash params (sometimes Supabase uses hash)
        const hash = window.location.hash;
        console.log('URL hash:', hash);
        if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
          console.log('User has password reset tokens in hash, setting isResettingPassword to true');
          setResettingPassword(true);
          setHasResetTokens(true);
          return;
        }
      }

      // If user has session but isResettingPassword is false, set it to true
      if (session && !isResettingPassword) {
        console.log('User has session but isResettingPassword is false, setting to true');
        setResettingPassword(true);
        setHasResetTokens(true);
      } else if (!isResettingPassword && !hasResetTokens) {
        console.log('User not in reset mode and no reset tokens detected, redirecting to login in 2 seconds...');
        redirectTimeoutRef.current = setTimeout(() => {
          router.replace('/login');
        }, 2000);
      }
    };

    checkPasswordResetAccess();

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isResettingPassword, session, router, setResettingPassword, hasResetTokens]);

  if (!isResettingPassword && !hasResetTokens) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Brak uprawnień</Text>
          <Text style={styles.subtitle}>
            Nie masz uprawnień do resetowania hasła. Przekierowuję na ekran logowania...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset hasła</Text>
        <Text style={styles.subtitle}>
          Wprowadź nowe hasło dla swojego konta
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nowe hasło</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Wprowadź nowe hasło"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Potwierdź hasło</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Potwierdź nowe hasło"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Text style={styles.eyeButtonText}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.resetButtonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.resetButtonText}>
              Zmień hasło
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/login')}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>
            Powrót do logowania
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
}); 