import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Błąd', 'Email i hasło są wymagane');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Sukces', 'Rejestracja zakończona. Sprawdź email w celu potwierdzenia.');
        setIsSignUp(false);
      } else {
        await signIn(email, password);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Błąd', error?.message ?? 'Coś poszło nie tak');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Rejestracja' : 'Logowanie'}</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={loading ? 'Przetwarzanie...' : isSignUp ? 'Zarejestruj się' : 'Zaloguj się'} onPress={handleAuth} disabled={loading} />
      <View style={styles.switchContainer}>
        <Text>
          {isSignUp ? 'Masz już konto?' : 'Nie masz konta?'}
        </Text>
        <Text style={styles.switchText} onPress={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? ' Zaloguj się' : ' Zarejestruj się'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
  },
  switchText: {
    color: '#3b82f6',
  },
});
