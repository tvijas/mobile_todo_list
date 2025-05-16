import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validators';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { register, state, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Очищаем ошибки при размонтировании компонента
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Показываем ошибку регистрации, если она есть
  useEffect(() => {
    if (state.error) {
      Alert.alert('Registration Error', state.error);
    }
  }, [state.error]);

  // Если регистрация прошла успешно, перенаправляем на экран входа
  useEffect(() => {
    if (!state.isLoading && !state.error && state.isAuthenticated) {
      // Это состояние может означать, что регистрация прошла успешно
      // но пользователь еще не авторизован
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please log in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [state, navigation]);

  const validateForm = (): boolean => {
    const emailValidationResult = validateEmail(email);
    const passwordValidationResult = validatePassword(password);
    let confirmPasswordValidationResult: string | null = null;
    
    if (password !== confirmPassword) {
      confirmPasswordValidationResult = 'Passwords do not match';
    }
    
    setEmailError(emailValidationResult);
    setPasswordError(passwordValidationResult);
    setConfirmPasswordError(confirmPasswordValidationResult);
    
    return !emailValidationResult && !passwordValidationResult && !confirmPasswordValidationResult;
  };

  const handleRegister = async () => {
    if (validateForm()) {
      await register({ email, password });
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
          
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={emailError}
            autoCapitalize="none"
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
          />
          
          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={state.isLoading}
            style={styles.signUpButton}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignUpScreen;