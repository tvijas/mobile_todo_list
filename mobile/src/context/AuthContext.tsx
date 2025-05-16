import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, TokenPair } from '../types/auth';
import { getTokens, removeTokens, saveTokens } from '../utils/authStorage';
import { login as loginApi, register as registerApi, verifyToken, } from '../api/auth';
import { LoginRequest, SignUpRequest } from '../types/auth';

// Определение типов действий
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: TokenPair }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS' }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_TOKEN'; payload: TokenPair | null }
  | { type: 'CLEAR_ERROR' };

// Начальное состояние
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  error: null,
};

// Редьюсер для управления состоянием аутентификации
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        error: null,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload !== null,
        accessToken: action.payload?.accessToken || null,
        refreshToken: action.payload?.refreshToken || null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Определение типа контекста
interface AuthContextType {
  state: AuthState;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: SignUpRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Восстановление токенов при загрузке приложения
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const tokens = await getTokens();
        
        // Если есть токены, проверяем их валидность
        if (tokens) {
          const isValid = await verifyToken();
          if (isValid) {
            dispatch({ type: 'RESTORE_TOKEN', payload: tokens });
          } else {
            await removeTokens();
            dispatch({ type: 'RESTORE_TOKEN', payload: null });
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } catch (error) {
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  // Функция для входа
  const login = async (data: LoginRequest) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const tokens = await loginApi(data);
      await saveTokens(tokens);
      dispatch({ type: 'LOGIN_SUCCESS', payload: tokens });
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  // Функция для регистрации
  const register = async (data: SignUpRequest) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      await registerApi(data);
      dispatch({ type: 'REGISTER_SUCCESS' });
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
    }
  };

  // Функция для выхода
  const logout = async () => {
    try {
      await removeTokens();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Функция для очистки ошибок
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const authContext: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};