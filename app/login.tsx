import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Walidacja formularza
  const validateForm = () => {
    if (!email.trim()) {
      toast.showError('Błąd', 'Email jest wymagany');
      return false;
    }
    if (!password.trim()) {
      toast.showError('Błąd', 'Hasło jest wymagane');
      return false;
    }
    if (password.length < 6) {
      toast.showError('Błąd', 'Hasło musi mieć co najmniej 6 znaków');
      return false;
    }
    // Prosta walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showError('Błąd', 'Podaj poprawny adres email');
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.showSuccess(
          'Rejestracja zakończona!', 
          'Sprawdź swoją skrzynkę email i kliknij link potwierdzający, aby aktywować konto.'
        );
        setIsSignUp(false); // Przełącz na logowanie po rejestracji
      } else {
        await signIn(email, password);
        // Po udanym logowaniu router automatycznie przekieruje na dashboard
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Obsługa różnych typów błędów Supabase
      let errorMessage = 'Wystąpił nieoczekiwany błąd';
      
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Nieprawidłowy email lub hasło';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email nie został potwierdzony. Sprawdź skrzynkę i kliknij link aktywacyjny.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Użytkownik z tym adresem email już istnieje';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Hasło musi mieć co najmniej 6 znaków';
        } else if (error.message.includes('Unable to validate email address')) {
          errorMessage = 'Nieprawidłowy format adresu email';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.showError('Błąd', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      toast.showError('Błąd', 'Wprowadź swój adres email, aby zresetować hasło');
      return;
    }
    
    // Uproszczona obsługa resetowania hasła - bez potwierdzenia
    const sendResetEmail = async () => {
      try {
        await resetPassword(email);
        toast.showSuccess('Sukces', 'Link do resetowania hasła został wysłany na podany adres email.');
      } catch (error: any) {
        toast.showError('Błąd', error?.message || 'Nie udało się wysłać linku resetującego');
      }
    };
    
    sendResetEmail();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isSignUp ? 'Rejestracja' : 'Logowanie'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignUp 
            ? 'Utwórz nowe konto, aby rozpocząć śledzenie wydatków'
            : 'Zaloguj się do swojego konta'
          }
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="twoj@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hasło</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Wprowadź hasło"
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

        {!isSignUp && (
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>
              Zapomniałeś hasła?
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.authButton, loading && styles.authButtonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.authButtonText}>
              {isSignUp ? 'Zarejestruj się' : 'Zaloguj się'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Masz już konto?' : 'Nie masz konta?'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsSignUp(!isSignUp);
              setEmail('');
              setPassword('');
            }}
            disabled={loading}
          >
            <Text style={styles.switchButton}>
              {isSignUp ? ' Zaloguj się' : ' Zarejestruj się'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {isSignUp 
            ? 'Rejestrując się, akceptujesz nasze warunki użytkowania i politykę prywatności.'
            : 'Twoje dane są bezpieczne i szyfrowane.'
          }
        </Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  authButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  authButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  authButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: '#6b7280',
    fontSize: 14,
  },
  switchButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});