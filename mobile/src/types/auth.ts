export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}
