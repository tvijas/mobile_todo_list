import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, TokenPair } from '../types/auth';
import { getTokens, removeTokens, saveTokens } from '../utils/authStorage';
import { login as loginApi, register as registerApi, verifyToken, } from '../api/auth';
import { LoginRequest, SignUpRequest } from '../types/auth';
import { clearSavedPendingChanges, clearTasks } from '../utils/taskStorage';

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

interface AuthContextType {
  state: AuthState;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: SignUpRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const tokens = await getTokens();
        
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

  const register = async (data: SignUpRequest) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      await registerApi(data);
      dispatch({ type: 'REGISTER_SUCCESS' });
      return true;
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
    }
  };

  const logout = async () => {
    try {
      await removeTokens();
      await clearSavedPendingChanges();
      await clearTasks();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};